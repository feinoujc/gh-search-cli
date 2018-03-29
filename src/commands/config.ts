import {Command, flags} from '@oclif/command'

import AuthFile from '../auth-file'

export default class Config extends Command {
  static description = 'Configure ghs settings'

  static examples = [
    `$ ghs config --clear
config cleared
`,
  ]

  static flags = {
    clear: flags.boolean({description: 'clears the local config file including the auth token.'}),
    token: flags.string({description: 'sets the github token to use.'}),
    ['base-url']: flags.string({description: 'sets the github base url for github enterprise instances (ex: https://github.company.com/api/v3).'}),
  }

  fail() {
    this._help()
    this.exit(-1)
  }

  async run() {
    const {flags} = this.parse(Config)
    const {
      clear,
      token,
      ['base-url']: baseUrl
    } = flags
    const file = new AuthFile(this.config)
    if (clear) {
      await file.clear()
      this.log('config file cleared')
    } else if (token && baseUrl) {
      await file.setConfig({token, baseUrl})
    } else if (token) {
      const config = await file.getConfig()
      await file.setConfig({baseUrl: 'https://api.github.com', ...config, token})
    } else if (baseUrl) {
      const config = await file.getConfig()
      if (config.token) {
        await file.setConfig({token: config.token, baseUrl})
      } else {
        this.fail()
      }
    } else {
      this.fail()
    }

  }
}
