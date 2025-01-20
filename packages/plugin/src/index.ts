import type { Plugin, ResolvedConfig } from 'vite';
import { resolve, normalize } from 'path';
import { pathToFileURL } from 'url';

export function dropin(): Plugin {
	let config: ResolvedConfig;
	let configModule: any;

	return {
		name: 'vite-plugin-global-config',

		configResolved(resolvedConfig: ResolvedConfig) {
			config = resolvedConfig;
		},

		async buildStart() {
			try {
				const configFilePath = normalize(resolve(config.root, 'drop-in.config.js'));

				// Explicitly convert to file URL string
				const fileUrl = pathToFileURL(configFilePath).toString();

				configModule = await import(fileUrl);
			} catch (error) {
				console.error('Error loading config:', error);
				throw error;
			}
		},

		resolveId(id) {
			if (id === 'virtual:dropin-config') {
				return '\0virtual:dropin-config';
			}
			if (id === 'virtual:dropin-server-config') {
				return '\0virtual:dropin-server-config';
			}
			return null;
		},

		load(id) {
			if (id === '\0virtual:dropin-config') {
				const publicConfig = extract_public_config(configModule.default);
				return `export default ${JSON.stringify(publicConfig)};`;
			}

			if (id === '\0virtual:dropin-server-config') {
				return `
          export default {
            ...${JSON.stringify(configModule.default)},
            auth: {
              ...${JSON.stringify(configModule.default.auth || {})},
              jwt_secret: process.env.JWT_SECRET
            },
            db: {
              ...${JSON.stringify(configModule.default.db || {})},
              url: process.env.DATABASE_URL
            }
          };
        `;
			}
			return null;
		},
	};
}

// Helper function to recursively extract the `public` parts of the config
function extract_public_config(config: any, path: string[] = []) {
	if (typeof config !== 'object' || config === null) return {};

	return Object.keys(config).reduce((acc: { [key: string]: any }, key) => {
		const value = config[key];
		const currentPath = [...path, key];

		if (key === 'public') {
			return { ...acc, ...value }; // Merge all `public` properties
		} else if (typeof value === 'object' && value !== null) {
			const nestedPublic = extract_public_config(value, currentPath);
			if (Object.keys(nestedPublic).length > 0) {
				acc[key] = nestedPublic;
			}
		}

		return acc;
	}, {});
}
