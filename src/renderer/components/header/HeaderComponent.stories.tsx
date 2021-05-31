import React from 'react'

import { storiesOf } from '@storybook/react'
import { AssetRuneNative } from '@xchainjs/xchain-util'
import { none } from 'fp-ts/lib/Option'
import * as O from 'fp-ts/lib/Option'

import { Locale } from '../../../shared/i18n/types'
import { RUNE_PRICE_POOL } from '../../helpers/poolHelper'
import { HeaderComponent } from './HeaderComponent'

const binanceUrl = O.some('https://testnet-dex.binance.org/api/v1')
const midgardUrl = O.some('https://54.0.0.27')
const bitcoinUrl = O.some('https://blockstream.info')
const thorchainUrl = O.some('https://thorchain.net')
const litecoinUrl = O.some('https://blockstream.info')

storiesOf('Components/Header', module).add('default', () => {
  return (
    <HeaderComponent
      keystore={none}
      lockHandler={() => console.log('lockHandler')}
      pricePools={O.none}
      setSelectedPricePool={() => console.log('setSelectedPricePool')}
      selectedPricePoolAsset={O.some(AssetRuneNative)}
      selectedPricePool={RUNE_PRICE_POOL}
      locale={Locale.EN}
      binanceUrl={binanceUrl}
      midgardUrl={midgardUrl}
      bitcoinUrl={bitcoinUrl}
      thorchainUrl={thorchainUrl}
      litecoinUrl={litecoinUrl}
      selectedNetwork={'mainnet'}
      changeNetwork={(network) => console.log('set network to', network)}
    />
  )
})
