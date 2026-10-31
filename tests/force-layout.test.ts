import { test } from 'node:test';
import assert from 'node:assert/strict';
import { forceLayout } from '../lib/force-layout';

test('produces a position for every node, inside the box', () => {
  const nodes = Array.from({ length: 12 }, (_, i) => ({ id: `n${i}`, group: i % 3 }));
  const edges: [string, string][] = [['n0', 'n1'], ['n1', 'n2'], ['n2', 'n3']];
  const pos = forceLayout(nodes, edges, { width: 800, height: 600, iters: 120, groups: 3 });
  assert.equal(Object.keys(pos).length, 12);
  for (const nd of nodes) {
    const p = pos[nd.id];
    assert.ok(p, `missing position for ${nd.id}`);
    assert.ok(p.x >= 0 && p.x <= 800 && p.y >= 0 && p.y <= 600, `${nd.id} out of box: ${p.x},${p.y}`);
  }
});

test('is deterministic: same input, same output', () => {
  const nodes = Array.from({ length: 20 }, (_, i) => ({ id: `x${i}`, group: i % 4 }));
  const edges: [string, string][] = Array.from({ length: 20 }, (_, i) => [`x${i}`, `x${(i + 1) % 20}`] as [string, string]);
  const a = forceLayout(nodes, edges, { width: 640, height: 480 });
  const b = forceLayout(nodes, edges, { width: 640, height: 480 });
  assert.deepEqual(a, b);
});

test('connected nodes end closer than the box diagonal', () => {
  const nodes = [{ id: 'a', group: 0 }, { id: 'b', group: 0 }];
  const pos = forceLayout(nodes, [['a', 'b']], { width: 800, height: 600, iters: 300, groups: 1 });
  const d = Math.hypot(pos.a.x - pos.b.x, pos.a.y - pos.b.y);
  assert.ok(d < 800, `edge endpoints too far apart: ${d}`);
});

test('edges referencing unknown ids are ignored (no crash)', () => {
  const nodes = [{ id: 'a', group: 0 }];
  const pos = forceLayout(nodes, [['a', 'ghost']], { width: 400, height: 400 });
  assert.ok(pos.a);
});
