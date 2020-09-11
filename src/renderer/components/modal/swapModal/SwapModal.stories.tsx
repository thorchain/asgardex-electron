import React from 'react'

import { storiesOf } from '@storybook/react'
import { assetAmount, assetToBase } from '@thorchain/asgardex-util'
import BigNumber from 'bignumber.js'

import { ASSETS_MAINNET } from '../../../../shared/mock/assets'
import { TxStatus, TxTypes } from '../../../types/asgardex'
import SwapModal from './SwapModal'
import { CalcResult } from './types'

storiesOf('Components/Swap Modal', module).add('default', () => {
  const txStatus: TxStatus = {
    modal: true,
    value: 75,
    status: true,
    type: TxTypes.SWAP,
    startTime: Date.now(),
    hash: 'FCA7F45C74278F819757DC00AB5289E1192F9EA31A6C31B0B300CFCDC7C70B64'
  }
  const calcResult: CalcResult = {
    Px: new BigNumber(1),
    slip: new BigNumber(0.01645550108862126),
    outputAmount: assetAmount(1),
    outputPrice: new BigNumber(556327544945582288316300000000),
    fee: assetAmount(1)
  }

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        width: '300px'
      }}>
      <SwapModal
        calcResult={calcResult}
        isCompleted={false}
        swapSource={ASSETS_MAINNET.RUNE}
        priceFrom={assetToBase(assetAmount(5))}
        priceTo={assetToBase(assetAmount(5))}
        swapTarget={ASSETS_MAINNET.BNB}
        txStatus={txStatus}
        visible
        maxSec={1}
      />
    </div>
  )
})
