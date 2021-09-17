import React from 'react'

import * as RD from '@devexperts/remote-data-ts'
import { storiesOf } from '@storybook/react'
import * as O from 'fp-ts/lib/Option'

import { HeaderNetStatus } from './HeaderNetStatus'

const inboundAddressRD = RD.initial
const mimirHaltRD = RD.initial
const midgardUrl = RD.initial

storiesOf('Components/HeaderNetStatus', module)
  .add('default', () => {
    return (
      <HeaderNetStatus
        isDesktopView={true}
        midgardStatus={inboundAddressRD}
        mimirStatus={mimirHaltRD}
        midgardUrl={midgardUrl}
        thorchainUrl={O.some('https://thorchain.info')}
      />
    )
  })
  .add('not connected', () => {
    return (
      <HeaderNetStatus
        isDesktopView={true}
        midgardStatus={inboundAddressRD}
        mimirStatus={mimirHaltRD}
        midgardUrl={midgardUrl}
        thorchainUrl={O.some('https://thorchain.info')}
      />
    )
  })
  .add('mobile', () => {
    return (
      <HeaderNetStatus
        isDesktopView={false}
        midgardStatus={inboundAddressRD}
        mimirStatus={mimirHaltRD}
        midgardUrl={midgardUrl}
        thorchainUrl={O.some('thorchain.info')}
      />
    )
  })
  .add('mobile - not connected', () => {
    return (
      <HeaderNetStatus
        isDesktopView={false}
        midgardStatus={inboundAddressRD}
        mimirStatus={mimirHaltRD}
        midgardUrl={midgardUrl}
        thorchainUrl={O.some('thorchain.info')}
      />
    )
  })
