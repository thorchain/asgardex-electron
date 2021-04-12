import React from 'react'

import * as RD from '@devexperts/remote-data-ts'
import { storiesOf } from '@storybook/react'
import { AssetRuneNative } from '@xchainjs/xchain-util'
import { none } from 'fp-ts/lib/Option'
import * as O from 'fp-ts/lib/Option'
import * as Rx from 'rxjs'

import { Locale } from '../../../shared/i18n/types'
import { HeaderComponent } from './HeaderComponent'

const binanceUrl = O.some('https://testnet-dex.binance.org/api/v1')
const midgardUrl = O.some('https://54.0.0.27')
const bitcoinUrl = O.some('https://blockstream.info')
const thorchainUrl = O.some('https://thorchain.net')
const litecoinUrl = O.some('https://blockstream.info')

// TODO (@Veado) Stories for pending / reached fundscap / non reached fundscap / error loading fundscap data
storiesOf('Components/Header', module).add('default', () => {
  return (
    <HeaderComponent
      keystore={none}
      lockHandler={() => console.log('lockHandler')}
      poolsState$={Rx.of(RD.pending)}
      setSelectedPricePool={() => console.log('setSelectedPricePool')}
      selectedPricePoolAsset$={Rx.of(O.some(AssetRuneNative))}
      locale={Locale.EN}
      binanceUrl={binanceUrl}
      midgardUrl={midgardUrl}
      bitcoinUrl={bitcoinUrl}
      thorchainUrl={thorchainUrl}
      litecoinUrl={litecoinUrl}
      selectedNetwork={'mainnet'}
      changeNetwork={(network) => console.log('set network to', network)}
      fundsCap={RD.pending}
      reloadFundsCap={() => console.log('Reload funds cap')}
    />
  )
})
