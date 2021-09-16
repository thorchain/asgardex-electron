import React from 'react'

import * as RD from '@devexperts/remote-data-ts'
import { storiesOf } from '@storybook/react'

import { HeaderNetStatus } from './HeaderNetStatus'

const inboundAddressRD = RD.initial
const mimirHaltRD = RD.initial

storiesOf('Components/HeaderNetStatus', module)
  .add('default', () => {
    return <HeaderNetStatus isDesktopView={true} midgardStatus={inboundAddressRD} mimirStatus={mimirHaltRD} />
  })
  .add('not connected', () => {
    return <HeaderNetStatus isDesktopView={true} midgardStatus={inboundAddressRD} mimirStatus={mimirHaltRD} />
  })
  .add('mobile', () => {
    return <HeaderNetStatus isDesktopView={false} midgardStatus={inboundAddressRD} mimirStatus={mimirHaltRD} />
  })
  .add('mobile - not connected', () => {
    return <HeaderNetStatus isDesktopView={false} midgardStatus={inboundAddressRD} mimirStatus={mimirHaltRD} />
  })
