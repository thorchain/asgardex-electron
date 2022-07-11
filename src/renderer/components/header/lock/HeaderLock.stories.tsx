import React from 'react'

// TODO (@veado) Replace knobs
// import { boolean } from '@storybook/addon-knobs'
import { storiesOf } from '@storybook/react'
import * as O from 'fp-ts/lib/Option'

import { HeaderLock } from './HeaderLock'

storiesOf('Components/HeaderLock', module).add('desktop / mobile', () => {
  // const isDesktopView = boolean('isDesktopView', false)
  // return <HeaderLock isDesktopView={isDesktopView} keystore={O.none} />
  return <HeaderLock isDesktopView={false} keystore={O.none} />
})
