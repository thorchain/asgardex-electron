import React from 'react'

import { storiesOf } from '@storybook/react'
import { tokenAmount } from '@thorchain/asgardex-token'
import BigNumber from 'bignumber.js'

import { TxStatus, TxTypes } from '../../../types/asgardex'
import SwapModal from './SwapModal'
import { CalcResult } from './types'

storiesOf('Components/Swap Modal', module).add('default', () => {
  const txStatus: TxStatus = {
    modal: true,
    value: 100,
    status: true,
    type: TxTypes.SWAP,
    startTime: 1592795475703,
    hash: 'FCA7F45C74278F819757DC00AB5289E1192F9EA31A6C31B0B300CFCDC7C70B64'
  }
  const calcResult: CalcResult = {
    Px: new BigNumber(1),
    slip: new BigNumber(0.01645550108862126),
    outputAmount: tokenAmount(1),
    outputPrice: new BigNumber(556327544945582288316300000000),
    fee: tokenAmount(1)
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
        isCompleted
        swapSource="RUNE"
        priceFrom={new BigNumber(5)}
        priceTo={new BigNumber(2)}
        swapTarget="BNB"
        txStatus={txStatus}
        visible
      />
    </div>
  )
})
