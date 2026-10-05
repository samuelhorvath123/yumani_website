# Yumani: separate work, one clear flow

Four fine, separate blue strands gather into one continuous sculptural ribbon. The form expresses Yumani's work connecting systems and removing repetitive handoffs, using the existing hopeful blue palette and soft morning-light atmosphere.

## Artwork

Created with the built-in image_gen tool, using the previous ribbon as a style reference. The new composition is original geometry, not a recoloring of the previous loop.

- Master: [yumani-flow-master.png](./source/yumani-flow-master.png), 1536 × 1024 RGBA.
- Responsive assets: `public/images/yumani-flow-{640,960,1536}.{avif,webp}`, with transparency preserved.
- Lighting mask: `public/images/yumani-flow-light-mask.avif`, a 960 × 640 alpha mask derived from the master alpha (AVIF quality 90, at most 6/255 from the lossless [yumani-flow-mask.png](./source/yumani-flow-mask.png) it was made from), applied as a CSS mask on the light's wrapper. The hero only requests it once the light can play and shows the light only after it has decoded, so it never competes with the artwork or fonts on first load, reduced-motion visitors never download it, and a browser that cannot decode it simply shows no light.
- Light geometry: [lib/flow-light.ts](../lib/flow-light.ts). The four strand highlights and the gathered highlight with its core are chains of discs moving on compositor-only transform keyframes, each chain blurred on its own layer (stdDeviation 14 in artwork units, as before). Tests in tests/flow-light.test.mjs hold the tracks to within 1.5 artwork units of the ribbon at every moment.
- The previous ribbon files remain available.

### Final generation prompt

Create one premium photorealistic transparent PNG hero sculpture for Yumani Automation: four separated translucent ice-blue ribbon strands enter lower left at different heights and converge unmistakably at the center into one broad continuous ribbon. The unified ribbon rises into an open arch at upper right, rolls toward the viewer, and descends into a broad lower-right fold. Many separate processes become one continuous flow. Fine silky satin-glass surface, subtle longitudinal striations, crisp thin edges, soft morning studio lighting, pale ice blue and periwinkle with cobalt only in deeper folds. Hopeful, human and serene. Landscape composition, visual weight on center and right. Genuine transparent alpha, isolated foreground only. No closed loop, infinity shape, backdrop, floor, ground shadow, text, symbols, particles, robotic pipes or tangled cables.

## Motion

The copy settles in 450 ms. The first word change starts after 600 ms of visible page time, during the 1250 ms ribbon entrance. Each word cycle sends four soft highlights along the separate strands; these resolve into one broader highlight following the unified ribbon. Lighting is masked to the actual material, including its translucency.

Hover adds a restrained periwinkle lighting response and runs both word and light playback at 3×. Changing speed preserves progress. Offscreen and hidden-page motion pauses; reduced-motion mode shows the static art and settled text. No continuous animation loop runs on the artwork between pulses.

## Responsive composition

Wide layouts use a landscape stage at 76vw, capped at 1040px, with the source artwork's exact 3:2 aspect ratio. Compact layouts up to 900px use an absolutely positioned portrait 2:3 stage behind the right side of the copy, at 82% of the available width and capped at 360px. The copy and actions alone determine the section height; the ribbon adds no separate artwork row or empty scroll space. Its gathering point stays vertically centered within the hero. Left and vertical masks protect text readability, and the opening clips and fades any trailing artwork at the section boundary.

The image and its masked light rotate together by 90 degrees clockwise: separate strands enter from above and gather down the page. The inner canvas measures 150% of the portrait stage's width and two-thirds of its height, maintaining the source proportions. Compact artwork opacity is applied to this inner group so the entrance animation cannot override it.

Responsive image source sizes account for the wider inner canvas before rotation. The whole hero controls playback visibility, keeping text and light synchronized while the section is visible.

## Validation

The generated asset was inspected against the pale hero background and the masked lighting was rendered independently as an SVG diagnostic. Rotation and playback behavior have automated regression coverage. This pass did not include live browser visual or device testing.
