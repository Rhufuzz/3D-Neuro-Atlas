import * as THREE from 'three';
import type { Vec3 } from '@/lib/data/types';

export const S = 0.025;
export function mni(x: number, y: number, z: number): THREE.Vector3 {
  return new THREE.Vector3(x * S, (z - 10) * S, -(y + 18) * S);
}

const glassVS = `varying vec3 vN; varying vec3 vV; varying vec3 vW;
void main(){ vec4 mv = modelViewMatrix*vec4(position,1.0); vN=normalize(normalMatrix*normal); vV=normalize(-mv.xyz); vW=(modelMatrix*vec4(position,1.0)).xyz; gl_Position=projectionMatrix*mv; }`;
// Fresnel glass with thin-film iridescence; uFlow > 0 turns it into pulsating CSF (cardiac-gated flow + caustic noise).
const glassFS = `uniform vec3 uColor; uniform float uOpacity; uniform float uTime; uniform float uHi; uniform float uIri; uniform float uFlow;
varying vec3 vN; varying vec3 vV; varying vec3 vW;
void main(){ vec3 N=normalize(vN); vec3 V=normalize(vV); float f = pow(1.0-abs(dot(N,V)),2.2);
 vec3 c = uColor*(0.35+0.5*max(dot(N,normalize(vec3(0.4,0.8,0.6))),0.0));
 vec3 iri = 0.5+0.5*cos(6.2831*(f*1.3+uTime*0.05+vec3(0.0,0.33,0.67)));
 c = mix(c, c*0.6+iri*0.5, uIri*f); c += uColor*f*1.2; c = mix(c, c*vec3(0.6,0.68,1.0), smoothstep(0.15,0.6,abs(dot(N,V)))*0.5); c += uColor*pow(f,1.6)*0.55;
 float pulse = 0.65+0.35*pow(0.5+0.5*sin(uTime*6.9),3.0);
 float caustic = sin(vW.x*70.0+uTime*1.7)*sin(vW.y*55.0-uTime*2.6)*sin(vW.z*63.0+uTime*1.2);
 float flow = uFlow*pulse*(0.45+0.3*caustic+0.25*sin(vW.y*40.0-vW.z*25.0-uTime*3.0));
 c += vec3(0.13,0.9,1.0)*flow*0.7; c += vec3(1.0)*uHi*(0.35+0.25*sin(uTime*4.0));
 gl_FragColor = vec4(c, clamp(uOpacity*(0.45+0.9*f)*(uFlow>0.0?pulse:1.0)+uHi*0.4,0.0,1.0)); }`;

export function glassMat(color: string, opacity: number, iri: number, flow: number): THREE.ShaderMaterial {
  return new THREE.ShaderMaterial({
    vertexShader: glassVS, fragmentShader: glassFS, transparent: true, depthWrite: false,
    blending: flow > 0 ? THREE.AdditiveBlending : THREE.NormalBlending, side: THREE.DoubleSide,
    uniforms: { uColor: { value: new THREE.Color(color) }, uOpacity: { value: opacity }, uTime: { value: 0 }, uHi: { value: 0 }, uIri: { value: iri }, uFlow: { value: flow } },
  });
}

export const MAX_AREAS = 32;
const cortexVS = `attribute vec3 aCol; attribute float aArea; uniform float uHiArr[${MAX_AREAS}];
varying vec3 vN; varying vec3 vV; varying vec3 vCol; varying float vHi;
void main(){ vec4 mv = modelViewMatrix*vec4(position,1.0); vN=normalize(normalMatrix*normal); vV=normalize(-mv.xyz); vCol=aCol;
 int k = int(aArea+0.5); vHi = aArea < -0.5 ? 0.0 : uHiArr[k]; gl_Position=projectionMatrix*mv; }`;
const cortexFS = `uniform float uOpacity; uniform float uTime; uniform float uIri;
varying vec3 vN; varying vec3 vV; varying vec3 vCol; varying float vHi;
void main(){ vec3 N=normalize(vN); vec3 V=normalize(vV); float f = pow(1.0-abs(dot(N,V)),2.0);
 float lam = 0.3+0.7*max(dot(N,normalize(vec3(0.3,0.9,0.4))),0.0) + 0.25*max(dot(N,normalize(vec3(-0.6,-0.2,-0.7))),0.0);
 vec3 c = vCol*lam*0.95; vec3 iri = 0.5+0.5*cos(6.2831*(f*1.2+uTime*0.04+vec3(0.0,0.33,0.67)));
 c = mix(c, c*0.6+iri*0.45, uIri*f); c += vCol*f*1.05; c += vCol*pow(f,1.6)*0.55;
 c += vec3(0.55,1.0,1.0)*vHi*(0.5+0.3*sin(uTime*4.0));
 gl_FragColor = vec4(c, clamp(uOpacity*(0.4+0.85*f)+vHi*0.5,0.0,1.0)); }`;

