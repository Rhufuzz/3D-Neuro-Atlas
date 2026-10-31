'use client';

import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass.js';
import { ALL_STRUCTURES, CORTICAL_AREAS, STRUCTURE_MAP, expandIds } from '@/lib/data/structures';
import type { BrainStructure, Vec3 } from '@/lib/data/types';
import { S, mni, glassMat, cortexMat, laplacianSmooth, buildNeuralTube, makeDotTexture, buildStreams, MAX_AREAS } from './viewer-helpers';
import type { StreamSpec } from './viewer-helpers';

export { mni };
export type { StreamSpec };

export const MESH_URL = '/meshes/brain-v1.glb';

const RADII: Record<string, [number, number, number]> = {
  thalamus: [7, 15, 8], putamen: [5.5, 15, 9], caudate: [5, 16, 7], gpe: [3.5, 10, 6], gpi: [2.5, 7, 4.5],
  hippocampus: [5, 16, 5], amygdala: [7, 8, 7], hypothalamus: [4, 6, 4], pons: [17, 14, 13], medulla: [9, 9, 14],
  midbrain: [13, 11, 11], cerebellum: [50, 26, 20], spinal: [5, 5, 24], 'corpus-callosum': [6, 34, 4],
  sn: [4, 9, 2.5], 'lat-ventricles': [4, 22, 5], 'third-ventricle': [1.5, 12, 8], 'fourth-ventricle': [7, 5, 9],
  aqueduct: [1.2, 6, 1.2], 'central-canal': [1, 1, 22], optic: [14, 4, 2], pituitary: [5, 4, 4], nacc: [5, 5, 4], lgn: [3, 4, 2.5],
};
const AREA_IDS = CORTICAL_AREAS.map((a: BrainStructure) => a.id).slice(0, MAX_AREAS);
const BIG = new Set(['cerebellum', 'pons', 'medulla', 'midbrain']);
const ss = (a: number, b: number, x: number) => { const t = Math.max(0, Math.min(1, (x - a) / (b - a))); return t * t * (3 - 2 * t); };

export interface ViewerProps {
  opacity: number;
  showGrid: boolean;
  showCsf: boolean;
  showDeep: boolean;
  dev: number;
  selected: string | null;
  highlight?: string[];
  onSelect?: (id: string | null) => void;
  compact?: boolean;
  /** Animated particle streams (pathway stage polylines in MNI mm). */
  streams?: StreamSpec[];
  /** Fly the camera to a lateral view of the selected structure. Default true. */
  autoOrbit?: boolean;
  heightClass?: string;
}

function colorHemisphere(g: THREE.BufferGeometry, side: number, meta: { areas: string[]; rh: Uint8Array | null; lh: Uint8Array | null } | null): void {
  const p = g.attributes.position as THREE.BufferAttribute;
  const n = p.count;
  const seeds: { x: number; y: number; z: number; a: number }[] = [];
  AREA_IDS.forEach((id: string, a: number) => {
    const s = STRUCTURE_MAP[id];
    (s?.seeds?.length ? s.seeds : [s?.mni ?? [0, 0, 0]]).forEach((v: Vec3) => seeds.push({ x: Math.abs(v[0]) * side, y: v[1], z: v[2], a }));
  });
  const base = new THREE.Color('#6fa8ff');
  const cols = AREA_IDS.map((id: string) => new THREE.Color(STRUCTURE_MAP[id]?.color ?? '#ffffff'));
  const baked = meta ? (side === 1 ? meta.rh : meta.lh) : null;
  const idToIdx = meta ? new Map(meta.areas.map((id: string) => [id, AREA_IDS.indexOf(id)])) : null;
  const col = new Float32Array(n * 3); const area = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    const x = p.getX(i) / S, z = p.getY(i) / S + 10, y = -p.getZ(i) / S - 18;
    let ba = -1;
    if (baked && idToIdx && baked[i] !== undefined && baked[i] < 255) ba = idToIdx.get(meta!.areas[baked[i]]) ?? -1;
    if (ba < 0) {
      let best = 1e9;
      for (let k = 0; k < seeds.length; k++) { const d = (seeds[k].x - x) ** 2 + (seeds[k].y - y) ** 2 + (seeds[k].z - z) ** 2; if (d < best) { best = d; ba = seeds[k].a; } }
      if (best > 24 * 24) ba = -1;
    }
    const c = ba >= 0 ? base.clone().lerp(cols[ba], 0.6) : base;
    col[i * 3] = c.r; col[i * 3 + 1] = c.g; col[i * 3 + 2] = c.b; area[i] = ba;
  }
  g.setAttribute('aCol', new THREE.BufferAttribute(col, 3));
  g.setAttribute('aArea', new THREE.BufferAttribute(area, 1));
}

