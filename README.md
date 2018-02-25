# gh-search-cli

searches github.com

requires a personal access token (no scope needed) https://github.com/settings/tokens/new

in .zshrc/.bashrc: `export GITHUB_API_TOKEN=xxxx`

if you want to search github enterprise you need to also set GITHUB_API_BASE_URL

example: `export GITHUB_API_BASE_URL='https://github.acme.com/api/v3'`

install globally: `~ npm install -g`

```shell
~ ghs --help
~ ghs repo --help
~ ghs issues --help
~ ghs code --help
~ ghs commits --help
```

Parameters that expect a username will default to the current configured git username if left empty. for example:

```shell
~ ghs issues --is open --author
```

will search for open issues for the current git username
