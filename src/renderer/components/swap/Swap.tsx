import React, { useCallback, useMemo, useState } from 'react'

import * as RD from '@devexperts/remote-data-ts'
import { getValueOfAsset1InAsset2, PoolData, getSwapMemo } from '@thorchain/asgardex-util'
import { Address, Balance } from '@xchainjs/xchain-client'
import {
  Asset,
  assetAmount,
  AssetAmount,
  assetToBase,
  assetToString,
  bn,
  formatBN,
  baseToAsset,
  BaseAmount,
  formatAssetAmountCurrency,
  AssetRuneNative
} from '@xchainjs/xchain-util'
import { Spin } from 'antd'
import { eqString } from 'fp-ts/Eq'
import * as A from 'fp-ts/lib/Array'
import * as FP from 'fp-ts/lib/function'
import * as O from 'fp-ts/lib/Option'
import { useIntl } from 'react-intl'
import { useHistory } from 'react-router'

import { ZERO_BASE_AMOUNT, ZERO_BN } from '../../const'
import { getChainAsset } from '../../helpers/chainHelper'
import { eqAsset } from '../../helpers/fp/eq'
import { sequenceTOption, sequenceTRD } from '../../helpers/fpHelpers'
import { getWalletBalanceByAsset } from '../../helpers/walletHelper'
import { swap } from '../../routes/swap'
import { AssetsWithPrice, AssetWithPrice, TxWithStateRD } from '../../services/binance/types'
import { SwapFeesRD } from '../../services/chain/types'
import { PoolDetails } from '../../services/midgard/types'
import { getPoolDetailsHashMap } from '../../services/midgard/utils'
import { NonEmptyWalletBalances } from '../../services/wallet/types'
import { TxStatus, TxTypes } from '../../types/asgardex'
import { PricePool } from '../../views/pools/Pools.types'
import { CurrencyInfo } from '../currency'
import { SwapModal } from '../modal/swap'
import { CalcResult } from '../modal/swap/SwapModal.types'
import { AssetSelect } from '../uielements/assets/assetSelect'
import { Fee, Fees } from '../uielements/fees'
import { Modal } from '../uielements/modal'
import { Slider } from '../uielements/slider'
import * as Styled from './Swap.styles'
import { getSwapData, assetWithPriceToAsset, pickAssetWithPrice } from './Swap.utils'

type SwapProps = {
  balance?: number
  availableAssets: AssetsWithPrice
  sourceAsset: O.Option<Asset>
  targetAsset: O.Option<Asset>
  onConfirmSwap: (source: Asset, amount: AssetAmount, memo: string) => void
  poolDetails?: PoolDetails
  walletBalances?: O.Option<NonEmptyWalletBalances>
  txWithState?: TxWithStateRD
  resetTx?: () => void
  goToTransaction?: (txHash: string) => void
  activePricePool: PricePool
  PasswordConfirmation: React.FC<{ onSuccess: () => void; onClose: () => void }>
  reloadFees?: () => void
  fees?: SwapFeesRD
  targetWalletAddress?: O.Option<Address>
}

