export default async (env: Env, args: { value: string }) => {
	await env.KV.put(crypto.randomUUID(), args.value);
};
