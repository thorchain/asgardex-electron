import { FeeOption } from '@xchainjs/xchain-client'
import { assetFromString, Asset, BaseAmount, Chain, isValidAsset } from '@xchainjs/xchain-util'
import * as Util from '@xchainjs/xchain-util'
import BigNumber from 'bignumber.js'
import * as FP from 'fp-ts/lib/function'
import * as IOG from 'io-ts/Guard'

import { Network } from '../api/types'
import { WalletType } from '../wallet/types'

const nonEmptyStringGuard = FP.pipe(
  IOG.string,
  IOG.refine((s): s is string => s.length > 0)
)

const chainGuard: IOG.Guard<unknown, Chain> = {
  is: (u: unknown): u is Chain => nonEmptyStringGuard.is(u) && Util.isChain(u)
}

export const isChain = (u: unknown): u is Chain => chainGuard.is(u)

export const isNetwork = (u: unknown): u is Network => u === 'mainnet' || u === 'stagenet' || u === 'testnet'

export const isFeeOption = (u: unknown): u is FeeOption =>
  u === FeeOption.Average || u === FeeOption.Fast || u === FeeOption.Fastest

export const isWalletType = (u: unknown): u is WalletType => u === 'keystore' || u === 'ledger'
export const isLedgerWallet = (walletType: WalletType): boolean => walletType === 'ledger'
export const isKeystoreWallet = (walletType: WalletType): boolean => walletType === 'keystore'

const assetGuard = IOG.struct({ symbol: nonEmptyStringGuard, ticker: nonEmptyStringGuard, chain: chainGuard })

export const isAsset = (u: unknown): u is Asset => {
  if (assetGuard.is(u)) return true

  if (typeof u === 'string') {
    const asset = assetFromString(u)
    if (asset) return isValidAsset(asset)
  }
  return false
}

const bnGuard: IOG.Guard<unknown, BigNumber> = {
  is: (u: unknown): u is BigNumber => BigNumber.isBigNumber(u)
}

const baseAmountGuard: IOG.Guard<unknown, BaseAmount> = {
  is: (u: unknown): u is BaseAmount => {
    if (u === null && typeof u !== 'object') return false

    return IOG.number.is((u as BaseAmount)?.decimal) && bnGuard.is((u as BaseAmount)?.amount())
  }
}

export const isBaseAmount = (u: unknown): u is BaseAmount => baseAmountGuard.is(u)

export const isError = (u: unknown): u is Error => u instanceof Error
