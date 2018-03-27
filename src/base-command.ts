import Command, {flags} from '@oclif/command'
import cli, {Table} from 'cli-ux'
import {StatusCodeError} from 'request-promise-native/errors'

import search, {ApiResponse} from './api'
import git from './git-user-name'
import opener from './opener'
import paginator from './pagination'

export type FormatOptions = {
  text: boolean;
  open: boolean;
  json: boolean;
}

export type TableResult = {
  rows: Array<any>
  options: Partial<Table.TableOptions>
}

export default abstract class extends Command {
  static args = [{name: 'query'}]

  static flags = {
    ['api-token']: flags.string({
      env: 'GITHUB_API_TOKEN',
      description: 'The github api token. Defaults to env GITHUB_API_TOKEN.',
      required: true
    }),
    ['api-base-url']: flags.string({
      env: 'GITHUB_API_BASE_URL',
      default: 'https://api.github.com',
      description:
        "The github api token. Defaults to env GITHUB_API_BASE_URL or 'https://api.github.com'"
    }),
    open: flags.boolean({
      char: 'o',
      description: 'Open the first result in your browser.'
    }),
    json: flags.boolean({
      char: 'j',
      description: 'Return json. Can be piped to jq.'
    }),
    order: flags.enum({
      description:
        'The sort order if sort parameter is provided. Default: desc',
      options: ['asc', 'desc']
    })
  }

  async catch(err: Error) {
    if (err.name === 'StatusCodeError') {
      const sce = err as StatusCodeError
      const lines: Array<string> = []
      lines.push(sce.error.message);
      (sce.error.errors || []).forEach((_err: Error) =>
        lines.push(_err.message)
      )
      this.warn(lines.join('\n'))
    } else {
      this.warn(err.message)
    }
  }

  abstract format(data: ApiResponse, opts?: FormatOptions): TableResult

  async run() {
    const {args, flags} = this.parse(this.constructor as any)

    const qs: Array<string> = []
    if (args.query) {
      qs.push(args.query)
    }

    const {
      ['api-token']: apiToken,
      ['api-base-url']: baseUrl,
      sort,
      order,
      open,
      json,
      text,
      ...options
    } = flags

    this.debug('options: %o', options)
    Object.entries(options).forEach(([k, v]) => {
      if (k.startsWith('current-')) {
        const trimmedKey = k.replace(/^current-/, '')
        qs.push(`${trimmedKey}:${git.getUser()}`)
      } else {
        qs.push(`${k}:${v}`)
      }
    })

    if (!qs.length) {
      this._help()
      return this.exit(-1)
    }

    const type = `${this.id}`

    const print = (resp: ApiResponse, opts: FormatOptions) => {
      if (!resp.items.length) {
        this.warn('no results found')
      } else if (opts.open) {
        opener.open(resp.items[0].html_url)
      } else if (opts.json) {
        this.log(JSON.stringify(resp.items))
      } else {
        const {rows, options} = this.format(resp, opts)
        cli.table(rows, options)
      }
    }

    const next = async (
      results: ApiResponse,
      opts: FormatOptions
    ) => {
      if (!opts.json && results.links.next) {
        if (await paginator.next()) {
          const resp = await results.links.next()
          print(resp, opts)
          await next(resp, opts)
        }
      }
    }

    const opts: FormatOptions = {
      open,
      json,
      text
    }

    this.debug('searching %s qs: %o sort: %s order: %s', type, qs, sort, order)

    const resp: any = await search(type, qs.join(' '), {
      apiToken,
      baseUrl,
      sort,
      order,
      userAgent: this.config.userAgent,
      textMatch: text
    })
    print(resp, opts)
    return next(resp, opts)
  }
}
