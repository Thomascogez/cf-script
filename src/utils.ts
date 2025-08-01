import { readdir } from "node:fs/promises";
import { join, normalize } from "node:path";

export const findWranglerConfigRoot = async (directory = process.cwd()): Promise<string> => {
	const currentDirContent = await readdir(directory);

	const wranglerConfigFileFolderPath = currentDirContent.find((file) => file.startsWith("wrangler."));

	if (!wranglerConfigFileFolderPath) {
		const nextPath = normalize(join(directory, ".."));

		if (!nextPath || nextPath === directory) {
			throw new Error("Could not find wrangler(.toml|.json|.jsonc) file");
		}

		return await findWranglerConfigRoot(nextPath);
	}

	return join(directory, wranglerConfigFileFolderPath);
};

export const scriptArgsToObject = (scriptArgs: string[]): Record<string, string> => {
	return Object.fromEntries(scriptArgs.map((arg) => arg.split(":", 2)).filter((entry) => entry.length === 2));
};
