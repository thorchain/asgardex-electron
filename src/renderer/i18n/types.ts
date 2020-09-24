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
  | 'common.transaction'
  | 'common.fee'
  | 'common.fees'
  | 'common.max'
  | 'common.search'
  | 'common.retry'
  | 'common.add'
  | 'common.swap'
  | 'common.liquidity'

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
  | 'wallet.send.success'
  | 'wallet.errors.balancesFailed'
  | 'wallet.errors.address.empty'
  | 'wallet.errors.address.invalid'
  | 'wallet.errors.amount.shouldBeNumber'
  | 'wallet.errors.amount.shouldBeGreaterThan'
  | 'wallet.errors.amount.shouldBeLessThanBalance'
  | 'wallet.errors.amount.shouldBeLessThanFrozenBalance'
  | 'wallet.errors.amount.shouldBeLessThanBalanceAndFee'
  | 'wallet.errors.fee.notCovered'
  | 'wallet.errors.route.invalidAsset'
  | 'wallet.errors.invalidChain'

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

type SwapMessageKey =
  | 'swap.input'
  | 'swap.balance'
  | 'swap.output'
  | 'swap.drag'
  | 'swap.searchAsset'
  | 'swap.state.pending'
  | 'swap.state.success'
  | 'swap.viewTransaction'
  | 'swap.swapping'

export type SwapMessages = { [key in SwapMessageKey]: string }

type StakeMessageKey =
  | 'stake.totalShare'
  | 'stake.totalEarnings'
  | 'stake.poolShare'
  | 'stake.withdraw'
  | 'stake.advancedMode'
  | 'stake.drag'
  | 'stake.poolDetails.depth'
  | 'stake.poolDetails.24hvol'
  | 'stake.poolDetails.allTimeVal'
  | 'stake.poolDetails.totalSwaps'
  | 'stake.poolDetails.totalStakers'
  | 'stake.poolDetails.returnToDate'
  | 'stake.pool.noStakes'
  | 'stake.wallet.add'
  | 'stake.wallet.connect'

export type StakeMessages = { [key in StakeMessageKey]: string }

export type Messages = CommonMessages & PoolsMessages & WalletMessages & SettingMessages & SwapMessages & StakeMessages

export enum Locale {
  EN = 'en',
  DE = 'de',
  RU = 'ru'
}

export type Translation = {
  locale: Locale
  messages: Messages
}
