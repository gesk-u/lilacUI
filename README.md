<div align="center">

<img src="public/favicon.svg" alt="Lilac UI floret" width="96" />

# Lilac UI

### *A field guide to accessible components, styled your way.*

![React 19](https://img.shields.io/badge/React-19-4b3478?style=flat-square&logo=react&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5.8-6f58a3?style=flat-square&logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-8-7e66b5?style=flat-square&logo=vite&logoColor=white)
![WCAG 2.2 AA](https://img.shields.io/badge/WCAG_2.2-AA-5f6b4c?style=flat-square)
![License: MIT](https://img.shields.io/badge/License-MIT-a9b391?style=flat-square)

</div>

---

> **Lilac UI** : a library that blooms in small, accessible components.

Lilac UI is a small library of web components built on **native HTML** and checked against the four
principles of WCAG: *perceivable, operable, understandable, robust*. Every specimen comes with notes on
when to use it, when not to, its props, its keyboard map, and its accessibility guarantees.

And because no two gardens look alike, it ships with an **AI Customizer**: describe a style in plain
words (*"Halloween button"*, *"calm ocean switch"*) and get a themed component back, contrast-checked,
ready to copy as React, HTML, CSS or Tailwind.

---

## 🌸 The Components. More coming soon...

| | Specimen | Native roots | Field notes |
|---|---|---|---|
| 🔘 | **Button** | `<button>` | `primary`, `secondary` and `quiet` variants. Won't submit a form unless you ask it to. |
| 🌗 | **Switch** | `<button role="switch">` | Always controlled. The label names the setting and stays put in both states. |
| ☑️ | **Choice group** | `<fieldset>` + checkboxes | The legend is read before every option. Submits with a form via `name`. |
| 💬 | **Dialog** | `<dialog>` + `showModal()` | Focus moves in, Tab stays inside, the page goes inert, Escape closes. No focus-trap script. |

Each one is pressed and catalogued on the **`/components`** page, with live demos and copy-ready code.

---

## 🪄 The Customizer

```
  "Neon arcade checkboxes"
            │
            ▼
   ┌─────────────────┐     ┌──────────────────┐     ┌───────────────────┐
   │   your words    │ ──▶ │  AI writes a     │ ──▶ │  contrast check   │
   │  + optional CSS │     │  style (JSON)    │     │  (WCAG 2.2 AA)    │
   └─────────────────┘     └──────────────────┘     └─────────┬─────────┘
                                                              │ fails? ask once more,
                                                              │ naming the bad pairs
                                                              ▼
                                         ┌─────────────────────────────────────┐
                                         │ live preview + export:              │
                                         │ React · HTML · CSS · Tailwind ·     │
                                         │ design tokens                       │
                                         └─────────────────────────────────────┘
```

- **Plain-language prompts.** One-click examples included for when inspiration is wilting.
- **Bring your own palette.** Paste or upload a CSS file with `--primary`, `--background`, `--radius`…
  and Lilac reads it as you type, showing exactly what it understood.
- **Contrast is non-negotiable.** The server measures every colour pair, retries once if anything fails,
  and the client fixes whatever slips through, telling you what it changed.
- **Safe by construction.** The AI's reply is validated with Zod, and fonts come only from an allow-list,
  so a model can't sneak arbitrary values into your CSS.
- **Pick your model.** Swap AI providers with a single `.env` line:

  | Provider | Cost | Needs |
  |---|---|---|
  | 🦙 **Ollama** | free, runs on your machine | Ollama + a model (default `qwen2.5:3b`) |
  | ✨ **Gemini** | free tier | `GEMINI_API_KEY` |
  | 🧠 **Claude** | paid per request | `ANTHROPIC_API_KEY` |

---

## 🌱 Running it locally

**Prerequisites:** Node.js 22+, and optionally MongoDB and one of the AI providers above.

```bash
# 1. Clone the cutting
git clone https://github.com/gesk-u/lilacUI.git
cd lilacUI

# 2. Water it
npm install
npm run server:install

# 3. Prepare the soil
cp server/.env.example server/.env   # then choose AI_PROVIDER and add keys if needed

# 4. Let it bloom (two terminals)
npm run dev       # the site, via Vite
npm run server    # the API, on http://localhost:3001
```

> 💡 No database? Leave `MONGODB_URI` empty. Lilac still runs, it just won't save or cache styles.

### Scripts

| Command | What it does |
|---|---|
| `npm run dev` | Starts the Vite dev server with hot reload |
| `npm run server` | Starts the Express API in watch mode |
| `npm run build` | Type-checks and builds the site into `dist/` |
| `npm start` | Builds, then serves site **and** API from one address |
| `npm run lint` | Runs ESLint |

---

## 🌿Project Structure

```
lilacUI/
├── src/                     🌸 React + TypeScript front end
│   ├── components/          each specimen in its own folder, with a CSS module
│   ├── content/             component docs and live demos
│   ├── pages/               Landing, Components, Customizer
│   ├── services/            talks to the API
│   └── utils/               colour maths, design tokens, CSS parser, code export
│
├── server/                  Express + Mongoose API
│   └── src/
│       ├── routes/          POST /api/styles (rate-limited), GET /api/styles
│       ├── services/ai/     providers, prompt, schema, contrast checker
│       └── middleware/      rate limiting, error handling
│
└── public/                  the floret favicon
```

**API at a glance**

| Method | Route | Purpose |
|---|---|---|
| `GET` | `/api/health` | Is the server up, is the DB connected, which AI is answering |
| `POST` | `/api/styles` | Generate a style from a prompt (10 requests / minute) |
| `GET` | `/api/styles` | List saved styles |

---

## 🎨 The palette

Lilac's own colours, light and dark, are contrast-checked too: body text sits at **5.32:1 or higher**
and UI elements at **3.70:1 or higher** in dark mode.

| Swatch | Token | Light |
|---|---|---|
| ![](https://img.shields.io/badge/-%20%20%20%20-4b3478?style=flat-square) | `--petal-1` | `#4b3478` |
| ![](https://img.shields.io/badge/-%20%20%20%20-6f58a3?style=flat-square) | `--petal-2` | `#6f58a3` |
| ![](https://img.shields.io/badge/-%20%20%20%20-bca9de?style=flat-square) | `--petal-3` | `#bca9de` |
| ![](https://img.shields.io/badge/-%20%20%20%20-f3eff8?style=flat-square) | `--paper` | `#f3eff8` |
| ![](https://img.shields.io/badge/-%20%20%20%20-2a1d45?style=flat-square) | `--ink` | `#2a1d45` |
| ![](https://img.shields.io/badge/-%20%20%20%20-5f6b4c?style=flat-square) | `--stem` | `#5f6b4c` |
| ![](https://img.shields.io/badge/-%20%20%20%20-a9b391?style=flat-square) | `--leaf` | `#a9b391` |

Set in *Libre Caslon* for display, *Figtree* for reading and *IBM Plex Mono* for code.

---

## 🐝 Contributing

Open an issue to suggest a newcomponent or report a bug, or send a pull request.
A new component is ready when it:

- [ ] is built on the most fitting native HTML element
- [ ] works with the keyboard alone, and its keyboard map is documented
- [ ] meets WCAG 2.2 AA contrast in both light and dark themes
- [ ] has docs: when to use it, when not to, props, and accessibility notes

---

<div align="center">

**MIT licensed** · grown with care by [gesk-u](https://github.com/gesk-u)

</div>
