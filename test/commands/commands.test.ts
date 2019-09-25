import { expect, test } from '@oclif/test';
import * as sinon from 'sinon';

import AuthFile from '../../src/auth-file';
import _git from '../../src/git-user-name';
import _opener from '../../src/opener';
import _paginator from '../../src/pagination';
import { random } from '../helpers/utils';

describe('ghs commands', () => {
	const sandbox = sinon.createSandbox();
	beforeEach(() => {
		sandbox.stub(_paginator, 'next').resolves();
		sandbox.stub(AuthFile.prototype, 'getConfig').resolves({
			token: 'test_token',
			baseUrl: 'https://api.github.com',
		});
	});

	afterEach(() => {
		sandbox.restore();
	});

	describe('repositories', () => {
		const args = ['repo'];

		test
			.nock('https://api.github.com', api =>
				api
					.get('/search/repositories')
					.query({ q: 'oclif' })
					.reply(
						200,
						require('../__fixtures__/commands_repositories_runs_oclif'),
					),
			)
			.stdout()
			.stderr()
			.command([...args, 'oclif'])
			.it('runs repo oclif', ctx => {
				expect(ctx.stdout).to.contain('oclif');
			});

		test
			.nock('https://api.github.com', api =>
				api
					.get('/search/repositories')
					.query({ q: 'gh-search-cli user:feinoujc' })
					.reply(
						200,
						require('../__fixtures__/commands_repositories_runs_repo_user_feinoujc'),
					),
			)
			.stdout()
			.stdout()
			.command([...args, '--user', 'feinoujc', 'gh-search-cli'])
			.it('runs repo --user feinoujc', ctx => {
				expect(ctx.stdout).to.contain('feinoujc');
			});

		test
			.nock('https://api.github.com', api =>
				api
					.get('/search/repositories')
					.query({ q: 'user:oclif' })
					.reply(
						200,
						require('../__fixtures__/commands_repositories_runs_repo_user_oclif_page1'),
						{
							Link:
								'<https://api.github.com/search/repositories?q=user%3Aoclif&page=2>; rel="next", <https://api.github.com/search/repositories?q=user%3Aoclif&page=2>; rel="last"',
						},
					)
					.get('/search/repositories')
					.query({ q: 'user:oclif', page: 2 })
					.reply(
						200,
						require('../__fixtures__/commands_repositories_runs_repo_user_oclif_page2'),
						{
							Link:
								'<https://api.github.com/search/repositories?q=user%3Aoclif&page=1>; rel="prev", <https://api.github.com/search/repositories?q=user%3Aoclif&page=1>; rel="first"',
						},
					),
			)
			.stdout()
			.command([...args, '--user', 'oclif'])
			.it('runs repo --user oclif w/paging', ctx => {
				expect(ctx.stdout).to.contain('oclif/command');
				expect(ctx.stdout).to.contain('oclif/oclif');
				expect(
					(_paginator.next as sinon.SinonStub).callCount,
				).to.be.greaterThan(0);
			});

		describe('opener flag', () => {
			let opener: any;
			beforeEach(() => {
				opener = sandbox.stub(_opener, 'open').resolves();
			});

			test
				.nock('https://api.github.com', api =>
					api
						.get('/search/repositories')
						.query({ q: 'gh-search-cli user:feinoujc' })
						.reply(
							200,
							require('../__fixtures__/commands_repositories_runs_repo_user_feinoujc'),
						),
				)
				.stdout()
				.command([...args, '--user', 'feinoujc', '-o', 'gh-search-cli'])
				.it('opens first result', ctx => {
					expect(ctx.stdout).to.be.equal('');
					expect(opener.callCount).to.be.equal(1);
					const [[url]] = opener.args;
					expect(url).to.be.equal('https://github.com/feinoujc/gh-search-cli');
				});
		});

		describe('json flag', () => {
			test
				.nock('https://api.github.com', api =>
					api
						.get('/search/repositories')
						.query({ q: 'gh-search-cli user:feinoujc' })
						.reply(
							200,
							require('../__fixtures__/commands_repositories_runs_repo_user_feinoujc'),
						),
				)
				.stdout()
				.command([...args, '--user', 'feinoujc', '--json', 'gh-search-cli'])
				.it('writes json', ctx => {
					const parsed = JSON.parse(ctx.stdout) as Array<any>;
					expect(parsed.length).to.be.equal(1);
				});
		});

		describe('errors', () => {
			const rand = random();
			test
				.nock('https://api.github.com', api =>
					api
						.get('/search/repositories')
						.query({ q: `gh-search-cli user:${rand}` })
						.reply(
							422,
							require('../__fixtures__/commands_repositories_errors_unknown_user'),
						),
				)
				.stderr()
				.command([...args, '--user', rand, 'gh-search-cli'])
				.it('writes out api errors', ctx => {
					expect(ctx.stderr).to.match(/resources do not exist/i);
				});

			test
				.stderr()
				.command([
					'repositories',
					'--api-token',
					rand,
					'--api-base-url',
					`ftp://api.${rand}.com`,
					'gh-search-cli',
				])
				.it('writes out http errors', ctx => {
					expect(ctx.stderr).to.match(/invalid protocol/i);
				});

			test
				.stderr()
				.stdout()
				.command([...args])
				.it('fails on empty command');
		});

		describe('--current-x flags', () => {
			beforeEach(() => {
				sandbox.stub(_git, 'getUser').callsFake(() => 'feinoujc');
			});

			test
				.nock('https://api.github.com', api =>
					api
						.get('/search/repositories')
						.query({ q: 'user:feinoujc' })
						.reply(
							200,
							require('../__fixtures__/commands_repositories_runs_repo_user_feinoujc'),
						),
				)
				.stdout()
				.command([...args, '--current-user'])
				.it('includes the current git user', ctx => {
					expect(ctx.stdout).to.be.contain('gh-search-cli');
				});
		});
	});

	describe('issues', () => {
		const args = ['issues'];

		test
			.nock('https://api.github.com', api =>
				api
					.get('/search/issues')
					.query({ q: 'ahejlsberg' })
					.reply(
						200,
						require('../__fixtures__/commands_issues_runs_ahejlsberg'),
					),
			)
			.stdout()
			.command([...args, 'ahejlsberg'])
			.it('runs issues ahejlsberg', ctx => {
				expect(ctx.stdout).to.contain(
					'https://github.com/microsoft/TypeScript/issues',
				);
			});
	});
	describe('commits', () => {
		const args = ['commits'];

		test
			.nock('https://api.github.com', api =>
				api
					.get('/search/commits')
					.query({ q: 'parser repo:oclif/oclif' })
					.reply(
						200,
						require('../__fixtures__/commands_commits_runs_runs_oclif_repo_parser'),
					),
			)
			.stdout()
			.command([...args, '--repo', 'oclif/oclif', 'parser'])
			.it('runs commits --repo oclif/oclif parser', ctx => {
				expect(ctx.stdout).to.contain('oclif');
				expect(ctx.stdout).to.contain('https://github.com/oclif/oclif');
			});
	});

	describe('code', () => {
		const args = ['code'];

		test
			.nock('https://api.github.com', api =>
				api
					.get('/search/code')
					.query({ q: 'parser repo:oclif/oclif' })
					.reply(
						200,
						require('../__fixtures__/commands_code_runs_runs_oclif_repo_parser'),
					),
			)
			.stdout()
			.command([...args, '--repo', 'oclif/oclif', 'parser'])
			.it('runs code --repo oclif/oclif parser', ctx => {
				expect(ctx.stdout).to.contain('oclif');
				expect(ctx.stdout).to.contain('https://github.com/oclif/oclif');
			});

		test
			.nock('https://api.github.com', api =>
				api
					.get('/search/code')
					.query({ q: 'parser repo:oclif/oclif' })
					.reply(
						200,
						require('../__fixtures__/commands_code_runs_runs_oclif_repo_parser_full_text'),
					),
			)
			.stdout()
			.command([...args, '--repo', 'oclif/oclif', 'parser', '--text'])
			.it('runs code --repo oclif/oclif parser --text', ctx => {
				expect(ctx.stdout).to.contain('oclif');
				expect(ctx.stdout).to.contain('https://github.com/oclif/oclif');
				expect(ctx.stdout).to.contain('parser');
			});

		test
			.nock('https://api.github.com', api =>
				api
					.get('/search/code')
					.query({ q: 'parser org:oclif' })
					.reply(
						200,
						require('../__fixtures__/commands_code_runs_runs_oclif_repo_parser_full_text'),
					),
			)
			.stdout()
			.command([...args, '--org', 'oclif', 'parser', '--text'])
			.it('runs code --org oclif parser --text', ctx => {
				expect(ctx.stdout).to.contain('oclif');
				expect(ctx.stdout).to.contain('https://github.com/oclif/oclif');
				expect(ctx.stdout).to.contain('parser');
			});
	});

	describe('notifications', () => {
		test
			.nock('https://api.github.com', api =>
				api
					.get('/notifications')
					.query({ all: 'false', participating: 'false' })
					.reply(200, require('../__fixtures__/commands_notifications_default'))
					.get(
						'/repos/DefinitelyTyped/DefinitelyTyped/issues/comments/534729067',
					)
					.reply(
						200,
						require('../__fixtures__/commands_notifications_issue_comment'),
					)
					.get('/repos/typescript-eslint/typescript-eslint/releases/20186922')
					.reply(
						200,
						require('../__fixtures__/commands_notifications_release'),
					),
			)
			.stdout()
			.command(['notifications'])
			.it('fetches notifications', ctx => {
				expect(ctx.stdout).to.contain('pollyjs');
			});

		test
			.nock('https://api.github.com', api =>
				api
					.get('/notifications')
					.query({ all: 'true', participating: 'false' })
					.reply(200, require('../__fixtures__/commands_notifications_default'))
					.get(
						'/repos/DefinitelyTyped/DefinitelyTyped/issues/comments/534729067',
					)
					.reply(
						200,
						require('../__fixtures__/commands_notifications_issue_comment'),
					)
					.get('/repos/typescript-eslint/typescript-eslint/releases/20186922')
					.reply(
						200,
						require('../__fixtures__/commands_notifications_release'),
					),
			)
			.stdout()
			.command(['notifications', '--all'])
			.it('fetches notifications --all', ctx => {
				expect(ctx.stdout).to.contain('pollyjs');
			});

		test
			.nock('https://api.github.com', api =>
				api
					.get('/repos/feinoujc/gh-search-cli/notifications')
					.query({ all: false, participating: false })
					.reply(200, require('../__fixtures__/commands_notifications_default'))
					.get(
						'/repos/DefinitelyTyped/DefinitelyTyped/issues/comments/534729067',
					)
					.reply(
						200,
						require('../__fixtures__/commands_notifications_issue_comment'),
					)
					.get('/repos/typescript-eslint/typescript-eslint/releases/20186922')
					.reply(
						200,
						require('../__fixtures__/commands_notifications_release'),
					),
			)
			.stdout()
			.command([
				'notifications',
				'--owner',
				'feinoujc',
				'--repo',
				'gh-search-cli',
			])
			.it('fetches notifications --owner --repo', ctx => {
				expect(ctx.stdout).to.contain('pollyjs');
			});
	});
});
