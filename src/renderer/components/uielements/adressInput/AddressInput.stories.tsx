import React from 'react'

import { storiesOf } from '@storybook/react'

import { AddressInput } from './AddressInput'

storiesOf('Components/AddressInput', module).add('default', () => {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        width: '500px'
      }}>
      <AddressInput
        onChange={(address: string) => console.log(address)}
        onStatusChange={(status: boolean) => console.log(status)}
      />
    </div>
  )
})