export function cortexMat(opacity: number): THREE.ShaderMaterial {
  return new THREE.ShaderMaterial({
    vertexShader: cortexVS, fragmentShader: cortexFS, transparent: true, depthWrite: false, side: THREE.DoubleSide,
    uniforms: { uOpacity: { value: opacity }, uTime: { value: 0 }, uIri: { value: 0.25 }, uHiArr: { value: new Float32Array(MAX_AREAS) } },
  });
}

/** Umbrella-weighted Laplacian smoothing with volume (mean-radius) preservation; used for the lissencephalic morph. */
export function laplacianSmooth(pos: ArrayLike<number>, index: ArrayLike<number>, iters: number): Float32Array {
  const n = Math.floor(pos.length / 3);
  const deg = new Uint32Array(n);
  for (let i = 0; i < index.length; i++) deg[index[i]] += 2;
  const start = new Uint32Array(n + 1);
  for (let i = 0; i < n; i++) start[i + 1] = start[i] + deg[i];
  const fill = start.slice(0, n);
  const nb = new Uint32Array(start[n]);
  for (let t = 0; t + 2 < index.length; t += 3) {
    const a = index[t], b = index[t + 1], c = index[t + 2];
    nb[fill[a]++] = b; nb[fill[a]++] = c; nb[fill[b]++] = a; nb[fill[b]++] = c; nb[fill[c]++] = a; nb[fill[c]++] = b;
  }
  let cur = Float32Array.from(pos);
  let tmp = new Float32Array(cur.length);
  const centroid = (p: Float32Array) => { const c = [0, 0, 0]; for (let i = 0; i < n; i++) { c[0] += p[i * 3]; c[1] += p[i * 3 + 1]; c[2] += p[i * 3 + 2]; } return c.map((v) => v / Math.max(1, n)); };
  const meanR = (p: Float32Array, c: number[]) => { let r = 0; for (let i = 0; i < n; i++) r += Math.hypot(p[i * 3] - c[0], p[i * 3 + 1] - c[1], p[i * 3 + 2] - c[2]); return r / Math.max(1, n); };
  const c0 = centroid(cur); const r0 = meanR(cur, c0);
  for (let it = 0; it < iters; it++) {
    for (let i = 0; i < n; i++) {
      let sx = 0, sy = 0, sz = 0; const s0 = start[i], s1 = start[i + 1];
      for (let k = s0; k < s1; k++) { const j = nb[k]; sx += cur[j * 3]; sy += cur[j * 3 + 1]; sz += cur[j * 3 + 2]; }
      const d = Math.max(1, s1 - s0);
      tmp[i * 3] = cur[i * 3] + 0.7 * (sx / d - cur[i * 3]);
      tmp[i * 3 + 1] = cur[i * 3 + 1] + 0.7 * (sy / d - cur[i * 3 + 1]);
      tmp[i * 3 + 2] = cur[i * 3 + 2] + 0.7 * (sz / d - cur[i * 3 + 2]);
    }
    const sw = cur; cur = tmp; tmp = sw;
  }
  const c1 = centroid(cur); const k = r0 / Math.max(1e-6, meanR(cur, c1));
  for (let i = 0; i < n; i++) for (let a = 0; a < 3; a++) cur[i * 3 + a] = c0[a] + (cur[i * 3 + a] - c1[a]) * k;
  return cur;
}

const ss = (a: number, b: number, x: number) => { const t = Math.max(0, Math.min(1, (x - a) / (b - a))); return t * t * (3 - 2 * t); };
const bump = (s: number, c: number, w: number) => Math.exp(-(((s - c) / w) ** 2));
const TUBE_COLS = ['#22e5ff', '#ff4fa3', '#a78bfa', '#facc15', '#4ade80'].map((h: string) => new THREE.Color(h));

