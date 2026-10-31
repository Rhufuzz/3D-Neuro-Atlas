import { test } from 'node:test';
import assert from 'node:assert/strict';
import { sm2, NEW_CARD } from '../lib/sm2';

test('new card, grade 4 (Good): first interval 1 day, ease unchanged', () => {
  const r = sm2(null, 4);
  assert.equal(r.repetitions, 1);
  assert.equal(r.interval, 1);
  assert.equal(r.easeFactor, 2.5);
  assert.ok(r.dueInMinutes > 0);
});

test('new card, grade 5 (Easy): first interval 3 days', () => {
  const r = sm2(null, 5);
  assert.equal(r.interval, 3);
  assert.equal(r.repetitions, 1);
});

test('second success: interval 6 days', () => {
  const r = sm2({ easeFactor: 2.5, interval: 1, repetitions: 1, lapses: 0 }, 4);
  assert.equal(r.interval, 6);
  assert.equal(r.repetitions, 2);
});

test('third success: interval grows by ease factor (rounded)', () => {
  const r = sm2({ easeFactor: 2.5, interval: 6, repetitions: 2, lapses: 0 }, 4);
  assert.equal(r.interval, Math.round(6 * 2.5));
  assert.equal(r.repetitions, 3);
});

test('failure (grade < 3): resets repetitions, +1 lapse, 10-minute relearning step, ease floor 1.3', () => {
  const r = sm2({ easeFactor: 2.5, interval: 20, repetitions: 4, lapses: 1 }, 1);
  assert.equal(r.repetitions, 0);
  assert.equal(r.interval, 0);
  assert.equal(r.lapses, 2);
  assert.equal(r.easeFactor, 2.3);
  assert.equal(r.dueInMinutes, 10);
  const floored = sm2({ easeFactor: 1.3, interval: 5, repetitions: 2, lapses: 0 }, 1);
  assert.equal(floored.easeFactor, 1.3);
});

test('grades are clamped to 0..5', () => {
  assert.equal(sm2(NEW_CARD, 9).repetitions, 1);
  assert.equal(sm2(NEW_CARD, 2).repetitions, 0);
});
