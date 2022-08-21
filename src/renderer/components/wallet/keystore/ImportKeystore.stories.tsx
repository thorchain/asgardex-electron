import * as RD from '@devexperts/remote-data-ts'
import { ComponentMeta, StoryFn } from '@storybook/react'
import * as Rx from 'rxjs'

import { MOCK_KEYSTORE } from '../../../../shared/mock/wallet'
import { ImportKeystore as Component, Props } from './ImportKeystore'

const initialLoadKeystore = () => Rx.of(RD.initial)

const Template: StoryFn<Props> = (args) => <Component {...args} />
export const Default = Template.bind({})

const meta: ComponentMeta<typeof Component> = {
  component: Component,
  title: 'Wallet/ImportKeystore',
  argTypes: {
    loadKeystore$: {
      control: {
        type: 'select',
        options: ['initial', 'loading', 'error', 'success'],
        mapping: {
          intitial: initialLoadKeystore,
          loading: () => Rx.of(RD.pending),
          error: () => Rx.of(RD.failure(Error('load keystore error'))),
          success: () => Rx.of(RD.success(MOCK_KEYSTORE))
        }
      }
    },
    importingKeystoreState: {
      control: {
        type: 'select',
        options: ['initial', 'loading', 'error', 'success'],
        mapping: {
          intitial: RD.initial,
          loading: () => RD.pending,
          error: () => RD.failure(Error('import keystore error')),
          success: () => RD.success(true)
        }
      }
    },
    importKeystore: { action: 'importKeystore' }
  },
  args: {
    loadKeystore$: initialLoadKeystore,
    importingKeystoreState: RD.initial,
    clientStates: RD.success(true),
    walletId: new Date().getTime()
  },
  decorators: [
    (Story) => (
      <div className="w-full bg-white">
        <Story />
      </div>
    )
  ]
}

export default meta
