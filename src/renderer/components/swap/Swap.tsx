import React, { useCallback, useMemo, useState } from 'react'

import * as RD from '@devexperts/remote-data-ts'
import { Balances } from '@thorchain/asgardex-binance'
import { Transfer } from '@thorchain/asgardex-binance'
import { Transfer as TransferWs } from '@thorchain/asgardex-binance/lib/types/binance-ws'
import {
  Asset,
  assetAmount,
  AssetAmount,
  assetToBase,
  assetToString,
  baseAmount,
  bn,
  EMPTY_ASSET,
  formatBN,
  getValueOfAsset1InAsset2,
  PoolData
} from '@thorchain/asgardex-util'
import { Spin } from 'antd'
import { eqString } from 'fp-ts/Eq'
import * as A from 'fp-ts/lib/Array'
import * as O from 'fp-ts/lib/Option'
import { pipe } from 'fp-ts/pipeable'
import { useIntl } from 'react-intl'
import { useHistory } from 'react-router'

import { sequenceTOption } from '../../helpers/fpHelpers'
import { swap } from '../../routes/swap'
import { AssetWithPrice } from '../../services/binance/types'
import { getAssetBalance } from '../../services/binance/utils'
import { PoolDetails } from '../../services/midgard/types'
import { getPoolDetailsHashMap } from '../../services/midgard/utils'
import { TxStatus, TxTypes } from '../../types/asgardex'
import { PricePool } from '../../views/pools/types'
import SwapModal from '../modal/swapModal'
import { CalcResult } from '../modal/swapModal/types'
import AssetSelect from '../uielements/assets/assetSelect'
import Drag from '../uielements/drag'
import Modal from '../uielements/modal'
import Slider from '../uielements/slider'
import { CurrencyInfo } from './CurrencyInfo'
import * as Styled from './Swap.styles'
import { getSwapData, getSwapMemo, pairAssetToPlain, pickAssetPair } from './utils'

type SwapProps = {
  balance?: number
  availableAssets: AssetWithPrice[]
  sourceAsset: O.Option<Asset>
  targetAsset: O.Option<Asset>
  onConfirmSwap: (source: Asset, amount: AssetAmount, memo: string) => void
  poolDetails?: PoolDetails
  balances?: RD.RemoteData<Error, Balances>
  txWithState?: RD.RemoteData<Error, { tx: Transfer; state: O.Option<TransferWs> }>
  resetTx?: () => void
  goToTransaction?: (txHash: string) => void
  activePricePool: PricePool
}

