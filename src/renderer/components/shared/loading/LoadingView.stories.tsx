import React from 'react'

import { storiesOf } from '@storybook/react'

import { LoadingView } from './LoadingView'

storiesOf('Components/LoadingView', module).add('default', () => {
  return <LoadingView text="Loading data!" />
})
