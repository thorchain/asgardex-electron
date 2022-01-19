import { Locale } from '../../shared/i18n/types'

export type CommonMessageKey =
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
  | 'common.cancel'
  | 'common.reject'
  | 'common.next'
  | 'common.finish'
  | 'common.copy'
  | 'common.loading'
  | 'common.error'
  | 'common.success'
  | 'common.change'
  | 'common.wallet'
  | 'common.history'
  | 'common.pool'
  | 'common.pools'
  | 'common.asset'
  | 'common.assets'
  | 'common.price'
  | 'common.price.rune'
  | 'common.transaction'
  | 'common.viewTransaction'
  | 'common.fee'
  | 'common.fees'
  | 'common.fee.estimated'
  | 'common.fees.estimated'
  | 'common.max'
  | 'common.min'
  | 'common.search'
  | 'common.searchAsset'
  | 'common.retry'
  | 'common.reload'
  | 'common.add'
  | 'common.swap'
  | 'common.liquidity'
  | 'common.withdraw'
  | 'common.approve'
  | 'common.approve.checking'
  | 'common.approve.error'
  | 'common.step'
  | 'common.done'
  | 'common.address.self'
  | 'common.thorAddress'
  | 'common.tx.healthCheck'
  | 'common.tx.sending'
  | 'common.tx.sendingAsset'
  | 'common.tx.checkResult'
  | 'common.tx.view'
  | 'common.modal.confirmTitle'
  | 'common.value'
  | 'common.manage'
  | 'common.detail'
  | 'common.filter'
  | 'common.all'
  | 'common.analytics'
  | 'common.asset.base'
  | 'common.tx.type.swap'
  | 'common.tx.type.deposit'
  | 'common.tx.type.refund'
  | 'common.tx.type.donate'
  | 'common.tx.type.deposit'
  | 'common.tx.type.withdraw'
  | 'common.tx.type.upgrade'
  | 'common.time.week'
  | 'common.time.all'
  | 'common.theme.light'
  | 'common.theme.dark'
  | 'common.volume24'
  | 'common.volume24.description'
  | 'common.informationMore'
  | 'common.balance'
  | 'common.balance.loading'

export type CommonMessages = {
  [key in CommonMessageKey]: string
}

type UpdateMessagesKeys =
  | 'update.description'
  | 'update.link'
  | 'update.checkFailed'
  | 'update.checkForUpdates'
  | 'update.noUpdate'

export type UpdateMessages = { [key in UpdateMessagesKeys]: string }

type RoutesMessageKey = 'routes.invalid.asset'

export type RoutesMessages = { [key in RoutesMessageKey]: string }

type PoolsMessageKey =
  | 'pools.depth'
  | 'pools.24hvol'
  | 'pools.avgsize'
  | 'pools.avgfee'
  | 'pools.blocksleft'
  | 'pools.trades'
  | 'pools.pending'
  | 'pools.available'

export type PoolsMessages = { [key in PoolsMessageKey]: string }

