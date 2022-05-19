import EthApp from '@ledgerhq/hw-app-eth'
import TransportNodeHidSingleton from '@ledgerhq/hw-transport-node-hid-singleton'
import { FeeOption } from '@xchainjs/xchain-client'
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
  walletIndex,
  amount
}: IPCLedgerApproveERC20TokenParams) => {
  const { ethplorerApiKey, ethplorerUrl } = getEthplorerCreds()
  const client = new ETH.Client({
    network: toClientNetwork(network),
    etherscanApiKey: getEtherscanApiKey(),
    ethplorerApiKey,
    ethplorerUrl,
    infuraCreds: getInfuraCreds()
  })

  const transport = await TransportNodeHidSingleton.open()
  const app = new EthApp(transport)
  const path = getDerivationPath(walletIndex)
  const provider = client.getProvider()
  const signer = new LedgerSigner({ provider, path, app })

  const { hash } = await client.approve({
    signer,
    contractAddress,
    spenderAddress,
    amount,
    feeOptionKey: FeeOption.Fast, // ChainTxFeeOption.APPROVE
    gasLimitFallback: DEFAULT_APPROVE_GAS_LIMIT_FALLBACK
  })

  await transport.close()

  return hash
}
