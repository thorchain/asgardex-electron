import * as RD from '@devexperts/remote-data-ts'
import { Meta, Story } from '@storybook/react'
import * as Rx from 'rxjs'

import { ImportKeystore } from './index'

const importKeystoreInitial$ = () => Rx.of(RD.initial)
const loadKeystoreInitial$ = () => Rx.of(RD.initial)

export const StoryInitial: Story = () => (
  <ImportKeystore
    importKeystore$={importKeystoreInitial$}
    loadKeystore$={loadKeystoreInitial$}
    clientStates={RD.initial}
  />
)
StoryInitial.storyName = 'initial'

const meta: Meta = {
  component: ImportKeystore,
  title: 'Components/Wallet/Keystore',
  decorators: [
    (Story) => (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          width: '300px'
        }}>
        <Story />
      </div>
    )
  ]
}

export default meta
