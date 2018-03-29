import {Hook, IConfig} from '@oclif/config'
import {createHash} from 'crypto'
import * as request from 'request-promise-native'
import {StatusCodeError} from 'request-promise-native/errors'

import AuthFile, {AuthConfig} from '../../auth-file'

import questions from './auth-questions'

type Creds = {
  username: string,
  password: string,
  otp: string
}

async function prompt(config: IConfig): Promise<AuthConfig> {
  let baseUrl = 'https://api.github.com'
  const enterprise = await questions.ghe()
  if (enterprise) {
    baseUrl = await questions.apiUrl()
  }
  const req = request.defaults({
    json: true,
    baseUrl,
    headers: {
      'User-Agent': config.userAgent
    }
  })
  const auth = async (creds: Partial<Creds> = {}): Promise<AuthConfig> => {
    let username = creds.username
    let password = creds.password
    if (!username) {
      username = await questions.username()
    }
    if (!password) {
      password = await questions.password()
    }
    try {
      const fingerprint = createHash('md5').update(`${config.userAgent}|${Date.now()}`).digest('hex')
      const {token} = await req.post({
        url: '/authorizations',
        headers: {
          'X-GitHub-OTP': creds.otp
        },
        auth: {username, password},
        body: {
          scopes: [],
          note: config.name,
          fingerprint
        }
      })
      return {token, baseUrl}
    } catch (err) {
      const sce = err as StatusCodeError
      if (sce) {
        if (sce.statusCode === 401
          && sce.response.headers['x-github-otp']
          && sce.response.headers['x-github-otp']!.includes('required')) {
            const otp = await questions.otp()
            return auth({username, password, otp})
        } else if (sce.statusCode === 401) {
          process.stderr.write('Bad login. Try again\n')
          return auth({})
        } else {
          throw err
        }
      }
      throw err
    }
  }
  return auth()
}

const hook: Hook<'init'> = async function ({config, id}) {
  const blacklist = ['config', 'help', '--help']
  if (blacklist.includes(id!)) return

  let token = ''
  let baseUrl = ''
  const file = new AuthFile(config)
  const auth = await file.getConfig()
  if (auth && auth.token && auth.baseUrl) {
    token = auth.token
    baseUrl = auth.baseUrl
  }

  if (!token || !baseUrl) {
    await file.setConfig(await prompt(config))
  }
}

export default hook
