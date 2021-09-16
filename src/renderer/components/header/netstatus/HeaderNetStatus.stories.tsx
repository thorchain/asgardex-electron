import React from 'react'

import * as RD from '@devexperts/remote-data-ts'
import { storiesOf } from '@storybook/react'

import { HeaderNetStatus } from './HeaderNetStatus'

const inboundAddressRD = RD.initial
const mimirRD = RD.initial

storiesOf('Components/HeaderNetStatus', module)
  .add('default', () => {
    return <HeaderNetStatus isDesktopView={true} inboundAddress={inboundAddressRD} mimirHalt={mimirRD} />
  })
  .add('not connected', () => {
    return <HeaderNetStatus isDesktopView={true} inboundAddress={inboundAddressRD} mimirHalt={mimirRD} />
  })
  .add('mobile', () => {
    return <HeaderNetStatus isDesktopView={false} inboundAddress={inboundAddressRD} mimirHalt={mimirRD} />
  })
  .add('mobile - not connected', () => {
    return <HeaderNetStatus isDesktopView={false} inboundAddress={inboundAddressRD} mimirHalt={mimirRD} />
  })
