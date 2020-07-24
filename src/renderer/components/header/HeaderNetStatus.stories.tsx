import React from 'react'

import { storiesOf } from '@storybook/react'
import * as O from 'fp-ts/lib/Option'

import HeaderNetStatus from './HeaderNetStatus'

const binanceUrl = O.some('https://testnet-dex.binance.org/api/v1')
const midgardUrl = O.some('https://54.0.0.27')

storiesOf('Components/HeaderNetStatus', module)
  .add('default', () => {
    return <HeaderNetStatus isDesktopView={true} binanceUrl={binanceUrl} midgardUrl={midgardUrl} />
  })
  .add('not connected', () => {
    return <HeaderNetStatus isDesktopView={true} binanceUrl={O.none} midgardUrl={O.none} />
  })
  .add('mobile', () => {
    return <HeaderNetStatus isDesktopView={false} binanceUrl={binanceUrl} midgardUrl={midgardUrl} />
  })
  .add('mobile - not connected', () => {
    return <HeaderNetStatus isDesktopView={false} binanceUrl={O.none} midgardUrl={O.none} />
  })
