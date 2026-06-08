# Flexume

> Build a resume worth flexing.

A two-pane résumé builder with a live, pixel-accurate A4 preview and local-AI
text editing via Ollama. Built with React + Vite + TypeScript.

**Live demo:** https://kiransbaliga.github.io/flexume/
(The AI features need a local Ollama server, so they only work when running
locally — the hosted demo gracefully shows "Ollama offline".)

![two panes: editor on the left, live A4 preview on the right](#)

## Features

- **Left pane — editor.** Collapsible sections → entries → bullet subpoints.
  Everything is generic: a section is just a title + a render *kind*
  (`Paragraph`, `Entries + bullets`, `Categories`), so adding new templates
  later is trivial. **Drag the divider** between the panes to resize the editor;
  fields reflow to one column when it's narrow.
- **Visual build-up.** Every section, entry, bullet, and contact has an
  eye toggle 👁 — flip it to include/exclude that piece from the PDF without
  deleting it. Reorder anything with ▲▼.
- **Page & Layout controls.** A collapsible card exposes font, accent colour,
  text size, line spacing, **page margins (top/bottom + left/right)**, and
  **section/entry spacing** — all live.
- **Right pane — live preview.** Renders the exact **Classic single-column**
  A4 document. What you see *is* the PDF.
- **Local AI (Ollama).** Each text field has an ✨ menu: _Improve, Concise,
  Quantify, Fix grammar, Summarise,_ or a custom instruction — all run on your
  local `gemma4:e4b` model. Nothing leaves your machine.
- **Export PDF.** `Export PDF` (or ⌘/Ctrl-P) opens the print dialog → *Save as
  PDF*. The print stylesheet isolates the page so the output matches the
  preview 1:1.
- **Save & continue.** Work autosaves to `localStorage`. Use **Save JSON** to
  download the full resume as a `.json` file and **Import** to load it back
  later (forward-compatible — older files get new settings filled in).

## Run

```bash
npm install
npm run dev
```

Open http://localhost:5173.

### Ollama

The app expects Ollama on `http://localhost:11434` with the `gemma4:e4b`
model pulled. Vite proxies `/ollama/*` → `localhost:11434` (see
`vite.config.ts`), so there's no CORS setup. The toolbar shows a live
connection indicator. To use a different model, change `OLLAMA_MODEL` in
`src/lib/ollama.ts`.

## Project layout

```
src/
  types.ts            data model (Resume → Section → Entry → Bullet)
  store.tsx           immer-backed state + all mutation actions + autosave
  lib/ollama.ts       Ollama client, rewrite presets
  data/resume.ts      sample + blank templates
  components/
    Toolbar.tsx       settings, Ollama status, export
    EditorPane.tsx    left pane
    HeaderEditor.tsx  name / tagline / contacts
    SectionCard.tsx   collapsible section
    EntryCard.tsx     entry with fields + bullets
    BulletRow.tsx     a single subpoint
    AiMenu.tsx        ✨ AI rewrite popover
    PreviewPane.tsx   right pane + zoom
    ResumeDoc.tsx     the A4 document (the printable template)
    ui.tsx            icons, toggles, auto-textarea
  styles/
    app.css           app chrome
    resume.css        the résumé template + @media print rules
```

## Adding a template (v2 direction)

The render is the only template-specific part. To add a template:
1. Add a branch / variant in `ResumeDoc.tsx`.
2. Add its styles in `resume.css` (keep `pt` units so print stays 1:1).
3. (Optional) expose a template picker in the toolbar wired to `settings`.
