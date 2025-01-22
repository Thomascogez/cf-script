import { writeFile } from "node:fs/promises";
import { resolve } from "node:path";

export default async (env: Record<string, unknown>, args?: Record<string, unknown>) => {
	await writeFile(resolve(import.meta.dirname, "..", "..", "..", ".test-out", "cooler-output.txt"), JSON.stringify({ env: Object.keys(env), args: Object.keys(args ?? {}) }));
};
