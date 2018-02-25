import Bluebird from 'bluebird';
import assert from 'assert';
import sinon from 'sinon';
import getUser from 'git-user-name';
import readline from 'readline';
import errors from 'request-promise/errors';

import opener from '../src/opener';
import getHandler from '../src/CommandHandler';
import * as search from '../src/GitHubSearch';
import testData from './data.json';

const emptyResponse = { items: [], link: {} };
const currentUser = getUser();

function buildOptions({ name, ...opts }) {
  return {
    name: () => name,
    ...opts
  };
}

function getMockResponse(type) {
  return { ...emptyResponse, items: [testData[type]] };
}

describe('command handler', function() {
  beforeEach(function() {
    this.sandbox = sinon.sandbox.create().usingPromise(Bluebird);
  });

  afterEach(function() {
    this.sandbox.restore();
  });

  it('should combine code query option flags', function() {
    const searchStub = this.sandbox
      .stub(search, 'default')
      .resolves(getMockResponse('code'));
    const handler = getHandler(searchStub);
    const options = buildOptions({
      name: 'code',
      user: 'someuser',
      text: true
    });

    return handler('something', options).tap(() =>
      assert.ok(searchStub.calledWith('code', 'something user:someuser', {}))
    );
  });

  it('should combine repo query option flags', function() {
    const searchStub = this.sandbox
      .stub(search, 'default')
      .resolves(getMockResponse('repositories'));
    const handler = getHandler(searchStub);
    const options = buildOptions({
      name: 'repositories',
      language: 'java',
      user: 'someuser'
    });

    return handler('something', options).tap(() =>
      assert.ok(
        searchStub.calledWith(
          'repositories',
          'something user:someuser language:java',
          {}
        )
      )
    );
  });

  it('should combine issues query option flags', function() {
    const searchStub = this.sandbox
      .stub(search, 'default')
      .resolves(getMockResponse('issues'));
    const handler = getHandler(searchStub);
    const options = buildOptions({
      name: 'issues',
      language: 'java',
      involves: 'someuser'
    });

    return handler(null, options).tap(() =>
      assert.ok(
        searchStub.calledWith('issues', 'involves:someuser language:java', {})
      )
    );
  });

  it('should combine commits query option flags', function() {
    const searchStub = this.sandbox
      .stub(search, 'default')
      .resolves(getMockResponse('commits'));
    const handler = getHandler(searchStub);
    const options = buildOptions({
      name: 'commits',
      hash: '1fec528fb13dc19280bb4886170a7e5655490ea0'
    });

    return handler('something', options).tap(() =>
      assert.ok(
        searchStub.calledWith(
          'commits',
          'something hash:1fec528fb13dc19280bb4886170a7e5655490ea0',
          {}
        )
      )
    );
  });

  [true, 1, 'all'].forEach(flag => {
    it(`should open with open flag: ${flag}`, function() {
      const openStub = this.sandbox.stub(opener, 'open');
      const searchStub = this.sandbox
        .stub(search, 'default')
        .resolves(getMockResponse('issues'));
      const handler = getHandler(searchStub);
      const options = buildOptions({ name: 'issues', open: flag });

      return handler('something', options).tap(resp => {
        assert.ok(openStub.calledOnce);
        assert.ok(openStub.calledWith(resp.items[0].html_url));
      });
    });
  });

  it('should wait for prompt and continue on paging', function() {
    const fakeReadline = {
      question: (q, cb) => cb(),
      close: () => {}
    };
    this.sandbox.stub(readline, 'createInterface').returns(fakeReadline);
    const questionSpy = this.sandbox.spy(fakeReadline, 'question');
    const resp = {
      items: [testData.issues],
      link: { next: this.sandbox.stub().resolves(getMockResponse('issues')) }
    };
    const searchStub = this.sandbox.stub(search, 'default').resolves(resp);
    const handler = getHandler(searchStub);
    const options = buildOptions({ name: 'issues' });

    return handler('something', options).then(() =>
      assert.ok(questionSpy.calledOnce)
    );
  });

  it('should pass sort and order options', function() {
    const searchStub = this.sandbox
      .stub(search, 'default')
      .resolves({ ...emptyResponse });
    const handler = getHandler(searchStub);
    const options = buildOptions({
      name: 'issues',
      sort: 'asc',
      order: 'comments'
    });

    return handler('something', options).tap(() =>
      searchStub.calledWith('issues', 'something', {
        sort: 'asc',
        order: 'comments'
      })
    );
  });

  it('should print json on json flag', function() {
    const searchStub = this.sandbox
      .stub(search, 'default')
      .resolves(getMockResponse('repositories'));
    const stringifySpy = this.sandbox
      .stub(JSON, 'stringify')
      .callsFake(() => '[]');
    const handler = getHandler(searchStub);
    const options = buildOptions({ name: 'issues', json: true });

    return handler('something', options).tap(() =>
      assert.ok(stringifySpy.calledOnce)
    );
  });

  it('should print out status code errors', function() {
    const searchStub = this.sandbox
      .stub(search, 'default')
      .rejects(new errors.StatusCodeError(422, testData.error));
    const handler = getHandler(searchStub);
    const options = buildOptions({
      name: 'commits',
      committerName: 'someuser'
    });

    return handler('something', options).tap(() =>
      assert.ok(searchStub.calledOnce)
    );
  });

  it('should call help function on invalid command with no args', function() {
    const help = sinon.spy();
    const handler = getHandler(this.sandbox.stub(search, 'default'));
    const options = buildOptions({
      name: 'commits',
      parent: {
        commands: [
          {
            _name: 'commits',
            help
          }
        ]
      }
    });

    return handler(null, options).then(() =>
      assert.strictEqual(help.callCount, 1)
    );
  });

  it('should user current user for user flags', function() {
    const searchStub = this.sandbox
      .stub(search, 'default')
      .resolves(getMockResponse('issues'));
    const handler = getHandler(searchStub);
    const options = buildOptions({
      name: 'issues',
      language: 'java',
      involves: true
    });

    return handler(null, options).tap(() =>
      assert.ok(
        searchStub.calledWith(
          'issues',
          `involves:${currentUser} language:java`,
          {}
        )
      )
    );
  });
});
