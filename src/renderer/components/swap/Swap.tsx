import React, { useCallback, useEffect, useMemo, useState } from 'react'

import * as RD from '@devexperts/remote-data-ts'
import { getValueOfAsset1InAsset2, PoolData, getSwapMemo } from '@thorchain/asgardex-util'
import { Address, Balance } from '@xchainjs/xchain-client'
import {
  Asset,
  assetAmount,
  assetToBase,
  assetToString,
  bn,
  formatBN,
  baseToAsset,
  BaseAmount,
  formatAssetAmountCurrency,
  AssetRuneNative
} from '@xchainjs/xchain-util'
import { eqString } from 'fp-ts/Eq'
import * as A from 'fp-ts/lib/Array'
import * as FP from 'fp-ts/lib/function'
import * as O from 'fp-ts/lib/Option'
import { useIntl } from 'react-intl'
import { useHistory } from 'react-router'
import * as Rx from 'rxjs'

import { ZERO_BASE_AMOUNT, ZERO_BN } from '../../const'
import { getChainAsset } from '../../helpers/chainHelper'
import { eqAsset } from '../../helpers/fp/eq'
import { sequenceSOption, sequenceTOption, sequenceTRD } from '../../helpers/fpHelpers'
import { getWalletBalanceByAsset } from '../../helpers/walletHelper'
import { swap } from '../../routes/swap'
import { AssetsWithPrice, AssetWithPrice } from '../../services/binance/types'
import { INITIAL_SWAP_STATE } from '../../services/chain/const'
import { SwapFeesRD, SwapState, SwapStateHandler } from '../../services/chain/types'
import { PoolDetails } from '../../services/midgard/types'
import { getPoolDetailsHashMap } from '../../services/midgard/utils'
import { NonEmptyWalletBalances, ValidatePasswordHandler } from '../../services/wallet/types'
import { PricePool } from '../../views/pools/Pools.types'
import { CurrencyInfo } from '../currency'
import { PasswordModal } from '../modal/password'
import { TxModal } from '../modal/tx'
import { AssetData } from '../uielements/assets/assetData'
import { AssetSelect } from '../uielements/assets/assetSelect'
import { Fees, UIFeesRD } from '../uielements/fees'
import { Slider } from '../uielements/slider'
import { StepBar } from '../uielements/stepBar'
import { Trend } from '../uielements/trend'
import * as Styled from './Swap.styles'
import { getSwapData, assetWithPriceToAsset, pickAssetWithPrice } from './Swap.utils'

export type ConfirmSwapParams = { asset: Asset; amount: BaseAmount; memo: string }

type SwapProps = {
  availableAssets: AssetsWithPrice
  sourceAsset: O.Option<Asset>
  targetAsset: O.Option<Asset>
  sourcePoolAddress: O.Option<string>
  swap$: SwapStateHandler
  poolDetails?: PoolDetails
  walletBalances?: O.Option<NonEmptyWalletBalances>
  goToTransaction?: (txHash: string) => void
  activePricePool: PricePool
  validatePassword$: ValidatePasswordHandler
  reloadFees?: FP.Lazy<void>
  reloadBalances?: FP.Lazy<void>
  fees?: SwapFeesRD
  targetWalletAddress?: O.Option<Address>
}

