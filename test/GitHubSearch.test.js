import assert from 'assert';
import nock from 'nock';

import GitHubSearch from '../src/GitHubSearch';
import testData from './data.json';

describe('Github search api', function() {
  it('should fail when no api key', function() {
    assert.throws(() => GitHubSearch());
  });

  it('should call api', function() {
    const ghSearch = GitHubSearch({
      apiToken: 'FAKE_TOKEN',
      baseUrl: 'https://github.acme.com/api/v3'
    });

    nock('https://github.acme.com/api/v3')
      .get('/search/code?q=something')
      .reply(
        200,
        {
          items: [testData.code]
        },
        {
          link:
            '<https://github.acme.com/api/v3/search/code?q=addClass+user%3Amozilla&page=2>; rel="next"'
        }
      );

    return ghSearch('code', 'something', {})
      .tap(({ items }) => assert.equal(items.length, 1))
      .tap(({ link }) => assert.ok(link.next));
  });

  it('should add next link and call api', function() {
    const ghSearch = GitHubSearch({
      apiToken: 'FAKE_TOKEN',
      baseUrl: 'https://github.acme.com/api/v3'
    });

    nock('https://github.acme.com/api/v3')
      .get('/search/code?q=something')
      .reply(
        200,
        {
          items: [testData.code]
        },
        {
          link:
            '<https://github.acme.com/api/v3/search/code?q=something&page=2>; rel="next"'
        }
      );

    nock('https://github.acme.com/api/v3')
      .get('/search/code?q=something&page=2')
      .reply(200, {
        items: [testData.code, testData.code]
      });

    return ghSearch('code', 'something', {})
      .tap(({ items }) => assert.equal(items.length, 1))
      .then(({ link }) => link.next())
      .tap(({ items }) => assert.strictEqual(items.length, 2));
  });
});
