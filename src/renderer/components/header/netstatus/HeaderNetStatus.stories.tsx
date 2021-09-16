import React from 'react'

import * as RD from '@devexperts/remote-data-ts'
import { storiesOf } from '@storybook/react'
import * as O from 'fp-ts/lib/Option'

import { HeaderNetStatus } from './HeaderNetStatus'

const midgardUrl = O.some('https://54.0.0.27')
const thorchainUrl = O.some('https://thorchain.net')
const inboundAddressRD = RD.initial

storiesOf('Components/HeaderNetStatus', module)
  .add('default', () => {
    return (
      <HeaderNetStatus
        isDesktopView={true}
        midgardUrl={midgardUrl}
        thorchainUrl={thorchainUrl}
        inboundAddress={inboundAddressRD}
      />
    )
  })
  .add('not connected', () => {
    return (
      <HeaderNetStatus
        isDesktopView={true}
        midgardUrl={O.none}
        thorchainUrl={O.none}
        inboundAddress={inboundAddressRD}
      />
    )
  })
  .add('mobile', () => {
    return (
      <HeaderNetStatus
        isDesktopView={false}
        midgardUrl={midgardUrl}
        thorchainUrl={thorchainUrl}
        inboundAddress={inboundAddressRD}
      />
    )
  })
  .add('mobile - not connected', () => {
    return (
      <HeaderNetStatus
        isDesktopView={false}
        midgardUrl={O.none}
        thorchainUrl={O.none}
        inboundAddress={inboundAddressRD}
      />
    )
  })
