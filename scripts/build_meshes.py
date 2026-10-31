"""Build anatomical glTF meshes for CORTEX-AETHER from MNI152 (ICBM 2009a sym) tissue maps + Harvard-Oxford subcortical atlas.
Output: brain.glb with named meshes whose vertices are already in viewer scene units:
  scene = (x*S, (z-10)*S, -(y+18)*S), S = 0.025
"""
import os, sys, json
import numpy as np
import nibabel as nib
from scipy import ndimage as ndi
from scipy.ndimage import distance_transform_edt
from skimage import measure
import fast_simplification
import trimesh
import nilearn
from nilearn import datasets

OUT = sys.argv[1] if len(sys.argv) > 1 else '/home/ubuntu/neuro_deploy/mesh/out'
os.makedirs(OUT, exist_ok=True)
S = 0.025
D = os.path.join(os.path.dirname(nilearn.__file__), 'datasets', 'data')
NILEARN_DATA = os.environ.get('NEURO_DATA', '/root/nilearn_data')
gm = nib.load(os.path.join(D, 'mni_icbm152_gm_tal_nlin_sym_09a_converted.nii.gz')).get_fdata() / 255.0
wm = nib.load(os.path.join(D, 'mni_icbm152_wm_tal_nlin_sym_09a_converted.nii.gz')).get_fdata() / 255.0
ORIG = np.array([-98.0, -134.0, -72.0])  # ICBM grid origin (1 mm)
ho = datasets.fetch_atlas_harvard_oxford('sub-maxprob-thr25-1mm', data_dir=NILEARN_DATA)
# App cortical-area ids, in canonical order (index order == brain-v1.meta.json order)
AREA_IDS = ['m1', 'premotor', 'broca', 'dlpfc', 'vmpfc', 'ofc', 's1', 'spl', 'ipl', 'smg', 'ag',
            'v1', 'v2v3', 'v4', 'mt', 'a1', 'wernicke', 'ffa', 'it', 'atl', 'phc', 'insula', 'acc', 'pcc']
# Harvard-Oxford cortical region name (side prefix stripped) -> app cortical area id.
CORT_MAP = {
    'Precentral Gyrus': 'm1',
    'Juxtapositional Lobule Cortex (formerly Supplementary Motor Cortex)': 'premotor',
    'Inferior Frontal Gyrus, pars opercularis': 'broca',
    'Inferior Frontal Gyrus, pars triangularis': 'broca',
    'Superior Frontal Gyrus': 'dlpfc',
    'Middle Frontal Gyrus': 'dlpfc',
    'Middle Frontal Gyrus, anterior division': 'dlpfc',
    'Middle Frontal Gyrus, posterior division': 'dlpfc',
    'Frontal Medial Cortex': 'vmpfc',
    'Subcallosal Cortex': 'vmpfc',
    'Frontal Pole': 'vmpfc',
    'Frontal Orbital Cortex': 'ofc',
    'Inferior Frontal Gyrus, pars orbitalis': 'ofc',
    'Postcentral Gyrus': 's1',
    'Parietal Opercular Cortex': 's1',
    'Superior Parietal Lobule': 'spl',
    'Precuneous Cortex': 'spl',
    'Supramarginal Gyrus, anterior division': 'smg',
    'Supramarginal Gyrus, posterior division': 'smg',
    'Angular Gyrus': 'ag',
    'Central Opercular Cortex': 'broca',
    'Frontal Opercular Cortex': 'broca',
    'Occipital Pole': 'v2v3',
    'Lingual Gyrus': 'v1',
    'Cuneal Cortex': 'v1',
    'Intracalcarine Cortex': 'v1',
    'Supracalcarine Cortex': 'v1',
    'Lateral Occipital Cortex, superior division': 'v2v3',
    'Lateral Occipital Cortex, inferior division': 'v2v3',
    'Occipital Fusiform Gyrus': 'v4',
    'Temporal Occipital Fusiform Cortex': 'ffa',
    'Middle Temporal Gyrus, posterior division': 'mt',
    'Middle Temporal Gyrus, temporooccipital part': 'mt',
    "Heschl's Gyrus (includes H1 and H2)": 'a1',
    'Planum Temporale': 'wernicke',
    'Superior Temporal Gyrus, posterior division': 'wernicke',
    'Inferior Temporal Gyrus, anterior division': 'it',
    'Inferior Temporal Gyrus, posterior division': 'it',
    'Inferior Temporal Gyrus, temporooccipital part': 'it',
    'Temporal Fusiform Cortex, anterior division': 'atl',
    'Temporal Fusiform Cortex, posterior division': 'atl',
    'Temporal Pole': 'atl',
    'Planum Polare': 'atl',
    'Superior Temporal Gyrus, anterior division': 'atl',
    'Middle Temporal Gyrus, anterior division': 'atl',
    'Parahippocampal Gyrus, anterior division': 'phc',
    'Parahippocampal Gyrus, posterior division': 'phc',
    'Insular Cortex': 'insula',
    'Paracingulate Gyrus': 'acc',
    'Cingulate Gyrus, anterior division': 'acc',
    'Cingulate Gyrus, posterior division': 'pcc',
}
hoimg = ho.maps if not isinstance(ho.maps, str) else nib.load(ho.maps)
hod = np.asarray(hoimg.get_fdata()).astype(np.int16)
labels = list(ho.labels)
HO_ORIG = np.array([-91.0, -126.0, -72.0])
# resample HO onto the ICBM grid (both 1 mm, axis-aligned): integer shift
lab = np.zeros(gm.shape, np.int16)
sh = (HO_ORIG - ORIG).astype(int)
lab[sh[0]:sh[0] + hod.shape[0], sh[1]:sh[1] + hod.shape[1], sh[2]:sh[2] + hod.shape[2]] = hod
L = {name: i for i, name in enumerate(labels)}
ii, jj, kk = np.indices(gm.shape)
X = ii + ORIG[0]; Y = jj + ORIG[1]; Z = kk + ORIG[2]

