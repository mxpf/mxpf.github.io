# MXPF Portfolio Template

Static portfolio site for [mxpf.github.io](https://mxpf.github.io/). The public files at the project root are [GitHub Pages](https://docs.github.com/en/pages)-ready, while the editable source lives in `src/`.

Coded with [VS Code](https://code.visualstudio.com/) and [Codex](https://chatgpt.com/codex/). Uses [pagePiling.js](https://github.com/alvarotrigo/pagePiling.js) by [Álvaro Trigo](https://alvarotrigo.com/) for page transitions.

---

## What everything does

- `src/data/content.json` is the content source of truth for portfolio cards, case studies, and experiments.
- `css/theme.css` is the theme layer, containing the knobs for color, typography, grid rails, motion, buttons, progress bars, and detail-page spacing.
- `src/partials/` breaks the HTML into small sections so the homepage is easier to edit without hunting through one giant file.
- `js/content.js` is generated from `src/data/content.json` and powers the case and experiment detail pages.
- `js/site.js` contains small progressive enhancements that sit on top of the legacy interaction bundle.
- `case.html` and `experiments.html` are small shells. They render the correct detail page from the hash in the URL, for example `case.html#wales-times`.

## Common Commands

```sh
npm run content
npm run build
npm run check
npm run serve
```

Use `npm run serve` to preview at `http://localhost:8765/`.

## Editing Styles

Start in `css/theme.css`.

Important knobs:

- `--color-brand-primary`: the universal accent color.
- `--color-ink`: the dark teal background/text color.
- `--color-surface-warm`: the cream color.
- `--font-display`: the serif display face, currently `mxpf-serif`.
- `--font-body` and `--font-ui`: the branded sans face, `mxpf-sans`.
- `--grid-left`, `--grid-center-left`, `--grid-right-left`: the nav/grid rails.
- `--section-scroll-duration`, `--section-scroll-ease`, `--section-enter-offset`: page transition feel.
- `--reveal-distance`, `--reveal-duration`, `--reveal-ease`: detail-page scroll reveal behavior.

Avoid hard-coding colors in HTML or component CSS. Add or update a token in `css/theme.css` instead.

## Adding Pages

### Adding A Case

1. Add the case images to `images/case/` or a new folder under `images/`.
2. Add a case object to `cases` in `src/data/content.json`.
3. Add one or more homepage cards to `portfolioItems` that point to the case `slug`.
4. Set `nextSlug` on the case so “View next case” goes where you want.
5. Run:

```sh
npm run content
npm run build
```

Case URLs look like:

```text
case.html#your-case-slug
```

### Removing A Case

1. Remove its object from `cases`.
2. Remove any `portfolioItems` that use the same `slug`.
3. Update any `nextSlug` values that pointed to it.
4. Run `npm run content` and `npm run build`.

### Adding An Experiment

1. Add the preview image to `img/main/experiments/`.
2. Add any article images to `images/experiments/`.
3. Add an experiment object to `experiments` in `src/data/content.json`.
4. Give it a unique `slug`, `title`, `dateLabel`, `detailDate`, `datetime`, `image`, `heroImage`, `dek`, and `body`.
5. Run:

```sh
npm run content
npm run build
```

Experiment URLs look like:

```text
experiments.html#your-experiment-slug
```

### Experiment Body Blocks

The experiment body supports these block types:

```json
{ "type": "paragraph", "text": "Body copy." }
{ "type": "heading", "text": "Section heading" }
{ "type": "image", "src": "images/experiments/example.jpg", "alt": "Image description" }
{ "type": "pullquote", "text": "A large highlighted thought." }
```

Plain strings also render as paragraphs, but objects are clearer.

## Build Flow

Run `npm run content` when you only want to refresh generated content. It updates:

- the Work homepage carousel
- the Experiments homepage carousel
- `js/content.js`

Run `npm run build` when you edit source files. It runs the content sync first, then regenerates:

- `index.html`
- `case.html`
- `experiments.html`

Run `npm run check` before publishing. It syncs content, builds the site, and verifies key local pages.

## Expertise Rollover Videos

The Expertise section plays full-screen video loops on desktop hover/focus.

Put the videos in `video/` with these names:

- `clarity.mp4`
- `systems.mp4`
- `story.mp4`
- `leadership.mp4`

The filenames map to `data-video-key` values in `src/partials/home/sections/services.html`. To add or rename an expertise item, update the button’s `data-video-key`, the matching `<video>` element, and the matching copy panel.

Recommended exports:

- MP4/H.264
- muted, short seamless loops
- 1920x1080 or 2560x1440
- `object-fit: cover` friendly framing
- no more than 10 MB

Adjust the feel in `css/theme.css`:

- `--expertise-video-opacity`
- `--expertise-video-scrim`
- `--expertise-video-transition`

---

## License

The source code for this site is licensed under the MIT License.

All portfolio content, images, case studies, writing, logos, trademarks, and design assets are © Max Pfennighaus or their respective owners and may not be copied, reused, or redistributed without permission.
