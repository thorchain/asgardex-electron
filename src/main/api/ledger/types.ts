import Transport from '@ledgerhq/hw-transport'
import { Network } from '@xchainjs/xchain-client'

export type VerifyAddressHandler = (params: {
  transport: Transport
  network: Network
  walletIndex: number
}) => Promise<boolean>