export const Swap = ({
  availableAssets,
  onConfirmSwap,
  sourceAsset: sourceAssetProp,
  targetAsset: targetAssetProp,
  poolDetails = [],
  balances = RD.initial,
  txWithState = RD.initial,
  goToTransaction,
  resetTx,
  activePricePool
}: SwapProps) => {
  const intl = useIntl()
  const history = useHistory()
  // convert to hash map here instead of using getPoolDetail
  const poolData: Record<string, PoolData> = useMemo(() => getPoolDetailsHashMap(poolDetails), [poolDetails])
  const sourceAssetPair = useMemo(() => pickAssetPair(availableAssets, sourceAssetProp), [
    availableAssets,
    sourceAssetProp
  ])
  const targetAssetPair = useMemo(() => pickAssetPair(availableAssets, targetAssetProp), [
    availableAssets,
    targetAssetProp
  ])
  const sourceAsset = useMemo(() => pairAssetToPlain(sourceAssetPair), [sourceAssetPair])
  const targetAsset = useMemo(() => pairAssetToPlain(targetAssetPair), [targetAssetPair])
  const assetsToSwap = useMemo(() => sequenceTOption(sourceAsset, targetAsset), [sourceAsset, targetAsset])

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

  const balance = useMemo(() => getAssetBalance(balances, sourceAsset), [balances, sourceAsset])

  const setChangeAmountFromPercentValue = useCallback(
    (percents) => {
      pipe(
        balance,
        O.map((balance) => setChangeAmount(bn(balance.free).multipliedBy(Number(percents) / 100)))
      )
    },
    [setChangeAmount, balance]
  )

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
      assetsToSwap,
      O.map(([sourceAsset, targetAsset]) =>
        pipe(
          availableAssets,
          A.filter((asset) => asset.asset.symbol !== sourceAsset.symbol && asset.asset.symbol !== targetAsset.symbol)
        )
      ),
      O.getOrElse(() => allAssets)
    )
  }, [assetsToSwap, allAssets, assetSymbolsInWallet])

  const assetsToSwapTo = useMemo(() => {
    return pipe(
      assetsToSwap,
      O.map(([sourceAsset, targetAsset]) =>
        pipe(
          allAssets,
          A.filter((asset) => asset.asset.symbol !== sourceAsset.symbol && asset.asset.symbol !== targetAsset.symbol)
        )
      ),
      O.getOrElse(() => allAssets)
    )
  }, [assetsToSwap, allAssets])

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
      assetsToSwap,
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
  }, [assetsToSwap, history, canSwitchAssets])

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
        RD.getOrElse(() => true)
      ),
    [balances, changeAmount]
  )

  const onSwapConfirmed = useCallback(() => {
    pipe(
      assetsToSwap,
      // eslint-disable-next-line  array-callback-return
      O.map(([sourceAsset, targetAsset]) => {
        // @todo thatStrangeGuy is address empty ?
        const memo = getSwapMemo(targetAsset.symbol, '')
        onConfirmSwap(sourceAsset, assetAmount(changeAmount), memo)
      })
    )
  }, [assetsToSwap, onConfirmSwap, changeAmount])

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

  const pendingState = useMemo(
    () =>
      pipe(
        txWithState,
        RD.fold(
          () => null,
          () => <Spin />,
          (e) => (
            <Modal
              closable
              visible
              title={intl.formatMessage({ id: 'common.error' })}
              onOk={onSwapConfirmed}
              okText={intl.formatMessage({ id: 'common.retry' })}
              onCancel={resetTx}>
              {e.message}
            </Modal>
          ),
          (r) =>
            pipe(
              r.state,
              O.map(
                (): TxStatus => ({
                  modal: true,
                  value: 100,
                  status: false,
                  type: TxTypes.SWAP
                })
              ),
              O.alt(
                (): O.Option<TxStatus> =>
                  O.some({
                    modal: true,
                    value: 50,
                    status: true,
                    startTime: Date.now(),
                    type: TxTypes.SWAP
                  })
              ),
              O.chain((txStatus) => sequenceTOption(sourceAssetPair, targetAssetPair, O.some(txStatus))),
              O.map(([sourceAssetPair, targetAssetPair, txStatus]) => (
                <SwapModal
                  key={'swap modal result'}
                  baseAsset={activePricePool.asset}
                  calcResult={{ slip: swapData.slip } as CalcResult}
                  swapSource={sourceAssetPair.asset}
                  swapTarget={targetAssetPair.asset}
                  priceFrom={
                    poolData[assetToString(sourceAssetPair.asset)] &&
                    getValueOfAsset1InAsset2(
                      assetToBase(assetAmount(1)),
                      poolData[assetToString(sourceAssetPair.asset)],
                      activePricePool.poolData
                    )
                  }
                  priceTo={
                    poolData[assetToString(targetAssetPair.asset)] &&
                    getValueOfAsset1InAsset2(
                      assetToBase(assetAmount(1)),
                      poolData[assetToString(targetAssetPair.asset)],
                      activePricePool.poolData
                    )
                  }
                  onClose={resetTx}
                  onClickFinish={resetTx}
                  isCompleted={!txStatus.status}
                  visible
                  onViewTxClick={(e) => {
                    e.preventDefault()
                    goToTransaction && goToTransaction(r.tx.hash)
                  }}
                  txStatus={{
                    ...txStatus,
                    hash: r.tx.hash
                  }}
                />
              )),
              O.toNullable
            )
        )
      ),
    [
      intl,
      txWithState,
      goToTransaction,
      onSwapConfirmed,
      resetTx,
      sourceAssetPair,
      targetAssetPair,
      swapData,
      activePricePool,
      poolData
    ]
  )

  return (
    <Styled.Container>
      <Styled.PendingContainer>{pendingState}</Styled.PendingContainer>
      <Styled.ContentContainer>
        <Styled.Header>
          {pipe(
            assetsToSwap,
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
            <Styled.AssetInput
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
              <div>{formatBN(swapData.swapResult, 7)}</div>
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
        <div>fee: 0.000375 + 1 RUNE</div>
      </Styled.SubmitContainer>
    </Styled.Container>
  )
}
