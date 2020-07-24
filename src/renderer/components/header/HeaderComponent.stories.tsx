import React from 'react'

import * as RD from '@devexperts/remote-data-ts'
import { storiesOf } from '@storybook/react'
import { none } from 'fp-ts/lib/Option'
import * as O from 'fp-ts/lib/Option'
import * as Rx from 'rxjs'

import { Locale } from '../../../shared/i18n/types'
import HeaderComponent from './HeaderComponent'

const binanceUrl = O.some('https://testnet-dex.binance.org/api/v1')
const midgardUrl = O.some('https://54.0.0.27')

storiesOf('Components/Header', module).add('default', () => {
  return (
    <HeaderComponent
      keystore={none}
      lockHandler={() => console.log('lockHandler')}
      poolsState$={Rx.of(RD.pending)}
      setSelectedPricePool={() => console.log('setSelectedPricePool')}
      selectedPricePoolAsset$={Rx.of(none)}
      locale={Locale.EN}
      binanceUrl={binanceUrl}
      midgardUrl={midgardUrl}
    />
  )
})
