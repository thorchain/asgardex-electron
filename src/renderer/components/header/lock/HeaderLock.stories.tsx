import React from 'react'

import { boolean } from '@storybook/addon-knobs'
import { storiesOf } from '@storybook/react'

import { HeaderLock } from './HeaderLock'

storiesOf('Components/HeaderLock', module).add('desktop / mobile', () => {
  const isDesktopView = boolean('isDesktopView', false)
  const isLocked = boolean('isLocked', false)
  return <HeaderLock isDesktopView={isDesktopView} isLocked={isLocked} />
})
