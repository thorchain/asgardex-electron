import { envOrDefault } from '../renderer/helpers/envHelper'

export const IS_PRODUCTION = envOrDefault(process.env.NODE_ENV, '') === 'production'

export enum ExternalUrl {
  WEBSITE = 'https://thorchain.org',
  DOCS = 'https://docs.thorchain.org/',
  TELEGRAM = 'https://t.me/thorchain_org',
  GITHUB = 'https://github.com/thorchain',
  GITHUB_REPO = `https://github.com/thorchain/asgardex-electron`,
  TWITTER = 'https://twitter.com/thorchain_org'
}
