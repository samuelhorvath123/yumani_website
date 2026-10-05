// The hero's travelling light, drawn so that every frame is a compositor-only
// change. Each stroke is a chain of solid discs whose union is the round-capped
// dash the artwork calls for; each disc follows the ribbon through precomputed
// transform keyframes, and a CSS blur on the stroke's layer softens the chain
// back into light. Nothing is repainted while it runs, so the browser can keep
// it at full frame rate even when it throttles the page itself (Safari halves
// rendering updates in Low Power Mode).

export type Point = { x: number; y: number };
export type FlowPath = { length: number; pointAt: (distance: number) => Point };

export type LightStroke = {
  d: string;
  /** Dash length as a fraction of the path (the SVG dasharray over pathLength 1000). */
  dash: number;
  /** Half the stroke width, in artwork units (the canvas is 1536 × 1024). */
  radius: number;
  /**
   * Largest gap between disc centres. The chain's edge dips by
   * r - sqrt(r^2 - (gap/2)^2) between discs: at most 3.4 units here, under a
   * quarter of the blur's standard deviation, so it blurs away completely.
   */
  spacing: number;
  color: string;
  duration: number;
  delay: number;
};

const feederPaths = [
  'M 35 345 C 180 430 230 420 310 400 C 475 365 540 470 750 515',
  'M 40 485 C 210 585 280 490 405 495 C 530 490 610 542 750 515',
  'M 45 655 C 245 705 325 600 440 570 C 550 545 635 560 750 515',
  'M 45 785 C 260 870 335 640 485 635 C 615 640 660 548 750 515',
];
const gatheredPath =
  'M 750 515 C 890 490 910 395 984 275 C 1068 149 1224 110 1310 240 C 1480 432 1396 460 1307 586 C 1163 745 1282 813 1491 934';

/** Four highlights along the separate strands, then a broad one and its bright core along the gathered ribbon. */
export const lightStrokes: LightStroke[] = [
  ...feederPaths.map((d, index) => ({ d, dash: 0.1, radius: 13, spacing: 11, color: '#e6f9ff', duration: 620, delay: index * 25 })),
  { d: gatheredPath, dash: 0.11, radius: 60, spacing: 36, color: '#d3e9ff', duration: 1700, delay: 380 },
  { d: gatheredPath, dash: 0.07, radius: 14, spacing: 12, color: '#f0fbff', duration: 1700, delay: 380 },
];

/** Blur of the light, in artwork units: the original SVG filter's stdDeviation. */
export const LIGHT_BLUR = 14;
export const CANVAS_WIDTH = 1536;

// The dash starts a tenth of the path before the start and runs off the end
// (dashoffset 100 to -1000 over pathLength 1000). Brightness rises, holds and
// fades over the same eased progress.
const DASH_FROM = -0.1;
const DASH_TO = 1;
const ENVELOPE: [number, number][] = [[0, 0], [0.15, 0.95], [0.8, 0.8], [1, 0]];
const EASING: [number, number, number, number] = [0.3, 0.1, 0.3, 1];

/** Arc-length parametrisation of the absolute M/C paths the artwork uses. */
export function parseFlowPath(d: string, samplesPerCurve = 160): FlowPath {
  const numbers = (d.match(/-?\d*\.?\d+/g) ?? []).map(Number);
  const xs = [numbers[0]];
  const ys = [numbers[1]];
  const lengths = [0];
  let total = 0;
  for (let i = 2; i + 5 < numbers.length; i += 6) {
    const x0 = xs[xs.length - 1], y0 = ys[ys.length - 1];
    const [x1, y1, x2, y2, x3, y3] = numbers.slice(i, i + 6);
    for (let step = 1; step <= samplesPerCurve; step++) {
      const t = step / samplesPerCurve, u = 1 - t;
      const x = u * u * u * x0 + 3 * u * u * t * x1 + 3 * u * t * t * x2 + t * t * t * x3;
      const y = u * u * u * y0 + 3 * u * u * t * y1 + 3 * u * t * t * y2 + t * t * t * y3;
      total += Math.hypot(x - xs[xs.length - 1], y - ys[ys.length - 1]);
      xs.push(x); ys.push(y); lengths.push(total);
    }
  }
  return {
    length: total,
    pointAt(distance) {
      const target = Math.min(Math.max(distance, 0), total);
      let lo = 0, hi = lengths.length - 1;
      while (hi - lo > 1) {
        const mid = (lo + hi) >> 1;
        if (lengths[mid] < target) lo = mid; else hi = mid;
      }
      const f = (target - lengths[lo]) / (lengths[hi] - lengths[lo] || 1);
      return { x: xs[lo] + (xs[hi] - xs[lo]) * f, y: ys[lo] + (ys[hi] - ys[lo]) * f };
    },
  };
}

/** CSS cubic-bezier(x1, y1, x2, y2) as a function of time, and its inverse. */
export function cubicBezier(x1: number, y1: number, x2: number, y2: number) {
  const coordinate = (a: number, b: number, t: number) => 3 * a * (1 - t) * (1 - t) * t + 3 * b * (1 - t) * t * t + t * t * t;
  const parameterFor = (value: number, a: number, b: number) => {
    let lo = 0, hi = 1;
    for (let i = 0; i < 40; i++) {
      const mid = (lo + hi) / 2;
      if (coordinate(a, b, mid) < value) lo = mid; else hi = mid;
    }
    return (lo + hi) / 2;
  };
  return {
    at: (time: number) => (time <= 0 ? 0 : time >= 1 ? 1 : coordinate(y1, y2, parameterFor(time, x1, x2))),
    timeOf: (progress: number) => (progress <= 0 ? 0 : progress >= 1 ? 1 : coordinate(x1, x2, parameterFor(progress, y1, y2))),
  };
}

