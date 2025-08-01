import { access } from "node:fs/promises";
import { join, parse, resolve as resolvePath } from "node:path";
import { createJiti } from "jiti";
import { getPlatformProxy } from "wrangler";
import { findWranglerConfigRoot } from "../utils";

type Options = {
	wranglerConfigPath?: string;
	cwd: string;
	scriptArgs?: Record<string, string>;
	environment?: string;
	experimentalRemoteBindings?: boolean;
};

export const runScript = async (scriptPath: string, options: Options) => {
	const wranglerConfigPath = options.wranglerConfigPath ?? (await findWranglerConfigRoot(options.cwd));

	const { dir: wranglerConfigDir } = parse(wranglerConfigPath);

	const platform = await getPlatformProxy({
		configPath: join(wranglerConfigPath),
		environment: options.environment,
		persist: { path: join(wranglerConfigDir, ".wrangler/state/v3") },
		experimental: {
			remoteBindings: options.experimentalRemoteBindings ?? false
		}
	});

	const resolvedScriptPath = resolvePath(process.cwd(), scriptPath);

	try {
		await access(resolvedScriptPath);
	} catch (error) {
		throw new Error(`Could not find script at path ${resolvedScriptPath}`, { cause: error });
	}

	const jiti = createJiti(resolvedScriptPath);
	const script = await jiti.import(resolvedScriptPath, { default: true });

	if (!(script instanceof Function)) {
		throw new Error("Your script must export by default a function (e.g. export default async (env, args) => { ... })");
	}

	await script(platform.env, options.scriptArgs);

	return {
		[Symbol.dispose]: () => {
			platform.dispose();
		}
	};
};
