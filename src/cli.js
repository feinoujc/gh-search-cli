#!/usr/bin/env node
import program from 'commander';

import GitHubSearch from './GitHubSearch';
import getHandler from './CommandHandler';
import pkg from '../package.json';
import debug from './debug';

const token = process.env.GITHUB_API_TOKEN; // eslint-disable-line no-process-env
const baseUrl = process.env.GITHUB_API_BASE_URL || undefined; // eslint-disable-line no-process-env
const handler = getHandler(GitHubSearch({ apiToken: token, baseUrl }));

/* istanbul ignore next */
program.version(pkg.version);

/* istanbul ignore next */
program
  .command('repositories [query]')
  .description('search repositories')
  .alias('repo')
  .option(
    '--in [in]',
    'Qualifies which fields are searched. With this qualifier you can restrict the search to just the repository name, description, readme, or any combination of these.'
  )
  .option(
    '--size [size]',
    'Finds repositories that match a certain size (in kilobytes).'
  )
  .option(
    '--forks [forks]',
    'Filters repositories based on the number of forks.'
  )
  .option(
    '-f,--fork [fork]',
    'Filters whether forked repositories should be included (true) or only forked repositories should be returned (only).'
  )
  .option(
    '-c,--created [created]',
    'Filters repositories based on date of creation, or when they were last updated.'
  )
  .option(
    '-p,--pushed [pushed]',
    'Filters repositories based on date of creation, or when they were last updated.'
  )
  .option(
    '-u,--user [user]',
    'Limits searches to a specific user or repository.'
  )
  .option(
    '-r,--repo [repo]',
    'Limits searches to a specific user or repository.'
  )
  .option(
    '-l,--language [language]',
    "Searches repositories based on the language they're written in."
  )
  .option(
    '--stars [stars]',
    'Searches repositories based on the number of stars.'
  )
  .option(
    '-o, --open [n|all]',
    'Open the first n result in your browser',
    /^(\d+|all|)$/
  )
  .option('-j,--json', 'Return json')
  .option(
    '-s,--sort [sort]',
    'The sort field. One of stars, forks, or updated. Default: results are sorted by best match.'
  )
  .option(
    '--order [order]',
    'The sort order if sort parameter is provided. One of asc or desc. Default: desc'
  )
  .action(handler);

/* istanbul ignore next */
program
  .command('code [query]')
  .description('search code')
  .option(
    '--in [in]',
    'Qualifies which fields are searched. With this qualifier you can restrict the search to the file contents (file), the file path (path), or both.'
  )
  .option(
    '-l,--language [language]',
    "Searches code based on the language it's written in."
  )
  .option('--size [size]', 'Finds files that match a certain size (in bytes).')
  .option(
    '--path [path]',
    'Specifies the path prefix that the resulting file must be under.'
  )
  .option(
    '--filename [filename]',
    'Matches files by a substring of the filename.'
  )
  .option(
    '--extension [extension]',
    'Matches files with a certain extension after a dot.'
  )
  .option('-u,--user [user]', 'Limits searches to a specific user.')
  .option('-r,--repo [repo]', 'Limits searches to a specific repository.')
  .option('-t,--text', 'Show full text match')
  .option(
    '-o, --open [n|all]',
    'Open the first n result in your browser',
    /^(\d+|all|)$/
  )
  .option('-j,--json', 'Return json')
  .option(
    '-s,--sort [sort]',
    'The sort field. Can only be indexed, which indicates how recently a file has been indexed by the GitHub search infrastructure. Default: results are sorted by best match.'
  )
  .option(
    '--order [order]',
    'The sort order if sort parameter is provided. One of asc or desc. Default: desc'
  )
  .action(handler);

