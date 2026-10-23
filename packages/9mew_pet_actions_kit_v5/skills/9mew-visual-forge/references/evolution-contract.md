# Appearance evolution contract

## Scope

Create a **candidate appearance** for an existing pet identity. Use the pet's real event/rule context when an actual progression event exists; mark a concept exploration as `concept_only` when it does not. Do not invent earned milestones or modify a PetProfile from an art request.

Keep three records separate:

1. `character_id`: stable identity, e.g. `9mew.character.naimiao`.
2. `appearance_version`: immutable visual revision with source hashes and previous-version link.
3. Authoritative progression/routing records: growth stage, Bond, Stardust, model tier, rights, balance and grants. The visual skill does not write these.

## Input to the artist or agent

Use a structured request with:

- `job_id`, `task`, target asset ID/version and intended placement.
- `identity_mode`: `preserve` or `new-character`; the latter requires a new ID and character brief.
- Base reference and appearance version; local file hash; authorization for that reference.
- `branch`: `natural`, `astral`, `mist`, `aether`, `cultivation` or `mythic` as an initial art-direction vocabulary. These labels are not new progression rules.
- `allowed_changes` and corresponding `changes`; explain the exact requested scope.
- `proof_mode`: `concept_only` or `event_linked`; for the latter retain an opaque `event_ref` from the product, without adding private event text to the provider prompt.
- Desired themes, aspect ratio, output type, candidate/attempt caps and provider authorization reference where applicable.

A supplied event ID or authorization string is a reference to be checked by the actual service. The skill cannot authenticate it and must not treat a string as a grant.

## Identity preservation

For ordinary variations, lock face structure, eye identity, nose/muzzle, recognizable proportions, scarf/star cues, and base character personality. A change in pose or environment is not a new individual.

Allow only requested changes. The builder uses a finite vocabulary: `pose`, `expression`, `accessories`, `coat_color`, `coat_pattern`, `aura`, `lighting`, `environment`, `silhouette`, `mythic_anatomy`. Natural branches reject `mythic_anatomy`. Major silhouette or multi-tail/wing changes require a deliberate fantasy brief and separate visual review.

For the main cat, keep enough cream face/chest, recognizable eye identity and scarf/star motif to remain identifiable when adding astral accents. Do not add an extra tail merely because the brand contains nine. A deliberate mythic branch may specify a counted multi-tail form with coherent attachment and a clear base-form rollback.

For a truly new breed or individual, use `new-character` and a new ID. State which part of the original reference supplies style and which part must not transfer.

## Example branch vocabulary

| Direction | Allowed art idea | Identity anchor |
|---|---|---|
| Natural | Different pose, small seasonal scarf | Face, coat and body identity |
| Astral | Fine star freckles, luminous tail tip, orbit ribbon | Cream face/chest and the same eyes |
| Mist | Soft blue-lilac outer-fur gradient and mist curls | Recognizable muzzle/ears and scarf clasp |
| Aether | Glowing fur edges and floating light motes | Face silhouette and proportions |
| Cultivation | A small jade ornament, cloud-like shawl, star talisman | Cat remains visible; no oversized armor |
| Mythic | Explicit spirit wings or deliberately counted tails | Base face and controlled silhouette continuity |

These are creative suggestions, not earned levels, fixed paid products or a requirement to generate every combination.

## Candidate lifecycle and activation

Use the project's actual state machine. Conceptually: requested → generated candidate → technical checks → visual/content review → eligible for product activation. A failure leaves the previous appearance active. Store the candidate separately; do not overwrite the selected reference.

Activation is a server-authoritative compare-and-swap against the expected current appearance version, bound to character, owner/space, allowed audience, approved artifact hash and the actual event/rule decision where required. Recheck revoked consent, obsolete versions and permissions before activation. Keep a rollback pointer and an audit record.

The skill may prepare an activation request object for the owning application, but does not execute it. Do not infer activation from a rendered animation, successful image generation, or a technical validator's pass.

## Website runtime mapping

The supplied website adapter uses `AppearanceReference = {appearanceId, appearanceVersion, variantId, revision, approval}`. Keep these mappings explicit:

| Skill/art record | Website/platform meaning |
|---|---|
| `character_id` | Stable character relationship owned by the backend; not an appearance approval token |
| `target.asset_id` / delivery `asset_id` | Register the corresponding appearance family as `appearanceId` after review |
| `appearance_version` | Map to catalog `appearanceVersion`; do not confuse it with the image job ID |
| Theme/form variant | Map to a registered `variantId` with actual allowed file paths |
| `parent_appearance_version` | Retain in server provenance and rollback history |
| `review_state: candidate` | Keep backstage; never map directly to `approval: approved` |
| No equivalent generated field | Runtime `revision` is the server's current binding/concurrency revision |

The local website demonstration uses `approval: prototype` and an explicit local-preview revision. Real approval comes from the server registry. A rollback request carries `petId`, target appearance/version/variant, `expectedRevision`, approval reference and idempotency key; the server rechecks authority and returns a new revision. The public pet panel does not generate assets or expose administrative rollback.

## Privacy and reproducibility

Send only needed visual references and minimal appearance descriptors to a provider. Do not send private conversation memory, event bodies, KB documents, owner identifiers, credentials or payment details as image-generation context. Keep opaque service references in the local audit record; omit them from the actual art prompt.

Retain prompt/reference hashes, selected result hash, real provider/model/version and actual supported parameters. A seed is optional and only recorded as actual when returned/used by the provider. Never promise exact future recreation from a seed or textual prompt. Preserve selected source bytes for reliable reuse.

## Animation compatibility of a new appearance

Bind action assets to their actual appearance version. A new still appearance does not inherit a claim that the existing animation set matches its new scarf, coat, ears or tail. Validate required actions for that revision, or keep the new appearance as a static candidate while its action coverage is pending. Never silently play the base cat’s sprites under a label claiming a different evolved look. Preserve the active valid appearance until the owning service approves a complete supported representation.
