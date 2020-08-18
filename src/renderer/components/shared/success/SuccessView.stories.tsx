import React from 'react'

import { storiesOf } from '@storybook/react'

import Button from '../../uielements/button'
import SuccessView from './SuccessView'

storiesOf('Components/SuccessView', module)
  .add('default', () => {
    return <SuccessView message="Data loaded successfully!" />
  })
  .add('action button', () => {
    const renderActionButton = () => (
      <Button onClick={() => console.log('action')} typevalue="outline">
        Click me
      </Button>
    )
    return <SuccessView message="Data loaded successfully!" actionButton={renderActionButton()} />
  })
