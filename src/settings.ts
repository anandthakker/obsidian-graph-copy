export interface Settings {
	maxDepth: number;
	prefix: string;
  suffix: string;
	excludeGlob: string;
}

export const DEFAULT_SETTINGS: Settings = {
	maxDepth: Infinity,
	prefix: `${"=".repeat(80)}\n# {{title}}\n\n`,
	suffix: "\n\n",
	excludeGlob: "",
};
