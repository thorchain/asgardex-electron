import React, { useRef, useState, RefObject, useCallback, useMemo, useEffect } from 'react'

import { bn, formatBN, Asset, assetFromString, BaseAmount, baseToAsset } from '@thorchain/asgardex-util'
import { Dropdown } from 'antd'
import BigNumber from 'bignumber.js'
import { sortBy as _sortBy } from 'lodash'

import { useClickOutside } from '../../../../hooks/useOutsideClick'
import { ZERO_BN } from '../../../../services/const'
import { PriceDataIndex } from '../../../../services/midgard/types'
import { AssetPair } from '../../../../types/asgardex'
import Label from '../../label'
import Slider from '../../slider'
import AssetMenu from '../assetMenu'
import * as Styled from './AssetCard.style'

type Props = {
  asset: Asset
  assetData?: AssetPair[]
  amount: BaseAmount
  selectedAmount: BaseAmount
  price: BigNumber
  priceIndex?: PriceDataIndex
  unit?: string
  slip?: number
  title?: string
  searchDisable?: string[]
  withPercentSlider?: boolean
  withSearch?: boolean
  // Base amount as BigNumber
  onChange?: (value: BigNumber) => void
  onChangeAsset?: (asset: Asset) => void
  className?: string
}

const AssetCard: React.FC<Props> = (props): JSX.Element => {
  const {
    asset,
    amount,
    assetData = [],
    price = bn(0),
    priceIndex,
    slip,
    unit = 'RUNE',
    className = '',
    title = '',
    withPercentSlider = false,
    withSearch = false,
    searchDisable = [],
    onChange = (_: BigNumber) => {},
    onChangeAsset = (_: Asset) => {},
    children = null,
    selectedAmount
  } = props

  const [openDropdown, setOpenDropdown] = useState(false)
  const [wrapperWidth, setWrapperWidth] = useState(0)
  const ref: RefObject<HTMLDivElement> = useRef(null)

  const selectedAmountBn = useMemo(() => baseToAsset(selectedAmount).amount(), [selectedAmount])
  const amountBn = useMemo(() => baseToAsset(amount).amount(), [amount])

  useClickOutside<HTMLDivElement>(ref, () => setOpenDropdown(false))

  const handleChangeAsset = useCallback(
    (asset: string | Asset) => {
      const targetAsset = typeof asset === 'string' ? assetFromString(asset) : asset
      if (targetAsset) {
        onChangeAsset(targetAsset)
        onChange(ZERO_BN)
      }
    },
    [onChangeAsset, onChange]
  )

  const renderMenu = useCallback(() => {
    const sortedAssetData = _sortBy(assetData, ['asset'])

    return (
      <AssetMenu
        assetData={sortedAssetData}
        asset={asset}
        priceIndex={priceIndex}
        withSearch={withSearch}
        searchDisable={searchDisable}
        onSelect={handleChangeAsset}
      />
    )
  }, [assetData, asset, priceIndex, withSearch, searchDisable, handleChangeAsset])

  const onPercentChange = useCallback(
    (percent: number) => {
      onChange(amountBn.multipliedBy(percent / 100))
    },
    [amountBn, onChange]
  )

  const percentValue = useMemo(() => selectedAmountBn.dividedBy(amountBn).multipliedBy(100).toNumber(), [
    selectedAmountBn,
    amountBn
  ])

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

  return (
    <Styled.AssetCardWrapper ref={ref} className={`AssetCard-wrapper ${className}`}>
      {!!title && <Label className="title-label">{title}</Label>}

      <Dropdown overlay={renderMenu()} trigger={[]} visible={openDropdown}>
        <Styled.CardBorderWrapper>
          <Styled.AssetNameLabel>{asset?.ticker ?? 'unknown'}</Styled.AssetNameLabel>
          <Styled.CardTopRow>
            <Styled.AssetSelect
              minWidth={wrapperWidth}
              showAssetName={false}
              assetData={assetData}
              asset={asset}
              onSelect={handleChangeAsset}>
              <Styled.AssetData>
                <Styled.InputBigNumber size="middle" value={selectedAmountBn} onChange={onChange} />
                <Styled.AssetCardFooter>
                  <Styled.FooterLabel>{`${unit} ${formatBN(selectedAmountBn.multipliedBy(price))}`}</Styled.FooterLabel>
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
          key={'asset amount slider'}
          value={percentValue}
          onChange={onPercentChange}
          tooltipPlacement="top"
          withLabel={true}
        />
      )}
      {children}
    </Styled.AssetCardWrapper>
  )
}

export default AssetCard
