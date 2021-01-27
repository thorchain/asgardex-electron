import React from 'react'

import { assetAmount } from '@xchainjs/xchain-util'

import { Bond as BondView } from './Bond'
import { Custom as CustomView } from './Custom'
import { Leave as LeaveView } from './Leave'
import { Unbond as UnbondView } from './Unbond'

export const Bond = () => <BondView onFinish={console.log} max={assetAmount(100)} />
export const BondPending = () => (
  <BondView loadingProgress={'progress step example'} isLoading={true} onFinish={console.log} max={assetAmount(100)} />
)

export const Unbond = () => <UnbondView onFinish={console.log} />

export const Leave = () => <LeaveView onFinish={console.log} />
export const LeavePending = () => (
  <LeaveView isLoading={true} loadingProgress={'progress step example'} onFinish={console.log} />
)

export const Custom = () => <CustomView onFinish={console.log} />
export const CustomPending = () => (
  <CustomView isLoading={true} loadingProgress={'progress step example'} onFinish={console.log} />
)

export default {
  title: 'Wallet/Interact/Forms'
}
