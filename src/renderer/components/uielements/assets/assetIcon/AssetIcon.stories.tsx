import React from 'react'

// TODO (@veado) Replace knobs
// import { radios } from '@storybook/addon-knobs'
// import { RadiosTypeOptionsProp } from '@storybook/addon-knobs/dist/components/types'
import { storiesOf } from '@storybook/react'
import { AssetBCH, AssetBNB, AssetBTC, AssetETH, AssetRuneNative } from '@xchainjs/xchain-util'

import { ASSETS_MAINNET, ASSETS_TESTNET, ERC20_MAINNET, ERC20_TESTNET } from '../../../../../shared/mock/assets'
import { AssetIcon } from './AssetIcon'
import { Size } from './AssetIcon.types'

storiesOf('Components/assets/AssetIcon', module).add('default', () => {
  // const sizeOptions: RadiosTypeOptionsProp<Size> = {
  //   small: 'small',
  //   normal: 'normal',
  //   large: 'large',
  //   big: 'big'
  // }

  // const size = radios('size', sizeOptions, 'small')
  const size: Size = 'normal'

  return (
    <div>
      <div style={{ display: 'flex' }}>
        <AssetIcon asset={AssetBTC} size={size} network="mainnet" />
        <AssetIcon asset={AssetBCH} size={size} network="mainnet" />
        <AssetIcon asset={AssetBNB} size={size} network="mainnet" />
        <AssetIcon asset={ASSETS_MAINNET.BOLT} size={size} network="mainnet" />
        <AssetIcon asset={ASSETS_MAINNET.FTM} size={size} network="mainnet" />
        <AssetIcon asset={ASSETS_MAINNET.TOMO} size={size} network="mainnet" />
        <AssetIcon asset={AssetETH} size={size} network="mainnet" />
        <AssetIcon asset={ERC20_MAINNET.USDT} size={size} network="mainnet" />
        <AssetIcon asset={ERC20_MAINNET.RUNE} size={size} network="mainnet" />
        <AssetIcon asset={AssetRuneNative} size={size} network="mainnet" />
      </div>

      <div style={{ display: 'flex' }}>
        <AssetIcon asset={AssetBTC} size={size} network="testnet" />
        <AssetIcon asset={AssetBCH} size={size} network="testnet" />
        <AssetIcon asset={AssetBNB} size={size} network="testnet" />
        <AssetIcon asset={ASSETS_TESTNET.BOLT} size={size} network="testnet" />
        <AssetIcon asset={ASSETS_TESTNET.FTM} size={size} network="testnet" />
        <AssetIcon asset={ASSETS_TESTNET.TOMO} size={size} network="testnet" />
        <AssetIcon asset={AssetETH} size={size} network="testnet" />
        <AssetIcon asset={ERC20_TESTNET.USDT} size={size} network="testnet" />
        <AssetIcon asset={ERC20_TESTNET.RUNE} size={size} network="testnet" />
        <AssetIcon asset={AssetRuneNative} size={size} network="testnet" />
      </div>
    </div>
  )
})