type WalletMessageKey =
  | 'wallet.main.title'
  | 'wallet.nav.deposits'
  | 'wallet.nav.bonds'
  | 'wallet.nav.poolshares'
  | 'wallet.column.name'
  | 'wallet.column.ticker'
  | 'wallet.action.send'
  | 'wallet.action.upgrade'
  | 'wallet.action.receive'
  | 'wallet.action.forget'
  | 'wallet.action.unlock'
  | 'wallet.action.connect'
  | 'wallet.action.import'
  | 'wallet.action.create'
  | 'wallet.action.deposit'
  | 'wallet.connect.instruction'
  | 'wallet.unlock.instruction'
  | 'wallet.lock.label'
  | 'wallet.unlock.label'
  | 'wallet.unlock.title'
  | 'wallet.unlock.phrase'
  | 'wallet.unlock.error'
  | 'wallet.imports.label'
  | 'wallet.imports.keystore.select'
  | 'wallet.imports.keystore.title'
  | 'wallet.imports.phrase.title'
  | 'wallet.imports.wallet'
  | 'wallet.imports.enterphrase'
  | 'wallet.imports.error.instance'
  | 'wallet.imports.error.keystore.load'
  | 'wallet.imports.error.keystore.import'
  | 'wallet.phrase.error.valueRequired'
  | 'wallet.phrase.error.invalid'
  | 'wallet.phrase.error.import'
  | 'wallet.txs.history'
  | 'wallet.empty.phrase.import'
  | 'wallet.empty.phrase.create'
  | 'wallet.create.title'
  | 'wallet.create.creating'
  | 'wallet.create.error'
  | 'wallet.create.error.phrase'
  | 'wallet.create.copy.phrase'
  | 'wallet.create.words.click'
  | 'wallet.create.enter.phrase'
  | 'wallet.receive.address.error'
  | 'wallet.receive.address.errorQR'
  | 'wallet.remove.label'
  | 'wallet.remove.label.title'
  | 'wallet.remove.label.description'
  | 'wallet.send.success'
  | 'wallet.send.fastest'
  | 'wallet.send.fast'
  | 'wallet.send.average'
  | 'wallet.send.max.doge'
  | 'wallet.password.confirmation.title'
  | 'wallet.password.confirmation.description'
  | 'wallet.password.confirmation.pending'
  | 'wallet.password.confirmation.error'
  | 'wallet.password.repeat'
  | 'wallet.password.mismatch'
  | 'wallet.ledger.confirm'
  | 'wallet.errors.balancesFailed'
  | 'wallet.errors.asset.notExist'
  | 'wallet.errors.address.empty'
  | 'wallet.errors.address.invalid'
  | 'wallet.errors.address.couldNotFind'
  | 'wallet.errors.amount.shouldBeNumber'
  | 'wallet.errors.amount.shouldBeGreaterThan'
  | 'wallet.errors.amount.shouldBeLessThanBalance'
  | 'wallet.errors.amount.shouldBeLessThanBalanceAndFee'
  | 'wallet.errors.fee.notCovered'
  | 'wallet.errors.invalidChain'
  | 'wallet.send.error'
  | 'wallet.upgrade.pending'
  | 'wallet.upgrade.success'
  | 'wallet.upgrade.error'
  | 'wallet.upgrade.error.data'
  | 'wallet.upgrade.error.loadPoolAddress'
  | 'wallet.upgrade.feeError'
  | 'wallet.validations.lessThen'
  | 'wallet.validations.graterThen'
  | 'wallet.validations.shouldNotBeEmpty'
  | 'wallet.ledger.verifyAddress.modal.title'
  | 'wallet.ledger.verifyAddress.modal.description'

export type WalletMessages = { [key in WalletMessageKey]: string }

type BondsMessageKey =
  | 'bonds.node'
  | 'bonds.bond'
  | 'bonds.award'
  | 'bonds.status'
  | 'bonds.status.active'
  | 'bonds.status.standby'
  | 'bonds.status.disabled'
  | 'bonds.status.unknown'
  | 'bonds.node.add'
  | 'bonds.node.enterMessage'
  | 'bonds.node.removeMessage'
  | 'bonds.validations.nodeAlreadyAdded'

export type BondsMessages = { [key in BondsMessageKey]: string }

type PoolSharesMessageKey = 'poolshares.ownership'

export type PoolSharesMessage = { [key in PoolSharesMessageKey]: string }

type LedgerMessageKey =
  | 'ledger.title'
  | 'ledger.title.sign'
  | 'ledger.needsconnected'
  | 'ledger.add.device'
  | 'ledger.error.nodevice'
  | 'ledger.error.inuse'
  | 'ledger.error.appnotopened'
  | 'ledger.error.noapp'
  | 'ledger.error.getaddressfailed'
  | 'ledger.error.signfailed'
  | 'ledger.error.sendfailed'
  | 'ledger.error.depositfailed'
  | 'ledger.error.invalidpubkey'
  | 'ledger.error.invaliddata'
  | 'ledger.error.rejected'
  | 'ledger.error.timeout'
  | 'ledger.error.invalidresponse'
  | 'ledger.error.notimplemented'
  | 'ledger.error.denied'
  | 'ledger.error.unknown'
  | 'ledger.notsupported'
  | 'ledger.notaddedorzerobalances'
  | 'ledger.deposit.oneside'

export type LedgerMessages = { [key in LedgerMessageKey]: string }

type SettingMessageKey =
  | 'setting.title'
  | 'setting.app.title'
  | 'setting.wallet.management'
  | 'setting.client'
  | 'setting.account.management'
  | 'setting.export'
  | 'setting.lock'
  | 'setting.view.phrase'
  | 'setting.version'
  | 'setting.language'
  | 'setting.notconnected'
  | 'setting.connected'
  | 'setting.add.device'
  | 'setting.wallet.index'
  | 'setting.wallet.index.info'

export type SettingMessages = { [key in SettingMessageKey]: string }

type MidgardMessageKey = 'midgard.error.byzantine.title' | 'midgard.error.byzantine.description'

export type MidgardMessages = { [key in MidgardMessageKey]: string }

