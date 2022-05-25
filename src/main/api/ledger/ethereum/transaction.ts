import EthApp from '@ledgerhq/hw-app-eth'
import type Transport from '@ledgerhq/hw-transport'
import { Address, FeeOption, TxHash } from '@xchainjs/xchain-client'
import * as ETH from '@xchainjs/xchain-ethereum'
import { Asset, BaseAmount } from '@xchainjs/xchain-util'
import * as E from 'fp-ts/Either'

import { getEtherscanApiKey } from '../../../../shared/api/etherscan'
import { getEthplorerCreds } from '../../../../shared/api/ethplorer'
import { getInfuraCreds } from '../../../../shared/api/infura'
import { LedgerError, LedgerErrorId, Network } from '../../../../shared/api/types'
import { toClientNetwork } from '../../../../shared/utils/client'
import { isError } from '../../../../shared/utils/guard'
import { getDerivationPath } from './common'
import { LedgerSigner } from './LedgerSigner'

/**
 * Sends ETH tx using Ledger
 */
export const send = async ({
  asset,
  transport,
  network,
  amount,
  memo,
  recipient,
  feeOption,
  walletIndex
}: {
  asset: Asset
  transport: Transport
  amount: BaseAmount
  network: Network
  recipient: Address
  memo?: string
  feeOption: FeeOption
  walletIndex: number
}): Promise<E.Either<LedgerError, TxHash>> => {
  try {
    const { ethplorerApiKey, ethplorerUrl } = getEthplorerCreds()

    const infuraCreds = getInfuraCreds()
    const clientNetwork = toClientNetwork(network)
    const etherscanApiKey = getEtherscanApiKey()

    const client = new ETH.Client({
      network: clientNetwork,
      etherscanApiKey,
      ethplorerApiKey,
      ethplorerUrl,
      infuraCreds
    })

    const app = new EthApp(transport)
    const path = getDerivationPath(walletIndex)
    const provider = client.getProvider()
    const signer = new LedgerSigner({ provider, path, app })

    const txHash = await client.transfer({
      signer,
      asset,
      memo,
      amount,
      recipient,
      feeOptionKey: feeOption
    })

    if (!txHash) {
      return E.left({
        errorId: LedgerErrorId.INVALID_RESPONSE,
        msg: `Could not get transaction hash to send ${asset.symbol} transaction`
      })
    }

    return E.right(txHash)
  } catch (error) {
    return E.left({
      errorId: LedgerErrorId.SEND_TX_FAILED,
      msg: isError(error) ? error?.message ?? error.toString() : `${error}`
    })
  }
}