/** Neural tube → 3 primary → 5 secondary vesicles with cephalic/pontine flexures, driven by dev ∈ [0, 0.7]. */
export function buildNeuralTube(dev: number): THREE.BufferGeometry {
  const a1 = ss(0.04, 0.22, dev), a2 = ss(0.25, 0.45, dev), a3 = ss(0.45, 0.7, dev);
  const straight: Vec3[] = [[0, -2.2, 0.4], [0, -1.4, 0.4], [0, -0.6, 0.4], [0, 0.2, 0.4], [0, 1.0, 0.4]];
  const flexed: Vec3[] = [[0, -2.2, 0.8], [0, -1.3, 0.85], [0, -0.55, 0.55], [0, 0.15, 0.05], [0, 0.1, -0.85]];
  const pts = straight.map((p: Vec3, i: number) => new THREE.Vector3(0, p[1] + (flexed[i][1] - p[1]) * a2, p[2] + (flexed[i][2] - p[2]) * a2));
  const curve = new THREE.CatmullRomCurve3(pts);
  const rings = 140, seg = 28;
  const frames = curve.computeFrenetFrames(rings, false);
  const pos: number[] = [], col: number[] = [], area: number[] = [], idx: number[] = [];
  for (let i = 0; i <= rings; i++) {
    const s = i / rings;
    const p = curve.getPointAt(s);
    let r = 0.11 + a1 * (1 - a2) * (bump(s, 0.56, 0.07) * 0.14 + bump(s, 0.73, 0.045) * 0.1 + bump(s, 0.88, 0.07) * 0.18)
      + a2 * (bump(s, 0.48, 0.045) * 0.11 + bump(s, 0.61, 0.05) * 0.17 + bump(s, 0.73, 0.04) * 0.1 + bump(s, 0.84, 0.035) * 0.14 + bump(s, 0.94, 0.06) * (0.24 + 0.4 * a3));
    r *= s > 0.96 ? Math.sqrt(Math.max(0.02, 1 - ((s - 0.96) / 0.04) ** 2)) : 1;
    const lateral = 1 + (0.6 * a2 + 1.4 * a3) * bump(s, 0.94, 0.07);
    const ci = s < 0.42 ? 0 : s < 0.67 ? 1 : s < 0.78 ? 2 : a2 < 0.5 ? 3 : s < 0.89 ? 3 : 4;
    const cc = TUBE_COLS[ci];
    for (let j = 0; j <= seg; j++) {
      const th = (j / seg) * Math.PI * 2;
      const N = frames.normals[i], B = frames.binormals[i];
      const cx = Math.cos(th) * r, sy = Math.sin(th) * r * lateral;
      pos.push(p.x + N.x * cx + B.x * sy, p.y + N.y * cx + B.y * sy, p.z + N.z * cx + B.z * sy);
      col.push(cc.r, cc.g, cc.b); area.push(-1);
    }
  }
  for (let i = 0; i < rings; i++) for (let j = 0; j < seg; j++) {
    const a = i * (seg + 1) + j, b = a + seg + 1;
    idx.push(a, b, a + 1, b, b + 1, a + 1);
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute('aCol', new THREE.Float32BufferAttribute(col, 3));
  g.setAttribute('aArea', new THREE.Float32BufferAttribute(area, 1));
  g.setIndex(idx);
  g.computeVertexNormals();
  return g;
}

export function makeDotTexture(): THREE.Texture {
  const c = document.createElement('canvas');
  c.width = c.height = 64;
  const ctx = c.getContext('2d');
  if (ctx) {
    const g = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
    g.addColorStop(0, 'rgba(255,255,255,1)'); g.addColorStop(0.3, 'rgba(255,255,255,0.8)'); g.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = g; ctx.fillRect(0, 0, 64, 64);
  }
  const t = new THREE.CanvasTexture(c);
  return t;
}

export interface StreamSpec { paths: Vec3[][]; color: string; bilateral?: boolean }

/** DTI-style bundle: smooth tube along a CatmullRom spline through MNI control points. */
export function buildTract(paths: Vec3[][], color: string, bilateral: boolean, radius = 0.045): { group: THREE.Group; dispose: () => void } {
  const group = new THREE.Group();
  const disposables: { dispose: () => void }[] = [];
  const mat = new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.4, blending: THREE.AdditiveBlending, depthWrite: false });
  disposables.push(mat);
  (bilateral ? [1, -1] : [1]).forEach((side: number) => {
    paths.forEach((path: Vec3[]) => {
      if ((path?.length ?? 0) < 2) return;
      const curve = new THREE.CatmullRomCurve3(path.map((p: Vec3) => mni(p[0] * side, p[1], p[2])));
      const geo = new THREE.TubeGeometry(curve, 96, radius, 8, false);
      const mesh = new THREE.Mesh(geo, mat);
      mesh.renderOrder = 15;
      group.add(mesh);
      disposables.push(geo);
    });
  });
  return { group, dispose: () => disposables.forEach((d) => d.dispose()) };
}

