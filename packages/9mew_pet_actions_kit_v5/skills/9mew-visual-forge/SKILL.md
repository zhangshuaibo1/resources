---
name: 9mew-visual-forge
description: Create consistent high-quality 2D art, real cat-action animation and fantasy appearance evolutions for 九喵/奶喵/喵灵. Use when Codex or another agent creates 9mew scenes, avatars, light/dark assets, walking/jumping, expressions, daily pet behaviors or appearance revisions from the selected cream-kitten identity. Preserve identity and fur quality; deliver actual requested motion, with 3D deferred.
---

# 九喵星绘 · 9mew Visual Forge

Create elegant 2D cat art and animation for 九喵宇宙. Preserve the selected original character and its tactile fur and lighting. Keep cultivation, mythology and cosmic fantasy as core creative directions. Maintain image quality while fulfilling requested actions; do not replace an animation request with a still.

## Start from the actual reference

1. Read `assets/identity.json` and view `assets/naimiao-master.png` before creating or editing the main cat. This original is the sole identity authority; new scenes, angle sheets and rejected models cannot replace it.
2. Read [style-bible.md](references/style-bible.md) for face, anatomy, palette, material, props and fantasy direction. View collaboration/privacy references only for relevant composition and style.
3. Read the current task and repository constraints. Preserve approved logo geometry and actual text; do not invent unavailable brand masters.
4. Follow `2d-quality-first.2`: the website-pet scope requires actual character movement, expressions and daily behavior. Use the original still as a runtime fallback while correcting failed motion; mark that action incomplete. Keep 3D deferred and outside current completion gates.

## Choose the route

| Request | Current route |
|---|---|
| Website pet | Deliver actual 2D action sequences and a player; retain the original still as fallback |
| Same cat, new scene or pose | Preserve identity; change only the requested scene or pose |
| Evolution, coat, accessory or aura | Follow [evolution-contract.md](references/evolution-contract.md); produce a versioned 2D candidate |
| New breed or fantasy individual | Assign a new character ID; use the master for style, not the exact main-cat face |
| Light/dark presentation | Reuse an unchanged transparent original when it reads well on both surfaces; adjust the surrounding scene |
| Whole-image movement or decorative layers | Label `motion-poster`; preserve the original face/body pixels and include a still fallback |
| Walking, jumping, emotions or daily behavior | Follow [animation-workflow.md](references/animation-workflow.md); produce and verify real 2D frames/rig motion |
| Exact logo, UI state, currency symbol or text | Reuse approved vector/code sources and actual localized UI |
| Legacy/requested 3D | Return a deferred job; continue current 2D work, without a 3D provider call |

Read [prompt-recipes.md](references/prompt-recipes.md) for generation prompts, [animation-workflow.md](references/animation-workflow.md) for action production, [likeness-review.md](references/likeness-review.md) for review and [output-contract.md](references/output-contract.md) for delivery contracts.

## Preserve quality before adding motion

- Keep the original wide rounded face, eyelids, short muzzle, outward ears, compact body, curved toes and fluffy curled tail. Compare actual outputs with the original, using specific observations rather than invented similarity scores.
- Prefer the unchanged original to a low-quality redraw or simplified geometric imitation. Do not trade facial identity, fur edges or elegant posture for more assets, lower bytes or additional effects.
- For a motion-poster, move the original as one layer with small translation/rotation and restrained separate accents. Do not stretch the face, cover the eyes, invent eyelids or call whole-image movement a real blink, wave or character performance.
- For actual 2D character animation, inspect every frame and its timed playback. Correct drifting identity, extra limbs, unstable paws, fur flicker and bad seams before counting the action as complete. A fallback keeps the website usable but does not satisfy the missing action.
- Use the available image-generation capability for new raster poses and expressions. Use code for mechanical cell extraction, alignment, encoding and playback. Do not redraw the selected cat as crude vector geometry, paint improvised eyelids over the master or use ghosted crossfades as substitute in-between frames.
- Count distinct source sequences, mirrored derivatives and reused/combined states separately. New labels, themes, file formats or a repeated timeline do not create new original actions.
- Keep the rejected website GLB and all its derived posters/animations out of active media and positive identity/style references. Their technical validity never cancels the visual rejection.
- Keep ordinary authorized work moving. These quality checkpoints do not require new permission for every reversible creative step.

## Prepare a portable handoff

```bash
python3 scripts/build_visual_job.py --request assets/requests/website-2d.json --out /path/to/work/website-job.json
```

The offline builder creates a prompt/job with verified local reference hashes. It does not call a provider, spend money, activate an appearance or alter growth. Relative extra references resolve within the skill; use `--reference-root` only for an authorized local reference directory.

Use `website-2d.json` for a genuine blink sequence, `website-jump.json` for a jump, or the appearance/scene examples for their own scopes. Prepare one source sequence per action. The builder produces a source-art prompt and separate final-delivery requirements; a generated sheet still needs frame assembly, encoding and playback review. Keep generated jobs outside the installed skill. Missing `target.media_kind` defaults to `static` only for non-action requests. The retained `website-3d.json` returns `deferred_by_visual_policy`, no execution route and zero attempts; it is not an active recipe.

## Execute with the available environment

- Use an available supported image tool for raster creation/editing. Follow its documented reference and transparency controls, without inventing video-generation capabilities. For unchanged-layer decorative compositions, build in code and label `motion-poster`.
- Inspect and send only authorized references. A local path does not grant permission to transmit private assets.
- Use existing valid task/data/provider/spending authorization without repeated confirmation. Finish authorized local work if an external route is unavailable; do not rewrite policy to create permission.
- Use bounded candidates and retries. Prefer one thoughtful variant, stop ineffective retries, and keep useful high-quality stills.
- Record actual prompt/reference hashes, supported parameters, provider/model facts, job IDs and cost facts when exposed. Keep unavailable facts null or `not_exposed`.
- Save revisions separately. Never overwrite the selected original or let a generated image self-approve its identity.

## Keep product domains separate

Keep stable `character_id`, appearance lineage, asset IDs, audience, provenance and rollback links. Store representation/renderer separately so a future approved renderer can reuse identity without inventing growth events.

Preserve **喵学徒 / 喵大师 / 喵真人 / 喵仙帝**. These are model-service display names in the cultivation world. Appearance changes do not increase model tier, price, balance, combat strength, permissions or consent. Only the owning service may activate a candidate under its existing review and authorization rules.

## Verify and hand over

1. Inspect the actual image on light and dark backgrounds and at intended display sizes. Check identity, fur edges, anatomy, pose, props, margins, copy-safe areas and fantasy scope.
2. Record static images, actual character animation, keyframe references and motion-posters as different types in [output-contract.md](references/output-contract.md).
3. Run `scripts/validate_visual_delivery.py` for encoded media and `scripts/validate_action_catalog.py` for actual sprite files/timing/derivation references. Inspect every frame and seam; validate the real player in a browser, including pause, reduced motion, offscreen/hidden behavior and fallback. Neither validator can judge identity or performance beauty.
4. Deliver actual files and editable source/build procedure, current review status, provenance and the unchanged static fallback. A technical pass cannot certify beauty or approve activation.

## Defer 3D cleanly

Do not discover or invoke 3D providers as part of the current 2D task. Revisit only after a deliberate future scope change and evidence of a capable, permitted workflow. Require actual same-character mesh likeness, editable source and export, runtime quality, and valid data/cost authorization. Preserve the rejected-model decision. A reference sheet or volumetrically shaded image does not satisfy this future requirement. Absence of GLB is not a defect or blocker in the current delivery.
