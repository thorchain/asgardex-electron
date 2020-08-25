import React, { useCallback, useMemo, useState } from 'react'

import * as RD from '@devexperts/remote-data-ts'
import { Balances } from '@thorchain/asgardex-binance'
import {
  Asset,
  assetAmount,
  AssetAmount,
  assetToString,
  baseAmount,
  bn,
  EMPTY_ASSET,
  formatBN,
  PoolData
} from '@thorchain/asgardex-util'
import BigNumber from 'bignumber.js'
import { eqString } from 'fp-ts/Eq'
import * as A from 'fp-ts/lib/Array'
import * as O from 'fp-ts/lib/Option'
import { pipe } from 'fp-ts/pipeable'
import { useIntl } from 'react-intl'
import { useHistory } from 'react-router'

import { sequenceTOption } from '../../helpers/fpHelpers'
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
  sourceAsset: O.Option<Asset>
  targetAsset: O.Option<Asset>
  onConfirmSwap: (source: Asset, amount: AssetAmount, memo: string) => void
  poolDetails?: PoolDetails
  balances?: RD.RemoteData<Error, Balances>
}

export const Swap = ({
  availableAssets,
  onConfirmSwap,
  sourceAsset: _sourceAsset,
  targetAsset: _targetAsset,
  poolDetails = [],
  balances = RD.initial
}: SwapProps) => {
  const intl = useIntl()
  const history = useHistory()
  // convert to hash map here instead of using getPoolDetail
  const poolData: Record<string, PoolData> = useMemo(() => {
    return getPoolDetailsHashMap(poolDetails)
  }, [poolDetails])

  const sourceAsset = useMemo(() => {
    return pipe(
      _sourceAsset,
      O.chain((sourceAsset) =>
        pipe(
          availableAssets,
          A.findFirst((asset) => sourceAsset.symbol === asset.asset.symbol)
        )
      ),
      O.alt(() => pipe(availableAssets, A.head)),
      O.map((a) => a.asset)
    )
  }, [availableAssets, _sourceAsset])

  const targetAsset = useMemo(() => {
    return pipe(
      _targetAsset,
      O.chain((targetAsset) =>
        pipe(
          availableAssets,
          A.findFirst((asset) => targetAsset.symbol === asset.asset.symbol)
        )
      ),
      O.alt(() => pipe(availableAssets, A.head)),
      O.map((a) => a.asset)
      // O.getOrElse(() => availableAssets[0].asset)
    )
  }, [availableAssets, _targetAsset])

  const setSourceAsset = useCallback(
    (asset: Asset) => {
      pipe(
        targetAsset,
        O.map((targetAsset) =>
          history.replace(
            swap.path({
              source: assetToString(asset),
              target: assetToString(targetAsset)
            })
          )
        )
      )
    },
    [history, targetAsset]
  )

  const setTargetAsset = useCallback(
    (asset: Asset) => {
      pipe(
        sourceAsset,
        O.map((sourceAsset) =>
          history.replace(
            swap.path({
              source: assetToString(sourceAsset),
              target: assetToString(asset)
            })
          )
        )
      )
    },
    [history, sourceAsset]
  )

  const [changeAmount, setChangeAmount] = useState(bn(0))

  const balance = useMemo(
    () =>
      pipe(
        sequenceTOption(pipe(balances, RD.toOption), sourceAsset),
        O.chain(([balances, sourceAsset]) =>
          pipe(
            balances,
            A.findFirst((balance) => balance.symbol === sourceAsset.symbol)
          )
        )
      ),
    [balances, sourceAsset]
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

  const sourceAssetPair = useMemo(
    () =>
      pipe(
        sourceAsset,
        O.chain((sourceAsset) =>
          pipe(
            availableAssets,
            A.findFirst((asset) => asset.asset.symbol === sourceAsset.symbol)
          )
        )
      ),
    [availableAssets, sourceAsset]
  )

  const targetAssetPair = useMemo(() => {
    return pipe(
      targetAsset,
      O.chain((targetAsset) =>
        pipe(
          availableAssets,
          A.findFirst((asset) => asset.asset.symbol === targetAsset.symbol)
        )
      )
    )
  }, [availableAssets, targetAsset])

  const allAssets = useMemo(
    () =>
      availableAssets.map((asset) => ({
        asset: asset.asset,
        price: baseAmount(asset.priceRune)
      })),
    [availableAssets]
  )

  const assetSymbolsInWallet = useMemo(() => pipe(balances, RD.map(A.map((balance) => balance.symbol)), RD.toOption), [
    balances
  ])

  const assetsToSwapFrom = useMemo(() => {
    const availableAssets = pipe(
      allAssets,
      A.filter((asset) =>
        pipe(
          assetSymbolsInWallet,
          O.map((symbols) => symbols.includes(asset.asset.symbol)),
          O.getOrElse((): boolean => false)
        )
      ),
      (assets) => (assets.length ? assets : allAssets)
    )

    return pipe(
      sequenceTOption(sourceAsset, targetAsset),
      O.map(([sourceAsset, targetAsset]) =>
        pipe(
          availableAssets,
          A.filter((asset) => asset.asset.symbol !== sourceAsset.symbol && asset.asset.symbol !== targetAsset.symbol)
        )
      ),
      O.getOrElse(() => allAssets)
    )
  }, [allAssets, assetSymbolsInWallet, sourceAsset, targetAsset])

  const assetsToSwapTo = useMemo(() => {
    return pipe(
      sequenceTOption(sourceAsset, targetAsset),
      O.map(([sourceAsset, targetAsset]) =>
        pipe(
          allAssets,
          A.filter((asset) => asset.asset.symbol !== sourceAsset.symbol && asset.asset.symbol !== targetAsset.symbol)
        )
      ),
      O.getOrElse(() => allAssets)
    )
  }, [allAssets, sourceAsset, targetAsset])

  const canSwitchAssets = useMemo(
    () =>
      pipe(
        balances,
        RD.map(A.map((balance) => balance.symbol)),
        RD.toOption,
        (balances) => sequenceTOption(balances, targetAsset),
        O.map(([balances, targetAsset]) => pipe(balances, A.elem(eqString)(targetAsset.symbol))),
        O.getOrElse(() => true)
      ),
    [balances, targetAsset]
  )

  const onSwitchAssets = useCallback(() => {
    if (!canSwitchAssets) {
      return
    }
    pipe(
      sequenceTOption(sourceAsset, targetAsset),
      // eslint-disable-next-line  array-callback-return
      O.map(([sourceAsset, targetAsset]) => {
        history.replace(
          swap.path({
            target: assetToString(sourceAsset),
            source: assetToString(targetAsset)
          })
        )
      })
    )
  }, [history, sourceAsset, targetAsset, canSwitchAssets])

  const swapData = useMemo(() => getSwapData(changeAmount, sourceAsset, targetAsset, poolData), [
    changeAmount,
    sourceAsset,
    targetAsset,
    poolData
  ])

  const balanceLabel = useMemo(
    () =>
      pipe(
        balance,
        O.map((balance) => `${intl.formatMessage({ id: 'swap.balance' })}: ${formatBN(bn(balance.free))}`),
        O.getOrElse(() => '')
      ),
    [balance, intl]
  )

  const isSwapDisabled = useMemo(
    () =>
      changeAmount.eq(0) ||
      pipe(
        balances,
        RD.map(A.isEmpty),
        RD.getOrElse(() => false)
      ),
    [balances, changeAmount]
  )

  const onSwapConfirmed = useCallback(() => {
    console.log('sourceAsset --- ', sourceAsset, 'targetAsset --- ', targetAsset)
    pipe(
      sequenceTOption(sourceAsset, targetAsset),
      // eslint-disable-next-line  array-callback-return
      O.map(([sourceAsset, targetAsset]) => {
        // @todo thatStrangeGuy is address empty ?
        const memo = getSwapMemo(assetToString(targetAsset), '')
        onConfirmSwap(sourceAsset, assetAmount(changeAmount), memo)
      })
    )
  }, [onConfirmSwap, changeAmount, sourceAsset, targetAsset])

  const slider = useMemo(
    () =>
      pipe(
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
      ),
    [balance, changeAmount, setChangeAmountFromPercentValue]
  )

  return (
    <Styled.Container>
      <Styled.ContentContainer>
        <Styled.Header>
          {pipe(
            sequenceTOption(sourceAsset, targetAsset),
            O.map(
              ([sourceAsset, targetAsset]) =>
                `${intl.formatMessage({ id: 'swap.swapping' })} ${sourceAsset.ticker} >> ${targetAsset.ticker}`
            ),
            O.getOrElse(() => 'No such assets')
          )}
        </Styled.Header>

        <Styled.FormContainer>
          <Styled.CurrencyInfoContainer>
            <CurrencyInfo slip={swapData.slip} from={sourceAssetPair} to={targetAssetPair} />
          </Styled.CurrencyInfoContainer>

          <Styled.ValueItemContainer className={'valueItemContainer-out'}>
            <AssetInput
              title={intl.formatMessage({ id: 'swap.input' })}
              label={balanceLabel}
              onChange={setChangeAmount}
              amount={changeAmount}
            />
            <AssetSelect
              onSelect={setSourceAsset}
              asset={pipe(
                sourceAsset,
                O.getOrElse(() => EMPTY_ASSET)
              )}
              assetData={assetsToSwapFrom}
            />
          </Styled.ValueItemContainer>

          <Styled.ValueItemContainer className={'valueItemContainer-percent'}>
            <Styled.SliderContainer>{slider}</Styled.SliderContainer>
            <Styled.SwapOutlined disabled={!canSwitchAssets} onClick={onSwitchAssets} />
          </Styled.ValueItemContainer>

          <Styled.ValueItemContainer className={'valueItemContainer-in'}>
            <Styled.InValue>
              <Styled.InValueTitle>{intl.formatMessage({ id: 'swap.output' })}:</Styled.InValueTitle>
              <div>{formatBN(swapData.swapResult)}</div>
            </Styled.InValue>
            <AssetSelect
              onSelect={setTargetAsset}
              asset={pipe(
                targetAsset,
                O.getOrElse(() => EMPTY_ASSET)
              )}
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
          disabled={isSwapDisabled}
          onConfirm={onSwapConfirmed}
          title={intl.formatMessage({ id: 'swap.drag' })}
          source={pipe(
            sourceAsset,
            O.getOrElse(() => EMPTY_ASSET)
          )}
          target={pipe(
            targetAsset,
            O.getOrElse(() => EMPTY_ASSET)
          )}
        />
        <div>fee: {formatBN(swapData.fee)}</div>
      </Styled.SubmitContainer>
    </Styled.Container>
  )
}
