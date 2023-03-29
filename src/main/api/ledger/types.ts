import Transport from '@ledgerhq/hw-transport'

import { Network } from '../../../shared/api/types'

export type VerifyAddressHandler = (params: {
  transport: Transport
  network: Network
  walletIndex: number
}) => Promise<boolean>
