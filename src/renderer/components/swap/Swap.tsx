import React, { useCallback, useMemo, useState } from 'react'

import * as RD from '@devexperts/remote-data-ts'
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
  PoolData,
  baseToAsset
} from '@thorchain/asgardex-util'
import { Spin } from 'antd'
import { eqString } from 'fp-ts/Eq'
import * as A from 'fp-ts/lib/Array'
import * as FP from 'fp-ts/lib/function'
import * as O from 'fp-ts/lib/Option'
import { useIntl } from 'react-intl'
import { useHistory } from 'react-router'

import { sequenceTOption } from '../../helpers/fpHelpers'
import { getAssetWBByAsset } from '../../helpers/walletHelper'
import { swap } from '../../routes/swap'
import { AssetWithPrice } from '../../services/binance/types'
import { PoolDetails } from '../../services/midgard/types'
import { getPoolDetailsHashMap } from '../../services/midgard/utils'
import { AssetsWithBalanceRD, AssetWithBalance } from '../../services/wallet/types'
import { TxStatus, TxTypes } from '../../types/asgardex'
import { RUNEAsset } from '../../views/pools/types'
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
  assetsRD?: AssetsWithBalanceRD
  txWithState?: RD.RemoteData<Error, { tx: Transfer; state: O.Option<TransferWs> }>
  resetTx?: () => void
  goToTransaction?: (txHash: string) => void
  runeAsset?: RUNEAsset
  activePricePool: PricePool
}

export const Swap = ({
  availableAssets,
  onConfirmSwap,
  sourceAsset: sourceAssetProp,
  targetAsset: targetAssetProp,
  poolDetails = [],
  assetsRD = RD.initial,
  txWithState = RD.initial,
  goToTransaction,
  resetTx,
  runeAsset,
  activePricePool
}: SwapProps) => {
  const intl = useIntl()
  const history = useHistory()
  // convert to hash map here instead of using getPoolDetail
  const poolData: Record<string, PoolData> = useMemo(() => getPoolDetailsHashMap(poolDetails, runeAsset), [
    poolDetails,
    runeAsset
  ])
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
      FP.pipe(
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
      FP.pipe(
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

  const oAssetWB: O.Option<AssetWithBalance> = useMemo(() => getAssetWBByAsset(assetsRD, sourceAsset), [
    assetsRD,
    sourceAsset
  ])

  const setChangeAmountFromPercentValue = useCallback(
    (percents) => {
      FP.pipe(
        oAssetWB,
        O.map((assetWB) => {
          const assetAmountBN = baseToAsset(assetWB.amount).amount()
          return setChangeAmount(assetAmountBN.multipliedBy(Number(percents) / 100))
        })
      )
    },
    [setChangeAmount, oAssetWB]
  )

  const allAssets = useMemo(
    () =>
      availableAssets.map((asset) => ({
        asset: asset.asset,
        price: baseAmount(asset.priceRune)
      })),
    [availableAssets]
  )

  const assetSymbolsInWallet = useMemo(
    () => FP.pipe(assetsRD, RD.map(A.map(({ asset }) => asset.symbol)), RD.toOption),
    [assetsRD]
  )

  const assetsToSwapFrom = useMemo(() => {
    const availableAssets = FP.pipe(
      allAssets,
      A.filter((asset) =>
        FP.pipe(
          assetSymbolsInWallet,
          O.map((symbols) => symbols.includes(asset.asset.symbol)),
          O.getOrElse((): boolean => false)
        )
      ),
      (assets) => (assets.length ? assets : allAssets)
    )

    return FP.pipe(
      assetsToSwap,
      O.map(([sourceAsset, targetAsset]) =>
        FP.pipe(
          availableAssets,
          A.filter((asset) => asset.asset.symbol !== sourceAsset.symbol && asset.asset.symbol !== targetAsset.symbol)
        )
      ),
      O.getOrElse(() => allAssets)
    )
  }, [assetsToSwap, allAssets, assetSymbolsInWallet])

  const assetsToSwapTo = useMemo(() => {
    return FP.pipe(
      assetsToSwap,
      O.map(([sourceAsset, targetAsset]) =>
        FP.pipe(
          allAssets,
          A.filter((asset) => asset.asset.symbol !== sourceAsset.symbol && asset.asset.symbol !== targetAsset.symbol)
        )
      ),
      O.getOrElse(() => allAssets)
    )
  }, [assetsToSwap, allAssets])

  const canSwitchAssets = useMemo(
    () =>
      FP.pipe(
        assetsRD,
        RD.map(A.map(({ asset }) => asset.symbol)),
        RD.toOption,
        (balances) => sequenceTOption(balances, targetAsset),
        O.map(([balances, targetAsset]) => FP.pipe(balances, A.elem(eqString)(targetAsset.symbol))),
        O.getOrElse(() => true)
      ),
    [assetsRD, targetAsset]
  )

  const onSwitchAssets = useCallback(() => {
    if (!canSwitchAssets) {
      return
    }
    FP.pipe(
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
      FP.pipe(
        oAssetWB,
        O.map(
          (balance) =>
            `${intl.formatMessage({ id: 'swap.balance' })}: ${formatBN(baseToAsset(balance.amount).amount())}`
        ),
        O.getOrElse(() => '')
      ),
    [oAssetWB, intl]
  )

  const isSwapDisabled = useMemo(
    () =>
      changeAmount.eq(0) ||
      FP.pipe(
        assetsRD,
        RD.map(A.isEmpty),
        RD.getOrElse(() => true)
      ),
    [assetsRD, changeAmount]
  )

  const onSwapConfirmed = useCallback(() => {
    FP.pipe(
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
      FP.pipe(
        oAssetWB,
        O.map((assetWB) => (
          <Slider
            key={'swap percentage slider'}
            value={(changeAmount.toNumber() / baseToAsset(assetWB.amount).amount().toNumber()) * 100}
            onChange={setChangeAmountFromPercentValue}
            tooltipVisible={true}
            withLabel={true}
            tooltipPlacement={'top'}
          />
        )),
        O.toNullable
      ),
    [oAssetWB, changeAmount, setChangeAmountFromPercentValue]
  )

  const pendingState = useMemo(
    () =>
      FP.pipe(
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
            FP.pipe(
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
          {FP.pipe(
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
              asset={FP.pipe(
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
              asset={FP.pipe(
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
          source={FP.pipe(
            sourceAsset,
            O.getOrElse(() => EMPTY_ASSET)
          )}
          target={FP.pipe(
            targetAsset,
            O.getOrElse(() => EMPTY_ASSET)
          )}
        />
        <div>fee: 0.000375 + 1 RUNE</div>
      </Styled.SubmitContainer>
    </Styled.Container>
  )
}
