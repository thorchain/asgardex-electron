import React from 'react'

import * as RD from '@devexperts/remote-data-ts'
import { storiesOf } from '@storybook/react'
import { AssetRuneNative } from '@xchainjs/xchain-util'
import { none } from 'fp-ts/lib/Option'
import * as O from 'fp-ts/lib/Option'

import { HeaderComponent } from './HeaderComponent'

const midgardUrl = O.some('https://54.0.0.27')
const thorchainUrl = O.some('https://thorchain.net')

storiesOf('Components/Header', module).add('default', () => {
  return (
    <HeaderComponent
      network="mainnet"
      keystore={none}
      lockHandler={() => console.log('lockHandler')}
      pricePools={O.none}
      runePrice={RD.initial}
      reloadRunePrice={() => console.log('reload rune price')}
      volume24Price={RD.initial}
      reloadVolume24Price={() => console.log('reload volume24 price')}
      setSelectedPricePool={() => console.log('setSelectedPricePool')}
      selectedPricePoolAsset={O.some(AssetRuneNative)}
      midgardUrl={midgardUrl}
      thorchainUrl={thorchainUrl}
      inboundAddresses={RD.initial}
    />
  )
})
