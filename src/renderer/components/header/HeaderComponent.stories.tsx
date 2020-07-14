import React from 'react'

import * as RD from '@devexperts/remote-data-ts'
import { storiesOf } from '@storybook/react'
import { none } from 'fp-ts/lib/Option'
import * as Rx from 'rxjs'

import HeaderComponent from './HeaderComponent'

storiesOf('Components/Header', module).add('default', () => {
  return (
    <HeaderComponent
      keystore={none}
      lockHandler={() => console.log('lockHandler')}
      poolsState$={Rx.of(RD.pending)}
      setSelectedPricePool={() => console.log('setSelectedPricePool')}
      selectedPricePoolAsset$={Rx.of(none)}
    />
  )
})
