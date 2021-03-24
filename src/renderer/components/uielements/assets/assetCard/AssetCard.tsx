import React, { useRef, useState, RefObject, useCallback, useMemo, useEffect } from 'react'

import {
  bn,
  Asset,
  assetFromString,
  BaseAmount,
  baseToAsset,
  assetToBase,
  formatAssetAmountCurrency,
  assetAmount
} from '@xchainjs/xchain-util'
import * as AU from '@xchainjs/xchain-util'
import { Dropdown } from 'antd'
import BigNumber from 'bignumber.js'
import * as FP from 'fp-ts/lib/function'

import { Network } from '../../../../../shared/api/types'
import { ZERO_BASE_AMOUNT } from '../../../../const'
import { BTC_DECIMAL, isBtcAsset } from '../../../../helpers/assetHelper'
import { ordWalletBalanceByAsset } from '../../../../helpers/fp/ord'
import { useClickOutside } from '../../../../hooks/useOutsideClick'
import { PriceDataIndex } from '../../../../services/midgard/types'
import { WalletBalances } from '../../../../types/wallet'
import { Label } from '../../label'
import { Slider } from '../../slider'
import { AssetMenu } from '../assetMenu'
import * as Styled from './AssetCard.style'

export type Props = {
  asset: Asset
  balances: WalletBalances
  selectedAmount: BaseAmount
  maxAmount: BaseAmount
  price: BigNumber
  priceIndex?: PriceDataIndex
  priceAsset?: Asset
  slip?: number
  title?: string
  searchDisable?: string[]
  percentValue?: number
  withSearch?: boolean
  onChangeAssetAmount?: (value: BaseAmount) => void
  inputOnBlurHandler?: FP.Lazy<void>
  inputOnFocusHandler?: FP.Lazy<void>
  onChangeAsset?: (asset: Asset) => void
  onChangePercent?: (percent: number) => void
  disabled?: boolean
  network: Network
  onAfterSliderChange?: (value: number) => void
}

export const AssetCard: React.FC<Props> = (props): JSX.Element => {
  const {
    asset,
    balances = [],
    price = bn(0),
    priceIndex,
    slip,
    priceAsset,
    title = '',
    percentValue = NaN,
    withSearch = false,
    searchDisable = [],
    onChangeAssetAmount = (_: BaseAmount) => {},
    inputOnBlurHandler = FP.constVoid,
    inputOnFocusHandler = FP.constVoid,
    onChangeAsset = (_: Asset) => {},
    onChangePercent = (_: number) => {},
    children = null,
    selectedAmount,
    maxAmount,
    disabled,
    network,
    onAfterSliderChange
  } = props

  const [openDropdown, setOpenDropdown] = useState(false)
  const [wrapperWidth, setWrapperWidth] = useState(0)
  const ref: RefObject<HTMLDivElement> = useRef(null)

  const selectedAmountBn = useMemo(() => baseToAsset(selectedAmount).amount(), [selectedAmount])
  const maxAmountBn = useMemo(() => baseToAsset(maxAmount).amount(), [maxAmount])

  useClickOutside<HTMLDivElement>(ref, () => setOpenDropdown(false))

  const handleChangeAsset = useCallback(
    (asset: string | Asset) => {
      const targetAsset = typeof asset === 'string' ? assetFromString(asset) : asset
      if (targetAsset) {
        onChangeAsset(targetAsset)
        onChangeAssetAmount(ZERO_BASE_AMOUNT)
      }
    },
    [onChangeAsset, onChangeAssetAmount]
  )

  const renderMenu = useCallback(() => {
    const sortedBalanceData = balances.sort(ordWalletBalanceByAsset.compare)

    return (
      <AssetMenu
        balances={sortedBalanceData}
        asset={asset}
        priceIndex={priceIndex}
        withSearch={withSearch}
        searchDisable={searchDisable}
        onSelect={handleChangeAsset}
        network={network}
      />
    )
  }, [balances, asset, priceIndex, withSearch, searchDisable, handleChangeAsset, network])

  const withPercentSlider = useMemo(() => !isNaN(percentValue), [percentValue])

  // Needed to have appropriate width of a dropdown
  useEffect(() => {
    // it will be executed only once after componentDidMount
    setWrapperWidth(!ref.current ? 0 : ref.current.clientWidth)
    const listener = () => {
      setWrapperWidth(!ref.current ? 0 : ref.current.clientWidth)
    }
    window.addEventListener('resize', listener)

    return () => {
      window.removeEventListener('resize', listener)
    }
  }, [setWrapperWidth])

  const changeAssetAmountHandler = useCallback(
    (value: BigNumber) => onChangeAssetAmount(assetToBase(AU.assetAmount(value))),
    [onChangeAssetAmount]
  )

  const priceLabel = useMemo(() => {
    const amount = assetAmount(selectedAmountBn.multipliedBy(price))
    return formatAssetAmountCurrency({
      amount,
      asset: priceAsset,
      // special case for BTC
      decimal: priceAsset && isBtcAsset(priceAsset) ? BTC_DECIMAL : 2
    })
  }, [price, priceAsset, selectedAmountBn])

  return (
    <Styled.AssetCardWrapper ref={ref}>
      {!!title && <Label className="title-label">{title}</Label>}

      <Dropdown overlay={renderMenu()} trigger={[]} visible={openDropdown}>
        <Styled.CardBorderWrapper>
          <Styled.AssetLabel asset={asset} />
          <Styled.CardTopRow>
            <Styled.AssetSelect
              minWidth={wrapperWidth}
              showAssetName={false}
              balances={balances}
              asset={asset}
              onSelect={handleChangeAsset}
              network={network}>
              <Styled.AssetData>
                <Styled.InputBigNumber
                  disabled={disabled}
                  value={selectedAmountBn}
                  onChange={changeAssetAmountHandler}
                  decimal={selectedAmount.decimal}
                  max={maxAmountBn.toString()}
                  onBlur={inputOnBlurHandler}
                  onFocus={inputOnFocusHandler}
                />
                <Styled.AssetCardFooter>
                  <Styled.FooterLabel>{priceLabel}</Styled.FooterLabel>
                  {slip !== undefined && (
                    <Styled.FooterLabel className="asset-slip-label">SLIP: {slip.toFixed(0)} %</Styled.FooterLabel>
                  )}
                </Styled.AssetCardFooter>
              </Styled.AssetData>
            </Styled.AssetSelect>
          </Styled.CardTopRow>
        </Styled.CardBorderWrapper>
      </Dropdown>
      {withPercentSlider && (
        <Styled.SliderWrapper>
          <Slider
            onAfterChange={onAfterSliderChange}
            disabled={disabled}
            value={percentValue}
            onChange={onChangePercent}
            tooltipPlacement="top"
            withLabel={true}
          />
        </Styled.SliderWrapper>
      )}
      {children}
    </Styled.AssetCardWrapper>
  )
}
