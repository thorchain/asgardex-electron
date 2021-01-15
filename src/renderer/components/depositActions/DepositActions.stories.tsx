import React from 'react'

import { DepositActions } from './DepositActions'
import { Bond, Unbond, Leave } from './forms/Forms.stories'

export const Default = () => (
  <DepositActions bondContent={<Bond />} unbondContent={<Unbond />} leaveContent={<Leave />} />
)

export default {
  title: 'Wallet/DepositActions'
}
