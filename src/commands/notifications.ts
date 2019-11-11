import { Command, flags } from '@oclif/command';
import chalk from 'chalk';
import { cli } from 'cli-ux';
import { StatusCodeError } from 'request-promise-native/errors';

import AuthFile from '../auth-file';
import BaseCommand, { TableResult } from '../base-command';
import getNotifications, { ApiResponse } from '../notifications-api';
import opener from '../opener';
import paginator from '../pagination';

function filteredBaseOptions(): Pick<
	typeof BaseCommand['flags'],
	'api-base-url' | 'api-token' | 'json' | 'open'
> {
	// tslint:disable-next-line:no-unused
	const { order, ...opts } = BaseCommand.flags;
	return opts;
}

export default class Notifications extends Command {
	static description = 'List notifications';

	static flags = {
		...filteredBaseOptions(),
		all: flags.boolean({
			char: 'a',
			default: false,
			description: 'If true, show notifications marked as read. Default: false',
		}),
		participating: flags.boolean({
			char: 'p',
			default: false,
			description:
				'If true, only shows notifications in which the user is directly participating or mentioned. Default: false',
		}),
		since: flags.string({
			char: 's',
			parse: input => new Date(input).toISOString(),
			description:
				'Only show notifications updated after the given time. This is a timestamp in ISO 8601 format: YYYY-MM-DDTHH:MM:SSZ',
		}),
		before: flags.string({
			char: 'b',
			parse: input => new Date(input).toISOString(),
			description:
				'Only show notifications updated before the given time. This is a timestamp in ISO 8601 format: YYYY-MM-DDTHH:MM:SSZ.',
		}),
		owner: flags.string({
			description: 'Filter notifications to a owner, required with --repo flag',
		}),
		repo: flags.string({
			description:
				'Filter notifications to a repository, required with --owner flag',
		}),
	};

	format(data: ApiResponse): TableResult {
		const rows = data.items.reduce((acc, item) => {
			const subject = chalk.cyan(item.subject.title);
			const url = item.subject.latest_comment_html_url;
			const reason = item.reason;
			acc.push({ subject, reason, url });
			return acc;
		}, []);

		return {
			rows,
			columns: {
				subject: {},
				reason: {},
				url: {},
			},
		};
	}

	async run() {
		const { flags } = this.parse(Notifications);
		let {
			['api-token']: apiToken,
			['api-base-url']: baseUrl,
			...params
		} = flags;

		this.debug('options: %o', params);

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

		const print = async (
			resp: ApiResponse,
			opts: { json?: boolean; open?: boolean },
		) => {
			if (opts.json) {
				this.log(JSON.stringify(resp.items));
			} else if (!resp.items.length) {
				this.warn('no results found');
			} else {
				if (opts.open) {
					const firstLink = resp.items
						.map(({ subject }) => subject.latest_comment_html_url)
						.find(Boolean);
					if (firstLink) {
						await opener.open(firstLink);
					}
				}
				const { rows, columns, options } = this.format(resp);
				cli.table(rows, columns, options);
			}
		};

		const next = async (results: ApiResponse, opts: { json?: boolean }) => {
			if (!opts.json && results.links.next) {
				await paginator.next();
				const resp = await results.links.next();
				await print(resp, opts);
				await next(resp, opts);
			}
		};

		const resp = await getNotifications(params, {
			baseUrl: baseUrl!,
			apiToken: apiToken!,
			userAgent: this.config.userAgent,
		});
		await print(resp, flags);
		return next(resp, flags);
	}

	async catch(err: Error) {
		if (err instanceof StatusCodeError) {
			const lines: Array<string> = [];
			lines.push(err.error.message);
			(err.error.errors ?? []).forEach((_err: Error) =>
				lines.push(_err.message),
			);
			this.warn(lines.join('\n'));
		} else {
			this.warn(err.message);
		}
	}
}
