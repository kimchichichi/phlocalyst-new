# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What This Is

A static artist portfolio website for **Phlocalyst** (Michiel De Vleeschhouwer — classical trumpet player and lo-fi / jazz-hop producer based in Munich). There is **no build system, no package manager, and no test suite**. All dependencies are loaded via CDN; JSX is transpiled in-browser by Babel.

## Running Locally

Serve the files with any static HTTP server — the JSX files are loaded as `<script type="text/babel" src="...">` and must be served over HTTP, not opened as `file://` URLs (CORS will block them).

```bash
python3 -m http.server 8080
# then open http://localhost:8080/
```

## File Map

| File | Role |
|---|---|
| `index.html` | Main site (landing page) — contains all page HTML, CSS variables, theme system, and the `window.TWEAK_DEFAULTS` block |
| `Bio.html`, `Contact.html`, `On The Road.html` | Secondary pages; share `contact.css` for nav/layout |
| `contact.css` | Shared stylesheet for the three secondary pages |
| `tapedeck.jsx` | Procedural audio engine + `<TapeDeck />` React component |
| `tweaks-panel.jsx` | Reusable tweaks panel system (`TweaksPanel`, `useTweaks`, sub-components) |
| `mount.jsx` | Wires both React roots into the page; contains `applyTweaks()` |
| `mobilenav.js` | Vanilla JS mobile hamburger nav — injects its own styles and DOM |
| `script.py` | Artist research utility that writes `output/phlocalyst_artist_research.md`; not part of the site |

## CDN Dependencies (Pinned Versions)

Loaded in `index.html` in this order:

- **mobilenav.js** (local)
- **Tone.js 14.8.49** — `cdn.jsdelivr.net/npm/tone@14.8.49/build/Tone.js`
- **React 18.3.1** + **ReactDOM 18.3.1** — `unpkg.com` (with SRI hashes)
- **Babel Standalone 7.29.0** — `unpkg.com` (with SRI hashes)
- `tweaks-panel.jsx`, `tapedeck.jsx`, `mount.jsx` — loaded as `type="text/babel"`

When upgrading any CDN version, update the SRI `integrity` hash accordingly.

## Architecture

### React Islands

The page uses two independent React roots so neither re-renders the other:

- `#tape-deck-mount` → `<TapeDeck />` from `tapedeck.jsx`
- `#tweaks-mount` → `<PhloTweaks />` (defined in `mount.jsx`, uses components from `tweaks-panel.jsx`)

Both roots are created in `mount.jsx` via `ReactDOM.createRoot()`.

### Theme System

Themes are driven entirely by CSS custom properties on `<html>`:

- **`data-theme`** attribute: `midnight` (default) | `warm` | `cream` | `acid`
- **`data-display`** attribute: `boldonse` (default) | `bagel` | `bigshoulders`

The initial values come from `window.TWEAK_DEFAULTS` in a `<script>` block near the top of `index.html`. These are applied synchronously before page paint (to prevent a flash), then the tweaks panel re-applies them reactively via `applyTweaks()` in `mount.jsx`. To change the site's default theme, edit the `TWEAK_DEFAULTS` block. Note: the `<html>` element has a hardcoded `data-theme="warm"` attribute, but `applyDefaults()` immediately overwrites it with the `TWEAK_DEFAULTS` value before first paint.

The secondary pages (`Bio.html`, `Contact.html`, `On The Road.html`) also default to the `midnight` theme and do not include the tweaks panel.

### Audio Engine (`tapedeck.jsx`)

The engine is **purely synthesised — no audio files**. Four tracks are hardcoded as data objects (`TRACKS[]`) at the top of the file, each defining:

- `chords`: array of chord arrays (one per bar, four bars total)
- `bass`: array of bass notes (one per bar)
- `drumPat`: 16-step grid `[{k?,s?,h?}|null]` for kick, snare, hi-hat

The Tone.js node graph is created **lazily on first play** to comply with browser autoplay policy. The signal chain is: synths → `lofiFilter` → `tapeWobble` → `reverb` → `compressor` → `master` → `meter` → `Tone.Destination`. Vinyl crackle (pink noise + high-pass) feeds into the same `lofiFilter`.

`TapeDeck` (the React component) and `TRACKS` (the track data array) are exposed to `window` via `Object.assign(window, { TapeDeck, TRACKS })` at the bottom of the file.

### Tweaks Panel (`tweaks-panel.jsx`)

`useTweaks(defaults)` is the core hook — it manages React state and persists changes by posting `__edit_mode_set_keys` to `window.parent`, which tells the host to rewrite the `TWEAK_DEFAULTS` block on disk. No `localStorage` is used. The panel announces itself by posting `__edit_mode_available` to `window.parent` and opens/closes in response to `__activate_edit_mode` / `__deactivate_edit_mode` messages from the host.

## Key Conventions

- **No JSX transpilation step** — edit `.jsx` files directly; Babel processes them at runtime.
- **CSS variables only** — all colour/spacing overrides go through custom properties defined on `:root` or a `[data-theme]` selector, never as inline values.
- **`TWEAK_DEFAULTS` block** in `index.html` is delimited by `/*EDITMODE-BEGIN*/` … `/*EDITMODE-END*/` comments; do not remove these markers.
- The secondary pages load `contact.css` as an external file but embed all other styles inline in `<style>` tags — keep this pattern consistent.
- `mobilenav.js` is self-contained (injects its own CSS and DOM); it targets `header.topbar` to find the nav and mirrors existing `<nav>` links automatically.

## Artist Facts (for Content Changes)

- **Artist:** Phlocalyst = Michiel De Vleeschhouwer (Flemish; born Sevilla, raised in Flanders)
- **Base:** Munich, Germany (since 2016)
- **Day job:** Third trumpet in a professional Munich orchestra; started producing in 2017
- **Streams:** 200M+ on Spotify (per Nettwerk biography)
- **Label:** Nettwerk Music Group — full recorded catalogue since 2022; sync licensing contact: `sync@nettwerk.com`
- **Contact emails:** `booking@phlocalyst.com` (booking — handled by Annika Lehmann), `collabs@phlocalyst.com` (collaborations — Michiel personally), `hi@phlocalyst.com` (general)
- **Spotify:** `open.spotify.com/artist/5xJ9q1lHwa8AShRof94oIt`
- **Instagram:** `@phlocalyst`
- ***Insights* EP (Dec 16, 2022, Nettwerk)** — debut release on the label; 8 tracks: Blue Fraction, Daylight, Morning Stroll, Aries, One of Those Things, Zeal, Beautiful Second, Moodswing
- ***Page Break* (Jun 30, 2023, Nettwerk)** — second album; 7 tracks: Rising Morning, Sapphire Bounce, Zeal Pt. 2, Marbles, Again, Emmitouflé, Our Time
- Full discography with tracklists: see `output/discography.md`
- The four tape deck tracks reference real releases: "Daylight", "Blue Fraction", "Zeal" (all from *Insights*, Nettwerk, 2022) and "Serendipity" (with LESKY, S!X - Music, Jun 2018). Note: `tapedeck.jsx` shows `label: 'MELTING POT'` and `release: 'w/ LESKY · 2020'` for Serendipity — both are incorrect per Discogs and Bandcamp; the real label is S!X - Music and the release year is 2018.
