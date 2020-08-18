type CommonMessageKey =
  | 'common.greeting'
  | 'common.copyright'
  | 'common.stats'
  | 'common.network'
  | 'common.faqs'
  | 'common.type'
  | 'common.address'
  | 'common.to'
  | 'common.from'
  | 'common.amount'
  | 'common.coin'
  | 'common.password'
  | 'common.memo'
  | 'common.refresh'
  | 'common.date'
  | 'common.remove'
  | 'common.back'
  | 'common.keystore'
  | 'common.phrase'
  | 'common.submit'
  | 'common.confirm'
  | 'common.next'
  | 'common.finish'
  | 'common.copy'
  | 'common.loading'
  | 'common.error'
  | 'common.success'
  | 'common.change'
  | 'common.wallet'
  | 'common.pool'
  | 'common.pools'
  | 'common.asset'
  | 'common.assets'
  | 'common.price'

export type CommonMessages = {
  [key in CommonMessageKey]: string
}

type PoolsMessageKey =
  | 'pools.depth'
  | 'pools.24hvol'
  | 'pools.avgsize'
  | 'pools.avgslip'
  | 'pools.blocksleft'
  | 'pools.trades'
  | 'pools.pending'
  | 'pools.available'

export type PoolsMessages = { [key in PoolsMessageKey]: string }

type WalletMessageKey =
  | 'wallet.nav.stakes'
  | 'wallet.nav.bonds'
  | 'wallet.column.name'
  | 'wallet.column.ticker'
  | 'wallet.column.balance'
  | 'wallet.column.value'
  | 'wallet.action.send'
  | 'wallet.action.receive'
  | 'wallet.action.freeze'
  | 'wallet.action.unfreeze'
  | 'wallet.action.remove'
  | 'wallet.action.unlock'
  | 'wallet.unlock.title'
  | 'wallet.unlock.phrase'
  | 'wallet.unlock.error'
  | 'wallet.imports.phrase'
  | 'wallet.imports.wallet'
  | 'wallet.imports.enterphrase'
  | 'wallet.txs.last90days'
  | 'wallet.empty.action.import'
  | 'wallet.empty.action.create'
  | 'wallet.empty.phrase.import'
  | 'wallet.empty.phrase.create'
  | 'wallet.create.title'
  | 'wallet.create.creating'
  | 'wallet.create.error'
  | 'wallet.create.password.repeat'
  | 'wallet.create.password.mismatch'
  | 'wallet.create.copy.phrase'
  | 'wallet.create.words.click'
  | 'wallet.create.enter.phrase'
  | 'wallet.receive.address.error'
  | 'wallet.receive.address.errorQR'
  | 'wallet.send.errors.balancesFailed'
  | 'wallet.send.errors.address.length'
  | 'wallet.send.errors.amount.shouldBeNumber'
  | 'wallet.send.errors.amount.shouldBePositive'
  | 'wallet.send.errors.amount.shouldBeLessThatBalance'

export type WalletMessages = { [key in WalletMessageKey]: string }

type SettingMessageKey =
  | 'setting.title'
  | 'setting.wallet.management'
  | 'setting.client'
  | 'setting.account.management'
  | 'setting.export'
  | 'setting.lock'
  | 'setting.view.phrase'
  | 'setting.midgard'
  | 'setting.version'
  | 'setting.notconnected'

export type SettingMessages = { [key in SettingMessageKey]: string }

type SwapMessageKey = 'swap.swapping' | 'swap.input' | 'swap.balance' | 'swap.output' | 'swap.drag'

export type SwapMessages = { [key in SwapMessageKey]: string }

export type Messages = CommonMessages & PoolsMessages & WalletMessages & SettingMessages & SwapMessages

export enum Locale {
  EN = 'en',
  DE = 'de',
  RU = 'ru'
}

export type Translation = {
  locale: Locale
  messages: Messages
}