export const Swap = ({
  availableAssets,
  onConfirmSwap,
  sourceAsset: sourceAssetProp,
  targetAsset: targetAssetProp,
  poolDetails = [],
  walletBalances = O.none,
  txWithState = RD.initial,
  goToTransaction,
  resetTx,
  activePricePool,
  PasswordConfirmation,
  reloadFees,
  fees: feesProp = RD.initial,
  targetWalletAddress = O.none
}: SwapProps) => {
  const intl = useIntl()
  const history = useHistory()
  // convert to hash map here instead of using getPoolDetail
  const poolData: Record<string, PoolData> = useMemo(() => getPoolDetailsHashMap(poolDetails, AssetRuneNative), [
    poolDetails
  ])
  const oSourceAssetWP: O.Option<AssetWithPrice> = useMemo(() => pickAssetWithPrice(availableAssets, sourceAssetProp), [
    availableAssets,
    sourceAssetProp
  ])
  const oTargetAssetWP: O.Option<AssetWithPrice> = useMemo(() => pickAssetWithPrice(availableAssets, targetAssetProp), [
    availableAssets,
    targetAssetProp
  ])
  const sourceAsset: O.Option<Asset> = useMemo(() => assetWithPriceToAsset(oSourceAssetWP), [oSourceAssetWP])
  const targetAsset: O.Option<Asset> = useMemo(() => assetWithPriceToAsset(oTargetAssetWP), [oTargetAssetWP])
  const assetsToSwap: O.Option<[Asset, Asset]> = useMemo(() => sequenceTOption(sourceAsset, targetAsset), [
    sourceAsset,
    targetAsset
  ])

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

  const oAssetWB: O.Option<Balance> = useMemo(() => getWalletBalanceByAsset(walletBalances, sourceAsset), [
    walletBalances,
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

  const allAssets = useMemo((): Asset[] => availableAssets.map(({ asset }) => asset), [availableAssets])

  const assetSymbolsInWallet: O.Option<string[]> = useMemo(
    () => FP.pipe(walletBalances, O.map(A.map(({ asset }) => asset.symbol))),
    [walletBalances]
  )

  const assetsToSwapFrom = useMemo((): Asset[] => {
    const filteredAssets: Asset[] = FP.pipe(
      allAssets,
      A.filter((asset) =>
        FP.pipe(
          assetSymbolsInWallet,
          O.map((symbols) => symbols.includes(asset.symbol)),
          O.getOrElse((): boolean => false)
        )
      ),
      (assets) => (assets.length ? assets : allAssets)
    )

    return FP.pipe(
      assetsToSwap,
      O.map(([sourceAsset, targetAsset]) =>
        FP.pipe(
          filteredAssets,
          A.filter((asset) => asset.symbol !== sourceAsset.symbol && asset.symbol !== targetAsset.symbol)
        )
      ),
      O.getOrElse(() => allAssets)
    )
  }, [allAssets, assetsToSwap, assetSymbolsInWallet])

  const assetsToSwapTo = useMemo((): Asset[] => {
    return FP.pipe(
      assetsToSwap,
      O.map(([sourceAsset, targetAsset]) =>
        FP.pipe(
          allAssets,
          A.filter((asset) => asset.symbol !== sourceAsset.symbol && asset.symbol !== targetAsset.symbol)
        )
      ),
      O.getOrElse(() => allAssets)
    )
  }, [allAssets, assetsToSwap])

  const canSwitchAssets = useMemo(
    () =>
      FP.pipe(
        walletBalances,
        O.map(A.map(({ asset }) => asset.symbol)),
        (oAssetSymbols) => sequenceTOption(oAssetSymbols, targetAsset),
        O.map(([balances, targetAsset]) => FP.pipe(balances, A.elem(eqString)(targetAsset.symbol))),
        O.getOrElse(() => true)
      ),
    [walletBalances, targetAsset]
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

  const [showPrivateModal, setShowPrivateModal] = useState(false)

  const onSwapConfirmed = useCallback(() => {
    setShowPrivateModal(true)
  }, [setShowPrivateModal])

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
          (error) => (
            <Modal
              closable
              visible
              title={intl.formatMessage({ id: 'common.error' })}
              onOk={onSwapConfirmed}
              okText={intl.formatMessage({ id: 'common.retry' })}
              onCancel={resetTx}>
              {error.message}
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
              O.chain((txStatus) => sequenceTOption(oSourceAssetWP, oTargetAssetWP, O.some(txStatus))),
              O.map(([sourceAssetWP, targetAssetWP, txStatus]) => (
                <SwapModal
                  key={'swap modal result'}
                  baseAsset={activePricePool.asset}
                  calcResult={{ slip: swapData.slip } as CalcResult}
                  swapSource={sourceAssetWP.asset}
                  swapTarget={targetAssetWP.asset}
                  priceFrom={
                    poolData[assetToString(sourceAssetWP.asset)] &&
                    getValueOfAsset1InAsset2(
                      assetToBase(assetAmount(1)),
                      poolData[assetToString(sourceAssetWP.asset)],
                      activePricePool.poolData
                    )
                  }
                  priceTo={
                    poolData[assetToString(targetAssetWP.asset)] &&
                    getValueOfAsset1InAsset2(
                      assetToBase(assetAmount(1)),
                      poolData[assetToString(targetAssetWP.asset)],
                      activePricePool.poolData
                    )
                  }
                  onClose={resetTx}
                  onClickFinish={resetTx}
                  isCompleted={!txStatus.status}
                  visible
                  onViewTxClick={(e) => {
                    e.preventDefault()
                    goToTransaction && goToTransaction(r.txHash)
                  }}
                  txStatus={{
                    ...txStatus,
                    hash: r.txHash
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
      oSourceAssetWP,
      oTargetAssetWP,
      swapData,
      activePricePool,
      poolData
    ]
  )

  const closePrivateModal = useCallback(() => {
    setShowPrivateModal(false)
  }, [setShowPrivateModal])

  const onPasswordValidationSucceed = useCallback(() => {
    FP.pipe(
      sequenceTOption(assetsToSwap, targetWalletAddress),
      // eslint-disable-next-line  array-callback-return
      O.map(([[sourceAsset, targetAsset], address]) => {
        const memo = getSwapMemo({ asset: targetAsset, address })
        closePrivateModal()
        onConfirmSwap(sourceAsset, assetAmount(changeAmount), memo)
      })
    )
  }, [assetsToSwap, onConfirmSwap, changeAmount, closePrivateModal, targetWalletAddress])

  const sourceChainFee: RD.RemoteData<Error, BaseAmount> = useMemo(
    () =>
      FP.pipe(
        feesProp,
        RD.map(({ source }) => source)
      ),
    [feesProp]
  )

  const targetChainFee: RD.RemoteData<Error, BaseAmount> = useMemo(
    () =>
      FP.pipe(
        feesProp,
        RD.map(({ target }) => target)
      ),
    [feesProp]
  )

  const sourceChainBalanceError: boolean = useMemo(
    () =>
      FP.pipe(
        sequenceTOption(sourceAsset, walletBalances),
        O.map(([sourceAsset, walletBalances]) => {
          // If sourceAsset is the same as source chain
          // we should subtract changeAmount
          const shouldSubtractChangeAmount = eqAsset.equals(sourceAsset, getChainAsset(sourceAsset.chain))

          const balanceMinusAmount = FP.pipe(
            walletBalances,
            A.findFirst((walletBalance) => eqAsset.equals(walletBalance.asset, sourceAsset)),
            O.map((sourceBalance) =>
              baseToAsset(sourceBalance.amount)
                .amount()
                .minus(shouldSubtractChangeAmount ? changeAmount : ZERO_BN)
            ),
            O.map(FP.flow(assetAmount, assetToBase))
          )

          return FP.pipe(
            sequenceTOption(balanceMinusAmount, FP.pipe(sourceChainFee, RD.toOption)),
            O.map(([leftBalance, sourceChainFee]) => {
              const sourceChainFeeAmount = sourceChainFee.amount()

              return leftBalance.amount().minus(sourceChainFeeAmount)
            }),
            O.map((result) => result.isNegative()),
            O.getOrElse((): boolean => false)
          )
        }),
        O.getOrElse((): boolean => false)
      ),
    [changeAmount, sourceAsset, walletBalances, sourceChainFee]
  )

  const sourceChainErrorLabel: JSX.Element = useMemo(() => {
    if (!sourceChainBalanceError) {
      return <></>
    }

    return FP.pipe(
      sequenceTOption(RD.toOption(sourceChainFee), oAssetWB),
      O.map(([fee, assetWB]) => (
        <Styled.BalanceErrorLabel key="sourceChainErrorLabel">
          {intl.formatMessage(
            { id: 'swap.errors.amount.balanceShouldCoverChainFee' },
            {
              balance: formatAssetAmountCurrency({
                asset: assetWB.asset,
                amount: baseToAsset(assetWB.amount),
                trimZeros: true
              }),
              fee: formatAssetAmountCurrency({ asset: assetWB.asset, trimZeros: true, amount: baseToAsset(fee) })
            }
          )}
        </Styled.BalanceErrorLabel>
      )),
      O.getOrElse(() => <></>)
    )
  }, [sourceChainBalanceError, intl, oAssetWB, sourceChainFee])

  const targetChainFeeAmountInTargetAsset: BaseAmount = useMemo(() => {
    const chainFee = FP.pipe(
      targetChainFee,
      RD.getOrElse(() => ZERO_BASE_AMOUNT)
    )

    return FP.pipe(
      targetAsset,
      O.map((asset) => {
        const chainAsset = getChainAsset(asset.chain)
        const chainAssetPoolData: PoolData | undefined = poolData[assetToString(chainAsset)]
        const assetPoolData: PoolData | undefined = poolData[assetToString(asset)]
        if (!chainAssetPoolData || !assetPoolData) {
          return ZERO_BASE_AMOUNT
        }

        return eqAsset.equals(chainAsset, asset)
          ? chainFee
          : getValueOfAsset1InAsset2(chainFee, chainAssetPoolData, assetPoolData)
      }),
      O.getOrElse(() => ZERO_BASE_AMOUNT)
    )
  }, [targetChainFee, targetAsset, poolData])

  const targetChainFeeError = useMemo((): boolean => {
    if (changeAmount.isZero()) {
      return false
    }
    const targetFee = FP.pipe(targetChainFeeAmountInTargetAsset, baseToAsset, (assetAmount) => assetAmount.amount())
    return swapData.swapResult.minus(targetFee).isNegative()
  }, [targetChainFeeAmountInTargetAsset, swapData, changeAmount])

  const outputLabel = useMemo(
    () =>
      FP.pipe(
        targetAsset,
        O.map((asset) =>
          formatAssetAmountCurrency({ amount: assetAmount(swapData.swapResult), asset, trimZeros: true })
        ),
        O.getOrElse(() => formatBN(ZERO_BN))
      ),
    [targetAsset, swapData]
  )

  const targetChainFeeErrorLabel = useMemo(() => {
    if (!targetChainFeeError) {
      return null
    }

    const feeAssetAmount = baseToAsset(targetChainFeeAmountInTargetAsset)

    return FP.pipe(
      targetAsset,
      O.map((asset) => (
        <Styled.ErrorLabel key="targetChainFeeErrorLabel">
          {intl.formatMessage(
            { id: 'swap.errors.amount.outputShouldCoverChainFee' },
            {
              fee: formatAssetAmountCurrency({ amount: feeAssetAmount, asset, trimZeros: true }),
              amount: outputLabel
            }
          )}
        </Styled.ErrorLabel>
      )),
      O.getOrElse(() => <></>)
    )
  }, [targetChainFeeError, targetChainFeeAmountInTargetAsset, intl, targetAsset, outputLabel])

  const fees: RD.RemoteData<Error, Fee[]> = useMemo(
    () =>
      FP.pipe(
        sequenceTRD(
          sourceChainFee,
          RD.success(targetChainFeeAmountInTargetAsset),
          RD.fromOption(sourceAsset, () => Error('No source asset')),
          RD.fromOption(targetAsset, () => Error('No target asset'))
        ),
        RD.map(([sourceFee, targetFee, sourceAsset, targetAsset]) => [
          { asset: getChainAsset(sourceAsset.chain), amount: sourceFee },
          { asset: targetAsset, amount: targetFee }
        ])
      ),
    [sourceChainFee, targetChainFeeAmountInTargetAsset, sourceAsset, targetAsset]
  )

  const isSwapDisabled: boolean = useMemo(() => changeAmount.eq(0) || FP.pipe(walletBalances, O.isNone), [
    walletBalances,
    changeAmount
  ])

  return (
    <Styled.Container>
      {showPrivateModal && (
        <PasswordConfirmation onSuccess={onPasswordValidationSucceed} onClose={() => setShowPrivateModal(false)} />
      )}
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
            <CurrencyInfo slip={swapData.slip} from={oSourceAssetWP} to={oTargetAssetWP} />
          </Styled.CurrencyInfoContainer>

          <Styled.ValueItemContainer className={'valueItemContainer-out'}>
            <Styled.AssetInput
              title={intl.formatMessage({ id: 'swap.input' })}
              label={balanceLabel}
              onChange={setChangeAmount}
              amount={changeAmount}
              hasError={sourceChainBalanceError || targetChainFeeError}
            />
            {FP.pipe(
              sourceAsset,
              O.fold(
                () => <></>,
                (asset) => <AssetSelect onSelect={setSourceAsset} asset={asset} assets={assetsToSwapFrom} />
              )
            )}
          </Styled.ValueItemContainer>

          <Styled.ValueItemContainer className={'valueItemContainer-percent'}>
            <Styled.SliderContainer>
              {slider}
              {sourceChainErrorLabel}
            </Styled.SliderContainer>
            <Styled.SwapOutlined disabled={!canSwitchAssets} onClick={onSwitchAssets} />
          </Styled.ValueItemContainer>
          <Styled.ValueItemContainer className={'valueItemContainer-in'}>
            <Styled.InValue>
              <Styled.InValueTitle>{intl.formatMessage({ id: 'swap.output' })}:</Styled.InValueTitle>
              <div>{outputLabel}</div>
            </Styled.InValue>
            {FP.pipe(
              targetAsset,
              O.fold(
                () => <></>,
                (asset) => <AssetSelect onSelect={setTargetAsset} asset={asset} assets={assetsToSwapTo} />
              )
            )}
          </Styled.ValueItemContainer>
        </Styled.FormContainer>
      </Styled.ContentContainer>

      <Styled.SubmitContainer>
        {FP.pipe(
          sequenceTOption(sourceAsset, targetAsset),
          O.fold(
            () => <></>,
            ([source, target]) => (
              <Styled.Drag
                disabled={isSwapDisabled}
                onConfirm={onSwapConfirmed}
                title={intl.formatMessage({ id: 'swap.drag' })}
                source={source}
                target={target}
              />
            )
          )
        )}
        {!RD.isInitial(fees) && <Fees fees={fees} reloadFees={reloadFees} />}
        {targetChainFeeErrorLabel}
      </Styled.SubmitContainer>
    </Styled.Container>
  )
}
