import React from 'react'

import * as RD from '@devexperts/remote-data-ts'
import { storiesOf } from '@storybook/react'
import { AssetRuneNative } from '@xchainjs/xchain-util'
import { none } from 'fp-ts/lib/Option'
import * as O from 'fp-ts/lib/Option'

import { HeaderComponent } from './HeaderComponent'

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
      inboundAddresses={RD.initial}
      mimirHalt={RD.initial}
      midgardUrl={RD.initial}
      thorchainUrl={'thorchain.info'}
    />
  )
})
