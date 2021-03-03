import React, { useCallback, useMemo, useState } from 'react'

import * as RD from '@devexperts/remote-data-ts'
import { getSwapMemo, getValueOfAsset1InAsset2, PoolData } from '@thorchain/asgardex-util'
import { Address, Balance } from '@xchainjs/xchain-client'
import {
  Asset,
  assetToString,
  formatBN,
  baseToAsset,
  BaseAmount,
  formatAssetAmountCurrency,
  AssetRuneNative,
  baseAmount,
  assetAmount
} from '@xchainjs/xchain-util'
import { eqString } from 'fp-ts/Eq'
import * as A from 'fp-ts/lib/Array'
import * as FP from 'fp-ts/lib/function'
import * as O from 'fp-ts/lib/Option'
import { useIntl } from 'react-intl'

import { Network } from '../../../shared/api/types'
import { ZERO_BASE_AMOUNT, ZERO_BN } from '../../const'
import { getChainAsset } from '../../helpers/chainHelper'
import { eqAsset } from '../../helpers/fp/eq'
import { sequenceSOption, sequenceTOption, sequenceTRD } from '../../helpers/fpHelpers'
import { getWalletBalanceByAsset } from '../../helpers/walletHelper'
import { useSubscriptionState } from '../../hooks/useSubscriptionState'
import { swap } from '../../routes/swap'
import { AssetsWithPrice, AssetWithPrice } from '../../services/binance/types'
import { INITIAL_SWAP_STATE } from '../../services/chain/const'
import { SwapFeesRD, SwapState, SwapStateHandler } from '../../services/chain/types'
import { PoolDetails } from '../../services/midgard/types'
import { getPoolDetailsHashMap } from '../../services/midgard/utils'
import { KeystoreState, NonEmptyWalletBalances, ValidatePasswordHandler } from '../../services/wallet/types'
import { hasImportedKeystore, isLocked } from '../../services/wallet/util'
import { CurrencyInfo } from '../currency'
import { PasswordModal } from '../modal/password'
import { TxModal } from '../modal/tx'
import { SwapAssets } from '../modal/tx/extra'
import { AssetSelect } from '../uielements/assets/assetSelect'
import { ViewTxButton } from '../uielements/button'
import { Fees, UIFeesRD } from '../uielements/fees'
import { Slider } from '../uielements/slider'
import * as Styled from './Swap.styles'
import { getSwapData, assetWithPriceToAsset, pickAssetWithPrice } from './Swap.utils'

export type ConfirmSwapParams = { asset: Asset; amount: BaseAmount; memo: string }

export type SwapProps = {
  keystore: KeystoreState
  availableAssets: AssetsWithPrice
  sourceAsset: O.Option<Asset>
  targetAsset: O.Option<Asset>
  sourcePoolAddress: O.Option<string>
  swap$: SwapStateHandler
  poolDetails: PoolDetails
  walletBalances: O.Option<NonEmptyWalletBalances>
  goToTransaction: (txHash: string) => void
  validatePassword$: ValidatePasswordHandler
  reloadFees: FP.Lazy<void>
  reloadBalances: FP.Lazy<void>
  fees: SwapFeesRD
  targetWalletAddress: O.Option<Address>
  onChangePath: (path: string) => void
  network: Network
}

