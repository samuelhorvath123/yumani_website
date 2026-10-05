import test from 'node:test';
import assert from 'node:assert/strict';
import { LIGHT_BLUR, TRACK_TOLERANCE, cubicBezier, discCount, lightStrokes, parseFlowPath, simplifyTrack, strokeBounds, strokeKeyframes } from '../lib/flow-light.ts';

const close = (actual, expected, tolerance, message) =>
  assert.ok(Math.abs(actual - expected) <= tolerance, `${message}: ${actual} is not within ${tolerance} of ${expected}`);

const translate = (keyframe) => keyframe.transform.match(/-?[\d.]+/g).map(Number);

test('a straight cubic measures and interpolates like a line', () => {
  const path = parseFlowPath('M 0 0 C 100 0 200 0 300 0');
  close(path.length, 300, 0.01, 'length');
  close(path.pointAt(150).x, 150, 0.5, 'midpoint');
  assert.deepEqual(path.pointAt(-20), { x: 0, y: 0 });
  assert.deepEqual(path.pointAt(900), { x: 300, y: 0 });
});

test('the easing matches CSS at its ends and inverts itself', () => {
  const ease = cubicBezier(0.3, 0.1, 0.3, 1);
  assert.equal(ease.at(0), 0);
  assert.equal(ease.at(1), 1);
  for (const time of [0.1, 0.35, 0.5, 0.8]) close(ease.timeOf(ease.at(time)), time, 1e-6, `round trip at ${time}`);
  assert.ok(ease.at(0.5) > 0.5, 'decelerating curve is ahead of linear halfway');
});

test('discs are dense enough that the blurred chain reads as one stroke', () => {
  for (const stroke of lightStrokes) {
    const length = parseFlowPath(stroke.d).length * stroke.dash;
    const gap = length / (discCount(stroke) - 1);
    assert.ok(gap <= stroke.spacing, 'gap within the spacing');
    // How far the chain's edge dips between two discs, against the blur.
    const dip = stroke.radius - Math.sqrt(stroke.radius ** 2 - (gap / 2) ** 2);
    assert.ok(dip <= LIGHT_BLUR / 4, `dip of ${dip.toFixed(2)} blurs away`);
  }
});

test('thinning keeps a track within tolerance of every sample it drops', () => {
  const times = Array.from({ length: 201 }, (_, i) => i / 200);
  const values = times.map((t) => [Math.cos(t * Math.PI * 3) * 100, t * 50]);
  const keep = simplifyTrack(times, values, 1);
  assert.equal(keep[0], 0);
  assert.equal(keep.at(-1), 200);
  assert.ok(keep.length < 60, `kept ${keep.length} of 201`);
  for (let k = 1; k < keep.length; k++) {
    const a = keep[k - 1], b = keep[k];
    for (let i = a; i <= b; i++) {
      const f = (times[i] - times[a]) / (times[b] - times[a]);
      const x = values[a][0] + (values[b][0] - values[a][0]) * f, y = values[a][1] + (values[b][1] - values[a][1]) * f;
      assert.ok(Math.hypot(x - values[i][0], y - values[i][1]) <= 1 + 1e-9);
    }
  }
});

test('the dash travels from before the start to past the end of its path', () => {
  const stroke = lightStrokes[4];
  const path = parseFlowPath(stroke.d);
  const { discs, envelope } = strokeKeyframes(stroke);
  const { x: originX, y: originY } = strokeBounds(stroke);
  const head = discs[discs.length - 1];
  const start = path.pointAt(0);
  const end = path.pointAt(path.length);
  // At the start the head sits a tenth of the dash length in, at the end the tail has left.
  const [firstX, firstY] = translate(head.transform[0]);
  const lead = path.pointAt(path.length * (stroke.dash - 0.1));
  close(firstX + stroke.radius + originX, lead.x, 1, 'head x at start');
  close(firstY + stroke.radius + originY, lead.y, 1, 'head y at start');
  const [lastX, lastY] = translate(discs[0].transform.at(-1));
  close(lastX + stroke.radius + originX, end.x, 0.5, 'tail parked at the end');
  close(lastY + stroke.radius + originY, end.y, 0.5, 'tail parked at the end');
  assert.ok(start.x < end.x);
  // Brightness rises from and returns to nothing.
  assert.equal(envelope[0].opacity, 0);
  assert.equal(envelope.at(-1).opacity, 0);
  assert.ok(Math.max(...envelope.map((k) => k.opacity)) >= 0.9);
});

