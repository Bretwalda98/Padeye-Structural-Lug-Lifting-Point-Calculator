# Padeye – Preliminary Lug Stress Screening

A static browser tool for selected padeye stresses, with geometry inputs in **mm**, load in **kN** and stresses in **MPa (N/mm²)**. Open `index.html` or use the repository's GitHub Pages site. Keep `calculator.js` beside `index.html`.

## Scope and design basis

This is a **preliminary screening model**, not a complete lifting-point verification or a verified implementation of EN, AISC or DNV standards. The original repository did not supply a source workbook, governing clauses or a traceable basis for its coefficients. The audit retained the equations to avoid an unsupported change in capacity.

The model assumes one main plate and, when `tc > 0`, two identical concentric cheek plates of the same yield strength. It uses thickness-proportional bearing load sharing. The arrow angle controls the drawing only: it does not resolve inclined loads or assess out-of-plane loading.

Not included: **pin shear or bending, shackle capacity and fit, base welds, supporting structure, fatigue, fracture assessment, or out-of-plane loading**. A result within a screening limit is not approval for lifting. Establish the project design basis and complete these checks separately.

## Equations retained

`Fdl = Load × v`, with a nonnegative load and load factor `v ≥ 1`. For stresses below, convert `Fdl` from kN to N.

| Check | Demand | Screening limit |
| --- | --- | --- |
| Pin/plate contact bearing | `Fdl / (dp × (tm + 2tc))` | `0.9fy` |
| Shear a–a | `1.1 × 0.5 × Fdl / Aa` | `0.4fy` |
| Net tension b–b | `Fdl / (2Aa)` | `0.45fy` |
| Cheek weld | `2F′ / Aw` | `0.4fy` |
| Tear-out c–c | `Fdl / (tm × ℓ)` | `0.4fy` |

- `Aa = (rm − dh/2)tm + 2(rc − dh/2)tc`.
- `Aw = 2πrc × w/√2` is the throat area of **one** full circular cheek weld; `w` is its equal-leg fillet weld size.
- `F′ = tc × Fdl / (tm + 2tc)` is the nominal load in **one** cheek.
- The original **factor 2** on cheek weld load is retained as an explicit model allowance. It is **not** the number of welds and must be checked against the project basis; it was not silently removed by the audit.
- `ℓ` is the **total length of the c–c shear paths** used in the area `tm × ℓ`, not the length of one of two paths. Determine it from the actual geometry.

## Input handling and results

Invalid, blank, nonfinite or physically inconsistent inputs withhold all results and clear the previous drawing. Cheeks require a positive ligament and weld size. Pin diameter cannot exceed hole diameter. The software does not impose an unsupported universal 4 mm clearance rule; confirm actual clearances and tolerances with the shackle manufacturer.

For a plain plate, set `tc = 0` (and `rc = 0`, `w = 0` if desired). The cheek-weld check is **N/A** and is excluded from the governing utilisation. `WITHIN LIMIT` and `EXCEEDS LIMIT` compare only the equations above.

## Development and validation

The calculation module has no external dependencies. The page retains Tailwind's CDN stylesheet generator, so an internet connection is needed for its full styling.

Run the regression and page-state tests with Node.js:

```sh
node --test tests/*.test.cjs
```

See [AUDIT.md](AUDIT.md) for findings, reproduction cases, and remaining engineering limits.
