#!/usr/bin/env node

import { program } from "commander";
import ora from "ora";
import { runScript } from "./commands/run-script";
import { scriptArgsToObject } from "./utils";

type CliOptions = {
	wranglerConfigPath?: string;
	cwd: string;
	scriptArgs?: string[];
	environment?: string;
	experimentalRemoteBindings?: boolean;
};

program
	.option("--wcp, --wrangler-config-path <path>", "Path to the wrangler(.jon|.toml) file, by default it will look for the closest one")
	.option("--cwd", "Current working directory", process.cwd())
	.option("--sa, --script-args <arg:value...>", "Args that will be passed to the executed script (e.g. --sa foo:bar)")
	.option("--env, --environment <env>", "Wrangler Environment to use when running the script")
	.option("--erb, --experimental-remote-bindings", "Enable experimental remote bindings support")
	.arguments("<script>")
	.parse();

const options = program.opts<CliOptions>();

const [scriptPath] = program.args ?? [];
if (!scriptPath) {
	program.help();
}

const scriptSpinner = ora();

try {
	scriptSpinner.start("Running script ... \n");

	await using _ = await runScript(scriptPath, {
		scriptArgs: scriptArgsToObject(options.scriptArgs ?? []),
		wranglerConfigPath: options.wranglerConfigPath,
		cwd: options.cwd,
		environment: options.environment,
		experimentalRemoteBindings: options.experimentalRemoteBindings
	});

	console.log();
	scriptSpinner.succeed("Script executed successfully 🎉");
} catch (error) {
	const errorMessage = error instanceof Error ? error.message : error;

	scriptSpinner.fail(`Script execution failed 😢\n${errorMessage}`);

	process.exit(1);
}
