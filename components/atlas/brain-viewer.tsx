'use client';

import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { ALL_STRUCTURES } from '@/lib/data/structures';
import type { BrainStructure } from '@/lib/data/types';

const S = 0.025;
export function mni(x: number, y: number, z: number): THREE.Vector3 {
  return new THREE.Vector3(x * S, (z - 10) * S, -(y + 18) * S);
}

const RADII: Record<string, [number, number, number]> = {
  thalamus: [7, 15, 8], putamen: [5.5, 15, 9], caudate: [5, 16, 7], gpe: [3.5, 10, 6], gpi: [2.5, 7, 4.5],
  hippocampus: [5, 16, 5], amygdala: [7, 8, 7], hypothalamus: [4, 6, 4], pons: [17, 14, 13], medulla: [9, 9, 14],
  midbrain: [13, 11, 11], cerebellum: [50, 26, 20], spinal: [5, 5, 24], 'corpus-callosum': [6, 34, 4],
  sn: [4, 9, 2.5], 'lat-ventricles': [4, 22, 5], 'third-ventricle': [1.5, 12, 8], 'fourth-ventricle': [7, 5, 9],
  aqueduct: [1.2, 6, 1.2], 'central-canal': [1, 1, 22], optic: [14, 4, 2], pituitary: [5, 4, 4], nacc: [5, 5, 4], lgn: [3, 4, 2.5],
};

const glassVS = `varying vec3 vN; varying vec3 vV; varying vec3 vP;
void main(){ vec4 mv = modelViewMatrix*vec4(position,1.0); vN=normalize(normalMatrix*normal); vV=normalize(-mv.xyz); vP=position; gl_Position=projectionMatrix*mv; }`;
const glassFS = `uniform vec3 uColor; uniform float uOpacity; uniform float uTime; uniform float uHi; uniform float uIri; uniform float uFlow;
varying vec3 vN; varying vec3 vV; varying vec3 vP;
void main(){ float f = pow(1.0-abs(dot(normalize(vN),normalize(vV))),2.2);
 vec3 c = uColor*(0.35+0.5*max(dot(normalize(vN),normalize(vec3(0.4,0.8,0.6))),0.0));
 vec3 iri = 0.5+0.5*cos(6.2831*(f*1.3+uTime*0.05+vec3(0.0,0.33,0.67)));
 c = mix(c, c*0.6+iri*0.5, uIri*f);
 c += uColor*f*1.2; float flow = uFlow*(0.5+0.5*sin(vP.y*60.0-uTime*3.0));
 c += vec3(0.13,0.9,1.0)*flow*0.6; c += vec3(1.0)*uHi*(0.35+0.25*sin(uTime*4.0));
 gl_FragColor = vec4(c, clamp(uOpacity*(0.45+0.9*f)+uHi*0.4,0.0,1.0)); }`;

function mat(color: string, opacity: number, iri: number, flow: number): THREE.ShaderMaterial {
  return new THREE.ShaderMaterial({
    vertexShader: glassVS, fragmentShader: glassFS, transparent: true, depthWrite: opacity > 0.9,
    blending: flow > 0 ? THREE.AdditiveBlending : THREE.NormalBlending, side: THREE.DoubleSide,
    uniforms: { uColor: { value: new THREE.Color(color) }, uOpacity: { value: opacity }, uTime: { value: 0 }, uHi: { value: 0 }, uIri: { value: iri }, uFlow: { value: flow } },
  });
}

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
}

