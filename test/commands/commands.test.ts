import {expect, test} from '@oclif/test'
import * as sinon from 'sinon'

import AuthFile from '../../src/auth-file'
import _git from '../../src/git-user-name'
import _opener from '../../src/opener'
import _paginator from '../../src/pagination'
import {random} from '../helpers/utils'

describe('ghs commands', () => {
  const sandbox = sinon.sandbox.create()
  beforeEach(() => {
      if (!process.env.TEST_GITHUB_TOKEN) {
        throw new Error('tests require TEST_GITHUB_TOKEN env var')
      }
      sandbox
        .stub(_paginator, 'next')
        .resolves(true)
      sandbox
        .stub(AuthFile.prototype, 'getConfig')
        .resolves({
          token: process.env.TEST_GITHUB_TOKEN || '',
          baseUrl: 'https://api.github.com'
        })
  })

  afterEach(() => {
    sandbox.restore()
  })

  describe('repositories', () => {
    const args = [
      'repo'
    ]

    test
      .stdout()
      .stderr()
      .command([...args, 'oclif'])
      .it('runs repo oclif', ctx => {
        expect(ctx.stdout).to.contain('oclif')
      })

    test
      .stdout()
      .command([...args, '--user', 'feinoujc', 'gh-search-cli'])
      .it('runs repo --user feinoujc', ctx => {
        expect(ctx.stdout).to.contain('feinoujc')
      })

    test
      .stdout()
      .command([...args, '--user', 'oclif'])
      .it('runs repo --user oclif w/paging', ctx => {
        expect(ctx.stdout).to.contain('oclif/command')
        expect(ctx.stdout).to.contain('oclif/oclif')
        expect((_paginator.next as sinon.SinonStub).callCount).to.be.greaterThan(0)
      })

    describe('opener flag', () => {
        let opener: any
        beforeEach(() => {
          opener = sandbox.stub(_opener, 'open').callsFake(() => {})
        })

        test
          .stdout()
          .command([...args, '--user', 'feinoujc', '-o', 'gh-search-cli'])
          .it('opens first result', ctx => {
            expect(ctx.stdout).to.be.equal('')
            expect(opener.callCount).to.be.equal(1)
            const [[url]] = opener.args
            expect(url).to.be.equal('https://github.com/feinoujc/gh-search-cli')

          })
      })

    describe('json flag', () => {
        test
          .stdout()
          .command([...args, '--user', 'feinoujc', '--json', 'gh-search-cli'])
          .it('writes json', ctx => {
            const parsed = JSON.parse(ctx.stdout) as Array<any>
            expect(parsed.length).to.be.equal(1)
          })
      })

    describe('errors', () => {
        test
          .stderr()
          .command([...args, '--user', random(), 'gh-search-cli'])
          .it('writes out api errors', ctx => {
            expect(ctx.stderr).to.match(/resources do not exist/i)
          })

        test
          .stderr()
          .command([
            'repositories',
            '--api-token',
            random(),
            '--api-base-url',
            `ftp://api.${random()}.com`,
            'gh-search-cli'
          ])
          .it('writes out http errors', ctx => {
            expect(ctx.stderr).to.match(/invalid protocol/i)
          })

        test
          .stderr()
          .stdout()
          .command([...args])
          .it('fails on empty command')
      })

    describe('--current-x flags', () => {
        beforeEach(() => {
          sandbox.stub(_git, 'getUser').callsFake(() => 'feinoujc')
        })

        test
          .stdout()
          .command([...args, '--current-user'])
          .it('includes the current git user', ctx => {
            expect(ctx.stdout).to.be.contain('gh-search-cli')
          })
      })
  })

  describe('issues', () => {
   const args = [
      'issues'
    ]

   test
      .stdout()
      .command([...args, 'feinoujc'])
      .it('runs issues feinoujc', ctx => {
        expect(ctx.stdout).to.contain('feinoujc')
      })
  })
  describe('commits', () => {
    const args = [
       'commits'
     ]

    test
       .stdout()
       .command([...args, '--repo', 'oclif/oclif', 'parser'])
       .it('runs commits --repo oclif/oclif parser', ctx => {
         expect(ctx.stdout).to.contain('oclif')
         expect(ctx.stdout).to.contain('https://github.com/oclif/oclif')
       })
   })

  describe('code', () => {
    const args = [
       'code'
     ]

    test
       .stdout()
       .command([...args, '--repo', 'oclif/oclif', 'parser'])
       .it('runs code --repo oclif/oclif parser', ctx => {
          expect(ctx.stdout).to.contain('oclif')
          expect(ctx.stdout).to.contain('https://github.com/oclif/oclif')
       })

    test
       .stdout()
       .command([...args, '--repo', 'oclif/oclif', 'parser', '--text'])
       .it('runs code --repo oclif/oclif parser --text', ctx => {
          expect(ctx.stdout).to.contain('oclif')
          expect(ctx.stdout).to.contain('https://github.com/oclif/oclif')
          expect(ctx.stdout).to.contain('parser')
       })

    test
      .stdout()
      .command([...args, '--org', 'oclif', 'parser', '--text'])
      .it('runs code --org oclif parser --text', ctx => {
        expect(ctx.stdout).to.contain('oclif')
        expect(ctx.stdout).to.contain('https://github.com/oclif/oclif')
        expect(ctx.stdout).to.contain('parser')
      })
   })
})
