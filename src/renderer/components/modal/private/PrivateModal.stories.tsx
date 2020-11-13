import React from 'react'

import { storiesOf } from '@storybook/react'

import { PrivateModal } from './PrivateModal'

storiesOf('Components/Private Modal', module)
  .add('default', () => {
    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          width: '300px'
        }}>
        <PrivateModal visible invalidPassword={false} validatingPassword={false} password="PASSWORD" />
      </div>
    )
  })
  .add('invalid', () => {
    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          width: '300px'
        }}>
        <PrivateModal visible invalidPassword validatingPassword={false} password="PASSWORD" />
      </div>
    )
  })
  .add('validating', () => {
    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          width: '300px'
        }}>
        <PrivateModal visible invalidPassword={false} validatingPassword password="PASSWORD" />
      </div>
    )
  })
