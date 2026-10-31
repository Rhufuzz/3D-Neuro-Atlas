'use client';

import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass.js';

/**
 * Zoom-through-scales scene: brain → neuron → synapse → ion channel.
 * Scroll/wheel drives one continuous camera dolly; each scale band is a Three.js group
 * whose meshes are generated procedurally (no extra assets). Pure visual metaphor —
 * the quantitative sims live in the panels below.
 */

const BANDS = [
  {
    id: 'brain', name: 'Whole brain', depth: [0.0, 0.16],
    fact: '≈ 86 billion neurons in ~1.4 kg of tissue.',
  },
  {
    id: 'neuron', name: 'Neuron & dendrites', depth: [0.16, 0.42],
    fact: 'One pyramidal neuron: ~20 µm soma, up to 10 000 synaptic inputs on its dendritic spines.',
  },
  {
    id: 'synapse', name: 'Synapse', depth: [0.42, 0.72],
    fact: 'A chemical synapse: the cleft is ~20 nm wide; vesicles release transmitter into it.',
  },
  {
    id: 'channel', name: 'Ion channels', depth: [0.72, 1.0],
    fact: 'Single ion channels: ~1 nm pores that open in the ~1 µs–ms range — the Hodgkin–Huxley gates live here.',
  },
];

function glass(color: string, opacity: number, opts: { additive?: boolean; doubleside?: boolean } = {}): THREE.ShaderMaterial {
  const shader = {
    uniforms: {
      uColor: { value: new THREE.Color(color) },
      uOpacity: { value: opacity },
      uTime: { value: 0 },
    },
    vertexShader: `varying vec3 vN; varying vec3 vV;
      void main(){ vec4 mv = modelViewMatrix*vec4(position,1.0); vN=normalize(normalMatrix*normal); vV=normalize(-mv.xyz); gl_Position=projectionMatrix*mv; }`,
    fragmentShader: `uniform vec3 uColor; uniform float uOpacity; uniform float uTime; varying vec3 vN; varying vec3 vV;
      void main(){ vec3 N=normalize(vN); vec3 V=normalize(vV); float f=pow(1.0-abs(dot(N,V)),2.0);
        vec3 c = uColor*(0.3+0.6*max(dot(N,normalize(vec3(0.4,0.8,0.6))),0.0)) + uColor*f*1.4;
        c += uColor*0.25*(0.5+0.5*sin(uTime*1.5+f*6.0));
        gl_FragColor = vec4(c, clamp(uOpacity*(0.35+1.1*f),0.0,1.0)); }`,
  };
  return new THREE.ShaderMaterial({ ...shader, transparent: true, depthWrite: false, blending: opts.additive ? THREE.AdditiveBlending : THREE.NormalBlending, side: opts.doubleside ? THREE.DoubleSide : THREE.FrontSide });
}

function dotTexture(): THREE.Texture {
  const c = document.createElement('canvas');
  c.width = c.height = 64;
  const ctx = c.getContext('2d');
  if (ctx) {
    const g = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
    g.addColorStop(0, 'rgba(255,255,255,1)');
    g.addColorStop(0.35, 'rgba(255,255,255,0.7)');
    g.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 64, 64);
  }
  return new THREE.CanvasTexture(c);
}

/** Deterministic PRNG so the scene is hydration-safe and identical every mount. */
function lcg(seed: number): () => number {
  let s = seed;
  return () => { s = (s * 1664525 + 1013904223) % 4294967296; return s / 4294967296; };
}

function buildBrain(): THREE.Group {
  const g = new THREE.Group();
  const r = new THREE.SphereGeometry(1.15, 64, 48);
  const pos = (r.attributes.position as THREE.BufferAttribute) as THREE.BufferAttribute;
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i), y = pos.getY(i), z = pos.getZ(i);
    const fold = 0.06 * Math.sin(8 * Math.atan2(z, x)) * Math.cos(6 * y) + 0.03 * Math.sin(14 * y);
    const s = 1 + fold;
    pos.setXYZ(i, x * s, y * 0.82 * s, z * 1.15 * s);
  }
  r.computeVertexNormals();
  const brain = new THREE.Mesh(r, glass('#7fb8ff', 0.4, { doubleside: true }));
  g.add(brain);
  // a bright tract pointing "down into" the next scale
  const tract = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.12, 1.6, 16), glass('#ff4fa3', 0.35));
  tract.position.set(0.35, -0.9, 0.2);
  tract.rotation.z = 0.25;
  g.add(tract);
  return g;
}

