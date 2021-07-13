import React from 'react'

import { storiesOf } from '@storybook/react'
import * as O from 'fp-ts/lib/Option'

import { HeaderNetStatus } from './HeaderNetStatus'

const binanceUrl = O.some('https://testnet-dex.binance.org/api/v1')
const midgardUrl = O.some('https://54.0.0.27')
const bitcoinUrl = O.some('https://blockstream.info')
const thorchainUrl = O.some('https://thorchain.net')
const litecoinUrl = O.some('https://blockstream.info')
const ethereumUrl = O.some('https://etherscan.io')
const bitcoinCashUrl = O.some('https://www.blockchain.com')

storiesOf('Components/HeaderNetStatus', module)
  .add('default', () => {
    return (
      <HeaderNetStatus
        isDesktopView={true}
        binanceUrl={binanceUrl}
        midgardUrl={midgardUrl}
        bitcoinUrl={bitcoinUrl}
        thorchainUrl={thorchainUrl}
        litecoinUrl={litecoinUrl}
        ethereumUrl={ethereumUrl}
        bitcoinCashUrl={bitcoinCashUrl}
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
        litecoinUrl={O.none}
        ethereumUrl={O.none}
        bitcoinCashUrl={O.none}
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
        litecoinUrl={litecoinUrl}
        ethereumUrl={ethereumUrl}
        bitcoinCashUrl={bitcoinCashUrl}
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
        litecoinUrl={O.none}
        ethereumUrl={ethereumUrl}
        bitcoinCashUrl={bitcoinCashUrl}
      />
    )
  })