export const Swap = ({
  availableAssets,
  sourceAsset: sourceAssetProp,
  targetAsset: targetAssetProp,
  sourcePoolAddress: oSourcePoolAddress,
  swap$,
  poolDetails = [],
  walletBalances = O.none,
  goToTransaction = (_) => {},
  activePricePool,
  validatePassword$,
  reloadFees = FP.constVoid,
  reloadBalances = FP.constVoid,
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
  const assetsToSwap: O.Option<{ source: Asset; target: Asset }> = useMemo(
    () => sequenceSOption({ source: sourceAsset, target: targetAsset }),
    [sourceAsset, targetAsset]
  )

  // (Possible) subscription of swap$
  const [swapSub, setSwapSub] = useState<O.Option<Rx.Subscription>>(O.none)

  useEffect(() => {
    // Unsubscribe of (possible) previous subscription of `swap$`
    return () => {
      FP.pipe(
        swapSub,
        O.map((sub) => sub.unsubscribe())
      )
    }
  }, [swapSub])

  // Swap state
  const [swapState, setSwapState] = useState<SwapState>(INITIAL_SWAP_STATE)

  // Swap start time
  const [swapStartTime, setSwapStartTime] = useState<number>(0)

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
      O.map(({ source, target }) =>
        FP.pipe(
          filteredAssets,
          A.filter((asset) => asset.symbol !== source.symbol && asset.symbol !== target.symbol)
        )
      ),
      O.getOrElse(() => allAssets)
    )
  }, [allAssets, assetsToSwap, assetSymbolsInWallet])

  const assetsToSwapTo = useMemo((): Asset[] => {
    return FP.pipe(
      assetsToSwap,
      O.map(({ source, target }) =>
        FP.pipe(
          allAssets,
          A.filter((asset) => asset.symbol !== source.symbol && asset.symbol !== target.symbol)
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
      O.map(({ source, target }) => {
        history.replace(
          swap.path({
            target: assetToString(source),
            source: assetToString(target)
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

  const txModalTitle = useMemo(
    () =>
      FP.pipe(
        swapState.txRD,
        RD.fold(
          () => 'swap.state.pending',
          () => 'swap.state.pending',
          () => 'swap.state.error',
          () => 'swap.state.success'
        ),
        (id) => intl.formatMessage({ id })
      ),
    [intl, swapState]
  )

  const extraTxModalContent = useMemo(() => {
    return FP.pipe(
      sequenceTOption(oSourceAssetWP, oTargetAssetWP),
      O.map(([sourceAssetWP, targetAssetWP]) => {
        const swapResultByBasePriceAsset =
          poolData[assetToString(targetAssetWP.asset)] &&
          // Convert swapResult to the selected price asset values
          getValueOfAsset1InAsset2(
            assetToBase(assetAmount(swapData.swapResult)),
            poolData[assetToString(targetAssetWP.asset)],
            activePricePool.poolData
          )

        const amountToSwapInSelectedPriceAsset =
          poolData[assetToString(sourceAssetWP.asset)] &&
          getValueOfAsset1InAsset2(
            assetToBase(assetAmount(changeAmount)),
            poolData[assetToString(sourceAssetWP.asset)],
            activePricePool.poolData
          )

        const basePriceAsset = activePricePool.asset
        const swapTargetAsset = targetAssetWP.asset

        return (
          <>
            <Styled.CoinDataWrapper>
              <StepBar size={50} />
              <Styled.CoinDataContainer>
                <AssetData
                  priceBaseAsset={basePriceAsset}
                  asset={swapTargetAsset}
                  price={amountToSwapInSelectedPriceAsset}
                />
                <AssetData priceBaseAsset={basePriceAsset} asset={swapTargetAsset} price={swapResultByBasePriceAsset} />
              </Styled.CoinDataContainer>
            </Styled.CoinDataWrapper>
            <Styled.TrendContainer>
              <Trend amount={swapData.slip} />
            </Styled.TrendContainer>
          </>
        )
      }),
      O.getOrElse(() => <></>)
    )
  }, [oSourceAssetWP, oTargetAssetWP, poolData, swapData, activePricePool, changeAmount])

  const onCloseTxModal = useCallback(() => {
    // reset swap$ subscription
    setSwapSub(O.none)
    // reset swap state
    setSwapState(INITIAL_SWAP_STATE)
  }, [])

  const onFinishTxModal = useCallback(() => {
    // We do same as with closing
    onCloseTxModal()
    // but also refresh balances
    reloadBalances()
  }, [onCloseTxModal, reloadBalances])

  const renderTxModal = useMemo(() => {
    const { txHash, txRD } = swapState
    // don't render TxModal in initial state
    if (RD.isInitial(txRD)) return <></>

    return (
      <TxModal
        title={txModalTitle}
        onClose={onCloseTxModal}
        onFinish={onFinishTxModal}
        startTime={swapStartTime}
        txRD={txRD}
        txHash={txHash}
        onViewTxClick={goToTransaction}
        extra={extraTxModalContent}
      />
    )
  }, [extraTxModalContent, goToTransaction, onCloseTxModal, onFinishTxModal, swapStartTime, swapState, txModalTitle])

  const closePrivateModal = useCallback(() => {
    setShowPrivateModal(false)
  }, [setShowPrivateModal])

  const onPasswordValidationSucceed = useCallback(() => {
    console.log('onPasswordValidationSucceed')
    console.log('oSourcePoolAddress', oSourcePoolAddress)
    console.log('assetsToSwap', assetsToSwap)
    console.log('targetWalletAddress', targetWalletAddress)

    FP.pipe(
      sequenceTOption(assetsToSwap, targetWalletAddress),
      // eslint-disable-next-line  array-callback-return
      O.map(([{ source, target }, address]) => {
        const memo = getSwapMemo({ asset: target, address })
        closePrivateModal()
        // set start time
        setSwapStartTime(Date.now())
        console.log('startTime:', swapStartTime)
        // subscribe to swap$
        const sub = swap$({
          poolAddress: oSourcePoolAddress,
          asset: source,
          amount: assetToBase(assetAmount(changeAmount)),
          memo
        }).subscribe((v) => {
          console.log('v:', v)
          setSwapState(v)
        })
        console.log('swapSub ', sub)
        setSwapSub(O.some(sub))
      })
    )
  }, [assetsToSwap, changeAmount, closePrivateModal, oSourcePoolAddress, swap$, swapStartTime, targetWalletAddress])

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

  const fees: UIFeesRD = useMemo(
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
        <PasswordModal
          onSuccess={onPasswordValidationSucceed}
          onClose={() => setShowPrivateModal(false)}
          validatePassword$={validatePassword$}
        />
      )}
      <Styled.PendingContainer>{renderTxModal}</Styled.PendingContainer>
      <Styled.ContentContainer>
        <Styled.Header>
          {FP.pipe(
            assetsToSwap,
            O.map(
              ({ source, target }) =>
                `${intl.formatMessage({ id: 'swap.state.pending' })} ${source.ticker} >> ${target.ticker}`
            ),
            O.getOrElse(() => `${intl.formatMessage({ id: 'swap.state.error' })} - No such assets`)
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
