import { existsSync } from "node:fs";
import { mkdir, readFile, rm } from "node:fs/promises";
import { join, resolve } from "node:path";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { type PlatformProxy, getPlatformProxy } from "wrangler";
import { runScript } from "../src/commands/run-script";

const mockWorkerProjectPath = resolve(join(import.meta.dirname, "mocks", "mock-worker-project"));
const invalidMockWorkerProjectPath = resolve(join(import.meta.dirname, "mocks", "invalid-mock-worker-project"));
const testOutPath = resolve(join(import.meta.dirname, ".test-out"));

describe("src/commands/run-script", () => {
	let cfPlatform: PlatformProxy;

	beforeAll(async () => {
		if (existsSync(testOutPath)) {
			await rm(testOutPath, { recursive: true });
		}

		await mkdir(testOutPath, { recursive: true });

		cfPlatform = await getPlatformProxy({
			configPath: join(mockWorkerProjectPath, "wrangler.json"),
			persist: false
		});
	});

	afterAll(async () => {
		if (cfPlatform) {
			await cfPlatform.dispose();
		}
	});

	it("should not run a script with a unknown path", async () => {
		const invalidScriptPath = join(mockWorkerProjectPath, "scripts", "invalid-script.ts");

		await expect(runScript(invalidScriptPath, { cwd: mockWorkerProjectPath })).rejects.toThrowError(`Could not find script at path ${invalidScriptPath}`);
	});

	it("should not run a script where wrangler config could not be found", async () => {
		const scriptPath = join(invalidMockWorkerProjectPath, "scripts", "script.ts");

		await expect(runScript(scriptPath, { cwd: invalidMockWorkerProjectPath })).rejects.toThrowError("Could not find wrangler(.toml|.json) file");
	});

	it("should run a script that has a function as default export", async () => {
		const scriptPath = join(mockWorkerProjectPath, "scripts", "cool-script.ts");

		await expect(runScript(scriptPath, { cwd: mockWorkerProjectPath })).resolves.not.toThrowError();

		const outputFileContent = await readFile(join(import.meta.dirname, ".test-out", "cool-output.txt"), "utf8");
		expect(outputFileContent).toBe(JSON.stringify({ env: Object.keys(cfPlatform.env), args: [] }));
	});

	it("should run a script with args", async () => {
		const scriptPath = join(mockWorkerProjectPath, "scripts", "cool-script.ts");
		const args = { args1: "foo", args2: "bar" };
		await expect(runScript(scriptPath, { cwd: mockWorkerProjectPath, scriptArgs: args })).resolves.not.toThrowError();

		const outputFileContent = await readFile(join(import.meta.dirname, ".test-out", "cool-output.txt"), "utf8");
		expect(outputFileContent).toBe(JSON.stringify({ env: Object.keys(cfPlatform.env), args: Object.keys(args) }));
	});
});
