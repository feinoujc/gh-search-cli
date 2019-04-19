import {cli} from 'cli-ux'

export default {
  open: (...args: Parameters<typeof cli.open>) => cli.open(...args)
}
