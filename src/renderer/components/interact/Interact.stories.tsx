import React from 'react'

import { Bond, Unbond, Leave } from './forms/Forms.stories'
import { Interact } from './Interact'

export const Default = () => <Interact bondContent={<Bond />} unbondContent={<Unbond />} leaveContent={<Leave />} />

export default {
  title: 'Wallet/Interact'
}
