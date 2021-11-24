import { Story } from '@storybook/react'
import {
  assetAmount,
  AssetBCH,
  AssetBNB,
  AssetBTC,
  assetFromString,
  AssetRuneNative,
  assetToBase,
  assetToString
} from '@xchainjs/xchain-util'
import * as A from 'fp-ts/Array'
import * as FP from 'fp-ts/function'
import * as O from 'fp-ts/Option'

import { TxDetail } from './TxDetail'

const getValues = (firstAsset: string, secondAsset: string, firstValue: number, secondValue: number) => {
  const first = FP.pipe(
    O.fromNullable(assetFromString(firstAsset)),
    O.map((asset) => ({ asset, amount: assetToBase(assetAmount(firstValue)) }))
  )
  const second = FP.pipe(
    O.fromNullable(assetFromString(secondAsset)),
    O.map((asset) => ({ asset, amount: assetToBase(assetAmount(secondValue)) }))
  )

  return FP.pipe([first, second], A.filterMap(FP.identity))
}

export const Desktop: Story<{
  firstInValue: number
  secondInValue: number
  firstOutValue: number
  secondOutValue: number
  firstInAsset: string
  secondInAsset: string
  firstOutAsset: string
  secondOutAsset: string
  isDesktopView: boolean
}> = ({
  firstInValue,
  secondInValue,
  firstOutValue,
  secondOutValue,
  firstInAsset,
  secondInAsset,
  firstOutAsset,
  secondOutAsset,
  isDesktopView
}) => {
  return (
    <TxDetail
      network="mainnet"
      type={'SWAP'}
      date={<>12-12-3 1231</>}
      incomes={getValues(firstInAsset, secondInAsset, firstInValue, secondInValue)}
      outgos={getValues(firstOutAsset, secondOutAsset, firstOutValue, secondOutValue)}
      slip={1.23}
      fees={[
        {
          asset: AssetRuneNative,
          amount: assetToBase(assetAmount(1))
        }
      ]}
      isDesktopView={isDesktopView}
    />
  )
}

const stringAssetsOrNone = [AssetRuneNative, AssetBNB, AssetBCH, AssetBTC].map(assetToString)
stringAssetsOrNone.unshift('none')

const numberControlConfig = { type: 'number', min: 0, step: 0.0001 }

const argTypes = {
  firstInAsset: {
    control: {
      type: 'select',
      options: stringAssetsOrNone
    }
  },
  firstInValue: {
    control: numberControlConfig
  },
  secondInAsset: {
    control: {
      type: 'select',
      options: stringAssetsOrNone
    }
  },
  secondInValue: {
    control: numberControlConfig
  },

  firstOutAsset: {
    control: {
      type: 'select',
      options: stringAssetsOrNone
    }
  },
  firstOutValue: {
    control: numberControlConfig
  },
  secondOutAsset: {
    control: {
      type: 'select',
      options: stringAssetsOrNone
    }
  },
  secondOutValue: {
    control: numberControlConfig
  },
  isDesktopView: {
    name: 'isDesktopView',
    control: {
      type: 'boolean'
    },
    defaultValue: true
  }
}

Desktop.args = {
  firstInValue: 1.23,
  secondInValue: 0,
  firstOutValue: 23.34,
  secondOutValue: 0,
  firstInAsset: stringAssetsOrNone[1],
  secondInAsset: stringAssetsOrNone[0],
  firstOutAsset: stringAssetsOrNone[2],
  secondOutAsset: stringAssetsOrNone[0],
  isDesktopView: true
}

export default {
  component: TxDetail,
  title: 'TxDetail',
  argTypes
}
