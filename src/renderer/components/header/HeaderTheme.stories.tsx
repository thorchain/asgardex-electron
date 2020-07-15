import React from 'react'

import { boolean } from '@storybook/addon-knobs'
import { storiesOf } from '@storybook/react'

import HeaderTheme from './HeaderTheme'

storiesOf('Components/HeaderTheme', module).add('desktop / mobile', () => {
  const isDesktopView = boolean('isDesktopView', false)
  return <HeaderTheme isDesktopView={isDesktopView} />
})
