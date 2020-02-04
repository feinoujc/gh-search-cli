import { flags } from '@oclif/command';
import * as chalk from 'chalk';

import { ApiResponse } from '../api';
import Command, { buildFlags, TableResult } from '../base-command';

export default class Repositories extends Command {
	static description =
		'search github repositories. https://developer.github.com/v3/search/#search-repositories';

	static examples = [
		`$ ghs repo puppeteer
  GoogleChrome/puppeteer (https://github.com/GoogleChrome/puppeteer)
`,
	];

	static flags = buildFlags(
		{
			in: flags.string({
				description:
					'Qualifies which fields are searched. With this qualifier you can restrict the search to just the repository name, description, readme, or any combination of these.',
			}),
			size: flags.string({
				description:
					'Finds repositories that match a certain size (in kilobytes).',
			}),
			forks: flags.string({
				description: 'Filters repositories based on the number of forks.',
			}),
			fork: flags.boolean({
				allowNo: true,
				char: 'f',
				description:
					'Filters whether forked repositories should be included (--fork) or not (--no-fork).',
			}),
			created: flags.string({
				char: 'c',
				description:
					'Filters repositories based on date of creation, or when they were last updated.',
			}),
			pushed: flags.string({
				char: 'p',
				description:
					'Filters repositories based on date of creation, or when they were last updated.',
			}),
			user: flags.string({
				char: 'u',
				description:
					'Limits searches to a specific user. Use @me for your username.',
			}),
			repo: flags.string({
				char: 'r',
				description: 'Limits searches to a specific repo.',
			}),
			language: flags.string({
				char: 'l',
				description:
					"Searches repositories based on the language they're written in.",
			}),
			license: flags.string({
				description:
					'Filters repositories by license or license family, using the license keyword.',
			}),
			stars: flags.string({
				description: 'Searches repositories based on the number of stars.',
			}),
			followers: flags.string({
				description: 'Searches repositories based on the number of followers.',
			}),
			topic: flags.string({
				description: 'Filters repositories based on the specified topic.',
			}),
			topics: flags.string({
				description:
					'Search repositories by the number of topics that have been applied to them.',
			}),
			mirror: flags.boolean({
				allowNo: true,
				description:
					"Search repositories based on whether or not they're a mirror and are hosted elsewhere.",
			}),
			archived: flags.boolean({
				allowNo: true,
				description:
					'Filters whether archived repositories should be included (--archived) or not (--no-archived).',
			}),
			'good-first-issues': flags.string({
				description:
					'Search for repositories that have a minimum number of issues labeled help-wanted.',
			}),
			'help-wanted-issues': flags.string({
				description:
					'Search for repositories that have a minimum number of issues labeled good-first-issue.',
			}),
			sort: flags.enum({
				char: 's',
				description:
					'The sort field. Default: results are sorted by best match.',
				options: ['stars', 'forks', 'updated'],
			}),
		},
		['sort'],
	);

	static aliases = ['repo', 'repository'];

	static args = [...Command.args];

	format(data: ApiResponse): TableResult {
		const rows = data.items.reduce((acc, item) => {
			const repo = chalk.cyan(item.full_name);
			const url = item.html_url;
			acc.push({ repo, url });
			return acc;
		}, []);

		return {
			rows,
			columns: {
				repo: {},
				url: {},
			},
		};
	}
}
