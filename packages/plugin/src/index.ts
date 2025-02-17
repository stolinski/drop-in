/// <reference path="../global.d.ts" />
import type { Plugin, ResolvedConfig } from 'vite';
import { resolve } from 'path';
import { pathToFileURL } from 'node:url';
import { normalize } from 'node:path';

export default function dropin(): Plugin {
	let config: ResolvedConfig;
	let configModule: any;

	return {
		name: 'vite-plugin-global-config',

		configResolved(resolvedConfig: ResolvedConfig) {
			config = resolvedConfig;
		},

		async configureServer() {
			const configFilePath = normalize(resolve(config.root, 'drop-in.config.js'));

			// Explicitly convert to file URL string
			const fileUrl = pathToFileURL(configFilePath).toString();

			configModule = await import(fileUrl);
			globalThis.DROP_IN = configModule.default;
		},
	};
}
