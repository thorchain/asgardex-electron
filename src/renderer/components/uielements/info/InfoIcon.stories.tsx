import React from 'react'

import { storiesOf } from '@storybook/react'

import { InfoIcon } from './InfoIcon'

storiesOf('Components/InfoIcon', module).add('default', () => {
  return <InfoIcon tooltip="testing info icon" />
})
