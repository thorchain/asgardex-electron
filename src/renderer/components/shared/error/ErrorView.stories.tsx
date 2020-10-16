import React from 'react'

import { SyncOutlined } from '@ant-design/icons'
import { storiesOf } from '@storybook/react'

import { Button } from '../../uielements/button'
import { ErrorView } from './index'

storiesOf('Components/ErrorView', module)
  .add('default', () => {
    return <ErrorView title="Error while loading data!" />
  })
  .add('action button', () => {
    const renderActionButton = () => (
      <Button onClick={() => console.log('action')} typevalue="outline">
        <SyncOutlined />
        Action Button
      </Button>
    )
    return <ErrorView title="Error while loading data!" extra={renderActionButton()} />
  })
