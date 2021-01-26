import React from 'react'

import { Bond, Unbond, Leave, Other } from './forms/Forms.stories'
import { Interact } from './Interact'

export const Default = () => (
  <Interact bondContent={<Bond />} unbondContent={<Unbond />} leaveContent={<Leave />} otherContent={<Other />} />
)

export default {
  title: 'Wallet/Interact'
}
