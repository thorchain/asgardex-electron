import React, { useCallback, useEffect, useMemo, useState } from 'react'

import * as RD from '@devexperts/remote-data-ts'
import { Balance, Balances } from '@thorchain/asgardex-binance'
import {
  Asset,
  assetAmount,
  AssetAmount,
  assetToString,
  baseAmount,
  bn,
  formatBN,
  PoolData
} from '@thorchain/asgardex-util'
import BigNumber from 'bignumber.js'
import * as A from 'fp-ts/lib/Array'
import * as O from 'fp-ts/lib/Option'
import { pipe } from 'fp-ts/pipeable'
import { useIntl } from 'react-intl'
import { useHistory } from 'react-router'

import { swap } from '../../routes/swap'
import { PoolDetails } from '../../services/midgard/types'
import { getPoolDetailsHashMap } from '../../services/midgard/utils'
import AssetInput from '../uielements/assets/assetInput'
import AssetSelect from '../uielements/assets/assetSelect'
import Drag from '../uielements/drag'
import Slider from '../uielements/slider'
import { CurrencyInfo } from './CurrencyInfo'
import * as Styled from './Swap.styles'
import { getSwapData, getSwapMemo } from './utils'

type SwapProps = {
  balance?: number
  availableAssets: { asset: Asset; priceRune: BigNumber }[]
  sourceAsset: Asset
  targetAsset: Asset
  onConfirmSwap: (source: Asset, amount: AssetAmount, memo: string) => void
  poolDetails?: PoolDetails
  isWalletEnabled?: boolean
  assetsInWallet?: O.Option<string[]>
  balances?: RD.RemoteData<Error, Balances>
}

