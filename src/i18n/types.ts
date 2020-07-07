export type CommonMessages = {
  'common.greeting': string
  'common.copyright': string
  'common.stats': string
  'common.network': string
  'common.faqs': string
  'common.type': string
  'common.address': string
  'common.to': string
  'common.amount': string
  'common.coin': string
  'common.memo': string
}

export type PoolsMessages = {
  'pools.title': string
  'pools.available': string
}

export type WalletMessages = {
  'wallet.title': string
  'wallet.nav.assets': string
  'wallet.nav.stakes': string
  'wallet.nav.bonds': string
  'wallet.column.name': string
  'wallet.column.ticker': string
  'wallet.column.balance': string
  'wallet.column.value': string
  'wallet.action.send': string
  'wallet.action.receive': string
}

export type Messages = CommonMessages & PoolsMessages & WalletMessages

export enum Locale {
  EN = 'en',
  FR = 'fr',
  DE = 'de'
}

export type Translation = {
  locale: Locale
  messages: Messages
}
