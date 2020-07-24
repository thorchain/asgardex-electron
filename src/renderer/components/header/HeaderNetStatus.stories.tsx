import React from 'react'

import { storiesOf } from '@storybook/react'

import HeaderNetStatus from './HeaderNetStatus'

storiesOf('Components/HeaderNetStatus', module)
  .add('default', () => {
    return <HeaderNetStatus isDesktopView={true} />
  })
  .add('mobile', () => {
    return <HeaderNetStatus isDesktopView={false} />
  })
