import React from 'react'

import { storiesOf } from '@storybook/react'

import ErrorView from './ErrorView'

storiesOf('Components/ErrorView', module).add('default', () => {
  return <ErrorView message="Error while loading data!" />
})