function buildNeuron(): THREE.Group {
  const g = new THREE.Group();
  const soma = new THREE.Mesh(new THREE.SphereGeometry(0.42, 48, 32), glass('#22d3ee', 0.5, { doubleside: true }));
  g.add(soma);
  const nucleus = new THREE.Mesh(new THREE.SphereGeometry(0.16, 32, 24), glass('#ff4fa3', 0.65, { additive: true }));
  g.add(nucleus);
  // dendrites: tapering tubes that subdivide
  const rng = lcg(11);
  const mat = glass('#4ade80', 0.5);
  const dend = (start: THREE.Vector3, dir: THREE.Vector3, len: number, rad: number, depth: number) => {
    if (depth === 0 || len < 0.12) return;
    const end = start.clone().addScaledVector(dir, len);
    const d = new THREE.Vector3().subVectors(end, start);
    const seg = new THREE.Mesh(new THREE.CylinderGeometry(rad * 0.62, rad, d.length(), 10), mat);
    seg.position.copy(start.clone().addScaledVector(d, 0.5));
    seg.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), d.clone().normalize());
    g.add(seg);
    if (depth <= 2) {
      const spine = new THREE.Mesh(new THREE.SphereGeometry(rad * 1.4, 10, 8), glass('#facc15', 0.8, { additive: true }));
      spine.position.copy(end);
      g.add(spine);
    }
    const n = depth > 2 ? 2 : rng() > 0.35 ? 2 : 1;
    for (let i = 0; i < n; i++) {
      const spread = 0.55 + rng() * 0.5;
      const nd = dir.clone().normalize()
        .add(new THREE.Vector3((rng() - 0.5) * spread, (rng() - 0.5) * spread * 0.6, (rng() - 0.5) * spread))
        .normalize();
      dend(end, nd, len * (0.6 + rng() * 0.15), rad * 0.62, depth - 1);
    }
  };
  for (let k = 0; k < 5; k++) {
    const a = (k / 5) * Math.PI * 2;
    dend(new THREE.Vector3(0, 0, 0), new THREE.Vector3(Math.cos(a), 0.55 + rng() * 0.5, Math.sin(a)).normalize(), 0.9, 0.09, 4);
  }
  // axon
  const axon = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.06, 1.7, 10), mat);
  axon.position.set(0, -1.0, 0);
  g.add(axon);
  for (let s = 0; s < 5; s++) {
    const sheath = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.07, 0.24, 12), glass('#f472b6', 0.55));
    sheath.position.set(0, -0.45 - s * 0.32, 0);
    g.add(sheath);
  }
  return g;
}

function buildSynapse(): THREE.Group {
  const g = new THREE.Group();
  const pre = new THREE.Mesh(new THREE.SphereGeometry(0.85, 48, 32), glass('#22d3ee', 0.28, { doubleside: true }));
  pre.position.set(0, 0.75, 0);
  pre.scale.set(1.25, 0.8, 1.0);
  g.add(pre);
  const post = new THREE.Mesh(new THREE.SphereGeometry(0.95, 48, 32), glass('#ff4fa3', 0.28, { doubleside: true }));
  post.position.set(0, -0.95, 0);
  post.scale.set(1.4, 0.75, 1.05);
  g.add(post);
  // vesicles inside the terminal
  const rng = lcg(23);
  const vesMat = glass('#a78bfa', 0.75, { additive: true });
  const vesicles: THREE.Mesh[] = [];
  for (let i = 0; i < 22; i++) {
    const v = new THREE.Mesh(new THREE.SphereGeometry(0.075 + rng() * 0.035, 16, 12), vesMat);
    const a = rng() * Math.PI * 2, rr = rng() * 0.7;
    v.position.set(Math.cos(a) * rr, 0.75 + (rng() - 0.5) * 0.55, Math.sin(a) * rr);
    v.userData.home = v.position.clone();
    v.userData.phase = rng() * Math.PI * 2;
    g.add(v);
    vesicles.push(v);
  }
  // transmitter dots in the cleft
  const tex = dotTexture();
  const n = 90;
  const geo = new THREE.BufferGeometry();
  const arr = new Float32Array(n * 3);
  for (let i = 0; i < n; i++) {
    arr[i * 3] = (rng() - 0.5) * 1.4;
    arr[i * 3 + 1] = (rng() - 0.5) * 0.5;
    arr[i * 3 + 2] = (rng() - 0.5) * 1.1;
  }
  geo.setAttribute('position', new THREE.BufferAttribute(arr, 3));
  const tm = new THREE.PointsMaterial({ color: '#facc15', size: 0.06, map: tex, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending });
  const tmol = new THREE.Points(geo, tm);
  g.add(tmol);
  // receptors on the postsynaptic side
  const recMat = glass('#34d399', 0.85, { additive: true });
  for (let i = 0; i < 9; i++) {
    const rec = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.08, 0.16, 8), recMat);
    rec.position.set((i - 4) * 0.16, -0.55, Math.sin(i * 2.1) * 0.3);
    g.add(rec);
  }
  g.userData.animate = (t: number) => {
    vesicles.forEach((v, i) => {
      // slow Brownian jitter; every ~2 s one dives to the membrane and "dumps"
      const cyc = (t * 0.5 + v.userData.phase) % 4;
      if (cyc < 0.55) {
        v.position.y = v.userData.home.y - (cyc / 0.55) * (v.userData.home.y + 0.28);
      } else if (cyc < 0.8) {
        v.position.y = -0.28;
      } else {
        v.position.copy(v.userData.home);
      }
      v.position.x = v.userData.home.x + Math.sin(t * 1.3 + i) * 0.02;
      v.position.z = v.userData.home.z + Math.cos(t * 1.1 + i * 1.7) * 0.02;
    });
    (tmol.material as THREE.PointsMaterial).opacity = 0.5 + 0.5 * Math.max(0, Math.sin(t * 1.5 - 1.2));
  };
  return g;
}

