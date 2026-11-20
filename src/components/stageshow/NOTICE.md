# Stageshow kit (vendored)

These files are a subset of the Stageshow kit by Benji Taylor, MIT licensed
(see `LICENSE` in this folder). Changes from upstream: only the parts this
site uses are kept, the playground's virtual-clock installer is removed from
`clock.ts`, and the `window.__stageshow` and act-wrapping casts are replaced
with a typed `Window` declaration and `Reflect` calls.

Changes marked `(Tavis)` in the source: `stage.tsx` renders the poster as the
first frame (the server included) and reads the reduced-motion preference
directly when its loop effect starts, so a still never flashes the opening;
`Bar` and `Camera` are added from `kit/window.tsx` and `kit/motion`.
