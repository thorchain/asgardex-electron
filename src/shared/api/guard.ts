import { assetFromString, Asset, BaseAmount, Chain, isValidAsset } from '@xchainjs/xchain-util'
import * as Util from '@xchainjs/xchain-util'
import BigNumber from 'bignumber.js'
import * as FP from 'fp-ts/lib/function'
import * as IOG from 'io-ts/Guard'

import { Network } from './types'

const nonEmptyStringGuard = FP.pipe(
  IOG.string,
  IOG.refine((s): s is string => s.length > 0)
)

const chainGuard: IOG.Guard<unknown, Chain> = {
  is: (u: unknown): u is Chain => nonEmptyStringGuard.is(u) && Util.isChain(u)
}

export const isChain = (u: unknown): u is Chain => chainGuard.is(u)

export const isNetwork = (u: unknown): u is Network => u === 'mainnet' || u === 'testnet'

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

export const isBaseAmount = (u: unknown): u is BaseAmount =>
  IOG.number.is((u as BaseAmount).decimal) && bnGuard.is((u as BaseAmount).amount())

export const isError = (u: unknown): u is Error => u instanceof Error
