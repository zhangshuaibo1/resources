# 2D pet actions: source art to actual playback

## Scope and identity

Deliver actual movement of the selected cat's eyelids, ears, head, paws, torso or tail. Maintain the sole identity master, gray-brown eyes, cream fur, sakura scarf and gold four-point star. Change the requested pose without freezing the original raised-paw posture into every action. Keep fine fur and soft volumetric shading as 2D illustration; do not return to the rejected 3D model.

Use the selected master as the reference for each new source sequence. A reviewed action may provide motion continuity guidance, but cannot become the new identity authority. Preserve the master unchanged and record its hash.

## Action coverage and honest counts

Use this as a production vocabulary, not a claim that the assets exist:

| Family | Useful actions | Visible performance requirement |
|---|---|---|
| Locomotion | walk, trot/run, jump, turn, sit/stand | Alternating limbs and weight shifts; jump includes crouch, takeoff, tucked apex and landing |
| Emotions | content/happy, excited, angry/huffy, sad, surprised, curious | Coordinated eye/ear/head/posture changes; preserve feline face and temperament |
| Daily life | blink, look around, wave, tail swish, stretch, groom, yawn, sleep, eat | Body part performs its named action; props only when designed and necessary |
| Product context | listen, think, respond, celebrate, comfort, cooperate | Map to an actual source action or declare a combination; no invented backend result |
| Fantasy | meditate, collect starlight, flourish, evolution transition | Explicitly planned character action plus restrained effects; show only authorized real progression |

Count independent source sequences separately from mirrored directions, alternate encodings/themes and compositions. `walk-left` may derive from `walk-right`; record its source and mirroring. A renamed happy clip used for a celebration is reuse, not a second original animation. Keep unavailable actions outside the selectable runtime catalog.

## Make one source sequence

1. View the reference; choose one action and its natural start/end stance. Define which visible paw moves and which supports the cat. Specify camera, crop, scale and ground anchor before generation.
2. Produce a small pilot. A useful source layout is a 4-column × 2-row transparent sheet of eight successive key poses, read left to right then top to bottom. Request equal cells, generous margins and the complete cat in every cell, with no labels, grid, background or baked shadow. Use supported size controls; record actual output dimensions, not requested dimensions as fact.
3. Describe all phases. Example jump: neutral → crouch → hind-leg push → paws tuck → apex → paws extend → soft landing → neutral. A jump must change the body shape and limb relationship; vertical translation alone is insufficient.
4. Inspect the sheet against the master at full resolution and intended website size. Check count/order, identity, coherent anatomy and non-overlapping cells. Reject or correct the specific deficient pose; do not accept an extra foot because the rest looks attractive.
5. Preserve the raw source, prompt and source/reference hashes. Keep provider/model/version/job/cost facts only when exposed; use null or `not_exposed` otherwise.

Use image generation for new raster artwork. Code may mechanically split, resample, align, mirror and encode approved artwork. Do not use code to invent replacement facial features or simplify the cat. Do not claim that the image tool generated video if it returned one sheet.

## Assemble without hiding defects

- Slice the real measured cells and inspect every cutout. If the generated grid is uneven, record actual cell rectangles; do not cut off ears or borrow a neighboring tail.
- Keep a shared canvas and consistent scale across the sequence. Correct accidental camera drift through documented placement only; preserve intended jump height, body squash and paw contact. Do not independently scale every bounding box to fill the canvas.
- Keep original alpha, fine fur edges and dark/light readability. If transparency is incorrect, use a supported image edit; do not call an opaque checkerboard transparent.
- Record exact frame order and per-frame duration. A held key pose is a timing decision, not new artwork. Repeating a frame to create a nominal 24 fps export does not make 24 distinct drawn frames per second.
- Use discrete frame replacement for keyed art. Avoid crossfade double eyes/paws and unverified optical-flow morphs. Use a gentle keyed timing style where only a few source poses are available; do not describe it as smooth full-frame animation.
- Use a real loop seam for idle/cyclic actions. For jumps or gestures, play once and return to the configured idle only after completion. Reverse/ping-pong only when anatomically and semantically plausible; do not reverse gravity, chewing or a landing to fabricate new behavior.
- Export useful animated WebP and GIF previews plus individual transparent frames, source sheets, a poster and the actual timeline. GIF may use a designed light/dark background to avoid palette halos; disclose it. Verify encoded outputs separately from the player.

## Player catalog

The current project uses `pet-actions/catalog.json` with `schemaVersion: "1.0"`, stable `characterId`, candidate `appearanceVersion: "0.4.0"`, `basePath`, `poster`, `defaultAction` and `actions`. Resolve `basePath` and `poster` against the catalog URL; resolve each frame's `src` against `basePath`. Use only registered local/controlled media, not arbitrary model-returned URLs.

Each available action declares `id`, `label`, `category`, `description`, `frames: [{src, durationMs}]`, `frameSize`, `anchor`, `playback` (`loop` or `once`), matching `loop`, and optional `returnTo`. Record `sourceActionId` for derived actions, `mirror` for a mirrored view and a `motion` travel cue only when the player supports it. Optional `sourceSheet`, `sourceFrameCount`, `derivation` and review/provenance metadata supplement the renderer; they are not approval tokens.

Store a source-action map outside presentation labels so exports and runtime derivatives retain their true origin. Never count `motion: travel` alone as a walk if the cat's limbs remain static. Keep authoritative approval in the owning appearance registry; local sample catalog status is `prototype`.

## Interaction and runtime behavior

Start from the poster and preload only the needed action. Use low-frequency blink/tail idle behavior by default. Keep walking, running, jumps and strong emotions user-triggered; the pet must not roam over forms or consent controls uninvited. Limit queues, prevent self-trigger cascades and support cancellation/return to idle.

Pause frame advancement and travel when hidden, offscreen or user-paused. Honor reduced-motion preferences, retaining a static pose; allow deliberate motion only through an explicit local control if the product supports it. Clear timers/listeners when unmounted. Missing media returns to the original poster without blocking page use. Keep drag/collapse/keyboard and touch safety independent of playback.

Map local selection to a demonstration only. Listening animation does not prove microphone capture; mouth motion does not prove TTS; a celebration does not create task success, rewards or growth. Real events use authorized backend adapters and the existing MODEL/media and audience boundaries.

## Evidence and completion

Run the catalog and encoded-media validators; then watch the actual player and each timed export, including the seam. Record frame/duration facts, visual findings, browser conditions, pause/reduced-motion behavior and missing performance gates separately. A hash pass cannot judge identity, beauty, gait or emotion.

Actual requested actions are required for the current website-pet deliverable. If a sequence fails identity or anatomy review, retain the fallback at runtime and correct/record that action as pending. A still, source sheet or whole-image bob does not complete the action. Keep production activation subject to its actual approval contract; do not introduce a permission question for every reversible creative correction.