export const Swap = ({
  keystore,
  availableAssets,
  sourceAsset: sourceAssetProp,
  targetAsset: targetAssetProp,
  sourcePoolAddress: oSourcePoolAddress,
  swap$,
  poolDetails,
  walletBalances,
  goToTransaction = (_) => {},
  validatePassword$,
  reloadFees = FP.constVoid,
  reloadBalances = FP.constVoid,
  fees: feesProp = RD.initial,
  targetWalletAddress,
  onChangePath,
  network
}: SwapProps) => {
  const intl = useIntl()

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

  const { state: swapState, reset: resetSwapState, subscribe: subscribeSwapState } = useSubscriptionState<SwapState>(
    INITIAL_SWAP_STATE
  )

  // Swap start time
  const [swapStartTime, setSwapStartTime] = useState<number>(0)

  const setSourceAsset = useCallback(
    (asset: Asset) => {
      FP.pipe(
        targetAsset,
        O.map((targetAsset) =>
          onChangePath(
            swap.path({
              source: assetToString(asset),
              target: assetToString(targetAsset)
            })
          )
        )
      )
    },
    [onChangePath, targetAsset]
  )

  const setTargetAsset = useCallback(
    (asset: Asset) => {
      FP.pipe(
        sourceAsset,
        O.map((sourceAsset) =>
          onChangePath(
            swap.path({
              source: assetToString(sourceAsset),
              target: assetToString(asset)
            })
          )
        )
      )
    },
    [onChangePath, sourceAsset]
  )

  const oAssetWB: O.Option<Balance> = useMemo(() => getWalletBalanceByAsset(walletBalances, sourceAsset), [
    walletBalances,
    sourceAsset
  ])

  /**
   * Returns `decimal` needed by `amountToSwap`
   *
   * It tries to get `decimal` from balances of selected asset in wallet.
   * Why from wallet balances? API of xchain-* provides balances with correct decimals.
   *
   * If no balances are available, it returns default `decimal` value of an `AssetAmount` (which is `8`)
   *
   *
   * */
  const amountToSwapDecimal = useMemo(
    () =>
      FP.pipe(
        oAssetWB,
        O.map((assetWB) => assetWB.amount.decimal),
        // use default `decimal` in other cases
        O.getOrElse(() => assetAmount(1).decimal)
      ),

    [oAssetWB]
  )

  const [amountToSwap, setAmountToSwapInternal] = useState(baseAmount(0, amountToSwapDecimal))

  const setAmountToSwap = useCallback(
    (targetAmount: BaseAmount) => {
      FP.pipe(
        oAssetWB,
        O.map(({ amount: maxAmount }) =>
          targetAmount.amount().isGreaterThan(maxAmount.amount())
            ? /**
               * New object instance is needed to make
               * AssetInput component react to the new value.
               * In case maxAmount has the same pointer
               * AssetInput will not be updated as a React-component
               * but native input element will change its
               * inner value and user will see inappropriate value
               */
              { ...maxAmount }
            : baseAmount(targetAmount.amount(), maxAmount.decimal)
        ),
        // Provide alt value ONLY in case there is no unlocked wallet
        // In other case missing oAssetWB means user does not have appropriate balance
        O.alt(() => (isLocked(keystore) ? O.some(targetAmount) : O.none)),
        O.map(setAmountToSwapInternal)
      )
    },
    [setAmountToSwapInternal, oAssetWB, keystore]
  )

  const setAmountToSwapFromPercentValue = useCallback(
    (percents) => {
      FP.pipe(
        oAssetWB,
        O.map((assetWB) => {
          const assetAmountBN = assetWB.amount.amount()
          const amountFromPercentage = assetAmountBN.multipliedBy(Number(percents) / 100)
          return setAmountToSwap(baseAmount(amountFromPercentage, amountToSwapDecimal))
        })
      )
    },
    [oAssetWB, amountToSwapDecimal, setAmountToSwap]
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
      O.map(({ source, target }) =>
        onChangePath(
          swap.path({
            target: assetToString(source),
            source: assetToString(target)
          })
        )
      )
    )
  }, [assetsToSwap, onChangePath, canSwitchAssets])

  const swapData = useMemo(() => getSwapData(amountToSwap, sourceAsset, targetAsset, poolData), [
    amountToSwap,
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

  const [showPasswordModal, setShowPasswordModal] = useState(false)

  const onSwapConfirmed = useCallback(() => {
    setShowPasswordModal(true)
  }, [setShowPasswordModal])

  const slider = useMemo(
    () =>
      FP.pipe(
        oAssetWB,
        O.map((assetWB) => {
          const percentage = amountToSwap.amount().dividedBy(assetWB.amount.amount()).multipliedBy(100).toNumber()
          return (
            <Slider
              key={'swap percentage slider'}
              value={percentage}
              onChange={setAmountToSwapFromPercentValue}
              tooltipVisible={true}
              withLabel={true}
              tooltipPlacement={'top'}
            />
          )
        }),
        O.toNullable
      ),
    [oAssetWB, amountToSwap, setAmountToSwapFromPercentValue]
  )

  const extraTxModalContent = useMemo(() => {
    return FP.pipe(
      sequenceTOption(oSourceAssetWP, oTargetAssetWP),
      O.map(([sourceAssetWP, targetAssetWP]) => {
        const targetAsset = targetAssetWP.asset
        const sourceAsset = sourceAssetWP.asset

        const stepLabels = [
          intl.formatMessage({ id: 'common.tx.healthCheck' }),
          intl.formatMessage({ id: 'common.tx.sending' }),
          intl.formatMessage({ id: 'common.tx.checkResult' })
        ]
        const stepLabel = FP.pipe(
          swapState.swap,
          RD.fold(
            () => '',
            () =>
              `${intl.formatMessage(
                { id: 'common.step' },
                { current: swapState.step, total: swapState.stepsTotal }
              )}: ${stepLabels[swapState.step - 1]}`,
            () => '',
            () => 'Done!'
          )
        )

        return (
          <SwapAssets
            key="swap-assets"
            source={{ asset: sourceAsset, amount: amountToSwap }}
            target={{ asset: targetAsset, amount: swapData.swapResult }}
            stepDescription={stepLabel}
            slip={swapData.slip}
            network={network}
          />
        )
      }),
      O.getOrElse(() => <></>)
    )
  }, [
    oSourceAssetWP,
    oTargetAssetWP,
    swapData.swapResult,
    swapData.slip,
    amountToSwap,
    swapState.swap,
    swapState.step,
    swapState.stepsTotal,
    intl,
    network
  ])

  const onFinishTxModal = useCallback(() => {
    resetSwapState()
    reloadBalances()
  }, [resetSwapState, reloadBalances])

  const renderTxModal = useMemo(() => {
    const { swapTx, swap } = swapState

    // don't render TxModal in initial state
    if (RD.isInitial(swap)) return <></>

    // Get timer value
    const timerValue = FP.pipe(
      swap,
      RD.fold(
        () => 0,
        FP.flow(
          O.map(({ loaded }) => loaded),
          O.getOrElse(() => 0)
        ),
        () => 0,
        () => 100
      )
    )

    // title
    const txModalTitle = FP.pipe(
      swap,
      RD.fold(
        () => 'swap.state.pending',
        () => 'swap.state.pending',
        () => 'swap.state.error',
        () => 'swap.state.success'
      ),
      (id) => intl.formatMessage({ id })
    )

    return (
      <TxModal
        title={txModalTitle}
        onClose={resetSwapState}
        onFinish={onFinishTxModal}
        startTime={swapStartTime}
        txRD={swap}
        extraResult={<ViewTxButton txHash={RD.toOption(swapTx)} onClick={goToTransaction} />}
        timerValue={timerValue}
        extra={extraTxModalContent}
      />
    )
  }, [extraTxModalContent, goToTransaction, intl, onFinishTxModal, resetSwapState, swapStartTime, swapState])

  const closePasswordModal = useCallback(() => {
    setShowPasswordModal(false)
  }, [setShowPasswordModal])

  const onClosePasswordModal = useCallback(() => {
    // close password modal
    closePasswordModal()
  }, [closePasswordModal])

  const onSucceedPasswordModal = useCallback(() => {
    // close private modal
    closePasswordModal()

    FP.pipe(
      sequenceTOption(assetsToSwap, targetWalletAddress),
      O.map(([{ source, target }, address]) => {
        const memo = getSwapMemo({ asset: target, address })

        // set start time
        setSwapStartTime(Date.now())
        // subscribe to swap$
        subscribeSwapState(
          swap$({
            poolAddress: oSourcePoolAddress,
            asset: source,
            amount: amountToSwap,
            memo
          })
        )

        return true
      })
    )
  }, [
    closePasswordModal,
    assetsToSwap,
    targetWalletAddress,
    subscribeSwapState,
    swap$,
    oSourcePoolAddress,
    amountToSwap
  ])

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
          // we should substract `amountToSwap`
          const subtractAmountToSwap = eqAsset.equals(sourceAsset, getChainAsset(sourceAsset.chain))

          const oBalanceMinusAmount: O.Option<BaseAmount> = FP.pipe(
            walletBalances,
            A.findFirst((walletBalance) => eqAsset.equals(walletBalance.asset, sourceAsset)),
            O.map((sourceBalance) =>
              sourceBalance.amount.amount().minus(subtractAmountToSwap ? amountToSwap.amount() : ZERO_BN)
            ),
            O.map(FP.flow(baseAmount))
          )

          return FP.pipe(
            sequenceTOption(oBalanceMinusAmount, RD.toOption(sourceChainFee)),
            O.map(([leftBalance, sourceChainFee]) => leftBalance.amount().minus(sourceChainFee.amount()).isNegative()),
            O.getOrElse((): boolean => false)
          )
        }),
        O.getOrElse((): boolean => false)
      ),
    [amountToSwap, sourceAsset, walletBalances, sourceChainFee]
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
    if (amountToSwap.amount().isZero()) {
      return false
    }
    const targetFee = FP.pipe(targetChainFeeAmountInTargetAsset, baseToAsset, (assetAmount) => assetAmount.amount())
    return swapData.swapResult.amount().minus(targetFee).isNegative()
  }, [targetChainFeeAmountInTargetAsset, swapData, amountToSwap])

  const swapResultLabel = useMemo(
    () =>
      FP.pipe(
        targetAsset,
        O.map((asset) =>
          formatAssetAmountCurrency({ amount: baseToAsset(swapData.swapResult), asset, trimZeros: true })
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
              amount: swapResultLabel
            }
          )}
        </Styled.ErrorLabel>
      )),
      O.getOrElse(() => <></>)
    )
  }, [targetChainFeeError, targetChainFeeAmountInTargetAsset, intl, targetAsset, swapResultLabel])

  const fees: UIFeesRD = useMemo(
    () =>
      FP.pipe(
        sequenceTRD(
          sourceChainFee,
          RD.success(targetChainFeeAmountInTargetAsset),
          RD.fromOption(sourceAsset, () => Error(intl.formatMessage({ id: 'swap.errors.asset.missingSourceAsset' }))),
          RD.fromOption(targetAsset, () => Error(intl.formatMessage({ id: 'swap.errors.asset.missingTargetAsset' })))
        ),
        RD.map(([sourceFee, targetFee, sourceAsset, targetAsset]) => [
          { asset: getChainAsset(sourceAsset.chain), amount: sourceFee },
          { asset: targetAsset, amount: targetFee }
        ])
      ),
    [sourceChainFee, targetChainFeeAmountInTargetAsset, sourceAsset, targetAsset, intl]
  )

  const isSwapDisabled: boolean = useMemo(() => amountToSwap.amount().isZero() || FP.pipe(walletBalances, O.isNone), [
    walletBalances,
    amountToSwap
  ])

  return (
    <Styled.Container>
      <Styled.ContentContainer>
        <Styled.Header>
          {FP.pipe(
            assetsToSwap,
            O.map(
              ({ source, target }) => `${intl.formatMessage({ id: 'common.swap' })} ${source.ticker} > ${target.ticker}`
            ),
            O.getOrElse(() => `${intl.formatMessage({ id: 'swap.state.error' })} - No such assets`)
          )}
        </Styled.Header>

        <Styled.FormContainer>
          <Styled.CurrencyInfoContainer>
            <CurrencyInfo slip={swapData.slip} from={oSourceAssetWP} to={oTargetAssetWP} />
          </Styled.CurrencyInfoContainer>

          <Styled.ValueItemContainer className={'valueItemContainer-out'}>
            {/* Note: Input value is shown as AssetAmount */}
            <Styled.AssetInput
              title={intl.formatMessage({ id: 'swap.input' })}
              label={balanceLabel}
              onChange={setAmountToSwap}
              amount={amountToSwap}
              hasError={sourceChainBalanceError || targetChainFeeError}
            />
            {FP.pipe(
              sourceAsset,
              O.fold(
                () => <></>,
                (asset) => (
                  <AssetSelect onSelect={setSourceAsset} asset={asset} assets={assetsToSwapFrom} network={network} />
                )
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
            <Styled.InValueContainer>
              <Styled.InValueTitle>{intl.formatMessage({ id: 'swap.output' })}:</Styled.InValueTitle>
              <Styled.InValueLabel>{swapResultLabel}</Styled.InValueLabel>
            </Styled.InValueContainer>
            {FP.pipe(
              targetAsset,
              O.fold(
                () => <></>,
                (asset) => (
                  <AssetSelect onSelect={setTargetAsset} asset={asset} assets={assetsToSwapTo} network={network} />
                )
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
                network={network}
              />
            )
          )
        )}
        <Styled.NoteLabel align="center">
          {!hasImportedKeystore(keystore)
            ? intl.formatMessage({ id: 'swap.note.nowallet' })
            : isLocked(keystore) && intl.formatMessage({ id: 'swap.note.lockedWallet' })}
        </Styled.NoteLabel>
        {!RD.isInitial(fees) && <Fees fees={fees} reloadFees={reloadFees} />}
        {targetChainFeeErrorLabel}
      </Styled.SubmitContainer>
      {showPasswordModal && (
        <PasswordModal
          onSuccess={onSucceedPasswordModal}
          onClose={onClosePasswordModal}
          validatePassword$={validatePassword$}
        />
      )}
      {renderTxModal}
    </Styled.Container>
  )
}
