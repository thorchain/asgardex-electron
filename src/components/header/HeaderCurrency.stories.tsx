import React from 'react'

import { boolean } from '@storybook/addon-knobs'
import { storiesOf } from '@storybook/react'

import HeaderCurrency, { HeaderCurrencyItems } from './HeaderCurrency'

const items: HeaderCurrencyItems = [
  { label: 'ᚱ RUNE', value: 'RUNE' },
  { label: '₿ BTC', value: 'BTC' },
  { label: 'Ξ ETH', value: 'ETH' },
  { label: '$ USD', value: 'USD' }
]

storiesOf('Components/HeaderCurrency', module).add('desktop / mobile', () => {
  const changeHandler = (value: string) => console.log(`changed: ${value}`)
  const isDesktopView = boolean('isDesktopView', false)
  return <HeaderCurrency items={items} isDesktopView={isDesktopView} changeHandler={changeHandler} />
})
