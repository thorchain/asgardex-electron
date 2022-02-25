import React from 'react'

import { Unbond, Leave, Custom } from './forms/Forms.stories'
import { Interact } from './Interact'

export const Default = () => (
  <Interact
    walletType="ledger"
    bondContent={<>Bond view</>}
    unbondContent={<Unbond />}
    leaveContent={<Leave />}
    customContent={<Custom />}
    network="testnet"
  />
)

export default {
  title: 'Wallet/Interact'
}
