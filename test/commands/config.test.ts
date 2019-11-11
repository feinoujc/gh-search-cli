import { expect, test } from '@oclif/test';
import * as sinon from 'sinon';

import AuthFile from '../../src/auth-file';

describe('config', () => {
	const sandbox = sinon.createSandbox();
	let clearStub: sinon.SinonStub<[], Promise<any>>;
	beforeEach(() => {
		clearStub = sandbox.stub(AuthFile.prototype, 'clear').resolves();
	});

	afterEach(() => {
		sandbox.restore();
	});

	test
		.stdout()
		.command(['config', '--clear'])
		.it('runs config --clear', ctx => {
			expect(clearStub.callCount).to.equal(1);
			expect(ctx.stdout).to.contain('config file cleared');
		});
});
