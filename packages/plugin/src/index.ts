import { resolve } from 'path';
import { type ResolvedConfig, type Plugin } from 'vite';

export function dropin(): Plugin {
	return {
		name: 'vite-plugin-global-config',

		async configResolved(config: ResolvedConfig) {
			// Resolve the path to your drop-in config file
			const configFilePath = resolve(config.root, 'drop-in.config.js');
			if (process.env.DATABASE_URL) {
				global.drop_in_config = {
					auth: {
						jwt_secret: process.env.JWT_SECRET,
					},
					db: {
						url: process.env.DATABASE_URL,
					},
				};
			} else {
				throw new Error('DATABASE_URL is not set');
			}
			try {
				// Dynamically import the ESM module
				const configModule = await import(configFilePath);

				// Check if the module has a default export and assign it to global
				if (configModule && configModule.default) {
					global.drop_in_config = configModule.default;
					console.log('Server Config has been set in global:', global.drop_in_config);
				} else {
					console.error('Invalid configuration file. Expected a default export.');
				}
			} catch (error) {
				console.error(`Error loading config from ${configFilePath}:`, error);
			}
		},
	};
}
