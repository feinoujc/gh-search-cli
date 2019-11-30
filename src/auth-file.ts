import * as Config from '@oclif/config';
import * as fs from 'fs-extra';
import * as path from 'path';

export type AuthConfig = {
	token: string;
	baseUrl: string;
};

export default class AuthFile {
	config: Config.IConfig;

	path: string;

	constructor(config: Config.IConfig) {
		this.config = config;
		this.path = path.join(this.config.configDir, 'auth.json');
	}

	async getConfig(): Promise<Partial<AuthConfig>> {
		try {
			const auth = await fs.readJSON(this.path);
			if (auth && auth.token && auth.baseUrl) {
				return auth;
			}
			await fs.outputJson(this.path, {});
			return {};
		} catch (error) {
			if (error.code === 'ENOENT') {
				await fs.outputJson(this.path, {});
				return {};
			}
			throw error;
		}
	}

	setConfig(config: AuthConfig): Promise<void> {
		return fs.outputJson(this.path, config);
	}

	clear(): Promise<void> {
		return fs.outputJson(this.path, {});
	}
}
