import React from 'react'

import { SyncOutlined } from '@ant-design/icons'
import { storiesOf } from '@storybook/react'

import Button from '../../uielements/button'
import ErrorView from './ErrorView'

storiesOf('Components/ErrorView', module)
  .add('default', () => {
    return <ErrorView message="Error while loading data!" />
  })
  .add('action button', () => {
    const renderActionButton = () => (
      <Button onClick={() => console.log('action')} typevalue="outline">
        <SyncOutlined />
        Action Button
      </Button>
    )
    return <ErrorView message="Error while loading data!" actionButton={renderActionButton()} />
  })
