import React from 'react'

import { SyncOutlined } from '@ant-design/icons'
import { storiesOf } from '@storybook/react'

import { Button } from '../button'
import { ButtonColor } from '../button/Button.types'
import { Alert } from './Alert'

const description = <div>This is a description message.</div>

const renderActionButton = (color: ButtonColor) => (
  <div>
    <p>{description}</p>
    <Button onClick={() => console.log('action')} typevalue="outline" color={color}>
      <SyncOutlined />
      Action Button
    </Button>
  </div>
)

storiesOf('Components/Alert', module)
  .add('info', () => {
    return (
      <div style={{ padding: '15px' }}>
        <Alert type="info" message="Info" />
      </div>
    )
  })
  .add('info w/ description', () => {
    return (
      <div style={{ padding: '15px' }}>
        <Alert type="info" message="Info" description={description} />
      </div>
    )
  })
  .add('info w/ action button', () => {
    return (
      <div style={{ padding: '15px' }}>
        <Alert type="info" message="Info" description={renderActionButton('primary')} />
      </div>
    )
  })
  .add('success', () => {
    return (
      <div style={{ padding: '15px' }}>
        <Alert type="success" message="Success" />
      </div>
    )
  })
  .add('success w/ description', () => {
    return (
      <div style={{ padding: '15px' }}>
        <Alert type="success" message="Success" description={description} />
      </div>
    )
  })
  .add('success w/ button', () => {
    return (
      <div style={{ padding: '15px' }}>
        <Alert type="success" message="Success" description={renderActionButton('success')} />
      </div>
    )
  })
  .add('warning', () => {
    return (
      <div style={{ padding: '15px' }}>
        <Alert type="warning" message="Warning" />
      </div>
    )
  })
  .add('warning w/ description', () => {
    return (
      <div style={{ padding: '15px' }}>
        <Alert type="warning" message="Warning" description={description} />
      </div>
    )
  })
  .add('warning w/ button', () => {
    return (
      <div style={{ padding: '15px' }}>
        <Alert type="warning" message="Warning" description={renderActionButton('warning')} />
      </div>
    )
  })
  .add('error', () => {
    return (
      <div style={{ padding: '15px' }}>
        <Alert type="error" message="Error" description={description} />
      </div>
    )
  })
  .add('error w/ button', () => {
    return (
      <div style={{ padding: '15px' }}>
        <Alert type="error" message="Error" description={renderActionButton('error')} />
      </div>
    )
  })
  .add('error w/ empty description', () => {
    return (
      <div style={{ padding: '15px' }}>
        <Alert type="error" message="Error" />
      </div>
    )
  })
