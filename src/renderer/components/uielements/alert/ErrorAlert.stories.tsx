import React from 'react'

import { SyncOutlined } from '@ant-design/icons'
import { storiesOf } from '@storybook/react'

import { Button } from '../../uielements/button'
import { ErrorAlert } from './ErrorAlert'

const description = <div>This is error message 1.</div>

const renderActionButton = (
  <div>
    <p>{description}</p>
    <Button onClick={() => console.log('action')} typevalue="outline" color="error">
      <SyncOutlined />
      Action Button
    </Button>
  </div>
)

storiesOf('Components/ErrorAlert', module)
  .add('default', () => {
    return (
      <div style={{ padding: '15px' }}>
        <ErrorAlert message="Error" description="This is error message 1" />
      </div>
    )
  })
  .add('button', () => {
    return (
      <div style={{ padding: '15px' }}>
        <ErrorAlert message="Error" description={renderActionButton} />
      </div>
    )
  })
  .add('empty description', () => {
    return (
      <div style={{ padding: '15px' }}>
        <ErrorAlert message="Error" />
      </div>
    )
  })
