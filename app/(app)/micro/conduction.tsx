'use client';

import { useEffect, useRef, useState } from 'react';
import { Pause, Play } from 'lucide-react';

/* Teaching animation, not to scale: unmyelinated continuous vs myelinated saltatory conduction. */
const X0 = 30, X1 = 510, PERIOD = 4;
const NODES = Array.from({ length: 9 }, (_, i) => X0 + i * 60);
const GAP = [3, 5]; // internodes 3→4 and 4→5 lose myelin when demyelination is on
const U_SPEED = 120; // px/s for the bare axon
const DWELL = 0.1; // s per node (regeneration at each node of Ranvier)

function myelinated(t: number, demy: boolean): { x: number; node: number | null; done: number } {
  let time = 0;
  for (let i = 0; i < NODES.length; i++) {
    if (demy && i > GAP[0] && i <= GAP[1]) continue;
    if (demy && i === GAP[0]) {
      if (t < time + DWELL) return { x: NODES[i], node: i, done: 0 };
      time += DWELL;
      const span = NODES[GAP[1]] - NODES[GAP[0]], dur = span / (U_SPEED * 0.8);
      if (t < time + dur) return { x: NODES[i] + ((t - time) / dur) * span, node: null, done: 0 };
      time += dur;
      continue;
    }
    if (t < time + DWELL) return { x: NODES[i], node: i, done: 0 };
    time += DWELL;
  }
  return { x: X1, node: null, done: time };
}
const myelinTotal = (demy: boolean) => myelinated(1e9, demy).done;

export default function Conduction() {
  const [t, setT] = useState(0);
  const [playing, setPlaying] = useState(true);
  const [demy, setDemy] = useState(false);
  const tRef = useRef(0);

  useEffect(() => {
    if (!playing) return;
    let raf = 0;
    let last: number | null = null;
    const step = (now: number) => {
      if (last !== null) { tRef.current = (tRef.current + (now - last) / 1000) % PERIOD; setT(tRef.current); }
      last = now;
      raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [playing]);

  const ux = Math.min(X0 + t * U_SPEED, X1);
  const my = myelinated(t, demy);
  const total = myelinTotal(demy);

  return (
    <div className="space-y-3">
      <svg viewBox="0 0 540 190" className="w-full panel rounded-lg" role="img" aria-label="Action potential travelling along an unmyelinated and a myelinated axon">
        <defs>
          <radialGradient id="ap-glow"><stop offset="0%" stopColor="#fbbf24" stopOpacity={0.95} /><stop offset="100%" stopColor="#fbbf24" stopOpacity={0} /></radialGradient>
        </defs>
        <text x={X0} y={22} fontSize={10} fill="hsl(var(--muted-foreground))">Unmyelinated axon (C fibre, ≈ 0.5–2 m/s): every patch of membrane regenerates the spike</text>
        <rect x={X0} y={40} width={X1 - X0} height={8} rx={4} fill="#334155" />
        <rect x={X0} y={40} width={Math.max(0, ux - X0)} height={8} rx={4} fill="#22d3ee" opacity={0.35} />
        <circle cx={ux} cy={44} r={16} fill="url(#ap-glow)" />
        <text x={X0} y={98} fontSize={10} fill="hsl(var(--muted-foreground))">Myelinated axon (Aα fibre, ≈ 70–120 m/s): the spike jumps between nodes of Ranvier</text>
        <rect x={X0} y={130} width={X1 - X0} height={8} rx={4} fill="#334155" />
        {NODES.slice(0, -1).map((x, i) => {
          const bare = demy && i >= GAP[0] && i < GAP[1];
          return bare
            ? <rect key={x} x={x + 4} y={122} width={52} height={24} rx={8} fill="none" stroke="#f87171" strokeDasharray="3 3" strokeOpacity={0.7} />
            : <rect key={x} x={x + 4} y={122} width={52} height={24} rx={10} fill="#e2e8f0" opacity={0.85} />;
        })}
        {NODES.map((x, i) => (
          <circle key={x} cx={x} cy={134} r={3} fill={my.node === i ? '#fbbf24' : '#64748b'} />
        ))}
        <circle cx={my.x} cy={134} r={16} fill="url(#ap-glow)" />
        {demy && <text x={(NODES[GAP[0]] + NODES[GAP[1]]) / 2} y={164} fontSize={9} textAnchor="middle" fill="#f87171">demyelinated (MS plaque): slow, continuous, may fail</text>}
        <text x={X1} y={184} fontSize={9} textAnchor="end" fill="hsl(var(--muted-foreground))">myelinated arrival {total.toFixed(1)} s vs bare {((X1 - X0) / U_SPEED).toFixed(1)} s (animation slowed ~1000×)</text>
      </svg>
      <div className="flex flex-wrap items-center gap-3 text-xs">
        <button onClick={() => setPlaying((v) => !v)} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-primary/15 text-primary hover:bg-primary/25">
          {playing ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}{playing ? 'Pause' : 'Play'}
        </button>
        <label className="flex items-center gap-2"><input type="checkbox" checked={demy} onChange={(e) => setDemy(e.target.checked)} className="accent-[hsl(var(--primary))]" />Demyelinate two internodes</label>
      </div>
      <p className="text-sm text-muted-foreground">
        Myelin from oligodendrocytes (CNS) or Schwann cells (PNS) raises membrane resistance and lowers capacitance, so current spreads passively and quickly under the sheath. Voltage-gated Na⁺ channels cluster at the nodes, where the spike is regenerated — saltatory conduction. Larger axon diameter also speeds conduction. Loss of myelin (multiple sclerosis, Guillain–Barré) slows or blocks conduction.
      </p>
    </div>
  );
}
