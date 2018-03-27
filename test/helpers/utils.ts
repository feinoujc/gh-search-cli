import {randomBytes} from 'crypto'

const _apiArgs = [
  '--api-token',
  process.env.TEST_GITHUB_TOKEN || process.env.GITHUB_API_TOKEN || '',
  '--api-base-url',
  'https://api.github.com'
]

export {_apiArgs as apiArgs}

export function random(): string {
  return randomBytes(16).toString('hex')
}
