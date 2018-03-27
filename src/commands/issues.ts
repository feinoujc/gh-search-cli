import {flags} from '@oclif/command'
import chalk from 'chalk'

import {ApiResponse} from '../api'
import Command, {TableResult} from '../base-command'

function sanitizeTicket(ticket: string) {
  return ticket.replace(/[^A-Z\d-]+/gi, '')
}

const jiraRegex = /^(\[?[A-Z]{2,10}-\d{1,5}\]?[\s|:]*)?(.*)$/im

export default class Issues extends Command {
  static description = 'search github issues. https://developer.github.com/v3/search/#search-issues'

  static examples = [
    `$ ghs issues --is open --involves my-github-username
`
  ]

  static flags = {
    type: flags.enum({
      char: 't',
      description: 'With this qualifier you can restrict the search to issues (issue) or pull request (pr) only.',
      options: ['issue', 'pr']
    }),
    in: flags.string({
      description: 'Qualifies which fields are searched. With this qualifier you can restrict the searchto just the title (title), body (body), comments (comments), or any combination of these.'
    }),
    author: flags.string({
      description: 'Finds issues or pull requests created by a certain user. Use --current-author to use the currently configured git username.'
    }),
    ['current-author']: flags.boolean({
      hidden: true
    }),
    assignee: flags.string({
      description: 'Finds issues or pull requeststhat are assigned to a certain user. Use --current-author to use the currently configured git username.',
    }),
    ['current-assignee']: flags.boolean({
      hidden: true
    }),
    mentions: flags.string({
      description: 'Finds issues or pull requests that mention a certain user. Use --current-author to use the currently configured git username.'
    }),
    ['current-mentions']: flags.boolean({
      hidden: true
    }),
    commenter: flags.string({
      description: 'Finds issues or pull requests that a certain user commented on. Use --current-commenter to use the currently configured git username.'
    }),
    ['current-commenter']: flags.boolean({
      hidden: true
    }),
    involves: flags.string({
      description: 'Finds issues or pull requests that were either created by a certain user, assigned to that user, mention that user, or were commented on by that user. Use --current-involves to use the currently configured git username.'
    }),
    ['current-involves']: flags.boolean({
      hidden: true
    }),
    team: flags.string({
      description: "For organizations you're a member of, finds issues or pull requests that @mention a team within the organization."
    }),
    state: flags.enum({
      description: "Filter issues or pull requests based on whether they're open or closed.",
      options: ['open', 'closed']
    }),
    labels: flags.string({
      description: 'Filters issues or pull requests based on their labels.'
    }),
    no: flags.string({
      description: 'Filters items missing certain metadata, such as label, milestone, or assignee'
    }),
    language: flags.string({
      char: 'l',
      description: 'Searches for issues or pull requests within repositories that match a certain language.'
    }),
    is: flags.string({
      description: 'Searches for items within repositories that match a certain state, such as open, closed, or merged'
    }),
    created: flags.string({
      char: 'c',
      description: 'Filters issues or pull requests based on date of creation,or when they were last updated.'
    }),
    updated: flags.string({
      char: 'u',
      description: 'Filters issues or pull requests based on date of creation, or when they were last updated.'
    }),
    merged: flags.string({
      char: 'm',
      description: 'Filters pull requests based on the date when they were merged.'
    }),
    status: flags.string({
      char: 's',
      description: 'Filters pull requests based on the commit status.'
    }),
    base: flags.string({
      description: 'Filters pull requests based on the branch that they came from.'
    }),
    head: flags.string({
      description: 'Filters pull requests based on the branch that they are modifying.'
    }),
    closed: flags.string({
      description: 'Filters issues or pull requests based on the date when they were closed.'
    }),
    comments: flags.string({
      description: 'Filters issues or pull requests based on the quantity of comments.'
    }),
    user: flags.string({
      char: 'u', description: 'Limits searches to a specific user. Use --current-user to use the currently configured git username.'
    }),
    ['current-user']: flags.boolean({
      hidden: true
    }),
    repo: flags.string({
      char: 'r', description: 'Limits searches to a specific repository.'
    }),
    project: flags.string({
      description: 'Limits searches to a specific project board in a repository or organization.'
    }),
    archived: flags.boolean({
      allowNo: true,
      description: 'Filters issues or pull requests based on whether they are in an archived repository.'
    }),
    sort: flags.enum({
      char: 's',
      description: 'The sort field. Default: results are sorted by best match.',
      options: ['comments', 'created', 'updated']
    }),
    ...Command.flags
  }

  static args = [...Command.args]

  format(data: ApiResponse): TableResult {
    const rows = data.items.reduce((acc, item) => {
      const [, ticketMatch, labelMatch] = item.title.match(jiraRegex)
      const ticket = chalk.bold.yellow(sanitizeTicket(ticketMatch || ''))
      const label = chalk.bold(labelMatch || '')
      const url = item.html_url
      acc.push({title: `${ticket} ${label}`.trim(), url})
      return acc
    }, [])

    return {
      rows,
      options: {
        columns: [
        {
          key: 'title'
        },
        {
          key: 'url'
        }]
      }
    }
  }
}
