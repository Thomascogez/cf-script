import { defineConfig } from "tsup";

export default defineConfig({
	entryPoints: ["src/index.ts"],
	format: ["esm"],
	outDir: "dist",
	clean: true,
	external: ["wrangler"],
	platform: "node",
	target: "node20"
});