test('a disc only shows while it lies on the path', () => {
  const ease = cubicBezier(0.3, 0.1, 0.3, 1);
  const opacityAt = (keyframes, time) => {
    for (let i = 1; i < keyframes.length; i++) {
      const a = keyframes[i - 1], b = keyframes[i];
      if (time <= b.offset) return b.offset === a.offset ? b.opacity : a.opacity + ((b.opacity - a.opacity) * (time - a.offset)) / (b.offset - a.offset);
    }
    return keyframes.at(-1).opacity;
  };
  for (const stroke of lightStrokes) {
    const length = parseFlowPath(stroke.d).length;
    const { discs } = strokeKeyframes(stroke);
    discs.forEach(({ opacity }, index) => {
      for (let i = 1; i < opacity.length; i++) assert.ok(opacity[i].offset >= opacity[i - 1].offset, 'offsets never go backwards');
      const along = (stroke.dash * length * index) / (discs.length - 1);
      for (let time = 0.002; time < 1; time += 0.01) {
        const centre = (-0.1 + 1.1 * ease.at(time)) * length + along;
        const onPath = centre >= 0 && centre <= length;
        // Allow the half-millisecond edge either side of the crossing.
        const margin = Math.abs(centre) < length * 0.01 || Math.abs(centre - length) < length * 0.01;
        if (!margin) assert.equal(opacityAt(opacity, time), onPath ? 1 : 0, `disc ${index} at ${time.toFixed(3)}`);
      }
    });
  }
});

test('every disc stays inside its stroke layer with room for the blur', () => {
  for (const stroke of lightStrokes) {
    const bounds = strokeBounds(stroke);
    for (const { transform } of strokeKeyframes(stroke).discs) {
      for (const keyframe of transform) {
        const [x, y] = translate(keyframe);
        assert.ok(x >= 0 && y >= 0, 'not above or left of the layer');
        assert.ok(x + stroke.radius * 2 <= bounds.width && y + stroke.radius * 2 <= bounds.height, 'not past the layer');
      }
    }
  }
});

test('keyframed tracks follow the ribbon to within the tolerance at every moment', () => {
  const ease = cubicBezier(0.3, 0.1, 0.3, 1);
  for (const stroke of lightStrokes) {
    const path = parseFlowPath(stroke.d);
    const { x: originX, y: originY } = strokeBounds(stroke);
    const { discs, envelope } = strokeKeyframes(stroke);
    assert.equal(envelope[0].offset, 0);
    assert.equal(envelope.at(-1).offset, 1);
    discs.forEach(({ transform }, index) => {
      assert.equal(transform[0].offset, 0);
      assert.equal(transform.at(-1).offset, 1);
      const along = (stroke.dash * path.length * index) / (discs.length - 1);
      for (let time = 0; time <= 1; time += 0.0037) {
        const next = transform.findIndex((k) => k.offset >= time);
        const b = transform[Math.max(next, 1)], a = transform[Math.max(next, 1) - 1];
        const f = (time - a.offset) / (b.offset - a.offset || 1);
        const [ax, ay] = translate(a), [bx, by] = translate(b);
        const exact = path.pointAt((-0.1 + 1.1 * ease.at(time)) * path.length + along);
        const x = ax + (bx - ax) * f + stroke.radius + originX, y = ay + (by - ay) * f + stroke.radius + originY;
        // The tolerance, plus the tenth of a unit the keyframes are rounded to.
        assert.ok(Math.hypot(x - exact.x, y - exact.y) <= TRACK_TOLERANCE + 0.1, `stroke r${stroke.radius} disc ${index} at ${time.toFixed(3)}`);
      }
    });
  }
});