type SwapMessageKey =
  | 'swap.input'
  | 'swap.output'
  | 'swap.recipient'
  | 'swap.slip.title'
  | 'swap.slip.tolerance'
  | 'swap.slip.tolerance.info'
  | 'swap.state.pending'
  | 'swap.state.success'
  | 'swap.state.error'
  | 'swap.info.max.fee'
  | 'swap.errors.asset.missingSourceAsset'
  | 'swap.errors.asset.missingTargetAsset'
  | 'swap.errors.amount.balanceShouldCoverChainFee'
  | 'swap.errors.amount.outputShouldCoverChainFee'
  | 'swap.note.lockedWallet'
  | 'swap.note.nowallet'
  | 'swap.ledger.sign'

export type SwapMessages = { [key in SwapMessageKey]: string }

type DepositMessageKey =
  | 'deposit.interact.title'
  | 'deposit.interact.subtitle'
  | 'deposit.interact.actions'
  | 'deposit.interact.actions.bond'
  | 'deposit.interact.actions.unbond'
  | 'deposit.interact.actions.leave'
  | 'deposit.interact.actions.custom'
  | 'deposit.share.title'
  | 'deposit.share.units'
  | 'deposit.share.poolshare'
  | 'deposit.share.total'
  | 'deposit.redemption.title'
  | 'deposit.totalEarnings'
  | 'deposit.add.sym'
  | 'deposit.add.asym'
  | 'deposit.add.state.sending'
  | 'deposit.add.state.checkResults'
  | 'deposit.add.state.pending'
  | 'deposit.add.state.success'
  | 'deposit.add.state.error'
  | 'deposit.add.error.chainFeeNotCovered'
  | 'deposit.add.error.nobalances'
  | 'deposit.add.error.nobalance1'
  | 'deposit.add.error.nobalance2'
  | 'deposit.add.pendingAssets.title'
  | 'deposit.add.pendingAssets.description'
  | 'deposit.add.pendingAssets.recoveryTitle'
  | 'deposit.add.pendingAssets.recoveryDescription'
  | 'deposit.add.asymAssets.title'
  | 'deposit.add.asymAssets.description'
  | 'deposit.add.asymAssets.recoveryTitle'
  | 'deposit.add.asymAssets.recoveryDescription'
  | 'deposit.add.assetMissmatch.title'
  | 'deposit.add.assetMissmatch.description'
  | 'deposit.bond.state.error'
  | 'deposit.unbond.state.error'
  | 'deposit.leave.state.error'
  | 'deposit.advancedMode'
  | 'deposit.poolDetails.depth'
  | 'deposit.poolDetails.24hvol'
  | 'deposit.poolDetails.allTimeVal'
  | 'deposit.poolDetails.totalSwaps'
  | 'deposit.poolDetails.totalUsers'
  | 'deposit.poolDetails.volumeTotal'
  | 'deposit.poolDetails.earnings'
  | 'deposit.poolDetails.ilpPaid'
  | 'deposit.poolDetails.totalTx'
  | 'deposit.poolDetails.totalFees'
  | 'deposit.poolDetails.members'
  | 'deposit.poolDetails.apy'
  | 'deposit.pool.noShares'
  | 'deposit.wallet.add'
  | 'deposit.wallet.connect'
  | 'deposit.withdraw.sym'
  | 'deposit.withdraw.asym'
  | 'deposit.withdraw.sym.title'
  | 'deposit.withdraw.asym.title'
  | 'deposit.withdraw.pending'
  | 'deposit.withdraw.success'
  | 'deposit.withdraw.error'
  | 'deposit.withdraw.choseText'
  | 'deposit.withdraw.fees'
  | 'deposit.withdraw.feeNote'
  | 'deposit.withdraw.error.feeNotCovered'
  | 'deposit.withdraw.ledger.sign'
  | 'deposit.ledger.sign'

export type DepositMessages = { [key in DepositMessageKey]: string }

export type HaltMessageKey =
  | 'halt.thorchain'
  | 'halt.trading'
  | 'halt.chain'
  | 'halt.chains'
  | 'halt.chain.trading'
  | 'halt.chain.upgrade'
  | 'halt.chain.pause'
  | 'halt.chain.pauseall'

export type HaltMessages = { [key in HaltMessageKey]: string }

export type Messages = CommonMessages &
  RoutesMessages &
  PoolsMessages &
  WalletMessages &
  SettingMessages &
  SwapMessages &
  DepositMessages &
  LedgerMessages &
  BondsMessages &
  PoolSharesMessage &
  UpdateMessages &
  HaltMessages

export type Translation = {
  locale: Locale
  messages: Messages
}
