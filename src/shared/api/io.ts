import { assetToString, assetFromString, Asset, BaseAmount, baseAmount } from '@xchainjs/xchain-util'
import * as E from 'fp-ts/lib/Either'
import * as FP from 'fp-ts/lib/function'
import * as t from 'io-ts'
import * as IOD from 'io-ts/Decoder'
import * as IOG from 'io-ts/Guard'

import { isAsset, isBaseAmount, isChain, isNetwork } from './guard'

const assetDecoder: IOD.Decoder<unknown, Asset> = FP.pipe(
  IOD.string,
  IOD.parse((assetString) =>
    FP.pipe(
      assetString,
      assetFromString,
      E.fromNullable(new Error(`Can't decode asset from ${assetString}`)),
      E.fold((e) => IOD.failure(assetString, e.message), IOD.success)
    )
  )
)

/**
 * Custom `Asset` IO type
 * to encode / decode `Asset`
 */
export const assetIO = new t.Type(
  'AssetIO',
  isAsset,
  (input, context) =>
    FP.pipe(
      assetDecoder.decode(input),
      E.fold(() => t.failure(input, context), t.success)
    ),
  assetToString
)

export type BaseAmountEncoded = { amount: string; decimal: number }

const isBaseAmountEncoded = (u: unknown): u is BaseAmountEncoded =>
  IOG.string.is((u as BaseAmountEncoded).amount) && IOG.number.is((u as BaseAmountEncoded).decimal)

export const baseAmountIO = new t.Type(
  'BaseAmountIO',
  isBaseAmount,
  (u, c) => {
    if (isBaseAmountEncoded(u)) {
      const a = baseAmount(u.amount, u.decimal)
      return t.success(a)
    }

    return t.failure(u, c, `Can't decode BaseAmount from ${u}`)
  },
  (a: BaseAmount): BaseAmountEncoded => ({ amount: a.amount().toString(), decimal: a.decimal })
)

export const chainIO = new t.Type(
  'ChainIO',
  isChain,
  (u, c) => {
    if (isChain(u)) return t.success(u)
    return t.failure(u, c, `Can't decode Chain from ${u}`)
  },
  t.identity
)

export const networkIO = new t.Type(
  'NetworkIO',
  isNetwork,
  (u, c) => {
    if (isNetwork(u)) return t.success(u)
    return t.failure(u, c, `Can't decode Network from ${u}`)
  },
  t.identity
)

export const ipcLedgerSendTxParamsIO = t.type({
  chain: chainIO,
  network: networkIO,
  asset: t.union([assetIO, t.undefined]),
  amount: baseAmountIO,
  recipient: t.string,
  memo: t.union([t.string, t.undefined])
})

export type IPCLedgerSendTxParams = t.TypeOf<typeof ipcLedgerSendTxParamsIO>
