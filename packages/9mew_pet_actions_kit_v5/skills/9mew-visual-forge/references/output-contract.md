# Actual output and validation contract

## Delivery manifest

Create one manifest per meaningful asset/version. Paths are relative to that manifest's directory and must stay inside it. Keep private or signed URLs out of the public brand registry.

```json
{
  "schema_version": "9mew.visual-delivery.v1",
  "asset_id": "9mew.pet.official.appearance.astral",
  "asset_version": "0.1.0",
  "character_id": "9mew.character.naimiao",
  "appearance_version": "naimiao.astral.0.1.0",
  "review_state": "candidate",
  "files": [
    {
      "path": "appearance.png",
      "media_kind": "static",
      "expected_format": "png",
      "theme": "transparent",
      "sha256": "REPLACE_WITH_ACTUAL_SHA256"
    }
  ],
  "source": {
    "reference_hashes": [],
    "prompt_sha256": null,
    "provider": null,
    "model": null,
    "model_version": null,
    "actual_parameters": {},
    "provider_job_id": null,
    "actual_cost": null
  },
  "runtime_evidence": [],
  "visual_review": {"status": "pending"}
}
```

For encoded actual character animation use `media_kind: "character-animation-2d"`; the legacy `"animation"` alias remains readable. For an encoded whole-image/layer composition use `media_kind: "motion-poster"`. Both require an actual multi-frame file (or animated SVG), `poster_path`, optional `expected_frames_min`, and truthful duration. Do not confuse the two types. Use `max_bytes` only when a budget was set before production. SVG animation receives structural detection only; actual motion must be verified in a browser. Current delivery is 2D; `model3d` is deferred and rejected as an active delivery type by the current validator.

Record source/editable files as separate `source` records or in the owning project manifest; the lightweight validator checks display formats, not arbitrary `.blend` or source archives. Do not claim they were parsed when only a hash was recorded elsewhere.

## Sprite action catalog

Use the project catalog and URL rules from [animation-workflow.md](animation-workflow.md). Keep sheets as source art, each extracted frame as a static frame, and the actual playable timeline as `character-animation-2d`. Record separate source counts, mirrored derivatives and reused/combined states. Do not declare a sheet PNG to be animated, and do not count each theme/encoding as a new action.

Run `scripts/validate_action_catalog.py --catalog /path/to/kit/pet-actions/catalog.json --root /path/to/kit --out /path/to/work/action-checks.json`. It checks local containment, actual frames, decode facts, declared dimensions, timing, alpha, variation, default/return references and derivation references. It cannot certify face identity, correct gait or animation semantics. Keep visual/browser review evidence alongside the mechanical result.

## CSS/SVG planar composition

For a CSS composition, list its original display image under `files` with `media_kind: "static"`. Record CSS/TSX/HTML source paths and their hashes in a separate `source` record or the owning registry, and set the composition's `media_kind: "motion-poster"`, `renderer: "css-2d"`. The media validator does not parse arbitrary source files or prove their playback. Supply actual browser evidence for motion, pause, reduced-motion and offscreen/hidden behavior. Include the unchanged static fallback. Never report a CSS composition as an encoded GIF/WebP unless that file really exists and was decoded.

## Image quality and identity evidence

Follow [likeness-review.md](likeness-review.md). Record the original hash, actual still/frame comparison and specific findings for identity, image quality, composition and motion. Do not invent a likeness percentage. A valid image or animation file can still be visually poor; preserve its candidate/rejected state until the appropriate review.

Keep the selected original as the current base/fallback. Rejected GLB-derived images and animations remain excluded; a new filename or a technical pass cannot reinstate them. Keep character ID and appearance lineage stable while recording the current 2D representation separately from a possible future renderer.

These checks do not create blanket approval requests. Continue ordinary authorized edits and use the project's real review/activation rules. Requested pet actions are required in current scope. A still, contact sheet or motion-poster does not substitute for them; retain fallback during corrections and report the affected action as incomplete. Deferred 3D is excluded from current DoD and must not block release.

## What the validator proves

`scripts/validate_visual_delivery.py` checks local containment, actual file presence, nonzero bytes, hashes, format signatures, declared type consistency and available structural/media facts. With Pillow installed it completely decodes raster frames and records dimensions, frame count, duration, pixel variation and alpha. Without Pillow it reports raster decoding as not executed rather than a completed check.

A legacy GLB structural parser remains for honest file inspection; current 2D policy rejects such a file as an active delivery. Parsing never permits 3D production, validates likeness or reinstates a rejected asset.

The result never grants approval or activates an appearance. A technical pass and a visual review are separate facts. Fix errors and preserve prior valid assets; do not weaken a declared budget after checking a larger file.

## Initial project budgets

Use the active project's approved budgets when they differ; record changes before production.

- Homepage poster: desktop ≤240 KiB; mobile ≤120 KiB.
- Ordinary scene: desktop ≤160 KiB; mobile ≤80 KiB.
- Functional state graphic: ≤60 KiB.
- Small loop: retain the project’s predeclared byte/device budget (initial target ≤800 KiB); record actual dimensions, duration, key-pose count, distinct decoded frames and per-frame timing. A keyed animation may use held poses; nominal encoder fps does not prove that many distinct drawn frames or smooth full-frame motion.
- CSS planar motion: reuse the still rather than adding frame downloads; record the actual component/CSS size and browser evidence.
- Future 3D budgets: out of current scope; define and approve before any future production work.

Keep high-quality source art separately from web delivery exports. A file-size pass does not prove decode-memory or frame-rate performance. Keep performance-pending status for unmet or unmeasured gates.

## Required human/runtime checks

- View actual light/dark compositions and transparent edges; check identity and feline anatomy.
- Check intended safe areas, real HTML/localized text and mobile framing.
- Decode and view actual motion; inspect prop contacts, timing, stationary camera where requested and loop seams.
- For planar motion, exercise pause/resume, reduced motion, offscreen/hidden states and the static fallback.
- Measure the appropriate target device when production acceptance requires it.
- Check the owning application's appearance version, audience, review and activation contract before any replacement.

Share a reviewable result with actual limitations. Avoid claiming an entire catalog is finished because a plan contains IDs.

## Future 3D record

Keep `3d_status: deferred_optional_future_upgrade` outside current completion gates. Reconsider only after a deliberate scope change with verified tools, actual same-character mesh quality, editable source/export/runtime evidence and valid provider/data/cost authorization. Do not schedule model calls or add GLB as a required output in current 2D jobs.
