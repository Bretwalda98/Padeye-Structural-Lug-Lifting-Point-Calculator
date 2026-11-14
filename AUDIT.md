# Padeye audit — 14 November 2026

Scope: the original `main` source, its calculation and display states, documentation and reproducible regression checks. This audit does not certify a lifting point or establish a project design basis.

## Findings and action

| Priority | Reproduced finding | Action |
| --- | --- | --- |
| High | With default cheek thickness and `w = 0`, the code set weld demand to zero and displayed five PASS results. | Cheek plates now require a positive weld leg. All results are withheld on invalid input. |
| High | `Load = -1500` produced five PASS results and a negative governing UC; a blank load silently became zero. | Blank, nonfinite and negative inputs are rejected where physically inapplicable. Stresses and derived values are checked for finite results. Explicit zero load remains valid. |
| High | A hole smaller than the pin still produced PASS; negative/zero ligament areas could generate negative or nonfinite UCs. | Pin fit and positive main/cheek ligaments are validated before calculation. The model also requires the concentric cheek radius not to exceed the main-plate radius. |
| High | README claimed EN/AISC/DNV compliance and pin verification, although the code has no pin shear/bending calculation or traceable clauses. | Removed unsupported claims; scope and missing checks appear on the page, in Help, and in README. Row labels now say WITHIN LIMIT / EXCEEDS LIMIT rather than implying complete padeye approval. |
| Medium | A bare main plate displayed a cheek-weld PASS. | Cheek weld becomes N/A when `tc = 0` and is excluded from governing UC. |
| Medium | The universal 4 mm clearance warning had no identified source. | Replaced it with a manufacturer/project fit requirement. Geometric pin/hole interference is still blocked. |
| Medium | The arrow input looked like an analytical load-angle input but changed no stresses. | Explicitly labelled visual only; excluded out-of-plane loading is prominent. |
| Medium | `2F′/Aw` could be mistaken for counting two welds while `Aw` is one weld. | Retained the original factor 2 as an explicit legacy load allowance. Clarified one-cheek load and one-weld area; no unsupported capacity increase was introduced. |
| Medium | Meaning of c–c length was unclear; the code uses `tm × ℓ`, with no factor of two. | Labelled ℓ as total c–c shear-path length. Users must derive that total from actual geometry. |
| Low | README referred to nonexistent `padeye.html`; document title had an extra `>`; Help could overflow a small viewport. | Corrected entry path/title and added modal scrolling. The no-cheek schematic no longer draws a cheek ring. |

## Calculation basis retained

The original five equations and yield-strength multipliers remain unchanged for valid inputs. At default inputs, design load is **1950 kN** and governing screening UC is **0.858** (rounded). The factor 2 on nominal per-cheek weld load has not been removed or reinterpreted as two weld areas. No source workbook was supplied, so these equations and factors remain an unverified project basis.

The circular equal-leg fillet assumption gives throat `w/√2`; `Aw` uses a full circumference. Actual effective weld lengths, weld material resistance, fabrication requirements and load distribution must be established for the detail. The current implementation does not add those checks.

## Validation

Run `node --test tests/*.test.cjs` (Node 18+). **29 tests passed** after the changes:

- Independent numerical examples for all five default equations and governing UC.
- Demand/utilisation scaling and overload classification.
- Positive/zero/negative loads, invalid pin/hole and ligament geometry, missing cheek weld, absent cheeks, zero/negative strength, nonfinite and overflowing inputs.
- Page initialisation, result invalidation, clearing the previous drawing, restoring results after correction and the N/A weld display.

The original defects were reproduced before modification using the original inline script in a Node VM with a minimal DOM. Tests exercise the shared production `calculator.js` and the page's actual inline integration code. Browser screenshots and deployment checks are handled separately by the publishing review; Node DOM tests do not claim cross-browser validation.

## Remaining limits and source checks

- No verified EN/AISC/DNV design method, pin shear/bending, shackle capacity or fit, base weld/supporting structure, fatigue, fracture or out-of-plane loading check is provided.
- The load factor is explicitly a multiplier `v ≥ 1`; it does not replace project-specific dynamic, consequence, load-sharing or resistance factors.
- Both cheeks are assumed identical and of the same material as the main plate; the simplistic thickness-proportional load share requires project justification.
- `ℓ` is independent input and is not derived or checked against an actual c–c failure path. The diagram does not define that path.
- Tailwind is still loaded from its existing CDN for styling. Calculation code is local and dependency-free.

Primary publisher material consulted during the audit:

- [SCI/BCSA — Welding](https://steelconstruction.info/topics/fabrication/welding): distinguishes fillet leg length from effective throat and warns that the dimension must be explicit. It does not substantiate this tool's legacy capacity coefficients.
- [DNV — DNV-ST-N001](https://www.dnv.com/energy/standards-guidelines/dnv-st-n001-marine-operations-and-marine-warranty/): official scope/edition information. The landing page does not validate this implementation's claimed standard compliance.
