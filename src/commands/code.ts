import {flags} from '@oclif/command'
import chalk from 'chalk'

import {ApiResponse} from '../api'
import Command, {FormatOptions, TableResult} from '../base-command'

export default class Code extends Command {
  static description = 'search github code. https://developer.github.com/v3/search/#search-code'

  static examples = [
    `$ ghs code --extension js "import _ from 'lodash'"
`
  ]

  static flags = {
    in: flags.string({
      description: 'Qualifies which fields are searched. With this qualifier you can restrict the search to the file contents (file), the file path (path), or both.'
    }),
    language: flags.string({
      char: 'l', description: "Searches code based on the language it's written in."
    }),
    size: flags.string({
      description: 'Finds files that match a certain size (in bytes).'
    }),
    path: flags.string({
      description: 'Specifies the path prefix that the resulting file must be under.'
    }),
    filename: flags.string({
      description: 'Matches files by a substring of the filename.'
    }),
    extension: flags.string({
      description: 'Matches files with a certain extension after a dot.'
    }),
    user: flags.string({
      char: 'u',
      description: 'Limits searches to a specific user. Use --current-user to use the currently configured git username.'
    }),
    ['current-user']: flags.boolean({
      hidden: true
    }),
    repo: flags.string({
      char: 'r',
      description: 'Limits searches to a specific repository.'
    }),
    org: flags.string({
      char: 'o',
      description: 'Limits searchs to a specific organization'
    }),
    text: flags.boolean({
      char: 't',
      description: 'Show full text match'
    }),
    sort: flags.enum({
      char: 's',
      options: ['indexed'],
      description: 'The sort field. Can only be indexed, which indicates how recently a file has been indexed by the GitHub search infrastructure. Default: results are sorted by best match.'
    }),
    ...Command.flags
  }

  static args = [...Command.args]

  format(data: ApiResponse, opts: FormatOptions): TableResult {
    const rows = data.items.reduce((acc, item) => {
      const repo = chalk.cyan(item.repository.name)
      const fullPath: string = item.html_url

      const [blobSegment] = fullPath.match(/blob\/[0-9a-f]{40}\//) as RegExpMatchArray
      let shortenedPath = fullPath
      if (blobSegment) {
        shortenedPath = fullPath.replace(blobSegment, `${blobSegment.substring(0, 12)}/`)
      }
      const url = shortenedPath
      acc.push({repo, url, text: opts.text ? chalk.green(item.text_matches.map((textMatch: any) => textMatch.fragment).join('/n')) : undefined})
      return acc
    }, [])

    return {
      rows,
      columns: {
        ...(opts.text ? {text: {header: 'code'}} : {repo: {}}),
        url: {}
      },
      options: opts.text ? {'no-truncate': true} : undefined
    }
  }
}
