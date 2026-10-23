# Portable prompt recipes

Use the available tool's documented call format. The text below is a prompt, not an assertion that every provider has fields named `seed`, `reference_images`, `transparent_background` or `negative_prompt`.

## Shared prompt structure

```text
Asset type and placement:
Primary request:
Reference role: identity / style-only / edit target / composition.
Identity to preserve:
Changes allowed:
Scene and single focal action:
Feline pose and contact:
Materials, palette and lighting:
Composition, safe area and intended themes:
Exact output requirement:
Constraints and unacceptable defects:
```

Read and view the actual reference before filling it. Avoid treating inherited generated wording such as “approved” as proof of approval; use the current project review record.

## Main character in a new scene

Preserve the supplied cream kitten's face, gray-brown glassy eyes, pink nose/inner ears/pads, fine fur, small sakura scarf and gold four-point star. Give the cat one graceful believable action. Use tactile short fur and coherent satin/pearl/linen props. Keep paws, ears and tail fully readable; leave space for actual UI text. Do not add lettering, fake screens, numeric claims or a guessed logo.

## Evolution edit

State: “Edit the supplied character into a candidate appearance. Change only [explicit list]. Preserve [identity locks]. Keep the original base form recognizable.” Name the fantasy branch and exact magical anatomy if present; do not let “fantasy” become uncontrolled extra limbs. Request before/after or side-view reference only if it helps the intended production step.

Example: preserve the cream face and gray-brown eyes, add sparse star freckles and a blue-lilac glow at the tail tip, replace the tiny clasp with the same four-point star surrounded by a small orbit ring. Keep the same scarf, ears, muzzle and sitting silhouette. No evolution statistics, textual badges or tier labels in the picture.

## New individual or breed

Use the master for material/lighting/art direction only. Specify the new cat's head, ears, muzzle, coat length, pattern and body proportions from appropriate references. Do not copy the main cat's exact face or white coat. Assign a new character ID and keep breed certainty honest.

## Deep/light theme pair

Use the existing scene as the edit target. Preserve exact characters, contact, poses and primary object locations. Relight for midnight-indigo or warm ivory. Keep the copy-safe area and coat colors readable. A transparent shared cutout can be reused when it already reads on both backgrounds; do not count duplicate references as separate original works.

## Supplemental motion-poster

Reuse the actual selected original image without redrawing its face, body, fur, paws or tail. Place it on a light or dark surface with a modest shadow and a few separately rendered soft star accents. Use restrained whole-image translation/rotation only when it improves the composition. Keep the original pixels and proportions, give the user pause control, honor reduced motion, pause hidden/offscreen content, and retain the unchanged still.

Label this `motion-poster` or planar composition. Do not claim a blink, articulated wave, breathing anatomy or 3D rotation. There is no need to call an image model merely to animate an existing layer in CSS/SVG.

## Actual 2D animation and key poses

Read [animation-workflow.md](animation-workflow.md). Specify a single action, start/end stance, duration, loop policy, limb ownership, prop contact and camera lock. Request a source sheet of actual sequential poses, then assemble and inspect timed playback. A source sheet alone is not an animation deliverable. Correct drifting faces, rubber limbs, ragged cutouts, visible holes and poor seams. An incomplete action remains incomplete while the website uses its still fallback.

Reusable source-art prompt:

```text
Edit the supplied sole identity reference into one sequential 2D sprite sheet.
Same cream kitten, same broad round face and gray-brown inset eyes with natural eyelids,
small pink nose, fluffy fine fur, sakura silk scarf and gold four-point star clasp.
Action: [one exact action]. Eight distinct sequential phases, in reading order:
[phase 1]; [phase 2]; [phase 3]; [phase 4];
[phase 5]; [phase 6]; [phase 7]; [phase 8].
Use 4 equal columns by 2 equal rows, real transparent alpha, no cell lines or labels.
Keep camera and character scale fixed. Maintain the same body anchor except the
explicit action displacement. Preserve jump clearance and limb/ear/tail margins.
Show the entire cat separately inside every cell, with consistent fur and lighting.
No props, cast shadow, background, text, extra paws/tails or changes of character.
```

Customize stance and phases for the action. Do not insist on a frozen seated body when requesting walking or stretching. Plan expressive eyes/ears/head together for emotions; preserve facial structure and avoid exaggerated human mouths. Output dimensions are a request, not a fact until measured. Keep any unavailable action or failed pose out of the runtime catalog.

## Deferred future 3D

Do not make an executable 3D request for the current scope. If a legacy input asks for 3D, return a deferred decision and the available 2D alternative. A future upgrade needs an explicit scope change, verified available tools and authorization, actual mesh likeness against the original, editable source, valid export and runtime evidence. Keep stable identity and appearance lineage with a replaceable renderer. New angle illustrations are optional inferred design references, never proof of geometry.

## Provider handoff

Pass the builder's active 2D prompt and verified reference bytes only through an available permitted capability. Map supported controls and keep owner/event/permission data out of the visual prompt. If a raster operation is unavailable, preserve the existing original and complete appropriate local composition work. Record missing new artwork honestly. Deferred 3D is not a missing current deliverable.
