import React from 'react'

import * as RD from '@devexperts/remote-data-ts'
import { BaseStory } from '@storybook/addons'
import * as O from 'fp-ts/lib/Option'

import { ASSETS_TESTNET } from '../../../../shared/mock/assets'
import { AssetDetails } from './index'

export const Story1: BaseStory<never, JSX.Element> = () => (
  <AssetDetails txsPageRD={RD.initial} balances={O.none} asset={O.some(ASSETS_TESTNET.BNB)} />
)
Story1.storyName = 'BNB'

export const Story2: BaseStory<never, JSX.Element> = () => (
  <AssetDetails txsPageRD={RD.initial} balances={O.none} asset={O.some(ASSETS_TESTNET.BNB)} />
)
Story2.storyName = 'BNB.RUNE - error no BNB balance'

export default {
  title: 'Wallet/AssetsDetails'
}
