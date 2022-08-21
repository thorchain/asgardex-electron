import { ComponentMeta } from '@storybook/react'
import { TxHash } from '@xchainjs/xchain-client'
import { assetAmount, assetToBase, BaseAmount, baseAmount } from '@xchainjs/xchain-util'
import * as FP from 'fp-ts/lib/function'
import * as O from 'fp-ts/lib/Option'
import * as Rx from 'rxjs'

import { getMockRDValueFactory, RDStatus } from '../../../../../shared/mock/rdByStatus'
import { mockValidatePassword$ } from '../../../../../shared/mock/wallet'
import { WalletType } from '../../../../../shared/wallet/types'
import { mockWalletBalance } from '../../../../helpers/test/testWalletHelper'
import { FeeRD } from '../../../../services/chain/types'
import { InteractStateHandler } from '../../../../services/thorchain/types'
import { ApiError, ErrorId, WalletBalance } from '../../../../services/wallet/types'
import { InteractType } from './Interact.types'
import { InteractForm as Component } from './InteractForm'

type Args = {
  interactType: InteractType
  txRDStatus: RDStatus
  feeRDStatus: RDStatus
  balance: string
  validAddress: boolean
  walletType: WalletType
}

const Template = ({ interactType, txRDStatus, feeRDStatus, balance, validAddress, walletType }: Args) => {
  const interact$: InteractStateHandler = (_) => {
    const getCurrentStep = () => {
      switch (txRDStatus) {
        case 'initial':
          return 0
        case 'pending':
          return 1
        case 'success':
          return 2
        case 'error':
          return 2
      }
    }
    return Rx.of({
      step: getCurrentStep(),
      stepsTotal: 2,
      txRD: FP.pipe(
        txRDStatus,
        getMockRDValueFactory<ApiError, TxHash>(
          () => 'tx-hash',
          () => ({
            msg: 'error message',
            errorId: ErrorId.SEND_TX
          })
        )
      )
    })
  }

  const feeRD: FeeRD = FP.pipe(
    feeRDStatus,
    getMockRDValueFactory<Error, BaseAmount>(
      () => baseAmount(2000000),
      () => Error('getting fees failed')
    )
  )

  const runeBalance: WalletBalance = mockWalletBalance({
    amount: assetToBase(assetAmount(balance))
  })

  return (
    <Component
      interactType={interactType}
      walletType={walletType}
      walletIndex={0}
      interact$={interact$}
      balance={runeBalance}
      addressValidation={(_: string) => validAddress}
      fee={feeRD}
      reloadFeesHandler={() => console.log('reload fees')}
      validatePassword$={mockValidatePassword$}
      network="testnet"
      openExplorerTxUrl={(txHash: TxHash) => {
        console.log(`Open explorer - tx hash ${txHash}`)
        return Promise.resolve(true)
      }}
      getExplorerTxUrl={(txHash: TxHash) => O.some(`url/asset-${txHash}`)}
    />
  )
}

export const Default = Template.bind({})

const meta: ComponentMeta<typeof Template> = {
  component: Template,
  title: 'Wallet/InteractForm',
  argTypes: {
    interactType: {
      control: { type: 'select', options: ['bond', 'unbond', 'leave', 'custom'] }
    },
    txRDStatus: {
      control: { type: 'select', options: ['pending', 'error', 'success'] }
    },
    feeRDStatus: {
      control: { type: 'select', options: ['initial', 'pending', 'error', 'success'] }
    },
    walletType: {
      control: { type: 'select', options: ['keystore', 'ledger'] }
    }
  },
  args: {
    interactType: 'bond',
    txRDStatus: 'success',
    walletType: 'keystore',
    balance: '2',
    validAddress: true
  }
}

export default meta
