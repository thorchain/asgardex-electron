import React from 'react'

import { assetAmount } from '@xchainjs/xchain-util'

import { AddressValidation } from '../../../services/clients'
import { Bond as BondView } from './Bond'
import { Custom as CustomView } from './Custom'
import { Leave as LeaveView } from './Leave'
import { Unbond as UnbondView } from './Unbond'

const addressValidation: AddressValidation = (_) => true

export const Bond = () => (
  <BondView addressValidation={addressValidation} onFinish={console.log} max={assetAmount(100)} />
)
export const BondPending = () => (
  <BondView
    addressValidation={addressValidation}
    loadingProgress={'progress step example'}
    isLoading={true}
    onFinish={console.log}
    max={assetAmount(100)}
  />
)

export const Unbond = () => <UnbondView addressValidation={addressValidation} onFinish={console.log} />

export const Leave = () => <LeaveView addressValidation={addressValidation} onFinish={console.log} />
export const LeavePending = () => (
  <LeaveView
    addressValidation={addressValidation}
    isLoading={true}
    loadingProgress={'progress step example'}
    onFinish={console.log}
  />
)

export const Custom = () => <CustomView onFinish={console.log} />
export const CustomPending = () => (
  <CustomView isLoading={true} loadingProgress={'progress step example'} onFinish={console.log} />
)

export default {
  title: 'Wallet/Interact/Forms'
}