# ---- Harvard-Oxford CORTICAL parcellation (per-vertex area labels for the hemisphere surfaces) ----
ho_c = datasets.fetch_atlas_harvard_oxford('cort-maxprob-thr25-1mm', data_dir=NILEARN_DATA)
hoimg_c = ho_c.maps if not isinstance(ho_c.maps, str) else nib.load(ho_c.maps)
hod_c = np.asarray(hoimg_c.get_fdata()).astype(np.int16)
# Fill the inter-gyral/sulcal gaps so surface vertices in the GM/WM shell always land on a label:
# each empty voxel adopts its nearest labelled voxel (EDT index map, a few mm at most).
_cort_filled = hod_c[tuple(distance_transform_edt(hod_c == 0, return_distances=False, return_indices=True))]
labels_c = list(ho_c.labels)
lab_c = np.zeros(gm.shape, np.int16)
sh_c = (HO_ORIG - ORIG).astype(int)
lab_c[sh_c[0]:sh_c[0] + _cort_filled.shape[0], sh_c[1]:sh_c[1] + _cort_filled.shape[1], sh_c[2]:sh_c[2] + _cort_filled.shape[2]] = _cort_filled
Lc = {name: i for i, name in enumerate(labels_c)}

def label_verts(m, side):
    """Sample the HO cortical atlas at each final vertex position -> uint8 app-area index (255 = none)."""
    V = m.vertices  # scene units
    mm = np.stack([V[:, 0] / S, -V[:, 2] / S - 18, V[:, 1] / S + 10], 1)  # MNI X,Y,Z mm
    # lab_c canvas index 0 == MNI ORIG (not HO_ORIG): subtract the ICBM origin.
    ix = np.clip(np.round(mm[:, 0] - ORIG[0]).astype(int), 0, lab_c.shape[0] - 1)
    iy = np.clip(np.round(mm[:, 1] - ORIG[1]).astype(int), 0, lab_c.shape[1] - 1)
    iz = np.clip(np.round(mm[:, 2] - ORIG[2]).astype(int), 0, lab_c.shape[2] - 1)
    vals = lab_c[ix, iy, iz]
    out = np.full(len(V), 255, np.uint8)
    hits = 0
    for i, v in enumerate(vals):
        if v == 0:
            continue
        n = labels_c[v]
        if n.startswith('Left '):
            if side > 0:
                continue
            n = n[5:]
        elif n.startswith('Right '):
            if side < 0:
                continue
            n = n[6:]
        aid = CORT_MAP.get(n)
        if aid and aid in AREA_IDS:
            out[i] = AREA_IDS.index(aid)
            hits += 1
    return out, hits / max(1, len(V))

def lm(*names):
    m = np.zeros(gm.shape, bool)
    for n in names:
        m |= lab == L[n]
    return m

tissue = gm + wm
stem = lm('Brain-Stem')
cerebrum = np.zeros(gm.shape, bool)
for side in ('Left', 'Right'):
    cerebrum |= lm(*[f'{side} {n}' for n in ['Cerebral White Matter', 'Cerebral Cortex', 'Lateral Ventricle', 'Thalamus', 'Caudate', 'Putamen', 'Pallidum', 'Hippocampus', 'Amygdala', 'Accumbens']])
cer_d = ndi.binary_dilation(cerebrum, iterations=2)

