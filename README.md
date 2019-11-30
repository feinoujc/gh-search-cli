gh-search-cli
=============
Provides a cli for searching github.com. Supports repositories, code, issues and commits. Can be configured for github enterprise instances as well. Built using [oclif](https://github.com/oclif/oclif)

[![Version](https://img.shields.io/npm/v/gh-search-cli.svg)](https://npmjs.org/package/gh-search-cli)
[![CircleCI](https://circleci.com/gh/feinoujc/gh-search-cli/tree/master.svg?style=shield)](https://circleci.com/gh/feinoujc/gh-search-cli/tree/master)
[![Appveyor CI](https://ci.appveyor.com/api/projects/status/github/feinoujc/gh-search-cli?branch=master&svg=true)](https://ci.appveyor.com/project/feinoujc/gh-search-cli/branch/master)
[![Codecov](https://codecov.io/gh/feinoujc/gh-search-cli/branch/master/graph/badge.svg)](https://codecov.io/gh/feinoujc/gh-search-cli)
[![License](https://img.shields.io/npm/l/gh-search-cli.svg)](https://github.com/feinoujc/gh-search-cli/blob/master/package.json)
[![Dependabot Status](https://api.dependabot.com/badges/status?host=github&repo=feinoujc/gh-search-cli)](https://dependabot.com)

<!-- toc -->
* [Setup](#setup)
* [Usage](#usage)
* [Commands](#commands)
<!-- tocstop -->

# Setup

The cli requires a personal access token (`notifications` scope is needed for the notifications command). The cli will create a new token on the first run and store it for future use. If you prefer you can use your own token and config the cli yourself (see [ghs config](#ghs-config))

_See code: [src/hooks/init/auth.ts](https://github.com/feinoujc/gh-search-cli/blob/v2.1.0/src/hooks/init/auth.ts)_


# Usage
<!-- usage -->
```sh-session
$ npm install -g gh-search-cli
$ ghs COMMAND
running command...
$ ghs (-v|--version|version)
gh-search-cli/2.5.0 darwin-x64 node-v10.17.0
$ ghs --help [COMMAND]
USAGE
  $ ghs COMMAND
...
```
<!-- usagestop -->
# Commands
<!-- commands -->
* [`ghs code [QUERY]`](#ghs-code-query)
* [`ghs commits [QUERY]`](#ghs-commits-query)
* [`ghs config`](#ghs-config)
* [`ghs help [COMMAND]`](#ghs-help-command)
* [`ghs issues [QUERY]`](#ghs-issues-query)
* [`ghs notifications`](#ghs-notifications)
* [`ghs repositories [QUERY]`](#ghs-repositories-query)

## `ghs code [QUERY]`

search github code. https://developer.github.com/v3/search/#search-code

```
USAGE
  $ ghs code [QUERY]

OPTIONS
  -j, --json                   Return json. Can be piped to jq.
  -l, --language=language      Searches code based on the language it's written in.
  -o, --open                   Open the first result in your browser.
  -o, --org=org                Limits searchs to a specific organization
  -r, --repo=repo              Limits searches to a specific repository.

  -s, --sort=(indexed)         The sort field. Can only be indexed, which indicates how recently a file has been indexed
                               by the GitHub search infrastructure. Default: results are sorted by best match.

  -t, --text                   Show full text match

  -u, --user=user              Limits searches to a specific user. Use --current-user to use the currently configured
                               git username.

  --api-base-url=api-base-url  The github api token. Defaults to configured GHE url or 'https://api.github.com'

  --api-token=api-token        The github api token. Defaults to configured api token

  --extension=extension        Matches files with a certain extension after a dot.

  --filename=filename          Matches files by a substring of the filename.

  --in=in                      Qualifies which fields are searched. With this qualifier you can restrict the search to
                               the file contents (file), the file path (path), or both.

  --order=(asc|desc)           The sort order if sort parameter is provided. Default: desc

  --path=path                  Specifies the path prefix that the resulting file must be under.

  --size=size                  Finds files that match a certain size (in bytes).

EXAMPLE
  $ ghs code --extension js "import _ from 'lodash'"
```

_See code: [src/commands/code.ts](https://github.com/feinoujc/gh-search-cli/blob/v2.5.0/src/commands/code.ts)_

## `ghs commits [QUERY]`

search github commits. https://developer.github.com/v3/search/#search-commits

```
USAGE
  $ ghs commits [QUERY]

OPTIONS
  -j, --json                               Return json. Can be piped to jq.
  -o, --open                               Open the first result in your browser.

  -s, --sort=(author-date|committer-date)  The sort field. Can be author-date or committer-date. Default: results are
                                           sorted by best match.

  --api-base-url=api-base-url              The github api token. Defaults to configured GHE url or
                                           'https://api.github.com'

  --api-token=api-token                    The github api token. Defaults to configured api token

  --author=author                          Matches commits authored by a user (based on email settings).

  --author-date=author-date                Matches commits by author date range.

  --author-email=author-email              Matches commits by author email.

  --author-name=author-name                Matches commits by author name.

  --committer=committer                    Matches commits committed by a user (based on email settings).

  --committer-date=committer-date          Matches commits by committer date range.

  --committer-email=committer-email        Matches commits by committer email.

  --committer-name=committer-name          Matches commits by committer name.

  --hash=hash                              Matches commits by hash.

  --is=(public|private)                    Matches public or private repositories.

  --[no-]merge                             --merge filters to merge commits, --no-merge filters out merge commits.

  --order=(asc|desc)                       The sort order if sort parameter is provided. Default: desc

  --org=org                                Limits searches to a specific organization.

  --parent=parent                          Matches commits that have a particular parent.

  --repo=repo                              Limits searches to a specific repository.

  --tree=tree                              Matches commits with the specified git tree hash.

  --user=user                              Limits searches to a specific user. Use --current-user to use the currently
                                           configured git username.

EXAMPLE
  $ ghs commit --repo octocat/Spoon-Knife css
```

_See code: [src/commands/commits.ts](https://github.com/feinoujc/gh-search-cli/blob/v2.5.0/src/commands/commits.ts)_

## `ghs config`

Configure ghs settings

```
USAGE
  $ ghs config

OPTIONS
  --base-url=base-url  sets the github base url for github enterprise instances (ex: https://github.company.com/api/v3).
  --clear              clears the local config file including the auth token.
  --token=token        sets the github token to use.

EXAMPLE
  $ ghs config --clear
  config cleared
```

_See code: [src/commands/config.ts](https://github.com/feinoujc/gh-search-cli/blob/v2.5.0/src/commands/config.ts)_

## `ghs help [COMMAND]`

display help for ghs

```
USAGE
  $ ghs help [COMMAND]

ARGUMENTS
  COMMAND  command to show help for

OPTIONS
  --all  see all commands in CLI
```

_See code: [@oclif/plugin-help](https://github.com/oclif/plugin-help/blob/v2.2.1/src/commands/help.ts)_

## `ghs issues [QUERY]`

search github issues. https://developer.github.com/v3/search/#search-issues

```
USAGE
  $ ghs issues [QUERY]

OPTIONS
  -c, --created=created                                Filters issues or pull requests based on date of creation,or when
                                                       they were last updated.

  -j, --json                                           Return json. Can be piped to jq.

  -l, --language=language                              Searches for issues or pull requests within repositories that
                                                       match a certain language.

  -m, --merged=merged                                  Filters pull requests based on the date when they were merged.

  -o, --open                                           Open the first result in your browser.

  -r, --repo=repo                                      Limits searches to a specific repository.

  -s, --sort=(comments|created|updated)                The sort field. Default: results are sorted by best match.

  -s, --status=status                                  Filters pull requests based on the commit status.

  -t, --type=(issue|pr)                                With this qualifier you can restrict the search to issues (issue)
                                                       or pull request (pr) only.

  -u, --updated=updated                                Filters issues or pull requests based on date of creation, or
                                                       when they were last updated.

  -u, --user=user                                      Limits searches to a specific user. Use --current-user to use the
                                                       currently configured git username.

  --SHA=SHA                                            If you know the specific SHA hash of a commit, you can use it to
                                                       search for pull requests that contain that SHA. The SHA syntax
                                                       must be at least seven characters.

  --api-base-url=api-base-url                          The github api token. Defaults to configured GHE url or
                                                       'https://api.github.com'

  --api-token=api-token                                The github api token. Defaults to configured api token

  --[no-]archived                                      Filters issues or pull requests based on whether they are in an
                                                       archived repository.

  --assignee=assignee                                  Finds issues or pull requeststhat are assigned to a certain user.
                                                       Use --current-author to use the currently configured git
                                                       username.

  --author=author                                      Finds issues or pull requests created by a certain user. Use
                                                       --current-author to use the currently configured git username.

  --base=base                                          Filters pull requests based on the branch that they came from.

  --closed=closed                                      Filters issues or pull requests based on the date when they were
                                                       closed.

  --commenter=commenter                                Finds issues or pull requests that a certain user commented on.
                                                       Use --current-commenter to use the currently configured git
                                                       username.

  --comments=comments                                  Filters issues or pull requests based on the quantity of
                                                       comments.

  --head=head                                          Filters pull requests based on the branch that they are
                                                       modifying.

  --in=in                                              Qualifies which fields are searched. With this qualifier you can
                                                       restrict the searchto just the title (title), body (body),
                                                       comments (comments), or any combination of these.

  --interactions=interactions                          You can filter issues and pull requests by the number of
                                                       interactions with the interactions qualifier along with greater
                                                       than, less than, and range qualifiers. The interactions count is
                                                       the number of reactions and comments on an issue or pull request.

  --involves=involves                                  Finds issues or pull requests that were either created by a
                                                       certain user, assigned to that user, mention that user, or were
                                                       commented on by that user. Use --current-involves to use the
                                                       currently configured git username.

  --is=is                                              Searches for items within repositories that match a certain
                                                       state, such as open, closed, or merged

  --label=label                                        Filters issues or pull requests based on their labels.

  --mentions=mentions                                  Finds issues or pull requests that mention a certain user. Use
                                                       --current-author to use the currently configured git username.

  --milestone=milestone                                Finds issues or pull requests that are a part of a milestone
                                                       within a repository.

  --no=no                                              Filters items missing certain metadata, such as label, milestone,
                                                       or assignee

  --order=(asc|desc)                                   The sort order if sort parameter is provided. Default: desc

  --org=org                                            Limits searches to a specific org.

  --project=project                                    Limits searches to a specific project board in a repository or
                                                       organization.

  --reactions=reactions                                You can filter issues and pull requests by the number of
                                                       reactions using the reactions qualifier along with greater than,
                                                       less than, and range qualifiers.

  --review=(none|required|approved|changes_requested)  You can filter pull requests based on their review status

  --review-requested=review-requested                  Filter pull requests by requested reviewer.

  --reviewed-by=reviewed-by                            Filter pull requests by reviewer.

  --state=(open|closed)                                Filter issues or pull requests based on whether they're open or
                                                       closed.

  --team=team                                          For organizations you're a member of, finds issues or pull
                                                       requests that @mention a team within the organization.

  --team-review-requested=team-review-requested        Filter pull requests by requested reviewer.

EXAMPLE
  $ ghs issues --is open --involves my-github-username
```

_See code: [src/commands/issues.ts](https://github.com/feinoujc/gh-search-cli/blob/v2.5.0/src/commands/issues.ts)_

## `ghs notifications`

List notifications

```
USAGE
  $ ghs notifications

OPTIONS
  -a, --all                    If true, show notifications marked as read. Default: false

  -b, --before=before          Only show notifications updated before the given time. This is a timestamp in ISO 8601
                               format: YYYY-MM-DDTHH:MM:SSZ.

  -j, --json                   Return json. Can be piped to jq.

  -o, --open                   Open the first result in your browser.

  -p, --participating          If true, only shows notifications in which the user is directly participating or
                               mentioned. Default: false

  -s, --since=since            Only show notifications updated after the given time. This is a timestamp in ISO 8601
                               format: YYYY-MM-DDTHH:MM:SSZ

  --api-base-url=api-base-url  The github api token. Defaults to configured GHE url or 'https://api.github.com'

  --api-token=api-token        The github api token. Defaults to configured api token

  --owner=owner                Filter notifications to a owner, required with --repo flag

  --repo=repo                  Filter notifications to a repository, required with --owner flag
```

_See code: [src/commands/notifications.ts](https://github.com/feinoujc/gh-search-cli/blob/v2.5.0/src/commands/notifications.ts)_

## `ghs repositories [QUERY]`

search github repositories. https://developer.github.com/v3/search/#search-repositories

```
USAGE
  $ ghs repositories [QUERY]

OPTIONS
  -c, --created=created                    Filters repositories based on date of creation, or when they were last
                                           updated.

  -f, --[no-]fork                          Filters whether forked repositories should be included (--fork) or not
                                           (--no-fork).

  -j, --json                               Return json. Can be piped to jq.

  -l, --language=language                  Searches repositories based on the language they're written in.

  -o, --open                               Open the first result in your browser.

  -p, --pushed=pushed                      Filters repositories based on date of creation, or when they were last
                                           updated.

  -r, --repo=repo                          Limits searches to a specific repo.

  -s, --sort=(stars|forks|updated)         The sort field. Default: results are sorted by best match.

  -u, --user=user                          Limits searches to a specific user. Use --current-user to filter on current
                                           github username

  --api-base-url=api-base-url              The github api token. Defaults to configured GHE url or
                                           'https://api.github.com'

  --api-token=api-token                    The github api token. Defaults to configured api token

  --[no-]archived                          Filters whether archived repositories should be included (--archived) or not
                                           (--no-archived).

  --followers=followers                    Searches repositories based on the number of followers.

  --forks=forks                            Filters repositories based on the number of forks.

  --good-first-issues=good-first-issues    Search for repositories that have a minimum number of issues labeled
                                           help-wanted.

  --help-wanted-issues=help-wanted-issues  Search for repositories that have a minimum number of issues labeled
                                           good-first-issue.

  --in=in                                  Qualifies which fields are searched. With this qualifier you can restrict the
                                           search to just the repository name, description, readme, or any combination
                                           of these.

  --license=license                        Filters repositories by license or license family, using the license keyword.

  --[no-]mirror                            Search repositories based on whether or not they're a mirror and are hosted
                                           elsewhere.

  --order=(asc|desc)                       The sort order if sort parameter is provided. Default: desc

  --size=size                              Finds repositories that match a certain size (in kilobytes).

  --stars=stars                            Searches repositories based on the number of stars.

  --topic=topic                            Filters repositories based on the specified topic.

  --topics=topics                          Search repositories by the number of topics that have been applied to them.

ALIASES
  $ ghs repo
  $ ghs repository

EXAMPLE
  $ ghs repo puppeteer
     GoogleChrome/puppeteer (https://github.com/GoogleChrome/puppeteer)
```

_See code: [src/commands/repositories.ts](https://github.com/feinoujc/gh-search-cli/blob/v2.5.0/src/commands/repositories.ts)_
<!-- commandsstop -->
