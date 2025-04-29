import {
	App,
	Plugin,
	PluginSettingTab,
	Setting,
	TFile,
	Notice,
} from "obsidian";
import { Minimatch } from "minimatch";
import { Settings, DEFAULT_SETTINGS } from "./settings";

/** Helper: replace {{title}}/{{path}} placeholders */
const applySeparator = (tpl: string, file: TFile) =>
	tpl.replace(/{{title}}/g, file.basename).replace(/{{path}}/g, file.path);

export default class CopyDepsPlugin extends Plugin {
	settings: Settings;

	async onload() {
		await this.loadSettings();

		this.addCommand({
			id: "copy-note-with-dependencies",
			name: "Copy note with dependencies",
			checkCallback: (checking) => {
				const file = this.app.workspace.getActiveFile();
				if (!file) return false;
				if (!checking) {
					this.copyWithDeps(file, "deps-to-target");
				}
				return true;
			},
		});

		this.addCommand({
			id: "copy-note-with-dependencies-reverse",
			name: "Copy note with dependencies (reverse)",
			checkCallback: (checking) => {
				const file = this.app.workspace.getActiveFile();
				if (!file) return false;
				if (!checking) {
					this.copyWithDeps(file, "target-to-deps");
				}
				return true;
			},
		});

		this.addSettingTab(new SettingTab(this.app, this));
	}

	/* ─────────────────────────────────────────────── */

	private async copyWithDeps(
		root: TFile,
		direction: "target-to-deps" | "deps-to-target"
	) {
		const mm = this.settings.excludeGlob
			? new Minimatch(this.settings.excludeGlob)
			: null;

		const seen = new Set<string>();
		const vault = this.app.vault;
		const mdc = this.app.metadataCache;
		const parts: string[] = [];

		const dfs = async (file: TFile, depth: number) => {
			if (seen.has(file.path)) return;
			if (mm?.match(file.path)) return;
			seen.add(file.path);

			const content = await vault.cachedRead(file);
			if (!content.trim()) return;

			const item = `${applySeparator(
				this.settings.prefix,
				file
			)}${content}${applySeparator(this.settings.suffix, file)}`;
			parts.push(item);

			if (depth >= this.settings.maxDepth) return;

			const links = Object.keys(mdc.resolvedLinks[file.path] ?? {});
			for (const link of links) {
				const linked = vault.getAbstractFileByPath(link);
				if (linked instanceof TFile && linked.extension === "md") {
					await dfs(linked, depth + 1);
				}
			}
		};

		await dfs(root, 0);
    if (direction === "deps-to-target") {
      parts.reverse();
		}
		await navigator.clipboard.writeText(parts.join(""));
		new Notice(`Copied ${seen.size} notes to clipboard`);
	}

	/* ───────────── Settings persistence ──────────── */

	async loadSettings() {
		this.settings = Object.assign(
			{},
			DEFAULT_SETTINGS,
			await this.loadData()
		);
	}
	async saveSettings() {
		await this.saveData(this.settings);
	}
}

/* ─────────────────────────────────────────────── */

class SettingTab extends PluginSettingTab {
	plugin: CopyDepsPlugin;
	constructor(app: App, plugin: CopyDepsPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}
	display(): void {
		const { containerEl } = this;
		containerEl.empty();

		new Setting(containerEl)
			.setName("Max depth")
			.setDesc('Number, or leave blank for "∞"')
			.addText((t) =>
				t
					.setPlaceholder("∞")
					.setValue(
						!isFinite(this.plugin.settings.maxDepth)
							? ""
							: String(this.plugin.settings.maxDepth)
					)
					.onChange((v) => {
						if (v.trim() === "") {
							this.plugin.settings.maxDepth = Infinity;
						} else {
							const n = parseInt(v, 10);
							if (isNaN(n) || n < 0) {
								new Notice(
									"Invalid depth - should be an integer or empty for ∞"
								);
								return;
							}
							this.plugin.settings.maxDepth = n;
						}
						this.plugin.saveSettings();
					})
			);

		new Setting(containerEl)
			.setName("Prefix template")
			.setDesc("Supports {{title}} and {{path}} placeholders")
			.addTextArea((t) =>
				t.setValue(this.plugin.settings.prefix).onChange((v) => {
					this.plugin.settings.prefix = v;
					this.plugin.saveSettings();
				})
			);

		new Setting(containerEl)
			.setName("Suffix template")
			.setDesc("Supports {{title}} and {{path}} placeholders")
			.addTextArea((t) =>
				t.setValue(this.plugin.settings.suffix).onChange((v) => {
					this.plugin.settings.suffix = v;
					this.plugin.saveSettings();
				})
			);

		new Setting(containerEl)
			.setName("Exclude glob")
			.setDesc("Minimatch pattern (empty → include everything)")
			.addText((t) =>
				t
					.setPlaceholder("Private/**")
					.setValue(this.plugin.settings.excludeGlob)
					.onChange((v) => {
						this.plugin.settings.excludeGlob = v;
						this.plugin.saveSettings();
					})
			);
	}
}
