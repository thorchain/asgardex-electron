import type Transport from '@ledgerhq/hw-transport'
import { LedgerKey } from '@terra-money/ledger-terra-js'
import { AccAddress, Coin, Coins, CreateTxOptions, Fee, LCDClient, MsgSend, SignatureV2 } from '@terra-money/terra.js'
import { Address, TxHash } from '@xchainjs/xchain-client'
import {
  getAccount,
  getDefaultClientConfig,
  getEstimatedFee,
  getTerraChains,
  getTerraNativeDenom,
  mergeChainIds
} from '@xchainjs/xchain-terra'
import { Asset, assetToString, BaseAmount, delay } from '@xchainjs/xchain-util'
import * as E from 'fp-ts/Either'
import * as FP from 'fp-ts/lib/function'
import * as O from 'fp-ts/lib/Option'

import { LedgerError, LedgerErrorId, Network } from '../../../../shared/api/types'
import { toClientNetwork } from '../../../../shared/utils/client'
import { isError } from '../../../../shared/utils/guard'
import { getDerivationPath } from '../terra/common'

/**
 * Sends Terra tx using Ledger
 */
export const send = async ({
  transport,
  network,
  amount,
  asset,
  feeAsset,
  memo,
  recipient,
  walletIndex
}: {
  transport: Transport
  network: Network
  amount: BaseAmount
  asset: Asset
  feeAsset: Asset
  recipient: Address
  memo?: string
  walletIndex: number
}): Promise<E.Either<LedgerError, TxHash>> => {
  try {
    const clientNetwork = toClientNetwork(network)
    if (!AccAddress.validate(recipient)) {
      return E.left({
        errorId: LedgerErrorId.GET_ADDRESS_FAILED,
        msg: `Invalid recipient address ${recipient}`
      })
    }

    const path = FP.pipe(walletIndex, getDerivationPath, O.toNullable)
    if (!path) {
      return E.left({
        errorId: LedgerErrorId.INVALID_DATA,
        msg: `Deriving 'path' for Ledger Terra failed`
      })
    }

    const assetDenom = getTerraNativeDenom(asset)
    if (!assetDenom)
      throw Error(`Invalid asset ${assetToString(asset)} - Terra native asset are supported to transfer only`)

    const feeDenom = getTerraNativeDenom(feeAsset)
    if (!feeDenom)
      throw Error(`Invalid asset ${assetToString(feeAsset)} - Terra native assets are supported to pay fees only`)

    const ledgerKey: LedgerKey = await LedgerKey.create(transport, walletIndex)
    const sender = ledgerKey.accAddress

    // request chain ids
    const chainIds = await getTerraChains()
    // merge chain ids into default config
    const config = mergeChainIds(chainIds, getDefaultClientConfig())
    const { chainID, cosmosAPIURL } = config[clientNetwork]

    const { amount: feeAmount, gasLimit } = await getEstimatedFee({
      chainId: chainID,
      cosmosAPIURL,
      sender,
      recipient,
      amount,
      asset,
      feeAsset,
      memo,
      network: clientNetwork
    })

    if (!feeAmount || !gasLimit) throw Error(`Missing fee amount and/or gas limit`)

    // delay next request to be more relaxed
    await delay(200)

    const gasFee: Coin.Data = { amount: feeAmount.amount().toFixed(), denom: feeDenom }
    const gasCoins = new Coins([Coin.fromData(gasFee)])
    const fee = new Fee(gasLimit.toNumber(), gasCoins)

    const amountToSend: Coins.Input = {
      [assetDenom]: amount.amount().toFixed()
    }
    const send = new MsgSend(sender, recipient, amountToSend)
    const txOptions: CreateTxOptions = {
      msgs: [send],
      memo,
      feeDenoms: [feeDenom],
      fee
    }

    const lcd = new LCDClient({
      URL: cosmosAPIURL,
      chainID: chainID
    })

    const wallet = lcd.wallet(ledgerKey)
    const { sequence, number: accountNumber } = await getAccount(sender, lcd)

    // delay next request to be more relaxed
    await delay(200)

    const signedTx = await wallet.createAndSignTx({
      ...txOptions,
      sequence,
      accountNumber,
      signMode: SignatureV2.SignMode.SIGN_MODE_LEGACY_AMINO_JSON
    })

    // broadcast (`async` mode)
    const { txhash } = await lcd.tx.broadcastAsync(signedTx)

    if (!txhash) {
      return E.left({
        errorId: LedgerErrorId.INVALID_RESPONSE,
        msg: `Post request to send ${assetToString(asset)} tx failed`
      })
    }

    return E.right(txhash)
  } catch (error) {
    return E.left({
      errorId: LedgerErrorId.SEND_TX_FAILED,
      msg: isError(error) ? error?.message ?? error.toString() : `${error}`
    })
  }
}
