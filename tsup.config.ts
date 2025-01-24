import { defineConfig } from "tsup";

export default defineConfig({
	entryPoints: ["src/cli.ts", "src/commands/run-script.ts"],
	format: ["esm"],
	dts: true,
	outDir: "dist",
	clean: true,
	external: ["wrangler"],
	platform: "node",
	target: "node20"
});
