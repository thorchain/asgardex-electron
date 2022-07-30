import * as RD from '@devexperts/remote-data-ts'
import { ComponentMeta, StoryFn } from '@storybook/react'
import * as Rx from 'rxjs'

import { MOCK_KEYSTORE } from '../../../../shared/mock/wallet'
import { ImportKeystore as Component, Props } from './ImportKeystore'

const initialImportKeystore = () => Rx.of(RD.initial)
const initialLoadKeystore = () => Rx.of(RD.initial)

const Template: StoryFn<Props> = (args) => (
  <Component importKeystore$={args.importKeystore$} loadKeystore$={args.loadKeystore$} clientStates={RD.initial} />
)
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
    importKeystore$: {
      control: {
        type: 'select',
        options: ['initial', 'loading', 'error', 'success'],
        mapping: {
          intitial: initialImportKeystore,
          loading: () => Rx.of(RD.pending),
          error: () => Rx.of(RD.failure(Error('import keystore error'))),
          success: () => Rx.of(RD.success(undefined))
        }
      }
    }
  },
  args: {
    loadKeystore$: initialLoadKeystore,
    importKeystore$: initialImportKeystore
  },
  decorators: [
    (Story) => (
      <div className="flex items-center w-full">
        <Story />
      </div>
    )
  ]
}

export default meta
