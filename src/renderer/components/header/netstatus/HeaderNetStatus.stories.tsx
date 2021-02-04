import React from 'react'

import { storiesOf } from '@storybook/react'
import * as O from 'fp-ts/lib/Option'

import { HeaderNetStatus } from './HeaderNetStatus'

const binanceUrl = O.some('https://testnet-dex.binance.org/api/v1')
const midgardUrl = O.some('https://54.0.0.27')
const bitcoinUrl = O.some('https://blockstream.info')
const thorchainUrl = O.some('https://thorchain.net')

storiesOf('Components/HeaderNetStatus', module)
  .add('default', () => {
    return (
      <HeaderNetStatus
        isDesktopView={true}
        binanceUrl={binanceUrl}
        midgardUrl={midgardUrl}
        bitcoinUrl={bitcoinUrl}
        thorchainUrl={thorchainUrl}
      />
    )
  })
  .add('not connected', () => {
    return (
      <HeaderNetStatus
        isDesktopView={true}
        binanceUrl={O.none}
        midgardUrl={O.none}
        bitcoinUrl={O.none}
        thorchainUrl={O.none}
      />
    )
  })
  .add('mobile', () => {
    return (
      <HeaderNetStatus
        isDesktopView={false}
        binanceUrl={binanceUrl}
        midgardUrl={midgardUrl}
        bitcoinUrl={bitcoinUrl}
        thorchainUrl={thorchainUrl}
      />
    )
  })
  .add('mobile - not connected', () => {
    return (
      <HeaderNetStatus
        isDesktopView={false}
        binanceUrl={O.none}
        midgardUrl={O.none}
        bitcoinUrl={O.none}
        thorchainUrl={O.none}
      />
    )
  })
