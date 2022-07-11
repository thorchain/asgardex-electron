import React from 'react'

// TODO (@veado) Replace knobs
// import { boolean } from '@storybook/addon-knobs'
import { storiesOf } from '@storybook/react'

import { HeaderSettings } from './HeaderSettings'

storiesOf('Components/HeaderSettings', module).add('desktop / mobile', () => {
  // const isDesktopView = boolean('isDesktopView', false)
  // return <HeaderSettings isDesktopView={isDesktopView} />
  return <HeaderSettings isDesktopView={true} />
})
