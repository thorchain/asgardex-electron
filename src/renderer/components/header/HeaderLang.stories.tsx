import React from 'react'

import { boolean } from '@storybook/addon-knobs'
import { storiesOf } from '@storybook/react'

import HeaderLang from './HeaderLang'

storiesOf('Components/HeaderLang', module).add('desktop / mobile', () => {
  const isDesktopView = boolean('isDesktopView', false)
  return <HeaderLang isDesktopView={isDesktopView} />
})
