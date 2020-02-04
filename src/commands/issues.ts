import { flags } from '@oclif/command';
import * as chalk from 'chalk';

import { ApiResponse } from '../api';
import Command, { buildFlags, TableResult } from '../base-command';

function sanitizeTicket(ticket: string) {
	return ticket.replace(/[^A-Z\d-]+/gi, '');
}

const jiraRegex = /^(\[?[A-Z]{2,10}-\d{1,5}\]?[\s|:]*)?(.*)$/im;

export default class Issues extends Command {
	static description =
		'search github issues. https://developer.github.com/v3/search/#search-issues';

	static examples = [
		`$ ghs issues --is open --involves my-github-username
`,
	];

	static flags = buildFlags(
		{
			type: flags.enum({
				char: 't',
				description:
					'With this qualifier you can restrict the search to issues (issue) or pull request (pr) only.',
				options: ['issue', 'pr'],
			}),
			in: flags.string({
				description:
					'Qualifies which fields are searched. With this qualifier you can restrict the searchto just the title (title), body (body), comments (comments), or any combination of these.',
			}),
			author: flags.string({
				description:
					'Finds issues or pull requests created by a certain user. Use @me for your username.',
			}),
			assignee: flags.string({
				description:
					'Finds issues or pull requeststhat are assigned to a certain user. Use @me for your username.',
			}),
			mentions: flags.string({
				description:
					'Finds issues or pull requests that mention a certain user. Use @me for your username.',
			}),
			commenter: flags.string({
				description:
					'Finds issues or pull requests that a certain user commented on. Use @me for your username.',
			}),
			involves: flags.string({
				description:
					'Finds issues or pull requests that were either created by a certain user, assigned to that user, mention that user, or were commented on by that user. Use @me for your username.',
			}),
			team: flags.string({
				description:
					"For organizations you're a member of, finds issues or pull requests that @mention a team within the organization.",
			}),
			state: flags.enum({
				description:
					"Filter issues or pull requests based on whether they're open or closed.",
				options: ['open', 'closed'],
			}),
			label: flags.string({
				description: 'Filters issues or pull requests based on their labels.',
			}),
			milestone: flags.string({
				description:
					'Finds issues or pull requests that are a part of a milestone within a repository.',
			}),
			no: flags.string({
				description:
					'Filters items missing certain metadata, such as label, milestone, or assignee',
			}),
			SHA: flags.string({
				description:
					'If you know the specific SHA hash of a commit, you can use it to search for pull requests that contain that SHA. The SHA syntax must be at least seven characters.',
			}),
			interactions: flags.string({
				description:
					'You can filter issues and pull requests by the number of interactions with the interactions qualifier along with greater than, less than, and range qualifiers. The interactions count is the number of reactions and comments on an issue or pull request.',
			}),
			reactions: flags.string({
				description:
					'You can filter issues and pull requests by the number of reactions using the reactions qualifier along with greater than, less than, and range qualifiers.',
			}),
			review: flags.enum({
				options: ['none', 'required', 'approved', 'changes_requested'],
				description:
					'You can filter pull requests based on their review status',
			}),
			'reviewed-by': flags.string({
				description: 'Filter pull requests by reviewer.',
			}),
			'review-requested': flags.string({
				description: 'Filter pull requests by requested reviewer.',
			}),
			'team-review-requested': flags.string({
				description: 'Filter pull requests by requested reviewer.',
			}),
			language: flags.string({
				char: 'l',
				description:
					'Searches for issues or pull requests within repositories that match a certain language.',
			}),
			is: flags.string({
				description:
					'Searches for items within repositories that match a certain state, such as open, closed, or merged',
			}),
			created: flags.string({
				char: 'c',
				description:
					'Filters issues or pull requests based on date of creation,or when they were last updated.',
			}),
			updated: flags.string({
				char: 'u',
				description:
					'Filters issues or pull requests based on date of creation, or when they were last updated.',
			}),
			merged: flags.string({
				char: 'm',
				description:
					'Filters pull requests based on the date when they were merged.',
			}),
			status: flags.string({
				char: 's',
				description: 'Filters pull requests based on the commit status.',
			}),
			base: flags.string({
				description:
					'Filters pull requests based on the branch that they came from.',
			}),
			head: flags.string({
				description:
					'Filters pull requests based on the branch that they are modifying.',
			}),
			closed: flags.string({
				description:
					'Filters issues or pull requests based on the date when they were closed.',
			}),
			comments: flags.string({
				description:
					'Filters issues or pull requests based on the quantity of comments.',
			}),
			user: flags.string({
				char: 'u',
				description:
					'Limits searches to a specific user. Use @me for your username.',
			}),
			repo: flags.string({
				char: 'r',
				description: 'Limits searches to a specific repository.',
			}),
			org: flags.string({
				description: 'Limits searches to a specific org.',
			}),
			project: flags.string({
				description:
					'Limits searches to a specific project board in a repository or organization.',
			}),
			archived: flags.boolean({
				allowNo: true,
				description:
					'Filters issues or pull requests based on whether they are in an archived repository.',
			}),
			sort: flags.enum({
				char: 's',
				description:
					'The sort field. Default: results are sorted by best match.',
				options: ['comments', 'created', 'updated'],
			}),
		},
		['sort'],
	);

	static args = [...Command.args];

	format(data: ApiResponse): TableResult {
		const rows = data.items.reduce((acc, item) => {
			const [, ticketMatch, labelMatch] = item.title.match(jiraRegex);
			const ticket = chalk.bold.yellow(sanitizeTicket(ticketMatch || ''));
			const label = chalk.bold(labelMatch || '');
			const url = item.html_url;
			acc.push({ title: `${ticket} ${label}`.trim(), url });
			return acc;
		}, []);

		return {
			rows,
			columns: {
				title: {},
				url: {},
			},
		};
	}
}
