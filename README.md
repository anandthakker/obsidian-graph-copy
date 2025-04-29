# Obsidian Graph Copy

Copy the active Obsidian note **plus every transitively-linked Markdown note** to your clipboard with a single command—perfect for pasting a self-contained context into an LLM chat or sharing a note bundle.

---

## Features

| Feature | Notes |
|---------|-------|
| **One-shot command**: `Copy note with dependencies` | Works from the command palette or a custom hotkey. |
| **Depth limit** | Stop after *n* link levels, or leave unlimited. |
| **Custom prefix/suffix** | Insert front-matter, titles, or any text between notes (supports `{{title}}` and `{{path}}`). |
| **Exclude glob** | Omit notes matching a minimatch pattern (e.g. `Private/**`, `*.daily.md`). |

---

## Installation

1. **Dev build (recommended while iterating)**  
   ```bash
   git clone https://github.com/yourname/copy-deps-obsidian.git
   cd copy-deps-obsidian && npm install && npm run build
   ```  
   In Obsidian → **Settings → Developer Plugins → Load unpacked** → select the repo folder.

2. **Community-plugins release (coming soon)**  
   Search for *Obsidian Graph Copy* in **Settings → Community plugins → Browse**.

---

## Usage

1. Open any note.  
2. Run **Command palette → Copy note with dependencies** (or hit your hotkey).  
3. A notice tells you how many notes were copied. Paste anywhere!

---

## Settings

| Setting | Default | Description |
|---------|---------|-------------|
| **Max depth** | ∞ | `1` = direct links only, `2` = links of links, … |
| **Prefix/suffix template** | `--- \n# {{title}}\n\n` | Use `{{title}}` & `{{path}}` placeholders. |
| **Exclude glob** | (empty) | Minimatch pattern; case-sensitive. |

---

## Development

* Code is TypeScript, bundled with `esbuild` just like the official [sample-plugin].  
* Unit-test friendly: vault interactions are isolated; see `test/` for a mock example.  
* PRs welcome—especially for:  
  * Embed / attachment support  
  * Progress bar for huge graphs  
  * Option to strip YAML & callouts

---

## Credits

- o3 for initial scaffolding and some code/README writing
- [obsidian](https://obsidian.md/)

## License

MIT © 2025 Anand Eng-Thakker
