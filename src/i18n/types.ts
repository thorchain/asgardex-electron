export type CommonMessages = {
  'common.greeting': string
  'common.copyright': string
}

export type StakeMessages = {
  'stake.title': string
}

export type SwapMessages = {
  'swap.title': string
}

export type WalletMessages = {
  'wallet.title': string
}

export type Messages = CommonMessages & StakeMessages & SwapMessages & WalletMessages

export enum Locale {
  EN = 'en',
  FR = 'fr'
}

export type Translation = {
  locale: Locale
  messages: Messages
}