/** Pulsing BOLD-style activation blobs at MNI coordinates (illustrative fMRI clusters). */
export function buildBold(clusters: { at: Vec3; r: number }[], color: string, bilateral: boolean): { group: THREE.Group; dispose: () => void; pulse: (t: number) => void } {
  const group = new THREE.Group();
  const disposables: { dispose: () => void }[] = [];
  const pulsers: { mesh: THREE.Mesh; phase: number }[] = [];
  const base = new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.16, blending: THREE.AdditiveBlending, depthWrite: false });
  const core = new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.5, blending: THREE.AdditiveBlending, depthWrite: false });
  disposables.push(base, core);
  clusters.forEach((c, i) => {
    (bilateral ? [1, -1] : [1]).forEach((side: number) => {
      const halo = new THREE.Mesh(new THREE.SphereGeometry(c.r * S, 24, 18), base);
      halo.position.copy(mni(c.at[0] * side, c.at[1], c.at[2]));
      halo.renderOrder = 16;
      group.add(halo);
      disposables.push(halo.geometry);
      const heart = new THREE.Mesh(new THREE.SphereGeometry(c.r * S * 0.45, 18, 12), core);
      heart.position.copy(halo.position);
      heart.renderOrder = 17;
      group.add(heart);
      disposables.push(heart.geometry);
      pulsers.push({ mesh: heart, phase: i * 1.3 });
    });
  });
  const pulse = (t: number) => {
    pulsers.forEach((p) => {
      const s = 1 + 0.28 * Math.sin(t * 2.4 + p.phase);
      p.mesh.scale.setScalar(s);
      (p.mesh.material as THREE.MeshBasicMaterial).opacity = 0.38 + 0.22 * (0.5 + 0.5 * Math.sin(t * 2.4 + p.phase));
    });
  };
  return { group, dispose: () => disposables.forEach((d) => d.dispose()), pulse };
}

/** Animated particle streams along CatmullRom splines through MNI waypoints (action-potential volleys along a pathway). */
export function buildStreams(specs: StreamSpec[], tex: THREE.Texture): { group: THREE.Group; update: (t: number) => void; dispose: () => void } {
  const group = new THREE.Group();
  const items: { samples: THREE.Vector3[]; geo: THREE.BufferGeometry; phase: Float32Array; speed: number }[] = [];
  const disposables: { dispose: () => void }[] = [];
  specs.forEach((spec: StreamSpec) => {
    (spec?.paths ?? []).forEach((path: Vec3[]) => {
      if ((path?.length ?? 0) < 2) return;
      (spec.bilateral ? [1, -1] : [1]).forEach((side: number) => {
        const curve = new THREE.CatmullRomCurve3(path.map((p: Vec3) => mni(p[0] * side, p[1], p[2])));
        const samples = curve.getSpacedPoints(160);
        const lg = new THREE.BufferGeometry().setFromPoints(samples);
        const lm = new THREE.LineBasicMaterial({ color: spec.color, transparent: true, opacity: 0.35, blending: THREE.AdditiveBlending, depthWrite: false });
        group.add(new THREE.Line(lg, lm));
        const N = 70;
        const geo = new THREE.BufferGeometry();
        geo.setAttribute('position', new THREE.Float32BufferAttribute(new Float32Array(N * 3), 3));
        const pm = new THREE.PointsMaterial({ color: spec.color, size: 0.075, map: tex, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, sizeAttenuation: true });
        const pts = new THREE.Points(geo, pm);
        pts.renderOrder = 20; pts.frustumCulled = false;
        group.add(pts);
        const phase = new Float32Array(N);
        for (let k = 0; k < N; k++) phase[k] = (k / N + Math.random() * 0.02) % 1;
        items.push({ samples, geo, phase, speed: 0.22 });
        disposables.push(lg, lm, geo, pm);
      });
    });
  });
  const update = (t: number) => {
    items.forEach((it) => {
      const arr = (it.geo.attributes.position as THREE.BufferAttribute).array as Float32Array;
      const last = it.samples.length - 1;
      for (let k = 0; k < it.phase.length; k++) {
        const u = (it.phase[k] + t * it.speed) % 1;
        const f = u * last; const i0 = Math.floor(f); const i1 = Math.min(last, i0 + 1); const w = f - i0;
        const a = it.samples[i0], b = it.samples[i1];
        arr[k * 3] = a.x + (b.x - a.x) * w; arr[k * 3 + 1] = a.y + (b.y - a.y) * w; arr[k * 3 + 2] = a.z + (b.z - a.z) * w;
      }
      it.geo.attributes.position.needsUpdate = true;
    });
  };
  return { group, update, dispose: () => disposables.forEach((d) => d.dispose()) };
}
