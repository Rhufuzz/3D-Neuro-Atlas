/** Deterministic force-directed layout (Fruchterman–Reingold style with group anchors). SSR-safe: no randomness. */
export interface LayoutNode { id: string; group: number }
export interface Pt { x: number; y: number }

export function forceLayout(nodes: LayoutNode[], edges: [string, string][], opts: { width: number; height: number; iters?: number; groups?: number }): Record<string, Pt> {
  const { width: W, height: H } = opts;
  const iters = opts.iters ?? 320;
  const G = Math.max(1, opts.groups ?? 4);
  const n = nodes.length;
  const idx: Record<string, number> = {};
  nodes.forEach((nd, i) => { idx[nd.id] = i; });
  const anchors = Array.from({ length: G }, (_, g) => ({ x: W / 2 + Math.cos((g / G) * Math.PI * 2 - Math.PI / 4) * W * 0.22, y: H / 2 + Math.sin((g / G) * Math.PI * 2 - Math.PI / 4) * H * 0.22 }));
  const x = new Float64Array(n), y = new Float64Array(n);
  nodes.forEach((nd, i) => {
    const a = i * 2.39996323; const r = 18 + 9 * Math.sqrt(i);
    x[i] = anchors[nd.group % G].x + Math.cos(a) * r; y[i] = anchors[nd.group % G].y + Math.sin(a) * r;
  });
  const E = edges.map(([a, b]) => [idx[a], idx[b]] as [number, number]).filter(([a, b]) => a !== undefined && b !== undefined);
  const k = Math.sqrt((W * H) / Math.max(1, n)) * 0.55;
  const dx = new Float64Array(n), dy = new Float64Array(n);
  for (let it = 0; it < iters; it++) {
    const temp = (1 - it / iters) * W * 0.06 + 0.5;
    dx.fill(0); dy.fill(0);
    for (let i = 0; i < n; i++) for (let j = i + 1; j < n; j++) {
      let ex = x[i] - x[j], ey = y[i] - y[j]; let d2 = ex * ex + ey * ey;
      if (d2 < 0.01) { ex = 0.1 * ((i % 3) - 1) + 0.05; ey = 0.1; d2 = 0.02; }
      const f = (k * k) / d2;
      dx[i] += ex * f; dy[i] += ey * f; dx[j] -= ex * f; dy[j] -= ey * f;
    }
    E.forEach(([a, b]) => {
      const ex = x[a] - x[b], ey = y[a] - y[b]; const d = Math.sqrt(ex * ex + ey * ey) || 0.01;
      const f = d / k;
      dx[a] -= ex * f; dy[a] -= ey * f; dx[b] += ex * f; dy[b] += ey * f;
    });
    for (let i = 0; i < n; i++) {
      const an = anchors[nodes[i].group % G];
      dx[i] += (an.x - x[i]) * 0.9; dy[i] += (an.y - y[i]) * 0.9;
      const d = Math.sqrt(dx[i] * dx[i] + dy[i] * dy[i]) || 1;
      const s = Math.min(d, temp) / d;
      x[i] = Math.max(30, Math.min(W - 30, x[i] + dx[i] * s));
      y[i] = Math.max(20, Math.min(H - 20, y[i] + dy[i] * s));
    }
  }
  const out: Record<string, Pt> = {};
  nodes.forEach((nd, i) => { out[nd.id] = { x: Math.round(x[i] * 10) / 10, y: Math.round(y[i] * 10) / 10 }; });
  return out;
}