export default function BrainViewer(props: ViewerProps) {
  const host = useRef<HTMLDivElement | null>(null);
  const propsRef = useRef<ViewerProps>(props);
  propsRef.current = props;
  const streamApi = useRef<{ root: THREE.Group; tex: THREE.Texture; cur: ReturnType<typeof buildStreams> | null } | null>(null);
  const [meshState, setMeshState] = useState<'loading' | 'ready' | 'fallback'>('loading');
  const [progress, setProgress] = useState(0);
  const metaRef = useRef<{ areas: string[]; rh: Uint8Array | null; lh: Uint8Array | null } | null>(null);
  const streamKey = JSON.stringify(props.streams ?? []);

  useEffect(() => {
    const el = host.current;
    if (!el) return;
    let disposed = false;
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio ?? 1, 2));
    renderer.setSize(el.clientWidth, el.clientHeight);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.12;
    el.appendChild(renderer.domElement);
    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#04060b');
    const camera = new THREE.PerspectiveCamera(40, el.clientWidth / Math.max(1, el.clientHeight), 0.01, 100);
    camera.position.set(-7.6, 3.6, -6.4);
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.autoRotate = true;
    controls.autoRotateSpeed = 0.45;
    const stopAuto = () => { controls.autoRotate = false; renderer.domElement.removeEventListener('pointerdown', stopAuto); renderer.domElement.removeEventListener('wheel', stopAuto); };
    renderer.domElement.addEventListener('pointerdown', stopAuto);
    renderer.domElement.addEventListener('wheel', stopAuto, { passive: true });
    const maxSamples = renderer.capabilities.maxSamples ?? 0;
    const composer = new EffectComposer(renderer, new THREE.WebGLRenderTarget(el.clientWidth, el.clientHeight, { type: THREE.HalfFloatType, samples: Math.min(4, maxSamples) }));
    composer.addPass(new RenderPass(scene, camera));
    const bloom = new UnrealBloomPass(new THREE.Vector2(el.clientWidth, el.clientHeight), propsRef.current?.compact ? 0.35 : 0.55, 0.55, 0.6);
    composer.addPass(bloom);
    composer.addPass(new OutputPass());
    const root = new THREE.Group();
    scene.add(root);
    const meshes: THREE.Mesh[] = []; const csf: THREE.Mesh[] = []; const deep: THREE.Mesh[] = [];
    const hemis: THREE.Mesh[] = []; const patches: THREE.Mesh[] = []; const shells: THREE.Mesh[] = [];
    const centers = new Map<string, THREE.Vector3>();
    const morph: { mesh: THREE.Mesh; orig: Float32Array; smooth: Float32Array }[] = [];
    let surfaceLoaded = false;

    // Fallback hemispheres (deformed spheres) until the anatomical glTF is loaded
    const fallback: THREE.Mesh[] = [];
    [1, -1].forEach((side: number) => {
      const g = new THREE.SphereGeometry(1, 96, 64);
      const p = g.attributes.position as THREE.BufferAttribute;
      for (let i = 0; i < p.count; i++) {
        const x = p.getX(i), y = p.getY(i), z = p.getZ(i);
        let mx = 36 + 33 * x; const my = -17 + 86 * z * -1; let mz = 22 + 54 * y;
        mx = Math.max(mx, 3 + 2 * Math.abs(y));
        if (y < 0) mz = 22 + (my > 15 ? 40 : my < -65 ? 30 : 60) * y;
        const n = Math.sin(mx * 0.35) * Math.sin(my * 0.3) * Math.sin(mz * 0.33) * 2.2;
        const v = mni(side * (mx + n * 0.3), my + n, mz + n);
        p.setXYZ(i, v.x, v.y, v.z);
      }
      g.computeVertexNormals();
      const m = new THREE.Mesh(g, glassMat('#7fb8ff', 0.3, 0.2, 0));
      m.renderOrder = 10;
      root.add(m); fallback.push(m);
    });

    ALL_STRUCTURES.forEach((s: BrainStructure) => {
      if (s.kind === 'lobe') return;
      const isCortex = s.kind === 'cortex';
      const r = RADII[s.id] ?? (isCortex ? [7, 9, 7] : [2.2, 2.2, 2.2]);
      (s.bilateral ? [1, -1] : [1]).forEach((side: number) => {
        const m = new THREE.Mesh(new THREE.SphereGeometry(1, 32, 20), glassMat(s.color, isCortex ? 0.55 : s.kind === 'ventricle' ? 0.5 : 0.85, isCortex ? 0.1 : 0.9, s.kind === 'ventricle' ? 1 : 0));
        const base = s.seeds?.[0] ?? s.mni;
        m.position.copy(mni(Math.abs(base?.[0] ?? 0) * side, base?.[1] ?? 0, base?.[2] ?? 0));
        m.scale.set(r[0] * S, r[2] * S, r[1] * S);
        m.userData.id = s.id;
        m.renderOrder = isCortex ? 11 : 1;
        if (side === 1) centers.set(s.id, m.position.clone());
        root.add(m); meshes.push(m);
        if (isCortex) patches.push(m); else if (s.kind === 'ventricle') csf.push(m); else deep.push(m);
      });
    });
    ALL_STRUCTURES.filter((s: BrainStructure) => s.kind === 'lobe').forEach((l: BrainStructure) => {
      const pts = (l.members ?? []).map((id: string) => centers.get(id)).filter(Boolean) as THREE.Vector3[];
      if (pts.length) centers.set(l.id, pts.reduce((a: THREE.Vector3, b: THREE.Vector3) => a.add(b), new THREE.Vector3()).multiplyScalar(1 / pts.length));
    });

    // Neural tube / vesicles for early development
    const tubeMat = cortexMat(0.6); tubeMat.uniforms.uIri.value = 0.4;
    const tube = new THREE.Mesh(buildNeuralTube(0), tubeMat);
    tube.visible = false; root.add(tube);
    let tubeDev = -1; let morphDev = -1;

    const grid = new THREE.Group();
    const gh = new THREE.GridHelper(200 * S, 20, 0x22e5ff, 0x1d3a4a);
    gh.position.copy(mni(0, -18, 0));
    grid.add(gh, new THREE.AxesHelper(80 * S));
    root.add(grid);
    const tex = makeDotTexture();
    streamApi.current = { root, tex, cur: null };
    // starfield backdrop (outside the scaling root so the dev slider never distorts it)
    const starGeo = new THREE.BufferGeometry();
    {
      const n = 750; const arr = new Float32Array(n * 3);
      for (let i = 0; i < n; i++) {
        const th = Math.random() * Math.PI * 2, ph = Math.acos(2 * Math.random() - 1), r = 9 + Math.random() * 9;
        arr[i * 3] = r * Math.sin(ph) * Math.cos(th); arr[i * 3 + 1] = r * Math.cos(ph); arr[i * 3 + 2] = r * Math.sin(ph) * Math.sin(th);
      }
      starGeo.setAttribute('position', new THREE.BufferAttribute(arr, 3));
    }
    const starMat = new THREE.PointsMaterial({ size: 0.045, map: tex, color: '#9fd8ff', transparent: true, opacity: 0.65, blending: THREE.AdditiveBlending, depthWrite: false });
    const stars = new THREE.Points(starGeo, starMat);
    stars.renderOrder = -1;
    scene.add(stars);

    const metaPromise: Promise<{ areas: string[]; rh: Uint8Array | null; lh: Uint8Array | null } | null> = fetch(MESH_URL.replace(/[^/]*$/, 'brain-v1.meta.json'))
      .then((r) => (r.ok ? r.json() : null))
      .then((m: { areas?: string[]; rh?: string; lh?: string } | null) => {
        if (!m?.areas?.length || typeof m.rh !== 'string' || typeof m.lh !== 'string') return null;
        const dec = (s: string) => Uint8Array.from(atob(s), (c) => c.charCodeAt(0));
        const meta = { areas: m.areas, rh: dec(m.rh), lh: dec(m.lh) };
        metaRef.current = meta;
        return meta;
      })
      .catch(() => null);

    new GLTFLoader().load(MESH_URL, (gltf) => {
      if (disposed) return;
      const meta = metaRef.current;
      const replaced = new Set<string>();
      gltf.scene.traverse((o: THREE.Object3D) => {
        const mesh = o as THREE.Mesh;
        if (!mesh.isMesh) return;
        const name = (mesh.name || mesh.parent?.name || '').replace(/__?[rl]$/, '');
        const g = mesh.geometry as THREE.BufferGeometry;
        g.computeVertexNormals();
        g.computeBoundingSphere();
        if (name === 'cortex-rh' || name === 'cortex-lh') {
          const side = name === 'cortex-rh' ? 1 : -1;
          colorHemisphere(g, side, meta);
          const m = new THREE.Mesh(g, cortexMat(0.3));
          m.userData.hemi = true; m.userData.side = side; m.renderOrder = 10;
          root.add(m); hemis.push(m);
          const orig = Float32Array.from((g.attributes.position as THREE.BufferAttribute).array as Float32Array);
          morph.push({ mesh: m, orig, smooth: laplacianSmooth(orig, (g.index?.array ?? []) as ArrayLike<number>, 60) });
          const sh = new THREE.Mesh(g.clone(), glassMat('#38bdf8', 0.08, 0.3, 0.55));
          const c = g.boundingSphere?.center ?? new THREE.Vector3();
          sh.geometry.translate(-c.x, -c.y, -c.z); sh.geometry.scale(1.04, 1.04, 1.04); sh.geometry.translate(c.x, c.y, c.z);
          sh.userData.id = 'subarachnoid'; sh.renderOrder = 12; root.add(sh); shells.push(sh);
          return;
        }
        const s = STRUCTURE_MAP[name];
        if (!s) return;
        const isV = s.kind === 'ventricle';
        const m = new THREE.Mesh(g, glassMat(s.color, isV ? 0.5 : BIG.has(s.id) ? 0.55 : 0.85, 0.9, isV ? 1 : 0));
        m.userData.id = s.id; m.renderOrder = 1;
        root.add(m); meshes.push(m);
        (isV ? csf : deep).push(m);
        replaced.add(s.id);
        const ctr = g.boundingSphere?.center;
        if (ctr && (!/__?l$/.test(mesh.name) || !centers.has(`${s.id}#mesh`))) { centers.set(s.id, ctr.clone()); centers.set(`${s.id}#mesh`, ctr.clone()); }
      });
      replaced.add('subarachnoid');
      for (let i = meshes.length - 1; i >= 0; i--) {
        const m = meshes[i];
        if (m.geometry.type === 'SphereGeometry' && replaced.has(m.userData.id as string)) { m.visible = false; m.userData.gone = true; meshes.splice(i, 1); }
      }
      fallback.forEach((m: THREE.Mesh) => { m.visible = false; });
      surfaceLoaded = hemis.length > 0;
      morphDev = -1;
      setMeshState(surfaceLoaded ? 'ready' : 'fallback');
    }, (xhr) => { if (!disposed && xhr.total) setProgress(Math.min(100, Math.round((xhr.loaded / xhr.total) * 100))); }, () => { if (!disposed) setMeshState('fallback'); });

    // if the meta file arrives after the meshes, recolor with anatomical parcellation
    metaPromise.then((m) => { if (!disposed && m && surfaceLoaded) hemis.forEach((hm) => colorHemisphere(hm.geometry, hm.userData.side ?? 1, m)); });

    const ray = new THREE.Raycaster(); const ptr = new THREE.Vector2();
    let down = { x: 0, y: 0 }; let flying = 0; const camGoal = new THREE.Vector3();
    const onDown = (e: PointerEvent) => { down = { x: e.clientX, y: e.clientY }; flying = 0; };
    const onUp = (e: PointerEvent) => {
      if (Math.abs(e.clientX - down.x) + Math.abs(e.clientY - down.y) > 5) return;
      const rect = renderer.domElement.getBoundingClientRect();
      ptr.set(((e.clientX - rect.left) / rect.width) * 2 - 1, -((e.clientY - rect.top) / rect.height) * 2 + 1);
      ray.setFromCamera(ptr, camera);
      const cands = [...meshes.filter((m: THREE.Mesh) => m.visible && !(surfaceLoaded && patches.includes(m))), ...hemis.filter((m: THREE.Mesh) => m.visible)];
      const hits = ray.intersectObjects(cands, false);
      const first = hits?.[0];
      const deepHit = hits.find((h) => !h.object.userData.hemi);
      let id: string | null = null;
      if (first?.object?.userData?.hemi) {
        if (deepHit && (propsRef.current?.opacity ?? 0.3) < 0.6) id = deepHit.object.userData.id as string;
        else {
          const aa = (first.object as THREE.Mesh).geometry.getAttribute('aArea') as THREE.BufferAttribute | undefined;
          const k = first.face ? Math.round(aa?.getX(first.face.a) ?? -1) : -1;
          id = k >= 0 ? AREA_IDS[k] ?? null : null;
        }
      } else id = (first?.object?.userData?.id as string) ?? null;
      propsRef.current?.onSelect?.(id);
    };
    renderer.domElement.addEventListener('pointerdown', onDown);
    renderer.domElement.addEventListener('pointerup', onUp);
    const onResize = () => { camera.aspect = el.clientWidth / Math.max(1, el.clientHeight); camera.updateProjectionMatrix(); renderer.setSize(el.clientWidth, el.clientHeight); composer.setSize(el.clientWidth, el.clientHeight); };
    window.addEventListener('resize', onResize);

    let raf = 0; const clock = new THREE.Clock(); let lastSel: string | null = null;
    // cinematic intro: dolly from the far position to the default view
    camGoal.set(-5.2, 2.2, -4.2); flying = 130;
    const loop = () => {
      raf = requestAnimationFrame(loop);
      const t = clock.getElapsedTime(); const pr = propsRef.current;
      const hi = new Set<string>(expandIds([...(pr?.highlight ?? []), pr?.selected ?? '']));
      const dev = pr?.dev ?? 1;
      const adult = ss(0.6, 0.72, dev); const tubeA = 1 - ss(0.62, 0.72, dev);
      root.scale.setScalar(0.35 + 0.65 * dev);
      const op = pr?.opacity ?? 0.3;
      [...meshes, ...fallback, ...shells].forEach((m: THREE.Mesh) => {
        const u = (m.material as THREE.ShaderMaterial).uniforms;
        u.uTime.value = t;
        u.uHi.value = hi.has(m.userData.id as string) ? 1 : 0;
      });
      fallback.forEach((m: THREE.Mesh) => { (m.material as THREE.ShaderMaterial).uniforms.uOpacity.value = op * adult; m.visible = !surfaceLoaded && adult > 0.01; });
      hemis.forEach((m: THREE.Mesh) => {
        const mt = m.material as THREE.ShaderMaterial;
        mt.uniforms.uTime.value = t; mt.uniforms.uOpacity.value = op * adult; mt.depthWrite = op > 0.9;
        const arr = mt.uniforms.uHiArr.value as Float32Array;
        AREA_IDS.forEach((id: string, k: number) => { arr[k] = hi.has(id) ? 1 : 0; });
        m.visible = adult > 0.01;
      });
      patches.forEach((m: THREE.Mesh) => { m.visible = !surfaceLoaded && adult > 0.01; (m.material as THREE.ShaderMaterial).uniforms.uOpacity.value = Math.min(1, op + 0.25) * adult; });
      shells.forEach((m: THREE.Mesh) => { m.visible = !!pr?.showCsf && adult > 0.5; });
      csf.forEach((m: THREE.Mesh) => { m.visible = !!pr?.showCsf && !m.userData.gone && adult > 0.3; });
      deep.forEach((m: THREE.Mesh) => { m.visible = pr?.showDeep !== false && !m.userData.gone && dev > 0.66; });
      grid.visible = !!pr?.showGrid;
      // development morphs
      tube.visible = tubeA > 0.01;
      if (tube.visible) {
        tubeMat.uniforms.uTime.value = t; tubeMat.uniforms.uOpacity.value = 0.55 * tubeA;
        if (Math.abs(dev - tubeDev) > 0.004) { tube.geometry.dispose(); tube.geometry = buildNeuralTube(Math.min(0.72, dev)); tubeDev = dev; }
      }
      if (surfaceLoaded && Math.abs(dev - morphDev) > 0.004 && (dev > 0.55 || morphDev < 0)) {
        const b = ss(0.66, 0.97, dev);
        morph.forEach((mo) => {
          const pa = mo.mesh.geometry.attributes.position as THREE.BufferAttribute; const arr = pa.array as Float32Array;
          for (let i = 0; i < arr.length; i++) arr[i] = mo.smooth[i] + (mo.orig[i] - mo.smooth[i]) * b;
          pa.needsUpdate = true; mo.mesh.geometry.computeVertexNormals();
        });
        morphDev = dev;
      }
      streamApi.current?.cur?.update(t);
      // camera focus / fly-to
      const sel = pr?.selected ?? null;
      const c = sel ? centers.get(sel)?.clone().multiplyScalar(root.scale.x) : undefined;
      if (sel !== lastSel) {
        lastSel = sel;
        if (c && pr?.autoOrbit !== false) {
          const sideSign = Math.abs(c.x) > 0.12 ? Math.sign(c.x) : -1;
          const dist = Math.min(6, Math.max(3.4, camera.position.distanceTo(controls.target)));
          camGoal.copy(c).add(new THREE.Vector3(sideSign, 0.45, -0.35).normalize().multiplyScalar(dist));
          flying = 80;
        }
      }
      if (flying > 0) { camera.position.lerp(camGoal, 0.06); flying -= 1; }
      controls.target.lerp(c ?? new THREE.Vector3(0, 0, 0), c ? 0.07 : 0.04);
      controls.update();
      stars.rotation.y = t * 0.004;
      composer.render();
    };
    loop();
    return () => {
      disposed = true;
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', onResize);
      renderer.domElement.removeEventListener('pointerdown', onDown);
      renderer.domElement.removeEventListener('pointerup', onUp);
      streamApi.current?.cur?.dispose();
      streamApi.current = null;
      controls.dispose();
      composer.dispose();
      starGeo.dispose();
      starMat.dispose();
      renderer.dispose();
      el.removeChild(renderer.domElement);
    };
  }, []);

  useEffect(() => {
    const sa = streamApi.current;
    if (!sa) return;
    if (sa.cur) { sa.root.remove(sa.cur.group); sa.cur.dispose(); sa.cur = null; }
    const specs = JSON.parse(streamKey) as StreamSpec[];
    if (specs.length) { sa.cur = buildStreams(specs, sa.tex); sa.root.add(sa.cur.group); }
  }, [streamKey]);

  return (
    <div className="relative">
      <div ref={host} className={`w-full ${props.heightClass ?? (props.compact ? 'h-[300px]' : 'h-[60vh] md:h-[calc(100vh-8rem)]')} rounded-lg`} aria-label="Interactive 3D brain" />
      <div className={`absolute inset-0 grid place-items-center bg-[#04060b] transition-opacity duration-700 ${meshState === 'loading' ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
        <div className="text-center space-y-3">
          <p className="glow-text text-lg font-semibold tracking-[0.3em]">CORTEX-AETHER</p>
          <div className="w-56 h-1.5 rounded-full bg-muted overflow-hidden mx-auto"><div className="h-full bg-gradient-to-r from-primary to-cyan-300 rounded-full transition-all" style={{ width: `${Math.max(6, progress)}%` }} /></div>
          <p className="text-[11px] text-muted-foreground">Loading MNI152 meshes… {progress}%</p>
        </div>
      </div>
      {meshState === 'fallback' && (
        <span className="absolute bottom-2 right-2 text-[10px] px-2 py-0.5 rounded bg-black/50 text-muted-foreground">Schematic mode (meshes unavailable)</span>
      )}
    </div>
  );
}
