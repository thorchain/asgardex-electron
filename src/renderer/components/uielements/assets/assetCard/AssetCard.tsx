import React, { useRef, useState, RefObject, useCallback, useMemo } from 'react'

import { BTC_DECIMAL } from '@xchainjs/xchain-bitcoin'
import {
  bn,
  Asset,
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
import * as O from 'fp-ts/lib/Option'
import { useIntl } from 'react-intl'

import { Network } from '../../../../../shared/api/types'
import { isLedgerWallet } from '../../../../../shared/utils/guard'
import { WalletType } from '../../../../../shared/wallet/types'
import { ZERO_BASE_AMOUNT } from '../../../../const'
import { isBtcAsset } from '../../../../helpers/assetHelper'
import { ordAsset } from '../../../../helpers/fp/ord'
import { useClickOutside } from '../../../../hooks/useOutsideClick'
import { InfoIcon } from '../../info'
import * as InfoIconStyled from '../../info/InfoIcon.styles'
import { Slider } from '../../slider'
import { AssetMenu } from '../assetMenu'
import * as Styled from './AssetCard.styles'

export type Props = {
  asset: Asset
  walletType: O.Option<WalletType>
  walletTypeDisabled: boolean
  walletTypeTooltip?: string
  walletTypeTooltipColor?: InfoIconStyled.Color
  onChangeWalletType: (walletType: WalletType) => void
  assets: Asset[]
  assetBalance: BaseAmount
  selectedAmount: BaseAmount
  maxAmount: BaseAmount
  price: BigNumber
  priceAsset?: Asset
  slip?: number
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
  minAmountError?: boolean
  minAmountLabel?: string
}

export const AssetCard: React.FC<Props> = (props): JSX.Element => {
  const {
    asset,
    walletType: oWalletType,
    walletTypeDisabled,
    onChangeWalletType,
    walletTypeTooltip,
    walletTypeTooltipColor = 'primary',
    assets = [],
    price = bn(0),
    slip,
    priceAsset,
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
    onAfterSliderChange,
    minAmountError = false,
    minAmountLabel = '',
    assetBalance
  } = props

  const intl = useIntl()

  const [openDropdown, setOpenDropdown] = useState(false)
  const ref: RefObject<HTMLDivElement> = useRef(null)

  const selectedAmountBn = useMemo(() => baseToAsset(selectedAmount).amount(), [selectedAmount])
  const maxAmountBn = useMemo(() => baseToAsset(maxAmount).amount(), [maxAmount])

  useClickOutside<HTMLDivElement>(ref, () => setOpenDropdown(false))

  const handleChangeAsset = useCallback(
    (asset: Asset) => {
      onChangeAsset(asset)
      onChangeAssetAmount(ZERO_BASE_AMOUNT)
    },
    [onChangeAsset, onChangeAssetAmount]
  )

  const renderMenu = useCallback(() => {
    const sortedAssets = assets.sort(ordAsset.compare)

    return (
      <AssetMenu
        assets={sortedAssets}
        asset={asset}
        withSearch={withSearch}
        searchDisable={searchDisable}
        onSelect={handleChangeAsset}
        network={network}
      />
    )
  }, [assets, asset, withSearch, searchDisable, handleChangeAsset, network])

  const withPercentSlider = useMemo(() => !isNaN(percentValue), [percentValue])

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

  const balanceLabel = useMemo(() => {
    const formatted = formatAssetAmountCurrency({ amount: baseToAsset(assetBalance), decimal: 2, asset })
    return <Styled.BalanceLabel key={'balance label'}>{formatted}</Styled.BalanceLabel>
  }, [asset, assetBalance])

  return (
    <Styled.AssetCardWrapper ref={ref}>
      <Dropdown overlay={renderMenu()} trigger={[]} visible={openDropdown}>
        <Styled.CardBorderWrapper error={minAmountError}>
          <Styled.CardHeader>
            <Styled.AssetLabel asset={asset} />
            {balanceLabel}
          </Styled.CardHeader>
          <Styled.CardTopRow>
            <Styled.AssetDataWrapper>
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
              <Styled.AssetSelectContainer>
                <Styled.AssetSelect
                  showAssetName={false}
                  assets={assets}
                  asset={asset}
                  onSelect={handleChangeAsset}
                  network={network}
                />

                <Styled.WalletTypeContainer>
                  {FP.pipe(
                    oWalletType,
                    O.fold(
                      () => <></>,
                      (walletType) => (
                        <>
                          <Styled.CheckButton
                            checked={isLedgerWallet(walletType)}
                            clickHandler={(checked) => onChangeWalletType(checked ? 'ledger' : 'keystore')}
                            disabled={walletTypeDisabled}>
                            {intl.formatMessage({ id: 'ledger.title' })}
                          </Styled.CheckButton>
                          {walletTypeTooltip && <InfoIcon color={walletTypeTooltipColor} tooltip={walletTypeTooltip} />}
                        </>
                      )
                    )
                  )}
                </Styled.WalletTypeContainer>
              </Styled.AssetSelectContainer>
            </Styled.AssetDataWrapper>
          </Styled.CardTopRow>
        </Styled.CardBorderWrapper>
      </Dropdown>
      {minAmountLabel && (
        <Styled.MinAmountLabel color={minAmountError ? 'error' : 'normal'}>{minAmountLabel}</Styled.MinAmountLabel>
      )}
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
