import Command, { flags } from '@oclif/command';
import { flags as parserFlags } from '@oclif/parser';
import cli, { Table } from 'cli-ux';
import { StatusCodeError } from 'request-promise-native/errors';

import search, { ApiResponse } from './api';
import AuthFile from './auth-file';
import opener from './opener';
import paginator from './pagination';

export type FormatOptions = {
	text: boolean;
	open: boolean;
	json: boolean;
};

export type TableResult = {
	rows: Array<any>;
	columns: Table.table.Columns<any>;
	options?: Table.table.Options;
};

type IOptionFlag<T> = parserFlags.IOptionFlag<T>;
type IBooleanFlag<T> = parserFlags.IBooleanFlag<T>;

/**
 * Adds a hidden NOT qualifier flag to all option flags (--language & --not-language) provided and returns the combined result
 */
function negateOptionFlags<
	T extends Record<string, IOptionFlag<any> | IBooleanFlag<any>>
>(
	flags: T,
	nonNegatable: (keyof T)[],
): T & Record<string, IOptionFlag<any> | IBooleanFlag<any>> {
	return Object.entries(flags).reduce<
		Record<string, IOptionFlag<any> | IBooleanFlag<any>>
	>((acc, [key, flag]) => {
		acc[key] = flag;
		if (flag.type === 'option' && !nonNegatable.includes(key)) {
			acc[`not-${key}`] = { ...flag, char: undefined, hidden: true };
		}
		return acc;
	}, {}) as T & Record<string, IOptionFlag<any> | IBooleanFlag<any>>;
}

export default abstract class BaseCommand extends Command {
	static args = [{ name: 'query' }];

	static flags = {
		'api-token': flags.string({
			description: 'The github api token. Defaults to configured api token',
		}),
		'api-base-url': flags.string({
			description:
				"The github api token. Defaults to configured GHE url or 'https://api.github.com'",
		}),
		open: flags.boolean({
			char: 'o',
			description: 'Open the first result in your browser.',
		}),
		json: flags.boolean({
			char: 'j',
			description: 'Return json. Can be piped to jq.',
		}),
		order: flags.enum({
			description:
				'The sort order if sort parameter is provided. Default: desc',
			options: ['asc', 'desc'],
		}),
	};

	async catch(err: Error) {
		if (err instanceof StatusCodeError) {
			const lines: Array<string> = [];
			lines.push(err.error.message);
			(err.error.errors || []).forEach((_err: Error) =>
				lines.push(_err.message),
			);
			this.warn(lines.join('\n'));
		} else {
			this.warn(err.message);
		}
	}

	abstract format(data: ApiResponse, opts?: FormatOptions): TableResult;

	async run() {
		const { args, flags } = this.parse(this.constructor as typeof Command);

		const qs: Array<string> = [];
		if (args.query) {
			qs.push(args.query);
		}

		let { 'api-token': apiToken, 'api-base-url': baseUrl } = flags;

		const { sort, order, open, json, text, ...options } = flags;

		this.debug('options: %o', options);
		Object.entries(options).forEach(([k, v]) => {
			if (k.startsWith('not-')) {
				const negatedKey = k.replace(/^not-/, '-');
				qs.push(`${negatedKey}:${v}`);
			} else {
				qs.push(`${k}:${v}`);
			}
		});

		if (qs.length === 0) {
			this._help();
		}
		const authFile = new AuthFile(this.config);
		const authConfig = await authFile.getConfig();
		this.debug('auth config: %o', authConfig);
		if (!apiToken && authConfig) {
			apiToken = authConfig.token;
		}

		if (!baseUrl && authConfig) {
			baseUrl = authConfig.baseUrl;
		} else if (!baseUrl) {
			baseUrl = 'https://api.github.com';
		}

		const type = `${this.id}`;

		const print = async (resp: ApiResponse, opts: FormatOptions) => {
			if (resp.items.length === 0) {
				this.warn('no results found');
			} else if (opts.open) {
				await opener.open(resp.items[0].html_url);
			} else if (opts.json) {
				this.log(JSON.stringify(resp.items));
			} else {
				const { rows, columns, options } = this.format(resp, opts);
				cli.table(rows, columns, options);
			}
		};

		const next = async (results: ApiResponse, opts: FormatOptions) => {
			if (!opts.json && results.links.next) {
				await paginator.next();
				const resp = await results.links.next();
				await print(resp, opts);
				await next(resp, opts);
			}
		};

		const opts: FormatOptions = {
			open,
			json,
			text,
		};

		this.debug('searching %s qs: %o sort: %s order: %s', type, qs, sort, order);

		const resp: any = await search(type, qs.join(' '), {
			apiToken,
			baseUrl,
			sort,
			order,
			userAgent: this.config.userAgent,
			textMatch: text,
		});
		await print(resp, opts);
		return next(resp, opts);
	}
}

export function buildFlags<
	T extends Record<string, IOptionFlag<any> | IBooleanFlag<any>>
>(
	flags: T,
	nonNegatable: (keyof T)[] = [],
): T &
	typeof BaseCommand['flags'] &
	Record<string, IOptionFlag<any> | IBooleanFlag<any>> {
	return {
		...negateOptionFlags(flags, nonNegatable),
		...BaseCommand.flags,
	};
}
