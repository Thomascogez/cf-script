export default async (env: Env, args: { value: string }) => {
	if (!args.value) {
		throw new Error("Value is required");
	}

	const key = crypto.randomUUID();

	await env.KV.put(key, args.value);

	console.log(`Key ${key} written with value ${args.value}`);
};
