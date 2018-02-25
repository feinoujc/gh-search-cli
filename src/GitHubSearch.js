import assert from 'assert';
import request from 'request-promise';
import requestDebug from 'request-debug';
import headerParser from 'parse-link-header';

import pkg from '../package.json';
import debug from './debug';

/* istanbul ignore next */
if (debug.enabled) {
  requestDebug(request);
}

export default function GitHubSearch({
  apiToken,
  baseUrl = 'https://api.github.com'
}) {
  assert.ok(apiToken, 'apiToken is required');
  assert.ok(baseUrl, 'baseUrl is required');

  const baseOpts = {
    auth: {
      user: '',
      password: apiToken
    },
    headers: {
      'User-Agent': `${pkg.name}/${pkg.version}`,
      Accept:
        'application/vnd.github.cloak-preview,application/vnd.github.v3.text-match+json'
    },
    json: true,
    resolveWithFullResponse: true
  };
  const continueReq = request.defaults({ ...baseOpts });
  const req = request.defaults({ ...baseOpts, baseUrl });

  function parseResponse(resp) {
    function linkContinuation(url) {
      return continueReq({ url }).then(res => parseResponse(res));
    }
    const result = { items: resp.body.items, link: {} };
    if (resp.headers.link) {
      const links = headerParser(resp.headers.link);
      result.link = Object.keys(links).reduce(
        (link, key) => ({
          ...link,
          [key]: () => linkContinuation(links[key].url)
        }),
        {}
      );
    }
    return result;
  }

  return function search(type, query, opts) {
    const options = {
      url: `/search/${type}`,
      qs: { q: query, ...opts }
    };
    debug('options: %j', options);
    return req(options).then(resp => parseResponse(resp));
  };
}
