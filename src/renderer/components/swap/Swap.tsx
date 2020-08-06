import React, { useCallback, useMemo, useState } from 'react'

import { Asset, assetToString, baseAmount, bn, getValueOfAsset1InAsset2, PoolData } from '@thorchain/asgardex-util'
import BigNumber from 'bignumber.js'
import { useIntl } from 'react-intl'

import { PoolDetails } from '../../services/midgard/types'
import { getPoolDetailsHashMap } from '../../services/midgard/utils'
import AssetInput from '../uielements/assets/assetInput'
import AssetSelect from '../uielements/assets/assetSelect'
import Drag from '../uielements/drag'
import Slider from '../uielements/slider'
import { CurrencyInfo } from './CurrencyInfo'
import * as Styled from './Swap.styles'

type SwapProps = {
  balance?: number
  availableAssets: { asset: Asset; priceRune: BigNumber }[]
  sourceAsset: Asset
  targetAsset: Asset
  onConfirmSwap: (source: Asset, target: Asset, amount: BigNumber) => void
  poolDetails?: PoolDetails
}

export const Swap = ({
  balance,
  availableAssets,
  onConfirmSwap,
  sourceAsset: _sourceAsset,
  targetAsset: _targetAsset,
  poolDetails = []
}: SwapProps) => {
  const intl = useIntl()
  // convert to hash map here instead of using getPoolDetail
  const poolData: Record<string, PoolData> = useMemo(() => {
    return getPoolDetailsHashMap(poolDetails)
  }, [poolDetails])

  const initialSourceAsset = useMemo(() => {
    const found = availableAssets.find((a) => _sourceAsset.symbol === a.asset.symbol)
    return found ? found.asset : availableAssets[0].asset
  }, [availableAssets, _sourceAsset])

  const initialTargetAsset = useMemo(() => {
    const found = availableAssets.find((a) => _targetAsset.symbol === a.asset.symbol)
    return found ? found.asset : availableAssets[0].asset
  }, [availableAssets, _targetAsset])

  const [sourceAsset, setSourceAsset] = useState(initialSourceAsset)
  const [targetAsset, setTargetAsset] = useState(initialTargetAsset)

  const [changeAmount, setChangeAmount] = useState(bn(0))

  const setChangeAmountFromPercentValue = useCallback(
    (s) => {
      if (balance) {
        setChangeAmount(bn((s * balance) / 100))
      }
    },
    [setChangeAmount, balance]
  )

  const sourceAssetPair = useMemo(() => {
    return availableAssets.find((asset) => asset.asset.symbol === sourceAsset.symbol)
  }, [availableAssets, sourceAsset])

  const targetAssetPair = useMemo(() => {
    return availableAssets.find((asset) => asset.asset.symbol === targetAsset.symbol)
  }, [availableAssets, targetAsset])

  const assets = useMemo(
    () =>
      availableAssets.map((asset) => ({
        asset: asset.asset,
        price: baseAmount(asset.priceRune)
      })),
    [availableAssets]
  )

  const targetResultValue = useMemo(
    () =>
      getValueOfAsset1InAsset2(
        baseAmount(changeAmount),
        poolData[assetToString(sourceAsset)],
        poolData[assetToString(targetAsset)]
      )
        .amount()
        .toFormat(2)
        .toString(),
    [changeAmount, sourceAsset, targetAsset, poolData]
  )

  return (
    <Styled.Container>
      <Styled.ContentContainer>
        <Styled.Header>{intl.formatMessage({ id: 'swap.swapping' })}</Styled.Header>

        <Styled.FormContainer>
          <Styled.CurrencyInfoContainer>
            <CurrencyInfo from={sourceAssetPair} to={targetAssetPair} />
          </Styled.CurrencyInfoContainer>

          <Styled.ValueItemContainer className={'valueItemContainer-out'}>
            <AssetInput
              title={intl.formatMessage({ id: 'swap.input' })}
              label={balance ? `${intl.formatMessage({ id: 'swap.balance' })}: ${balance}` : ''}
              onChange={setChangeAmount}
              amount={changeAmount}
            />
            <AssetSelect onSelect={setSourceAsset} asset={sourceAsset} assetData={assets} />
          </Styled.ValueItemContainer>

          <Styled.ValueItemContainer className={'valueItemContainer-percent'}>
            <Styled.SliderContainer>
              {balance && (
                <Slider
                  value={(changeAmount.toNumber() / (balance || 1)) * 100}
                  onChange={setChangeAmountFromPercentValue}
                  tooltipVisible={true}
                  withLabel={true}
                  tooltipPlacement={'top'}
                />
              )}
            </Styled.SliderContainer>

            <Styled.SwapOutlined />
          </Styled.ValueItemContainer>

          <Styled.ValueItemContainer className={'valueItemContainer-in'}>
            <Styled.InValue>
              <Styled.InValueTitle>{intl.formatMessage({ id: 'swap.output' })}:</Styled.InValueTitle>
              <div>{targetResultValue}</div>
            </Styled.InValue>
            <AssetSelect
              onSelect={setTargetAsset}
              asset={targetAsset}
              assetData={assets}
              priceIndex={availableAssets.reduce((acc, asset) => {
                return {
                  ...acc,
                  [asset.asset.ticker]: baseAmount(asset.priceRune).amount()
                }
              }, {})}
            />
          </Styled.ValueItemContainer>
        </Styled.FormContainer>
      </Styled.ContentContainer>

      <Styled.SubmitContainer>
        <Drag
          onConfirm={() => onConfirmSwap(sourceAsset, targetAsset, changeAmount)}
          title={intl.formatMessage({ id: 'swap.drag' })}
          source={sourceAsset}
          target={targetAsset}
        />
      </Styled.SubmitContainer>
    </Styled.Container>
  )
}
