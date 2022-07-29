import { Keystore } from '@xchainjs/xchain-crypto'
import { assetToString, assetFromString, Asset, BaseAmount, baseAmount } from '@xchainjs/xchain-util'
import * as E from 'fp-ts/lib/Either'
import * as FP from 'fp-ts/lib/function'
import * as t from 'io-ts'
import * as IOD from 'io-ts/Decoder'
import * as IOG from 'io-ts/Guard'

import { isAsset, isBaseAmount, isChain, isFeeOption, isNetwork } from '../utils/guard'

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

export const assetListIO = t.array(assetIO)

export type BaseAmountEncoded = { amount: string; decimal: number }

export const isBaseAmountEncoded = (u: unknown): u is BaseAmountEncoded =>
  IOG.struct({ amount: IOG.string, decimal: IOG.number }).is(u)

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

export const feeOptionIO = new t.Type(
  'FeeOptionIO',
  isFeeOption,
  (u, c) => {
    if (isFeeOption(u)) return t.success(u)
    return t.failure(u, c, `Can't decode FeeOption from ${u}`)
  },
  t.identity
)

export const ipcLedgerSendTxParamsIO = t.type({
  chain: chainIO,
  network: networkIO,
  sender: t.union([t.string, t.undefined]),
  recipient: t.string,
  asset: t.union([assetIO, t.undefined]),
  feeAsset: t.union([assetIO, t.undefined]),
  amount: baseAmountIO,
  memo: t.union([t.string, t.undefined]),
  walletIndex: t.number,
  feeRate: t.number,
  feeOption: t.union([feeOptionIO, t.undefined]),
  feeAmount: t.union([baseAmountIO, t.undefined])
})

export type IPCLedgerSendTxParams = t.TypeOf<typeof ipcLedgerSendTxParamsIO>

export const ipcLedgerDepositTxParamsIO = t.type({
  chain: chainIO,
  network: networkIO,
  asset: t.union([assetIO, t.undefined]),
  router: t.union([t.string, t.undefined]),
  recipient: t.union([t.string, t.undefined]),
  amount: baseAmountIO,
  memo: t.string,
  walletIndex: t.number,
  feeOption: t.union([feeOptionIO, t.undefined])
})

export type IPCLedgerDepositTxParams = t.TypeOf<typeof ipcLedgerDepositTxParamsIO>

export const ipcLedgerApproveERC20TokenParamsIO = t.type({
  network: networkIO,
  contractAddress: t.string,
  spenderAddress: t.string,
  walletIndex: t.number
})

export type IPCLedgerApproveERC20TokenParams = t.TypeOf<typeof ipcLedgerApproveERC20TokenParamsIO>

export const poolsWatchListIO = assetListIO

export type PoolsWatchList = t.TypeOf<typeof poolsWatchListIO>

export const poolsWatchListsIO = t.type({
  testnet: poolsWatchListIO,
  stagenet: poolsWatchListIO,
  mainnet: poolsWatchListIO
})

export const storageVersionIO = t.string

export type StorageVersion = t.TypeOf<typeof storageVersionIO>

export type PoolsWatchLists = t.TypeOf<typeof poolsWatchListsIO>

export const poolsStorageIO = t.type({
  watchlists: poolsWatchListsIO,
  version: storageVersionIO
})

// Note: We use Encoded type for storage
export type PoolsStorageEncoded = ReturnType<typeof poolsStorageIO.encode>

/**
 * Guard to check `Keystore`
 */
export const isKeystore = (u: unknown): u is Keystore =>
  IOG.struct({
    crypto: IOG.struct({
      cipher: IOG.string,
      ciphertext: IOG.string,
      cipherparams: IOG.struct({
        iv: IOG.string
      }),
      kdf: IOG.string,
      kdfparams: IOG.struct({
        prf: IOG.string,
        dklen: IOG.number,
        salt: IOG.string,
        c: IOG.number
      }),
      mac: IOG.string
    }),
    id: IOG.string,
    version: IOG.number,
    meta: IOG.string
  }).is(u)

/**
 * IO interface of `Keystore`
 *
 * @see https://github.com/xchainjs/xchainjs-lib/blob/master/packages/xchain-crypto/src/crypto.ts#L17-L39
 */
export const keystoreIO = new t.Type(
  'KeystoreIO',
  isKeystore,
  (u, c) => {
    if (isKeystore(u)) return t.success(u)
    return t.failure(u, c, `Can't decode Keystore from ${u}`)
  },
  t.identity
)

/**
 * `Keystore` type
 * As same as `Keystore
 * @see https://github.com/xchainjs/xchainjs-lib/blob/master/packages/xchain-crypto/src/crypto.ts#L17-L39
 */
// export type Keystore = ReturnType<typeof keystoreIO.encode>

export const ipcKeystoreAccountIO = t.type({
  id: t.number,
  name: t.string,
  selected: t.boolean,
  keystore: keystoreIO
})

/**
 * Keystore Account
 * Created by users by importing or creating keystores in `Wallet` section
 */
export type KeystoreAccount = ReturnType<typeof ipcKeystoreAccountIO.encode>

export const ipcKeystoreAccountsIO = t.array(ipcKeystoreAccountIO)

export type IPCKeystoreAccounts = t.TypeOf<typeof ipcKeystoreAccountsIO>

export type KeystoreAccounts = ReturnType<typeof ipcKeystoreAccountsIO.encode>
