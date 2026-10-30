"""Build anatomical glTF meshes for CORTEX-AETHER from MNI152 (ICBM 2009a sym) tissue maps + Harvard-Oxford subcortical atlas.
Output: brain.glb with named meshes whose vertices are already in viewer scene units:
  scene = (x*S, (z-10)*S, -(y+18)*S), S = 0.025
"""
import os, sys, json
import numpy as np
import nibabel as nib
from scipy import ndimage as ndi
from skimage import measure
import trimesh
import fast_simplification
import nilearn
from nilearn import datasets

OUT = sys.argv[1] if len(sys.argv) > 1 else '/home/ubuntu/neuro_deploy/mesh/out'
os.makedirs(OUT, exist_ok=True)
S = 0.025
D = os.path.join(os.path.dirname(nilearn.__file__), 'datasets', 'data')
gm = nib.load(os.path.join(D, 'mni_icbm152_gm_tal_nlin_sym_09a_converted.nii.gz')).get_fdata() / 255.0
wm = nib.load(os.path.join(D, 'mni_icbm152_wm_tal_nlin_sym_09a_converted.nii.gz')).get_fdata() / 255.0
ORIG = np.array([-98.0, -134.0, -72.0])  # ICBM grid origin (1 mm)
ho = datasets.fetch_atlas_harvard_oxford('sub-maxprob-thr25-1mm', data_dir='/home/ubuntu/nilearn_data')
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
for k, m in meshes.items():
    scene.add_geometry(m, node_name=k, geom_name=k)
    stats[k] = {'verts': int(len(m.vertices)), 'tris': int(len(m.faces)), 'centroid_scene': [round(float(c), 3) for c in m.centroid]}
glb = trimesh.exchange.gltf.export_glb(scene, include_normals=False)
with open(os.path.join(OUT, 'brain.glb'), 'wb') as fh:
    fh.write(glb)
with open(os.path.join(OUT, 'stats.json'), 'w') as fh:
    json.dump(stats, fh, indent=1)
print('bytes', len(glb))
for k, s in stats.items():
    print(k, s)