function buildChannel(): THREE.Group {
  const g = new THREE.Group();
  // lipid bilayer: two leaflets of head spheres
  const rng = lcg(7);
  const lip = glass('#f472b6', 0.5, { additive: true });
  for (let x = -14; x <= 14; x++) {
    for (const y of [-0.62, 0.62]) {
      const head = new THREE.Mesh(new THREE.SphereGeometry(0.13, 12, 10), lip);
      head.position.set(x * 0.15 + (rng() - 0.5) * 0.02, y + (rng() - 0.5) * 0.03, (rng() - 0.5) * 0.9);
      head.scale.y = 0.55;
      g.add(head);
      const tail = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.5, 6), glass('#f9a8d4', 0.25, { additive: true }));
      tail.position.set(head.position.x, y + (y > 0 ? -0.34 : 0.34), head.position.z);
      g.add(tail);
    }
  }
  // a pore-forming channel in the middle
  const ch = new THREE.Group();
  const subMat = glass('#22d3ee', 0.85, { doubleside: true });
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2;
    const sub = new THREE.Mesh(new THREE.CapsuleGeometry(0.09, 0.85, 6, 12), subMat);
    sub.position.set(Math.cos(a) * 0.2, 0, Math.sin(a) * 0.2);
    sub.rotation.x = Math.PI / 2;
    ch.add(sub);
  }
  g.add(ch);
  // ions streaming through
  const tex = dotTexture();
  const n = 40;
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(n * 3), 3));
  const ions = new THREE.Points(geo, new THREE.PointsMaterial({ color: '#facc15', size: 0.075, map: tex, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending }));
  ions.frustumCulled = false;
  g.add(ions);
  g.userData.ions = ions;
  g.userData.animate = (t: number) => {
    const arr = (geo.attributes.position as THREE.BufferAttribute).array as Float32Array;
    for (let i = 0; i < n; i++) {
      const u = ((t * 0.45 + i * 0.073) % 1) * 2 - 1;
      arr[i * 3] = Math.sin(i * 5.1) * 0.07 + Math.sin(t * 2 + i) * 0.012;
      arr[i * 3 + 1] = u * 1.25;
      arr[i * 3 + 2] = Math.cos(i * 3.7) * 0.07;
    }
    geo.attributes.position.needsUpdate = true;
  };
  return g;
}

