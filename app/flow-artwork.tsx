import type { CSSProperties } from 'react';
import { discCount, lightStrokes, strokeBounds } from '@/lib/flow-light';

// An alpha mask of the ribbon's material, so the light only lands on the ribbon.
// Also named in globals.css, which applies it.
const LIGHT_MASK_SRC = '/images/yumani-flow-light-mask.avif';
// A little wider than the window on a phone, so the loop stays a good size past the
// edge (the same calc as .hero-art), and 76% of the window beside the copy on a
// wide screen.
const sizes = '(max-width: 900px) calc(25.5vw + 460px), min(76vw, 1040px)';

export default function FlowArtwork() {
  return (
    <div className="hero-flow-sculpture">
      <picture>
        <source
          type="image/avif"
          srcSet="/images/yumani-flow-640.avif 640w, /images/yumani-flow-960.avif 960w, /images/yumani-flow-1536.avif 1536w"
          sizes={sizes}
        />
        <source
          type="image/webp"
          srcSet="/images/yumani-flow-640.webp 640w, /images/yumani-flow-960.webp 960w, /images/yumani-flow-1536.webp 1536w"
          sizes={sizes}
        />
        <img
          src="/images/yumani-flow-960.webp"
          alt=""
          width="1536"
          height="1024"
          fetchPriority="high"
          decoding="async"
        />
      </picture>
      {/* The light is chains of discs that follow the ribbon on transform
          keyframes (lib/flow-light.ts), so the compositor moves it without a
          single repaint. Each stroke is blurred on its own layer and the
          wrapper's mask keeps the light on the ribbon. The mask loads only once
          the light can play; the hero sets data-light="ready" when it has, and
          the stylesheet names the same file. */}
      <div
        className="hero-flow-light"
        data-mask-src={LIGHT_MASK_SRC}
        aria-hidden="true"
      >
        <div className="hero-flow-canvas">
          {lightStrokes.map((stroke, index) => {
            const { x, y, width, height } = strokeBounds(stroke);
            return (
            <div
              key={index}
              className="hero-flow-stroke"
              style={{ left: x, top: y, width, height, '--disc-size': `${stroke.radius * 2}px`, color: stroke.color } as CSSProperties}
            >
              {Array.from({ length: discCount(stroke) }, (_, disc) => (
                <i key={disc} className="hero-flow-disc" />
              ))}
            </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