def surface(field, level, target_tris, smooth_iter=8):
    v, f, _, _ = measure.marching_cubes(field, level=level, step_size=1, allow_degenerate=False)
    mm = v + ORIG
    sc = np.stack([mm[:, 0] * S, (mm[:, 2] - 10) * S, -(mm[:, 1] + 18) * S], 1).astype(np.float32)
    f = f[:, ::-1]  # flip winding (axis permutation changes handedness)
    if len(f) > target_tris:
        sc, f = fast_simplification.simplify(sc, f.astype(np.int32), target_reduction=1 - target_tris / len(f))
    m = trimesh.Trimesh(sc, f, process=True)
    parts = m.split(only_watertight=False)
    if len(parts) > 1:
        m = max(parts, key=lambda p: len(p.faces))
    if smooth_iter:
        trimesh.smoothing.filter_taubin(m, iterations=smooth_iter)
    return m

meshes = {}
stats = {}
# Cerebral hemispheres: ICBM GM+WM probability restricted to the dilated HO cerebrum mask, per side
for side, name in ((1, 'cortex-rh'), (-1, 'cortex-lh')):
    msk = cer_d & ((X * side) >= -0.5)
    fld = ndi.gaussian_filter(np.where(msk, tissue, 0.0), 0.6)
    meshes[name] = surface(fld, 0.5, 45000, 6)
# Cerebellum: tissue not in cerebrum/brainstem, posterior-inferior
cb = (tissue > 0.35) & ~cer_d & ~ndi.binary_dilation(stem, iterations=1) & (Y < -28) & (Z < 12)
cb = ndi.binary_opening(cb, iterations=1)
meshes['cerebellum'] = surface(ndi.gaussian_filter(cb.astype(float), 0.8), 0.5, 26000, 6)
# Brainstem split into midbrain / pons / medulla by MNI z
for sid, lo, hi in (('midbrain', -19, 99), ('pons', -42, -19), ('medulla', -99, -42)):
    m = stem & (Z >= lo) & (Z < hi)
    meshes[sid] = surface(ndi.gaussian_filter(m.astype(float), 1.0), 0.5, 2500, 10)
# Deep nuclei (one mesh per side; both stored, viewer mirrors none)
DEEP = {'thalamus': 'Thalamus', 'caudate': 'Caudate', 'putamen': 'Putamen', 'hippocampus': 'Hippocampus', 'amygdala': 'Amygdala', 'nacc': 'Accumbens', 'lat-ventricles': 'Lateral Ventricle'}
for sid, hn in DEEP.items():
    for side, sfx in (('Right', 'r'), ('Left', 'l')):
        m = lm(f'{side} {hn}')
        meshes[f'{sid}__{sfx}'] = surface(ndi.gaussian_filter(m.astype(float), 0.9), 0.5, 2600 if sid != 'lat-ventricles' else 5000, 10)
    # pallidum split into GPe (lateral) / GPi (medial)
for side, sfx, sg in (('Right', 'r', 1), ('Left', 'l', -1)):
    p = lm(f'{side} Pallidum')
    meshes[f'gpe__{sfx}'] = surface(ndi.gaussian_filter((p & (X * sg >= 18)).astype(float), 0.8), 0.5, 1500, 10)
    meshes[f'gpi__{sfx}'] = surface(ndi.gaussian_filter((p & (X * sg < 18)).astype(float), 0.8), 0.5, 1200, 10)

scene = trimesh.Scene()
meta_labels = {}
for k, m in meshes.items():
    scene.add_geometry(m, node_name=k, geom_name=k)
    stats[k] = {'verts': int(len(m.vertices)), 'tris': int(len(m.faces)), 'centroid_scene': [round(float(c), 3) for c in m.centroid]}
# per-vertex parcellation for the two hemisphere surfaces (after all processing, so vertex order == GLB order)
import base64
for side, name in ((1, 'cortex-rh'), (-1, 'cortex-lh')):
    arr, frac = label_verts(meshes[name], side)
    meta_labels['rh' if side > 0 else 'lh'] = base64.b64encode(arr.tobytes()).decode()
    stats[name]['mapped_fraction'] = round(float(frac), 3)
print('mapped fractions:', {k: v['mapped_fraction'] for k, v in stats.items() if 'mapped_fraction' in v})
meta = {'areas': AREA_IDS, **meta_labels}
with open(os.path.join(OUT, 'brain-v1.meta.json'), 'w') as fh:
    json.dump(meta, fh)
glb = trimesh.exchange.gltf.export_glb(scene, include_normals=False)
with open(os.path.join(OUT, 'brain.glb'), 'wb') as fh:
    fh.write(glb)
with open(os.path.join(OUT, 'stats.json'), 'w') as fh:
    json.dump(stats, fh, indent=1)
print('bytes', len(glb))
for k, s in stats.items():
    print(k, s)
