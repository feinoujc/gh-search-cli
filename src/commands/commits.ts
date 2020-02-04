import { flags } from '@oclif/command';
import * as chalk from 'chalk';

import { ApiResponse } from '../api';
import Command, { buildFlags, TableResult } from '../base-command';

export default class Code extends Command {
	static description =
		'search github commits. https://developer.github.com/v3/search/#search-commits';

	static examples = [
		`$ ghs commit --repo octocat/Spoon-Knife css
`,
	];

	static flags = buildFlags(
		{
			author: flags.string({
				description:
					'Matches commits authored by a user (based on email settings).',
			}),
			committer: flags.string({
				description:
					'Matches commits committed by a user (based on email settings).',
			}),
			'author-name': flags.string({
				description: 'Matches commits by author name.',
			}),
			'committer-name': flags.string({
				description: 'Matches commits by committer name.',
			}),
			'author-email': flags.string({
				description: 'Matches commits by author email.',
			}),
			'committer-email': flags.string({
				description: 'Matches commits by committer email.',
			}),
			'author-date': flags.string({
				description: 'Matches commits by author date range.',
			}),
			'committer-date': flags.string({
				description: 'Matches commits by committer date range.',
			}),
			merge: flags.boolean({
				allowNo: true,
				description:
					'--merge filters to merge commits, --no-merge filters out merge commits.',
			}),
			hash: flags.string({
				description: 'Matches commits by hash.',
			}),
			tree: flags.string({
				description: 'Matches commits with the specified git tree hash.',
			}),
			parent: flags.string({
				description: 'Matches commits that have a particular parent.',
			}),
			is: flags.enum({
				options: ['public', 'private'],
				description: 'Matches public or private repositories.',
			}),
			user: flags.string({
				description:
					'Limits searches to a specific user. Use @me for your username.',
			}),
			org: flags.string({
				description: 'Limits searches to a specific organization.',
			}),
			repo: flags.string({
				description: 'Limits searches to a specific repository.',
			}),
			sort: flags.enum({
				char: 's',
				options: ['author-date', 'committer-date'],
				description:
					'The sort field. Can be author-date or committer-date. Default: results are sorted by best match.',
			}),
		},
		['sort'],
	);

	static args = [...Command.args];

	format(data: ApiResponse): TableResult {
		const rows = data.items.reduce((acc, item) => {
			const message = chalk.bold(item.commit.message);
			const ssha = item.sha.substring(0, 7);
			const shortenedUrl = item.html_url.replace(item.sha, ssha);
			const url = shortenedUrl;
			const repo = chalk.cyan(item.repository.name);
			acc.push({ message, repo, url });
			return acc;
		}, []);

		return {
			rows,
			columns: {
				repo: {},
				message: {},
				url: {},
			},
		};
	}
}
