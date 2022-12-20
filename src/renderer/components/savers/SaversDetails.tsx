import React from 'react'

import { Asset, baseAmount, BaseAmount, baseToAsset, formatAssetAmountCurrency, formatBN } from '@xchainjs/xchain-util'
import BigNumber from 'bignumber.js'
import { useIntl } from 'react-intl'

import { ZERO_BN } from '../../const'
import { isUSDAsset } from '../../helpers/assetHelper'
import { EmptyResult } from '../shared/result/EmptyResult'

type Props = {
  asset: Asset
  priceAsset: Asset
  deposit: { amount: BaseAmount; price: BaseAmount }
  redeem: { amount: BaseAmount; price: BaseAmount }
  percent: BigNumber
}

export const SaversDetails: React.FC<Props> = (props): JSX.Element => {
  const { asset, priceAsset, deposit, redeem, percent } = props
  const intl = useIntl()

  const depositValueLabel = formatAssetAmountCurrency({ amount: baseToAsset(deposit.amount), asset, decimal: 3 })

  const priceDepositLabel = formatAssetAmountCurrency({
    amount: baseToAsset(deposit.price),
    asset: priceAsset,
    decimal: isUSDAsset(priceAsset) ? 2 : 6
  })
  const redeemValueLabel = formatAssetAmountCurrency({ amount: baseToAsset(redeem.amount), asset, decimal: 3 })

  const redeemDepositLabel = formatAssetAmountCurrency({
    amount: baseToAsset(redeem.price),
    asset: priceAsset,
    decimal: isUSDAsset(priceAsset) ? 2 : 6
  })

  const growthValue = redeem.amount.minus(deposit.amount)
  const growthValueLabel = formatAssetAmountCurrency({
    amount: baseToAsset(growthValue.gt(0) ? growthValue : baseAmount(0, deposit.amount.decimal)),
    asset,
    decimal: isUSDAsset(asset) ? 2 : 6
  })

  const priceGrowth = redeem.price.minus(deposit.price)
  const priceGrowthLabel = formatAssetAmountCurrency({
    amount: baseToAsset(priceGrowth.gt(0) ? priceGrowth : baseAmount(0, deposit.price.decimal)),
    asset: priceAsset,
    decimal: isUSDAsset(priceAsset) ? 2 : 6
  })

  const percentLabel = `${formatBN(percent.gt(0) ? percent : ZERO_BN, 4)}%`

  const hasSavings = deposit.amount.gt(0)

  return hasSavings ? (
    <div className="flex w-full flex-col items-center p-20px">
      <h1 className="pb-10px pt-0 text-center font-mainSemiBold text-14 uppercase text-text2 dark:text-text2 lg:pt-[50px]">
        {intl.formatMessage({ id: 'savers.detail.current.title' })}
      </h1>

      <div className="w-full border border-gray0 p-20px dark:border-gray0d">
        <div className="flex flex-col items-center font-main">
          <div className="text-[21px] text-text0 dark:text-text0d">{depositValueLabel}</div>
          <div className="text-[17px] text-gray2 dark:text-gray2d">{priceDepositLabel}</div>
        </div>
      </div>
      <h1 className="pb-10px pt-30px text-center font-mainSemiBold text-14 uppercase text-text2 dark:text-text2">
        {intl.formatMessage({ id: 'savers.detail.redeem.title' })}
      </h1>
      <div className="w-full border border-gray0 p-20px dark:border-gray0d">
        <div className="flex flex-col items-center font-main">
          <div className="text-[21px] text-text0 dark:text-text0d">{redeemValueLabel}</div>
          <div className="text-[17px] text-gray2 dark:text-gray2d">{redeemDepositLabel}</div>
        </div>
      </div>
      <h1 className="pb-10px pt-30px text-center font-mainSemiBold text-14 uppercase text-text2 dark:text-text2">
        {intl.formatMessage({
          id: 'savers.detail.percent'
        })}
      </h1>
      <div className="w-full border border-gray0 p-20px dark:border-gray0d">
        <div className="flex flex-col items-center font-main">
          <div className="text-[33px] text-text0 dark:text-text0d">{percentLabel}</div>
          <div className="my-20px h-[1px] w-full border-b border-gray0 px-20px dark:border-gray0d"></div>
          <div className="text-[17px] text-text0 dark:text-text0d">{growthValueLabel}</div>
          <div className="text-[14px] text-gray2 dark:text-gray2d">{priceGrowthLabel}</div>
        </div>
      </div>
    </div>
  ) : (
    <EmptyResult
      title={intl.formatMessage({
        id: 'savers.noSavings'
      })}
      className="h-full w-full py-50px"
    />
  )
}