export default function ZoomScene({ initialDepth = 0.06, fill = false }: { initialDepth?: number; fill?: boolean }) {
  const host = useRef<HTMLDivElement | null>(null);
  const [depth, setDepth] = useState(initialDepth);
  const depthRef = useRef(initialDepth);
  depthRef.current = depth;
  const band = BANDS.find((b) => depth >= b.depth[0] && depth < b.depth[1]) ?? BANDS[BANDS.length - 1];

  useEffect(() => {
    const el = host.current;
    if (!el) return;
    let disposed = false;
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio ?? 1, 2));
    renderer.setSize(el.clientWidth, el.clientHeight);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.1;
    el.appendChild(renderer.domElement);
    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#04060b');
    const camera = new THREE.PerspectiveCamera(45, el.clientWidth / Math.max(1, el.clientHeight), 0.01, 100);
    camera.position.set(0, 0.4, 3.4);
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.enablePan = false;
    const maxSamples = renderer.capabilities.maxSamples ?? 0;
    const composer = new EffectComposer(renderer, new THREE.WebGLRenderTarget(el.clientWidth, el.clientHeight, { type: THREE.HalfFloatType, samples: Math.min(4, maxSamples) }));
    composer.addPass(new RenderPass(scene, camera));
    composer.addPass(new UnrealBloomPass(new THREE.Vector2(el.clientWidth, el.clientHeight), 0.7, 0.5, 0.55));
    composer.addPass(new OutputPass());

    const tex = dotTexture();
    const scales: { group: THREE.Group; at: number }[] = [];
    // brain at 0, neuron at -6, synapse at -12, channel at -18 (camera dollies through)
    const positions = [0, -6, -12, -18];
    const builders = [buildBrain, buildNeuron, buildSynapse, buildChannel];
    builders.forEach((build, i) => {
      const g = build();
      g.position.set(0, 0, positions[i]);
      scene.add(g);
      scales.push({ group: g, at: positions[i] });
    });
    // faint "depth tunnel" rings to give a sense of motion between scales
    const ringMat = new THREE.MeshBasicMaterial({ color: '#22e5ff', transparent: true, opacity: 0.1, side: THREE.DoubleSide });
    for (let i = 0; i < 12; i++) {
      const ring = new THREE.Mesh(new THREE.RingGeometry(2.6, 2.65, 64), ringMat);
      ring.position.z = 0.8 - i * 1.8;
      scene.add(ring);
    }
    const fog = new THREE.FogExp2(0x04060b, 0.055);
    scene.fog = fog;

    const animate = (t: number) => {
      scales.forEach((s) => {
        s.group.traverse((o) => {
          const m = (o as THREE.Mesh).material as THREE.ShaderMaterial | undefined;
          if (m && m.uniforms?.uTime) m.uniforms.uTime.value = t;
        });
        s.group.userData.animate?.(t);
      });
      // camera dollies with depth (wheel) between -1 and -19.4
      const target = -0.8 - depthRef.current * 19.2;
      camera.position.z += (target - camera.position.z) * 0.06;
      fog.density = 0.03 + 0.05 * depthRef.current;
      composer.render();
    };
    let raf = 0;
    const clock = new THREE.Clock();
    const loop = () => {
      raf = requestAnimationFrame(loop);
      animate(clock.getElapsedTime());
      controls.update();
    };
    loop();

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const d = Math.min(1, Math.max(0, depthRef.current + e.deltaY * 0.00045));
      depthRef.current = d;
      setDepth(d);
    };
    renderer.domElement.addEventListener('wheel', onWheel, { passive: false });
    const onResize = () => {
      camera.aspect = el.clientWidth / Math.max(1, el.clientHeight);
      camera.updateProjectionMatrix();
      renderer.setSize(el.clientWidth, el.clientHeight);
      composer.setSize(el.clientWidth, el.clientHeight);
    };
    window.addEventListener('resize', onResize);
    return () => {
      disposed = true;
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', onResize);
      renderer.domElement.removeEventListener('wheel', onWheel);
      controls.dispose();
      composer.dispose();
      renderer.dispose();
      el.removeChild(renderer.domElement);
    };
  }, []);

  const jump = (d: number) => setDepth(d);
  const at = (id: string) => BANDS.findIndex((b) => b.id === id) * (1 / 3) + 0.03;

  return (
    <div className="space-y-3">
      <div ref={host} className={`relative w-full ${fill ? 'h-full' : 'h-[420px]'} rounded-lg overflow-hidden`} aria-label="Zoom through neural scales">
        <div className="absolute left-3 top-3 glass-panel px-3 py-2 rounded-lg text-xs space-y-1">
          <p className="font-semibold text-primary">{band.name}</p>
          <p className="text-[11px] text-muted-foreground max-w-[260px]">{band.fact}</p>
        </div>
        <div className="absolute right-3 top-3 glass-panel px-2 py-2 rounded-lg flex flex-col gap-1 text-[10px]">
          {BANDS.map((b) => (
            <button key={b.id} onClick={() => jump(at(b.id))} className={`px-2 py-1 rounded transition-colors text-left ${band.id === b.id ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-primary'}`}>{b.name}</button>
          ))}
        </div>
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 text-[10px] text-muted-foreground glass-panel px-3 py-1 rounded-full">scroll to zoom · drag to orbit</div>
      </div>
      <input aria-label="Zoom depth" type="range" min={0} max={1} step={0.001} value={depth} onChange={(e) => { const d = Number(e.target.value); depthRef.current = d; setDepth(d); }} className="range-neuro w-full" />
    </div>
  );
}
