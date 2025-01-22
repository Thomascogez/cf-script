export default async (env: Env) => {
	const result = await env.KV.list();
	const values = await Promise.all(
		result.keys.map(async (key) => {
			const keyValue = await env.KV.get(key.name);

			return { key: key.name, value: keyValue };
		})
	);

	console.table(values);
};
