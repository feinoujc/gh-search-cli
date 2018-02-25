import _ from 'lodash';
import Bluebird from 'bluebird';
import colors from 'colors/safe';
import errors from 'request-promise/errors';
import getUser from 'git-user-name';
import path from 'path';
import readline from 'readline';
import util from 'util';

import debug from './debug';
import opener from './opener';

const user = getUser();

debug(`current github user is: '${user}'`);

colors.setTheme({
  repo: ['cyan'],
  ticket: ['bold', 'yellow'],
  label: ['bold'],
  code: ['green'],
  text: ['magenta'],
  url: ['reset']
});

function sanitizeTicket(ticket) {
  return ticket.replace(/[^A-Z\d-]+/gi, '');
}

const titleRegex = /^(\[?[A-Z]{2,10}-\d{1,5}\]?[\s|:]*)?(.*)$/im;

function writeline(...args) {
  process.stdout.write(`${util.format.apply(undefined, args)}\n`);
}

function getReadline() {
  return Bluebird.resolve(
    readline.createInterface({
      input: process.stdin,
      output: process.stdout
    })
  ).disposer(rl => rl.close());
}

const advancedOptions = {
  repositories: [
    'in',
    'size',
    'forks',
    'fork',
    'created',
    'pushed',
    'user',
    'repo',
    'language',
    'stars'
  ],
  code: [
    'in',
    'fork',
    'language',
    'size',
    'path',
    'filename',
    'extension',
    'user',
    'repo'
  ],
  issues: [
    'type',
    'in',
    'author',
    'assignee',
    'mentions',
    'commenter',
    'involves',
    'team',
    'state',
    'labels',
    'no',
    'language',
    'is',
    'created',
    'updated',
    'merged',
    'status',
    'base',
    'head',
    'closed',
    'comments',
    'user',
    'repo'
  ],
  commits: [
    'author',
    'committer',
    'author-name',
    'committer-name',
    'author-email',
    'committer-email',
    'author-date',
    'committer-date',
    'merge',
    'hash',
    'parent',
    'is',
    'user',
    'org',
    'repo'
  ]
};
const userOptions = [
  'author',
  'assignee',
  'mentions',
  'commenter',
  'involves',
  'user'
];

const formatters = {
  repositories(item) {
    const repo = colors.repo(item.full_name);
    const url = colors.url(item.html_url);
    writeline(`${repo} (${url})`);
  },
  code(item, opts) {
    const repo = colors.repo(item.repository.name);
    const fullPath = path.join(
      item.repository.html_url,
      'blob/master',
      colors.code(item.path)
    );
    const url = colors.url(fullPath);
    writeline(`${repo} ${url}`);
    if (opts.text) {
      item.text_matches.forEach(textMatch => {
        writeline(colors.text(textMatch.fragment));
      });
    }
  },
  issues(item) {
    const titleMatches = item.title.match(titleRegex);
    const ticket = colors.ticket(sanitizeTicket(titleMatches[1] || ''));
    const label = colors.label(titleMatches[2] || '');
    const url = colors.url(item.html_url);
    writeline(`${ticket} ${label} (${url})`.trim());
  },
  commits(item) {
    const label = colors.label(item.message);
    const url = colors.url(item.html_url);
    const repo = colors.repo(item.repository.name);
    writeline(`${repo} ${label}\n${url}`);
  }
};

function displayResults(items, opts, formatter) {
  items.forEach(item => formatter(item, opts));
}

function openItemsInBrowser(items, opts) {
  if (_.isBoolean(opts.open)) {
    opener.open(items[0].html_url);
  } else if (/^\d+$/.test(opts.open)) {
    items
      .slice(0, parseInt(opts.open, 10))
      .forEach(item => opener.open(item.html_url));
  } else if (/^all$/i.test(opts.open)) {
    items.slice(0, 20).forEach(item => opener.open(item.html_url));
  }
}

function output(items, type, opts) {
  if (!items.length) {
    writeline(colors.red('no results found'));
  } else if (opts.open) {
    openItemsInBrowser(items, opts);
  } else if (opts.json) {
    writeline(JSON.stringify(items));
  } else {
    displayResults(items, opts, formatters[type]);
  }
}

function next(results, type, opts, rl) {
  if (!opts.json && results.link.next) {
    return new Bluebird((resolve, reject) => {
      rl.question('More...', () => {
        results.link
          .next()
          .tap(resp => output(resp.items, type, opts))
          .then(resp => next(resp, type, opts, rl))
          .then(resolve)
          .catch(reject);
      });
    });
  }
  return results;
}

export default function handler(ghSearch) {
  function search(type, query, options) {
    const opts = { ...options };
    const qs = [];
    if (!_.isNil(query)) {
      qs.push(query);
    }

    advancedOptions[type]
      .map(name => ({ oname: name, name: _.camelCase(name) }))
      .filter(({ name }) => opts[name] && !_.isObject(opts[name]))
      .forEach(({ oname, name }) => {
        let value = opts[name];
        // replace empty option with your current username (--involves = --involves myname)
        if (_.isBoolean(value) && userOptions.includes(oname)) {
          value = user;
        }
        qs.push(`${oname}:${value}`);
      });

    if (!qs.length) {
      const command = opts.parent.commands.find(
        ({ _name: name }) => name === type
      );

      /* istanbul ignore else */
      if (command) {
        command.help();
      }
      return Bluebird.resolve();
    }
    return Bluebird.using(getReadline(), rl =>
      ghSearch(type, qs.join(' '), _.pick(opts, ['sort', 'order']))
        .tap(results => output(results.items, type, opts))
        .then(results => next(results, type, opts, rl))
    );
  }

  return function invoke(query, options) {
    return Bluebird.try(() =>
      search(options.name(), query, options).catch(
        errors.StatusCodeError,
        sce => {
          debug(sce);
          const err = sce.error;
          writeline(colors.red(err.message));
          (err.errors || []).forEach(error =>
            writeline(colors.red(error.message))
          );
        }
      )
    );
  };
}
