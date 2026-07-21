# Design polish & UX changelog

Summary of the design/UX work on the `react-migration` branch. Grouped by area;
within each group the individual fixes are listed.

## Design system & theming

- **Load Inter** — `--font-sans: InterVariable` was declared but the font file
  was never imported, so the whole UI fell back to the OS default. Imported
  `inter.css`, enabled optical sizing + character variants.
- **Retune semantic colours** — replaced the raw Bootstrap-5 hex values
  (`--color-info: #007bff`, `danger`, `success`, `warning`) with brand-adjacent,
  desaturated tones.
- **Softer shadows** — two-step layered `--shadow-card` / `--shadow-raised`.
- **New shadcn primitives** — added `alert.tsx` and `item.tsx`.
  - `EditGroup` now builds on shadcn `Card`.
  - `TodoPanel` items use `Item` / `ItemGroup`.
  - `EditUnderskrifter` info boxes use `Alert`; person cards use `Card`.
- **Fixed `AlertDescription` line-breaking** — its `grid` layout put each inline
  child (text / `<strong>`) on its own row; switched to inline flow.
- **Favicon** — copied `favicon.ico` + `favicon-96x96.png` into the app and
  linked them; set `<title>` to "Gredor – gratis årsredovisning".

## Tooltips

- The field help icon was a native `<span title="…">` with a Bootstrap-blue
  circle — slow, inconsistent, and invisible in-app. Replaced with the real
  shadcn `Tooltip` + a muted lucide `Info` icon (works on hover **and**
  keyboard focus).

## Belopprad tables (RR / BR / Noter)

- **Removed the row-hover highlight** — it read as a distracting grey block.
- **Middle-align cells** — labels/inputs are vertically centred (was
  bottom-aligned).
- **Horizontal scroll** — wide tables (e.g. with the preview open) now scroll
  instead of clipping; title column has a min-width.
- **Restrained textarea focus** — dropped the heavy outline ring / backdrop
  highlight in favour of a subtle border colour.

## Notes (Noter)

- **Collapsible category cards** with a note count and chevron.
- **De-duplicated labels** — a note no longer repeats its title across the
  category heading, card title, and field label.
- **Left-hand tree sidebar** — category → note navigation with scrollspy
  highlight, click-to-scroll, and collapse/filter kept in sync with the panel
  via a shared `NoterNav` context. Rail can collapse to an icon strip.

## Editor shell

- **Wider content** — `max-w-3xl` → `max-w-5xl`.
- **Save draft restored** — a "Spara" button in the appbar exports the open
  draft as `.gredorutkast` (ports the Vue `exportFile` that the React rewrite
  had lost); re-openable from the start page.
- **Preview panel**
  - Fixed first-open sizing (it measured mid-animation → tiny/clipped
    document); re-measures after the open transition settles.
  - **Draggable split** between editor and preview.
  - Smaller default width.
- **Färdigställ & Skicka in are dialogs** — the two flows were routed pages;
  they now open as in-editor dialogs (`FinalizeWizardDialog`,
  `SendWizardDialog`) with local step state. The old routes redirect to the
  editor.
- **FAB polish** — floating action buttons open the dialogs above.

## TodoPanel ("Att åtgärda")

- **Typed items** — `TodoListItem.type` (`import` / `validation` / `info`);
  items are grouped under type headings.
- **Hide-completed filter** — a "Dölj färdiga" toggle hides fully-done items and
  also hides completed subtasks within partially-done items.
- **Badge counts only unfinished items** (rail + header).

## Start page

- **Playful hero** — eyebrow badge, two-tone headline, gradient resume card,
  colour-coded action-card icon chips with hover lift.
- **Single trust badge** — one chip "Helt gratis · godkänd av \<Bolagsverket
  logo\>" using the **official** Bolagsverket SVG (flower + wordmark); removed
  the duplicate bottom "Godkänt inlämningsformat" section.
- **Homepage chrome** — header and footer removed from the homepage; the footer
  now lives on the editor and info pages.

## Import (new årsredovisning)

- **SIE merged into the new-report wizard** — the dialog is now a two-step
  wizard with SIE upload first.
- **Auto-fill org number** — `parseSieHeader` reads the SIE `#ORGNR` (and
  `#FNAMN`) and prefills the organisationsnummer.
- **In-wizard results** — SIE import warnings/success are shown inline in the
  wizard instead of a separate modal (they still land in the todo list).

## Misc

- **Native checkboxes** styled with `accent-primary` (was default browser blue).
- Removed the duplicate "Om Gredor" link from the top nav.
