import React from 'react'

import { Bond as BondView } from './Bond'
import { Leave as LeaveView } from './Leave'
import { Unbond as UnbondView } from './Unbond'

export const Bond = () => <BondView onFinish={console.log} />

export const Unbond = () => <UnbondView onFinish={console.log} />

export const Leave = () => <LeaveView onFinish={console.log} />

export default {
  title: 'Wallet/DepositActions/Forms'
}
