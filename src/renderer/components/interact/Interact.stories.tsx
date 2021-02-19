import React from 'react'

import { Bond, Unbond, Leave, Custom } from './forms/Forms.stories'
import { Interact } from './Interact'

export const Default = () => (
  <Interact
    bondContent={<Bond />}
    unbondContent={<Unbond />}
    leaveContent={<Leave />}
    customContent={<Custom />}
    network="testnet"
  />
)

export default {
  title: 'Wallet/Interact'
}
