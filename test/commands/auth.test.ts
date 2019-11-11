import { expect, test } from '@oclif/test';
import * as nock from 'nock';
import * as sinon from 'sinon';

import AuthFile, { AuthConfig } from '../../src/auth-file';
import questions from '../../src/hooks/init/auth-questions';

describe('hooks', () => {
	const sandbox = sinon.createSandbox();
	afterEach(() => {
		sandbox.restore();
		nock.cleanAll();
	});
	describe('already configured', () => {
		beforeEach(() => {
			sandbox
				.stub(AuthFile.prototype, 'getConfig')
				.resolves({ token: 'abc123', baseUrl: 'https://api.github.com' });
		});
		test
			.stderr()
			.stdout()
			.hook('init', { id: 'commits' })
			.do(output => {
				expect(output.stderr).to.be.equal('');
				expect(output.stdout).to.be.equal('');
			})
			.it('does nothing');
	});

	describe('skips if command is config', () => {
		test
			.stderr()
			.stdout()
			.hook('init', { id: 'config' })
			.do(output => {
				expect(output.stderr).to.be.equal('');
				expect(output.stdout).to.be.equal('');
			})
			.it('does nothing');
	});

	describe('needs configured (github, no 2fa)', () => {
		let configStub: sinon.SinonStub<[AuthConfig], Promise<any>>;
		beforeEach(() => {
			sandbox.stub(AuthFile.prototype, 'getConfig').resolves({});
			configStub = sandbox.stub(AuthFile.prototype, 'setConfig').resolves();
			sandbox.stub(questions, 'ghe').resolves(false);
			sandbox.stub(questions, 'username').resolves('testuser');
			sandbox.stub(questions, 'password').resolves('password');
			nock('https://api.github.com')
				.post('/authorizations')
				.reply(200, {
					token: 'abc123',
				});
		});

		test
			.stderr()
			.hook('init', { id: 'commits' })
			.do(() => {
				expect(
					configStub.calledOnceWith({
						token: 'abc123',
						baseUrl: 'https://api.github.com',
					}),
				).to.be.equal(true);
			})
			.it('stores config');
	});

	describe('bad login', () => {
		let configStub: sinon.SinonStub<[AuthConfig], Promise<any>>;
		beforeEach(() => {
			sandbox.stub(AuthFile.prototype, 'getConfig').resolves({});
			configStub = sandbox.stub(AuthFile.prototype, 'setConfig').resolves();
			sandbox.stub(questions, 'ghe').resolves(false);
			sandbox.stub(questions, 'username').resolves('testuser');
			sandbox
				.stub(questions, 'password')
				.onFirstCall()
				.resolves('wrong')
				.onSecondCall()
				.resolves('correct');
			nock('https://api.github.com', {
				reqheaders: {
					Authorization: auth =>
						Buffer.from(auth.split(' ')[1], 'base64')
							.toString()
							.endsWith(':wrong'),
				},
			})
				.post('/authorizations')
				.reply(401, {});

			nock('https://api.github.com', {
				reqheaders: {
					Authorization: auth =>
						Buffer.from(auth.split(' ')[1], 'base64')
							.toString()
							.endsWith(':correct'),
				},
			})
				.post('/authorizations')
				.reply(200, { token: 'fgh345' });
		});

		test
			.stderr()
			.hook('init', { id: 'commits' })
			.do(ctx => {
				expect(ctx.stderr).to.match(/bad login/i);
				expect(
					configStub.calledOnceWith({
						token: 'fgh345',
						baseUrl: 'https://api.github.com',
					}),
				).to.be.equal(true);
			})
			.it('stores config');
	});

	describe('needs configured (github, 2fa)', () => {
		let configStub: sinon.SinonStub<[AuthConfig], Promise<any>>;
		beforeEach(() => {
			sandbox.stub(AuthFile.prototype, 'getConfig').resolves({});
			configStub = sandbox.stub(AuthFile.prototype, 'setConfig').resolves();
			sandbox.stub(questions, 'ghe').resolves(false);
			sandbox.stub(questions, 'username').resolves('testuser');
			sandbox.stub(questions, 'password').resolves('password');
			sandbox.stub(questions, 'otp').resolves('12345');

			nock('https://api.github.com')
				.post('/authorizations')
				.reply(
					401,
					{},
					{
						'X-GitHub-OTP': 'required; app',
					},
				);
			nock('https://api.github.com', {
				reqheaders: {
					'X-GitHub-OTP': '12345',
				},
			})
				.post('/authorizations')
				.reply(200, {
					token: 'abc123',
				});
		});

		test
			.stderr()
			.stdout()
			.hook('init', { id: 'commits' })
			.do(() => {
				expect(
					configStub.calledOnceWith({
						token: 'abc123',
						baseUrl: 'https://api.github.com',
					}),
				).to.be.equal(true);
			})
			.it('stores config');
	});

	describe('needs configured (ghe, no 2fa)', () => {
		let configStub: sinon.SinonStub<[AuthConfig], Promise<any>>;
		beforeEach(() => {
			sandbox.stub(AuthFile.prototype, 'getConfig').resolves({});
			configStub = sandbox.stub(AuthFile.prototype, 'setConfig').resolves();
			sandbox.stub(questions, 'ghe').resolves(true);
			sandbox
				.stub(questions, 'apiUrl')
				.resolves('https://github.evilcorp.com/api/v3');
			sandbox.stub(questions, 'username').resolves('testuser');
			sandbox.stub(questions, 'password').resolves('password');
			nock('https://github.evilcorp.com/api/v3')
				.post('/authorizations')
				.reply(200, {
					token: '456dfg',
				});
		});

		test
			.stderr()
			.hook('init', { id: 'commits' })
			.do(() => {
				expect(
					configStub.calledOnceWith({
						token: '456dfg',
						baseUrl: 'https://github.evilcorp.com/api/v3',
					}),
				).to.be.equal(true);
			})
			.it('stores config');
	});
});