const pathCache = new Map<string, FlowPath>();
function pathFor(d: string) {
  let path = pathCache.get(d);
  if (!path) pathCache.set(d, (path = parseFlowPath(d)));
  return path;
}

export function discCount(stroke: LightStroke) {
  return Math.ceil((stroke.dash * pathFor(stroke.d).length) / stroke.spacing) + 1;
}

/**
 * The box a stroke can light up: its path, widened by the disc radius and the
 * reach of the blur. Each stroke's layer is only this big, so the compositor
 * blurs a strand's own area rather than the whole canvas.
 */
export function strokeBounds(stroke: LightStroke) {
  const path = pathFor(stroke.d);
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  for (let distance = 0; distance <= path.length; distance += 4) {
    const { x, y } = path.pointAt(distance);
    minX = Math.min(minX, x); minY = Math.min(minY, y); maxX = Math.max(maxX, x); maxY = Math.max(maxY, y);
  }
  const reach = stroke.radius + LIGHT_BLUR * 3;
  const x = Math.floor(minX - reach), y = Math.floor(minY - reach);
  return { x, y, width: Math.ceil(maxX + reach) - x, height: Math.ceil(maxY + reach) - y };
}

export type StrokeKeyframes = {
  envelope: Keyframe[];
  discs: { transform: Keyframe[]; opacity: Keyframe[] }[];
};

const round = (value: number) => Math.round(value * 10) / 10;

/** How far a keyframed track may stray from the exact one, in artwork units (about one device pixel). */
export const TRACK_TOLERANCE = 1.5;
/** How far a keyframed brightness may stray from the exact envelope. */
const ENVELOPE_TOLERANCE = 0.004;

/**
 * Keep only the samples a linear keyframe animation needs: greedily extend
 * each segment for as long as straight interpolation, in time, stays within
 * the tolerance of every sample it skips. WebKit resolves each keyframe of a
 * transform animation whenever it recomputes compositing, and each resolution
 * walks the keyframes again, so the count matters squared.
 */
export function simplifyTrack(times: number[], values: number[][], tolerance: number): number[] {
  const keep = [0];
  let anchor = 0;
  const fits = (end: number) => {
    for (let i = anchor + 1; i < end; i++) {
      const f = (times[i] - times[anchor]) / (times[end] - times[anchor]);
      let error = 0;
      for (let c = 0; c < values[i].length; c++) {
        const expected = values[anchor][c] + (values[end][c] - values[anchor][c]) * f;
        error += (expected - values[i][c]) ** 2;
      }
      if (Math.sqrt(error) > tolerance) return false;
    }
    return true;
  };
  for (let end = anchor + 2; end < times.length; end++) {
    if (!fits(end)) { keep.push(end - 1); anchor = end - 1; }
  }
  if (keep[keep.length - 1] !== times.length - 1) keep.push(times.length - 1);
  return keep;
}

/**
 * Keyframes with the easing baked in, to be played with linear timing: linear
 * keyframe animations are the kind every engine hands to its compositor. The
 * track is sampled every 2 ms and then thinned to the keyframes it needs.
 */
export function strokeKeyframes(stroke: LightStroke): StrokeKeyframes {
  const path = pathFor(stroke.d);
  const easing = cubicBezier(...EASING);
  const samples = Math.ceil(stroke.duration / 2);
  const times = Array.from({ length: samples + 1 }, (_, k) => k / samples);
  const progress = times.map(easing.at);
  const dashLength = stroke.dash * path.length;
  const count = discCount(stroke);
  const bounds = strokeBounds(stroke);
  const envelopeAt = (p: number) => {
    for (let i = 1; i < ENVELOPE.length; i++) {
      const [p0, v0] = ENVELOPE[i - 1], [p1, v1] = ENVELOPE[i];
      if (p <= p1) return v0 + ((v1 - v0) * (p - p0)) / (p1 - p0);
    }
    return ENVELOPE[ENVELOPE.length - 1][1];
  };

  const discs = Array.from({ length: count }, (_, index) => {
    const along = count > 1 ? (dashLength * index) / (count - 1) : 0;
    const track = times.map((_, k) => {
      const start = (DASH_FROM + (DASH_TO - DASH_FROM) * progress[k]) * path.length;
      const point = path.pointAt(start + along);
      return [point.x - stroke.radius - bounds.x, point.y - stroke.radius - bounds.y];
    });
    const transform = simplifyTrack(times, track, TRACK_TOLERANCE).map((k) => ({
      offset: times[k],
      transform: `translate(${round(track[k][0])}px, ${round(track[k][1])}px)`,
    }));
    // A disc only shows while it lies on the path, as the dash is only drawn there.
    const progressAt = (distance: number) => (distance / path.length - DASH_FROM) / (DASH_TO - DASH_FROM);
    const enter = easing.timeOf(progressAt(-along));
    const leave = easing.timeOf(progressAt(path.length - along));
    const edge = 0.0005;
    const opacity: Keyframe[] = [{ offset: 0, opacity: enter <= 0 ? 1 : 0 }];
    if (enter > 0) opacity.push({ offset: Math.max(0, enter - edge), opacity: 0 }, { offset: enter, opacity: 1 });
    if (leave < 1) opacity.push({ offset: leave, opacity: 1 }, { offset: Math.min(1, leave + edge), opacity: 0 });
    opacity.push({ offset: 1, opacity: leave < 1 ? 0 : 1 });
    return { transform, opacity };
  });

  const brightness = progress.map((p) => [envelopeAt(p)]);
  const envelope = simplifyTrack(times, brightness, ENVELOPE_TOLERANCE).map((k) => ({
    offset: times[k],
    opacity: Math.round(brightness[k][0] * 1000) / 1000,
  }));
  return { envelope, discs };
}
