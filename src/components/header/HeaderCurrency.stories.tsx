import React from 'react'

import { boolean } from '@storybook/addon-knobs'
import { storiesOf } from '@storybook/react'

import { PoolAsset } from '../../views/pools/types'
import HeaderCurrency, { HeaderCurrencyItems } from './HeaderCurrency'

const items: HeaderCurrencyItems = [
  { label: 'ᚱ RUNE', value: PoolAsset.RUNE },
  { label: '₿ BTC', value: PoolAsset.BTC },
  { label: 'Ξ ETH', value: PoolAsset.ETH },
  { label: '$ USD', value: PoolAsset.TUSDB }
]

storiesOf('Components/HeaderCurrency', module).add('desktop / mobile', () => {
  const changeHandler = (value: string) => console.log(`changed: ${value}`)
  const isDesktopView = boolean('isDesktopView', false)
  return <HeaderCurrency items={items} isDesktopView={isDesktopView} changeHandler={changeHandler} />
})
