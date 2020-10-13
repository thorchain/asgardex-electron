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
} from '@thorchain/asgardex-util'
import * as AU from '@thorchain/asgardex-util'
import { Dropdown } from 'antd'
import BigNumber from 'bignumber.js'

import { ZERO_BASE_AMOUNT } from '../../../../const'
import { BTC_DECIMAL, isBtcAsset } from '../../../../helpers/assetHelper'
import { ordAsset } from '../../../../helpers/fp/ord'
import { useClickOutside } from '../../../../hooks/useOutsideClick'
import { PriceDataIndex } from '../../../../services/midgard/types'
import Label from '../../label'
import Slider from '../../slider'
import AssetMenu from '../assetMenu'
import * as Styled from './AssetCard.style'

type Props = {
  asset: Asset
  assets?: Asset[]
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
  onChangeAsset?: (asset: Asset) => void
  onChangePercent?: (percent: number) => void
  disabled?: boolean
}

const AssetCard: React.FC<Props> = (props): JSX.Element => {
  const {
    asset,
    assets = [],
    price = bn(0),
    priceIndex,
    slip,
    priceAsset,
    title = '',
    percentValue = NaN,
    withSearch = false,
    searchDisable = [],
    onChangeAssetAmount = (_: BaseAmount) => {},
    onChangeAsset = (_: Asset) => {},
    onChangePercent = (_: number) => {},
    children = null,
    selectedAmount,
    maxAmount,
    disabled
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
    const sortedAssetData = assets.sort(ordAsset.compare)

    return (
      <AssetMenu
        assets={sortedAssetData}
        asset={asset}
        priceIndex={priceIndex}
        withSearch={withSearch}
        searchDisable={searchDisable}
        onSelect={handleChangeAsset}
      />
    )
  }, [assets, asset, priceIndex, withSearch, searchDisable, handleChangeAsset])

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
          <Styled.AssetNameLabel>{asset?.ticker ?? 'unknown'}</Styled.AssetNameLabel>
          <Styled.CardTopRow>
            <Styled.AssetSelect
              minWidth={wrapperWidth}
              showAssetName={false}
              assets={assets}
              asset={asset}
              onSelect={handleChangeAsset}>
              <Styled.AssetData>
                <Styled.InputBigNumber
                  disabled={disabled}
                  size="middle"
                  value={selectedAmountBn}
                  onChange={changeAssetAmountHandler}
                  decimal={selectedAmount.decimal}
                  max={maxAmountBn.toString()}
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
        <Slider
          disabled={disabled}
          value={percentValue}
          onChange={onChangePercent}
          tooltipPlacement="top"
          withLabel={true}
        />
      )}
      {children}
    </Styled.AssetCardWrapper>
  )
}

export default AssetCard
