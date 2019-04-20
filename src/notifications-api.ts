import * as headerParser from 'parse-link-header'
import * as request from 'request-promise-native'
import {StatusCodeError} from 'request-promise-native/errors'

export interface ApiOptions {
  apiToken: string
  baseUrl: string
  userAgent: string
}

export interface ApiResponse {
  items: Array<any>
  links: {
    [rel: string]: () => Promise<ApiResponse>;
  }
}

export interface ApiParams {
  all?: boolean,
  participating?: boolean,
  since?: string,
  before?: string,
  owner?: string,
  repo?: string
}

const baseOpts = {
  json: true,
  resolveWithFullResponse: true,
  headers: {
    Accept: 'application/json'
  },
}
const req = request.defaults({...baseOpts})

async function fetchAndAssignSubjectHtmlUrl(subject: any, opts: ApiOptions): Promise<void> {
  try {
    const {body} = await req({
      auth: {
        user: '',
        password: opts.apiToken
      },
      headers: {
        'User-Agent': opts.userAgent,
        Accept: baseOpts.headers.Accept
      },
      url: subject.latest_comment_url
    })
    Object.assign(subject, {latest_comment_html_url: body.html_url})
  } catch (error) {
    // can fail on permissions issues
    if (error instanceof StatusCodeError && error.statusCode === 404) {
      Object.assign(subject, {latest_comment_html_url: null})
      return
    }
    throw error
  }
}

async function parseResponse(resp: any, opts: ApiOptions): Promise<ApiResponse> {
  async function linkContinuation(url: string): Promise<ApiResponse> {
    const res = await req({
      auth: {
        user: '',
        password: opts.apiToken
      },
      headers: {
        'User-Agent': opts.userAgent,
        Accept: baseOpts.headers.Accept
      },
      url
    })
    return parseResponse(res, opts)
  }
  const subjects = resp.body
    .map((notification: any) => notification.subject)
    .filter((subject: any) => subject.latest_comment_url)

  await Promise.all(subjects.map((subject: any) => fetchAndAssignSubjectHtmlUrl(subject, opts)))

  const result = {items: resp.body, links: {}}

  if (resp.headers.link) {
    const links = headerParser(resp.headers.link)!
    result.links = Object.entries(links).reduce(
      (link, [k, v]) => ({
        ...link,
        [k]: () => linkContinuation(v.url)
      }),
      {}
    )
  }
  return result
}

export default async function getNotifications(
  params: ApiParams,
  opts: ApiOptions
): Promise<ApiResponse> {
  const {owner, repo, ...qs} = params
  const url = (owner && repo) ? `/repos/${owner}/${repo}/notifications` : '/notifications'
  const options = {
    auth: {
      user: '',
      password: opts.apiToken
    },
    headers: {
      'User-Agent': opts.userAgent,
      Accept: baseOpts.headers.Accept
    },
    baseUrl: opts.baseUrl,
    url,
    qs
  }
  const resp = await req(options)
  return parseResponse(resp, opts)
}
