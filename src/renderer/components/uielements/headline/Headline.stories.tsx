import React from 'react'

import { storiesOf } from '@storybook/react'

import Headline from '.'

storiesOf('Components/Headline', module).add('default', () => {
  return <Headline>Hello headline</Headline>
})
