# gh-search-cli

[![npm version](https://badge.fury.io/js/gh-search-cli.svg)](https://badge.fury.io/js/gh-search-cli)
[![Build Status](https://travis-ci.org/feinoujc/gh-search-cli.svg?branch=master)](https://travis-ci.org/feinoujc/gh-search-cli)

provides a cli for searching github.com. Supports repo, code, issues and commit searches. Can be configured for github enteriprise instances as well.

```shell
~ ghs --help
~ ghs repo --help
~ ghs issues --help
~ ghs code --help
~ ghs commits --help
```

The cli requires a personal access token (no scope needed) https://github.com/settings/tokens/new

in .zshrc/.bashrc: `export GITHUB_API_TOKEN=xxxx`

if you want to search github enterprise you need to also set GITHUB_API_BASE_URL

example: `export GITHUB_API_BASE_URL='https://github.acme.com/api/v3'`

Parameters that expect a username will default to the current configured git username if left empty. for example:

```shell
~ ghs issues --is open --author
```

will search for open issues for the current git username