export const Swap = ({
  // balance,
  availableAssets,
  assetsInWallet = O.none,
  onConfirmSwap,
  sourceAsset: _sourceAsset,
  targetAsset: _targetAsset,
  poolDetails = [],
  isWalletEnabled = false,
  balances = RD.initial
}: SwapProps) => {
  const intl = useIntl()
  const history = useHistory()
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

  const balance = pipe(
    balances,
    RD.map(A.findFirst((balance) => balance.symbol === sourceAsset.symbol)),
    RD.getOrElse((): O.Option<Balance> => O.none)
  )

  const setChangeAmountFromPercentValue = useCallback(
    (percents) => {
      pipe(
        balance,
        O.map((balance) => setChangeAmount(bn(balance.free).multipliedBy(Number(percents) / 100)))
      )
    },
    [setChangeAmount, balance]
  )

  const sourceAssetPair = useMemo(() => {
    return availableAssets.find((asset) => asset.asset.symbol === sourceAsset.symbol)
  }, [availableAssets, sourceAsset])

  const targetAssetPair = useMemo(() => {
    return availableAssets.find((asset) => asset.asset.symbol === targetAsset.symbol)
  }, [availableAssets, targetAsset])

  const allAssets = useMemo(
    () =>
      availableAssets.map((asset) => ({
        asset: asset.asset,
        price: baseAmount(asset.priceRune)
      })),
    [availableAssets]
  )

  const assetsToSwapFrom = useMemo(() => {
    return pipe(
      allAssets,
      A.filter((asset) =>
        pipe(
          assetsInWallet,
          O.map((symbols) => symbols.includes(asset.asset.symbol)),
          O.getOrElse((): boolean => false)
        )
      ),
      (assets) => (assets.length ? assets : allAssets),
      A.filter((asset) => asset.asset.symbol !== sourceAsset.symbol && asset.asset.symbol !== targetAsset.symbol)
    )
  }, [allAssets, assetsInWallet, sourceAsset, targetAsset])

  const assetsToSwapTo = useMemo(() => {
    return allAssets.filter(
      (asset) => asset.asset.symbol !== sourceAsset.symbol && asset.asset.symbol !== targetAsset.symbol
    )
  }, [allAssets, sourceAsset, targetAsset])

  const canSwitchAssets = useMemo(
    () =>
      pipe(
        balances,
        RD.map((balances) => !!balances.find((balance) => balance.symbol === targetAsset.symbol)),
        RD.getOrElse(() => true)
      ),
    [balances, targetAsset]
  )

  const onSwapChange = useCallback(() => {
    if (!canSwitchAssets) {
      return
    }
    const tmp = sourceAsset
    setSourceAsset(targetAsset)
    setTargetAsset(tmp)
  }, [sourceAsset, targetAsset, canSwitchAssets])

  const swapData = useMemo(() => getSwapData(changeAmount, sourceAsset, targetAsset, poolData), [
    changeAmount,
    sourceAsset,
    targetAsset,
    poolData
  ])

  useEffect(() => {
    history.replace(
      swap.path({
        target: assetToString(sourceAsset),
        source: assetToString(targetAsset)
      })
    )
  }, [targetAsset, sourceAsset, history])

  const onSwapConfirmed = useCallback(() => {
    if (isWalletEnabled) {
      const memo = getSwapMemo(assetToString(targetAsset), '')
      onConfirmSwap(sourceAsset, assetAmount(changeAmount), memo)
    }
  }, [onConfirmSwap, changeAmount, isWalletEnabled, sourceAsset, targetAsset])

  return (
    <Styled.Container>
      <Styled.ContentContainer>
        <Styled.Header>
          {intl.formatMessage({ id: 'swap.swapping' })} {sourceAsset.ticker} {' >> '} {targetAsset.ticker}
        </Styled.Header>

        <Styled.FormContainer>
          <Styled.CurrencyInfoContainer>
            <CurrencyInfo slip={swapData.slip} from={sourceAssetPair} to={targetAssetPair} />
          </Styled.CurrencyInfoContainer>

          <Styled.ValueItemContainer className={'valueItemContainer-out'}>
            <AssetInput
              title={intl.formatMessage({ id: 'swap.input' })}
              label={pipe(
                balance,
                O.map((balance) => `${intl.formatMessage({ id: 'swap.balance' })}: ${bn(balance.free).toFormat(2)}`),
                O.getOrElse(() => '')
              )}
              onChange={setChangeAmount}
              amount={changeAmount}
            />
            <AssetSelect onSelect={setSourceAsset} asset={sourceAsset} assetData={assetsToSwapFrom} />
          </Styled.ValueItemContainer>

          <Styled.ValueItemContainer className={'valueItemContainer-percent'}>
            <Styled.SliderContainer>
              {pipe(
                balance,
                O.map((balance) => (
                  <Slider
                    key={'swap percentage slider'}
                    value={(changeAmount.toNumber() / bn(balance.free).toNumber()) * 100}
                    onChange={setChangeAmountFromPercentValue}
                    tooltipVisible={true}
                    withLabel={true}
                    tooltipPlacement={'top'}
                  />
                )),
                O.toNullable
              )}
            </Styled.SliderContainer>

            <Styled.SwapOutlined disabled={!canSwitchAssets} onClick={onSwapChange} />
          </Styled.ValueItemContainer>

          <Styled.ValueItemContainer className={'valueItemContainer-in'}>
            <Styled.InValue>
              <Styled.InValueTitle>{intl.formatMessage({ id: 'swap.output' })}:</Styled.InValueTitle>
              <div>{formatBN(swapData.swapResult)}</div>
            </Styled.InValue>
            <AssetSelect
              onSelect={setTargetAsset}
              asset={targetAsset}
              assetData={assetsToSwapTo}
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
          disabled={!isWalletEnabled || changeAmount.eq(0)}
          onConfirm={onSwapConfirmed}
          title={intl.formatMessage({ id: 'swap.drag' })}
          source={sourceAsset}
          target={targetAsset}
        />
        <div>fee: {swapData.fee.toFormat(5)}</div>
      </Styled.SubmitContainer>
    </Styled.Container>
  )
}