export default function BrainViewer(props: ViewerProps) {
  const host = useRef<HTMLDivElement | null>(null);
  const api = useRef<{ meshes: THREE.Mesh[]; cortex: THREE.Mesh[]; grid: THREE.Object3D; csf: THREE.Mesh[]; deep: THREE.Mesh[]; root: THREE.Group; controls: OrbitControls; target: THREE.Vector3 } | null>(null);
  const propsRef = useRef<ViewerProps>(props);
  propsRef.current = props;

  useEffect(() => {
    const el = host.current;
    if (!el) return;
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio ?? 1, 2));
    renderer.setSize(el.clientWidth, el.clientHeight);
    el.appendChild(renderer.domElement);
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(40, el.clientWidth / Math.max(1, el.clientHeight), 0.01, 100);
    camera.position.set(-5.2, 2.2, -4.2);
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    const root = new THREE.Group();
    scene.add(root);
    const meshes: THREE.Mesh[] = []; const cortex: THREE.Mesh[] = []; const csf: THREE.Mesh[] = []; const deep: THREE.Mesh[] = [];

    // cortical areas as gyral patches + hemispheres
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
      const m = new THREE.Mesh(g, mat('#7fb8ff', 0.3, 0.2, 0));
      m.userData.id = side > 0 ? 'lobe-frontal' : 'lobe-frontal';
      m.userData.hemi = true;
      m.renderOrder = 10;
      root.add(m); cortex.push(m);
    });

    ALL_STRUCTURES.forEach((s: BrainStructure) => {
      if (s.kind === 'lobe') return;
      const isCortex = s.kind === 'cortex';
      const r = RADII[s.id] ?? (isCortex ? [7, 9, 7] : [2.2, 2.2, 2.2]);
      const sides = s.bilateral ? [1, -1] : [1];
      sides.forEach((side: number) => {
        const g = new THREE.SphereGeometry(1, 32, 20);
        const m = new THREE.Mesh(g, mat(s.color, isCortex ? 0.55 : s.kind === 'ventricle' ? 0.5 : 0.85, isCortex ? 0.1 : 0.9, s.kind === 'ventricle' ? 1 : 0));
        const base = s.seeds?.[0] ?? s.mni;
        const x = Math.abs(base?.[0] ?? 0) * side;
        m.position.copy(mni(x, base?.[1] ?? 0, base?.[2] ?? 0));
        m.scale.set(r[0] * S, r[2] * S, r[1] * S);
        m.userData.id = s.id;
        m.renderOrder = isCortex ? 11 : 1;
        root.add(m); meshes.push(m);
        if (s.kind === 'ventricle') csf.push(m); else if (!isCortex) deep.push(m);
      });
    });

    const grid = new THREE.Group();
    const gh = new THREE.GridHelper(200 * S, 20, 0x22e5ff, 0x1d3a4a);
    gh.position.copy(mni(0, -18, 0));
    grid.add(gh, new THREE.AxesHelper(80 * S));
    root.add(grid);
    api.current = { meshes, cortex, grid, csf, deep, root, controls, target: new THREE.Vector3() };

    const ray = new THREE.Raycaster(); const ptr = new THREE.Vector2();
    let down = { x: 0, y: 0 };
    const onDown = (e: PointerEvent) => { down = { x: e.clientX, y: e.clientY }; };
    const onUp = (e: PointerEvent) => {
      if (Math.abs(e.clientX - down.x) + Math.abs(e.clientY - down.y) > 5) return;
      const rect = renderer.domElement.getBoundingClientRect();
      ptr.set(((e.clientX - rect.left) / rect.width) * 2 - 1, -((e.clientY - rect.top) / rect.height) * 2 + 1);
      ray.setFromCamera(ptr, camera);
      const hits = ray.intersectObjects(meshes.filter((m: THREE.Mesh) => m.visible), false);
      propsRef.current?.onSelect?.((hits?.[0]?.object?.userData?.id as string) ?? null);
    };
    renderer.domElement.addEventListener('pointerdown', onDown);
    renderer.domElement.addEventListener('pointerup', onUp);
    const onResize = () => { camera.aspect = el.clientWidth / Math.max(1, el.clientHeight); camera.updateProjectionMatrix(); renderer.setSize(el.clientWidth, el.clientHeight); };
    window.addEventListener('resize', onResize);

    let raf = 0; const clock = new THREE.Clock();
    const loop = () => {
      raf = requestAnimationFrame(loop);
      const t = clock.getElapsedTime(); const pr = propsRef.current;
      const hi = new Set<string>([...(pr?.highlight ?? []), pr?.selected ?? '']);
      const dev = pr?.dev ?? 1;
      root.scale.setScalar(0.35 + 0.65 * dev);
      [...meshes, ...cortex].forEach((m: THREE.Mesh) => {
        const u = (m.material as THREE.ShaderMaterial).uniforms;
        u.uTime.value = t;
        const id = m.userData.id as string;
        u.uHi.value = !m.userData.hemi && hi.has(id) ? 1 : 0;
        if (m.userData.hemi) u.uOpacity.value = (pr?.opacity ?? 0.3) * (0.4 + 0.6 * dev);
        if (cortex.includes(m) || (m.renderOrder === 11)) (m.material as THREE.ShaderMaterial).depthWrite = (pr?.opacity ?? 0) > 0.9;
      });
      meshes.forEach((m: THREE.Mesh) => { if (m.renderOrder === 11) (m.material as THREE.ShaderMaterial).uniforms.uOpacity.value = Math.min(1, (pr?.opacity ?? 0.3) + 0.25); });
      csf.forEach((m: THREE.Mesh) => { m.visible = !!pr?.showCsf; });
      deep.forEach((m: THREE.Mesh) => { m.visible = pr?.showDeep !== false && dev > 0.5; });
      grid.visible = !!pr?.showGrid;
      const sel = meshes.find((m: THREE.Mesh) => m.userData.id === pr?.selected);
      if (sel) controls.target.lerp(sel.position.clone().multiplyScalar(root.scale.x), 0.06);
      else controls.target.lerp(new THREE.Vector3(0, 0, 0), 0.04);
      controls.update();
      renderer.render(scene, camera);
    };
    loop();
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', onResize);
      renderer.domElement.removeEventListener('pointerdown', onDown);
      renderer.domElement.removeEventListener('pointerup', onUp);
      controls.dispose();
      renderer.dispose();
      el.removeChild(renderer.domElement);
    };
  }, []);

  return <div ref={host} className={`w-full ${props.compact ? 'h-[300px]' : 'h-[60vh] md:h-[calc(100vh-8rem)]'} rounded-lg`} aria-label="Interactive 3D brain" />;
}