/* istanbul ignore next */
program
  .command('issues [query]')
  .description('search issues')
  .option(
    '-t,--type [type]',
    'With this qualifier you can restrict the search to issues (issue) or pull request (pr) only.'
  )
  .option(
    '--in [in]',
    'Qualifies which fields are searched. With this qualifier you can restrict the search to just the title (title), body (body), comments (comments), or any combination of these.'
  )
  .option(
    '--author [author]',
    'Finds issues or pull requests created by a certain user.'
  )
  .option(
    '--assignee [assignee]',
    'Finds issues or pull requests that are assigned to a certain user.'
  )
  .option(
    '--mentions [mentions]',
    'Finds issues or pull requests that mention a certain user.'
  )
  .option(
    '--commenter [commenter]',
    'Finds issues or pull requests that a certain user commented on.'
  )
  .option(
    '--involves [involves]',
    'Finds issues or pull requests that were either created by a certain user, assigned to that user, mention that user, or were commented on by that user.'
  )
  .option(
    '--team [team]',
    "For organizations you're a member of, finds issues or pull requests that @mention a team within the organization."
  )
  .option(
    '--state [state]',
    "Filter issues or pull requests based on whether they're open or closed."
  )
  .option(
    '--labels [labels]',
    'Filters issues or pull requests based on their labels.'
  )
  .option(
    '--no [no]',
    'Filters items missing certain metadata, such as label, milestone, or assignee'
  )
  .option(
    '-l,--language [language]',
    'Searches for issues or pull requests within repositories that match a certain language.'
  )
  .option(
    '--is [is]',
    'Searches for items within repositories that match a certain state, such as open, closed, or merged'
  )
  .option(
    '-c,--created [created]',
    'Filters issues or pull requests based on date of creation, or when they were last updated.'
  )
  .option(
    '-u,--updated [updated]',
    'Filters issues or pull requests based on date of creation, or when they were last updated.'
  )
  .option(
    '-m,--merged [merged]',
    'Filters pull requests based on the date when they were merged.'
  )
  .option(
    '-s,--status [status]',
    'Filters pull requests based on the commit status.'
  )
  .option(
    '--base [base]',
    'Filters pull requests based on the branch that they came from.'
  )
  .option(
    '--head [head]',
    'Filters pull requests based on the branch that they are modifying.'
  )
  .option(
    '--closed [closed]',
    'Filters issues or pull requests based on the date when they were closed.'
  )
  .option(
    '--comments [comments]',
    'Filters issues or pull requests based on the quantity of comments.'
  )
  .option('-u,--user [user]', 'Limits searches to a specific user.')
  .option('-r,--repo [repo]', 'Limits searches to a specific repository.')
  .option(
    '-o, --open [n|all]',
    'Open the first n result in your browser',
    /^(\d+|all|)$/
  )
  .option('-j,--json', 'Return json')
  .option(
    '-s,--sort [sort]',
    'The sort field. Can be comments, created, or updated. Default: results are sorted by best match.'
  )
  .option(
    '--order [order]',
    'The sort order if sort parameter is provided. One of asc or desc. Default: desc'
  )
  .action(handler);

/* istanbul ignore next */
program
  .command('commits [query]')
  .description('search commits')
  .option(
    '--author [author]',
    'Matches commits authored by a user (based on email settings).'
  )
  .option(
    '--committer [committer]',
    'Matches commits committed by a user (based on email settings).'
  )
  .option('--author-name [author-name]', 'Matches commits by author name.')
  .option(
    '--committer-name [committer-name]',
    'Matches commits by committer name.'
  )
  .option('--author-email [author-email]', 'Matches commits by author email.')
  .option(
    '--committer-email [committer-email]',
    'Matches commits by committer email.'
  )
  .option(
    '--author-date [author-date]',
    'Matches commits by author date range.'
  )
  .option(
    '--committer-date [committer-date]',
    'Matches commits by committer date range.'
  )
  .option(
    '--merge [merge]',
    'true filters to merge commits, false filters out merge commits.',
    /^(true|false)$/
  )
  .option('--hash [hash]', 'Matches commits by hash.')
  .option(
    '--parent [parent]',
    'Matches commits that have a particular parent.',
    undefined,
    undefined
  )
  .option(
    '--is [is]',
    'Matches public or private repositories.',
    /^(public|private)$/
  )
  .option('--user [user]', 'Limits searches to a specific user.')
  .option('--org [org]', ' Limits searches to a specific organization.')
  .option('--repo [repo]', 'Limits searches to a specific repository.')
  .option(
    '-o, --open [n|all]',
    'Open the first n result in your browser',
    /^(\d+|all|)$/
  )
  .option('-j,--json', 'Return json')
  .option(
    '-s,--sort [sort]',
    'The sort field. Can be author-date or committer-date. Default: results are sorted by best match.',
    /^(author-date|committer-date)$/
  )
  .option(
    '--order [order]',
    'The sort order if sort parameter is provided. One of asc or desc. Default: desc',
    /^(asc|desc)$/
  )
  .action(handler);

/* istanbul ignore next */
const command = program.parse(process.argv);

/* istanbul ignore next */
if (command.args.length < 2) {
  command.help();
  process.exit(-1);
}
debug(command);
