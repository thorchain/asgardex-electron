import React from 'react'

import { storiesOf } from '@storybook/react'

import { ErrorAlert } from './ErrorAlert'

const descriptions = ['This is error message 1.', 'This is error message 2.', 'This is error message 3.']

storiesOf('Components/ErrorAlert', module)
  .add('default', () => {
    return (
      <div style={{ padding: '15px' }}>
        <ErrorAlert message="Error" descriptions={descriptions} />
      </div>
    )
  })
  .add('single description', () => {
    return (
      <div style={{ padding: '15px' }}>
        <ErrorAlert message="Error" descriptions={[descriptions[0]]} />
      </div>
    )
  })
  .add('empty list of descriptions', () => {
    return (
      <div style={{ padding: '15px' }}>
        <ErrorAlert message="Error" descriptions={[]} />
      </div>
    )
  })
