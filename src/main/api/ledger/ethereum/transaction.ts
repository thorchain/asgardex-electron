import EthApp from '@ledgerhq/hw-app-eth'
import type Transport from '@ledgerhq/hw-transport'
import { FeeOption, TxHash } from '@xchainjs/xchain-client'
import * as ETH from '@xchainjs/xchain-ethereum'
import { Address, Asset, assetToString, BaseAmount } from '@xchainjs/xchain-util'
import BigNumber from 'bignumber.js'
import * as E from 'fp-ts/Either'

import { getEtherscanApiKey } from '../../../../shared/api/etherscan'
import { getEthplorerCreds } from '../../../../shared/api/ethplorer'
import { getInfuraCreds } from '../../../../shared/api/infura'
import { LedgerError, LedgerErrorId, Network } from '../../../../shared/api/types'
import { ROUTER_ABI } from '../../../../shared/ethereum/abi'
import { DEPOSIT_EXPIRATION_OFFSET, FEE_BOUNDS } from '../../../../shared/ethereum/const'
import { getDerivationPath } from '../../../../shared/ethereum/ledger'
import { getBlocktime } from '../../../../shared/ethereum/provider'
import { EthHDMode } from '../../../../shared/ethereum/types'
import { toClientNetwork } from '../../../../shared/utils/client'
import { isError } from '../../../../shared/utils/guard'
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
  walletIndex,
  ethHDMode
}: {
  asset: Asset
  transport: Transport
  amount: BaseAmount
  network: Network
  recipient: Address
  memo?: string
  feeOption: FeeOption
  walletIndex: number
  ethHDMode: EthHDMode
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
      infuraCreds,
      feeBounds: FEE_BOUNDS[clientNetwork]
    })

    const app = new EthApp(transport)
    const path = getDerivationPath(walletIndex, ethHDMode)
    const provider = client.getProvider()
    const signer = new LedgerSigner({ provider, path, app })

    const txHash = await client.transfer({
      signer,
      asset,
      memo,
      amount,
      recipient,
      feeOption
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

/**
 * Sends ETH deposit txs using Ledger
 */
export const deposit = async ({
  transport,
  asset,
  router,
  network,
  amount,
  memo,
  recipient,
  walletIndex,
  feeOption,
  ethHDMode
}: {
  asset: Asset
  router: Address
  transport: Transport
  amount: BaseAmount
  network: Network
  recipient: Address
  memo?: string
  walletIndex: number
  feeOption: FeeOption
  ethHDMode: EthHDMode
}): Promise<E.Either<LedgerError, TxHash>> => {
  try {
    const address = ETH.getAssetAddress(asset)

    if (!address) {
      return E.left({
        errorId: LedgerErrorId.INVALID_DATA,
        msg: `Could not get asset address from ${assetToString(asset)}`
      })
    }

    const isETHAddress = address === ETH.ETHAddress

    const { ethplorerApiKey, ethplorerUrl } = getEthplorerCreds()

    const infuraCreds = getInfuraCreds()
    const clientNetwork = toClientNetwork(network)
    const etherscanApiKey = getEtherscanApiKey()

    const client = new ETH.Client({
      network: clientNetwork,
      etherscanApiKey,
      ethplorerApiKey,
      ethplorerUrl,
      infuraCreds,
      feeBounds: FEE_BOUNDS[clientNetwork]
    })

    const app = new EthApp(transport)
    const path = getDerivationPath(walletIndex, ethHDMode)
    const provider = client.getProvider()
    const signer = new LedgerSigner({ provider, path, app })

    const gasPrices = await client.estimateGasPrices()
    const gasPrice = gasPrices[feeOption].amount().toFixed(0) // no round down needed
    const blockTime = await getBlocktime(provider)
    const expiration = blockTime + DEPOSIT_EXPIRATION_OFFSET

    // Note: `client.call` handling very - similar to `runSendPoolTx$` in `src/renderer/services/ethereum/transaction.ts`
    // Call deposit function of Router contract
    // Note2: Amounts need to use `toFixed` to convert `BaseAmount` to `Bignumber`
    // since `value` and `gasPrice` type is `Bignumber`
    const { hash } = await client.call<{ hash: TxHash }>({
      signer,
      contractAddress: router,
      abi: ROUTER_ABI,
      funcName: 'depositWithExpiry',
      funcParams: [
        recipient,
        address,
        // Send `BaseAmount` w/o decimal and always round down for currencies
        amount.amount().toFixed(0, BigNumber.ROUND_DOWN),
        memo,
        expiration,
        isETHAddress
          ? {
              // Send `BaseAmount` w/o decimal and always round down for currencies
              value: amount.amount().toFixed(0, BigNumber.ROUND_DOWN),
              gasPrice
            }
          : { gasPrice }
      ]
    })

    return E.right(hash)
  } catch (error) {
    return E.left({
      errorId: LedgerErrorId.DEPOSIT_TX_FAILED,
      msg: isError(error) ? error?.message ?? error.toString() : `${error}`
    })
  }
}
