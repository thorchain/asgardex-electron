import EthApp from '@ledgerhq/hw-app-eth'
import TransportNodeHidSingleton from '@ledgerhq/hw-transport-node-hid-singleton'
import { FeeOption, TxHash } from '@xchainjs/xchain-client'
import * as ETH from '@xchainjs/xchain-ethereum'

import { getEtherscanApiKey } from '../../../../shared/api/etherscan'
import { getEthplorerCreds } from '../../../../shared/api/ethplorer'
import { getInfuraCreds } from '../../../../shared/api/infura'
import { IPCLedgerApproveERC20TokenParams } from '../../../../shared/api/io'
import { DEFAULT_APPROVE_GAS_LIMIT_FALLBACK } from '../../../../shared/ethereum/const'
import { toClientNetwork } from '../../../../shared/utils/client'
import { getDerivationPath } from './common'
import { LedgerSigner } from './LedgerSigner'

export const approveLedgerERC20Token = async ({
  network,
  contractAddress,
  spenderAddress,
  walletIndex
}: IPCLedgerApproveERC20TokenParams): Promise<TxHash> => {
  const { ethplorerApiKey, ethplorerUrl } = getEthplorerCreds()

  const infuraCreds = getInfuraCreds()
  const clientNetwork = toClientNetwork(network)

  const client = new ETH.Client({
    network: clientNetwork,
    etherscanApiKey: getEtherscanApiKey(),
    ethplorerApiKey,
    ethplorerUrl,
    infuraCreds
  })

  const transport = await TransportNodeHidSingleton.open()
  const app = new EthApp(transport)
  const path = getDerivationPath(walletIndex)
  const provider = client.getProvider()
  const signer = new LedgerSigner({ provider, path, app })

  const { wait } = await client.approve({
    signer,
    contractAddress,
    spenderAddress,
    feeOption: FeeOption.Fast, // ChainTxFeeOption.APPROVE
    gasLimitFallback: DEFAULT_APPROVE_GAS_LIMIT_FALLBACK
  })

  // wait until the transaction has been mined
  const { transactionHash } = await wait(1)

  await transport.close()

  return transactionHash
}
