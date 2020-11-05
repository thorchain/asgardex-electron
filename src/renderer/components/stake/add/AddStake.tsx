import React, { useCallback, useMemo, useState } from 'react'

import { SyncOutlined } from '@ant-design/icons'
import * as RD from '@devexperts/remote-data-ts'
import {
  Asset,
  AssetAmount,
  baseAmount,
  BaseAmount,
  baseToAsset,
  formatAssetAmountCurrency,
  PoolData
} from '@xchainjs/xchain-util'
import { Col } from 'antd'
import BigNumber from 'bignumber.js'
import * as FP from 'fp-ts/lib/function'
import * as O from 'fp-ts/lib/Option'
import { useIntl } from 'react-intl'

import { BASE_CHAIN_ASSET, ZERO_BASE_AMOUNT } from '../../../const'
import { sequenceTOption } from '../../../helpers/fpHelpers'
import { SymDepositMemo, Memo, SendStakeTxParams, StakeFeesRD } from '../../../services/chain/types'
import { PoolAddress } from '../../../services/midgard/types'
import { StakeType } from '../../../types/asgardex'
import { Drag } from '../../uielements/drag'
import * as Helper from './AddStake.helper'
import * as Styled from './AddStake.style'

type Props = {
  type: StakeType
  asset: Asset
  runeAsset: Asset
  assetPrice: BigNumber
  runePrice: BigNumber
  assetBalance: O.Option<BaseAmount>
  runeBalance: O.Option<BaseAmount>
  baseChainAssetBalance: O.Option<BaseAmount>
  crossChainAssetBalance: O.Option<BaseAmount>
  poolAddress: O.Option<PoolAddress>
  isCrossChain?: boolean
  asymDepositMemo: O.Option<Memo>
  symDepositMemo: O.Option<SymDepositMemo>
  priceAsset?: Asset
  fees: StakeFeesRD
  reloadFees: (type: StakeType) => void
  assets?: Asset[]
  onStake: (p: SendStakeTxParams) => void
  onChangeAsset: (asset: Asset) => void
  disabled?: boolean
  poolData: PoolData
}

export const AddStake: React.FC<Props> = (props) => {
  const {
    type,
    asset,
    runeAsset,
    assetPrice,
    runePrice,
    assetBalance: oAssetBalance,
    runeBalance: oRuneBalance,
    baseChainAssetBalance: oBaseChainAssetBalance,
    crossChainAssetBalance: oCrossChainAssetBalance,
    isCrossChain = false,
    asymDepositMemo: oAsymDepositMemo,
    symDepositMemo: oSymDepositMemo,
    poolAddress: oPoolAddress,
    assets,
    priceAsset,
    reloadFees,
    fees,
    onChangeAsset,
    disabled = false,
    poolData
  } = props

  const intl = useIntl()
  const [runeAmountToStake, setRuneAmountToStake] = useState<BaseAmount>(ZERO_BASE_AMOUNT)
  const [assetAmountToStake, setAssetAmountToStake] = useState<BaseAmount>(ZERO_BASE_AMOUNT)
  const [percentValueToStake, setPercentValueToStake] = useState(0)

  const isAsym = useMemo(() => type === 'asym', [type])

  const assetBalance: BaseAmount = useMemo(
    () =>
      FP.pipe(
        oAssetBalance,
        O.getOrElse(() => ZERO_BASE_AMOUNT)
      ),
    [oAssetBalance]
  )

  const runeBalance: BaseAmount = useMemo(
    () =>
      FP.pipe(
        oRuneBalance,
        O.getOrElse(() => ZERO_BASE_AMOUNT)
      ),
    [oRuneBalance]
  )

  const maxRuneAmountToStake = useMemo(
    (): BaseAmount => Helper.maxRuneAmountToStake({ poolData, runeBalance, assetBalance }),
    [assetBalance, poolData, runeBalance]
  )

  const maxAssetAmountToStake = useMemo(
    (): BaseAmount => Helper.maxAssetAmountToStake({ poolData, runeBalance, assetBalance }),
    [assetBalance, poolData, runeBalance]
  )

  const hasAssetBalance = useMemo(() => assetBalance.amount().isGreaterThan(0), [assetBalance])
  const hasRuneBalance = useMemo(() => runeBalance.amount().isGreaterThan(0), [runeBalance])

  const isAsymBalanceError = useMemo(() => !hasAssetBalance, [hasAssetBalance])

  const isSymBalanceError = useMemo(() => !hasAssetBalance && !hasRuneBalance, [hasAssetBalance, hasRuneBalance])

  const isBalanceError = useMemo(() => (type === 'sym' ? isSymBalanceError : isAsymBalanceError), [
    isAsymBalanceError,
    isSymBalanceError,
    type
  ])

  const showBalanceError = useMemo(
    () =>
      // Note:
      // To avoid flickering of balance error for a short time at the beginning
      // We never show error if balances are not available
      type === 'sym'
        ? O.isSome(oAssetBalance) && isSymBalanceError
        : FP.pipe(sequenceTOption(oRuneBalance, oAssetBalance), (balances) => O.isSome(balances) && isAsymBalanceError),
    [isAsymBalanceError, isSymBalanceError, oAssetBalance, oRuneBalance, type]
  )

  const renderBalanceError = useMemo(() => {
    const noAssetBalancesMsg = intl.formatMessage(
      { id: 'stake.add.error.nobalance1' },
      {
        asset: asset.ticker
      }
    )

    const noRuneBalancesMsg = intl.formatMessage(
      { id: 'stake.add.error.nobalance1' },
      {
        asset: runeAsset.ticker
      }
    )

    const noRuneAndAssetBalancesMsg = intl.formatMessage(
      { id: 'stake.add.error.nobalance2' },
      {
        asset1: asset.ticker,
        asset2: runeAsset.ticker
      }
    )

    // asym error message
    const asymMsg =
      // no balance for pool asset and rune
      !hasAssetBalance && !hasRuneBalance
        ? noRuneAndAssetBalancesMsg
        : // no rune balance
        !hasRuneBalance
        ? noRuneBalancesMsg
        : // no balance of pool asset
          noAssetBalancesMsg

    const symMsg = noAssetBalancesMsg

    const title = intl.formatMessage({ id: 'stake.add.error.nobalances' })

    const msg = type === 'sym' ? symMsg : asymMsg
    return <Styled.BalanceAlert type="warning" message={title} description={msg} />
  }, [asset.ticker, hasAssetBalance, hasRuneBalance, intl, runeAsset.ticker, type])

  const runeAmountChangeHandler = useCallback(
    (runeInput: BaseAmount) => {
      let runeQuantity = runeInput.amount().isGreaterThan(maxRuneAmountToStake.amount())
        ? maxRuneAmountToStake
        : runeInput
      const assetQuantity = Helper.getAssetAmountToStake(runeQuantity, poolData)

      if (assetQuantity.amount().isGreaterThan(maxRuneAmountToStake.amount())) {
        runeQuantity = Helper.getRuneAmountToStake(maxRuneAmountToStake, poolData)
        setRuneAmountToStake(runeQuantity)
        setAssetAmountToStake(maxRuneAmountToStake)
        setPercentValueToStake(100)
      } else {
        setRuneAmountToStake(runeQuantity)
        setAssetAmountToStake(assetQuantity)
        // formula: runeQuantity * 100 / maxRuneAmountToStake
        const percentToStake = maxRuneAmountToStake.amount().isGreaterThan(0)
          ? runeQuantity.amount().multipliedBy(100).dividedBy(maxRuneAmountToStake.amount()).toNumber()
          : 0
        setPercentValueToStake(percentToStake)
      }
    },
    [maxRuneAmountToStake, poolData]
  )

  const assetAmountChangeHandler = useCallback(
    (assetInput: BaseAmount) => {
      let assetQuantity = assetInput.amount().isGreaterThan(maxRuneAmountToStake.amount())
        ? maxRuneAmountToStake
        : assetInput
      const runeQuantity = Helper.getRuneAmountToStake(assetQuantity, poolData)

      if (runeQuantity.amount().isGreaterThan(maxRuneAmountToStake.amount())) {
        assetQuantity = Helper.getAssetAmountToStake(runeQuantity, poolData)
        setRuneAmountToStake(maxRuneAmountToStake)
        setAssetAmountToStake(assetQuantity)
        setPercentValueToStake(100)
      } else {
        setRuneAmountToStake(runeQuantity)
        setAssetAmountToStake(assetQuantity)
        // assetQuantity * 100 / maxAssetAmountToStake
        const percentToStake = maxRuneAmountToStake.amount().isGreaterThan(0)
          ? assetQuantity.amount().multipliedBy(100).dividedBy(maxRuneAmountToStake.amount()).toNumber()
          : 0
        setPercentValueToStake(percentToStake)
      }
    },
    [maxRuneAmountToStake, poolData]
  )

  const changePercentHandler = useCallback(
    (percent: number) => {
      const runeAmountBN = maxRuneAmountToStake.amount().dividedBy(100).multipliedBy(percent)
      const assetAmountBN = maxAssetAmountToStake.amount().dividedBy(100).multipliedBy(percent)
      setRuneAmountToStake(baseAmount(runeAmountBN))
      setAssetAmountToStake(baseAmount(assetAmountBN))
      setPercentValueToStake(percent)
    },
    [maxAssetAmountToStake, maxRuneAmountToStake]
  )

  const onStakeConfirmed = useCallback(() => {
    const asymDepositTx = () =>
      FP.pipe(
        sequenceTOption(oPoolAddress, oAsymDepositMemo),
        O.map(([poolAddress, asymDepositMemo]) => {
          const baseChainStakeTxParam = {
            chain: runeAsset.chain,
            asset: BASE_CHAIN_ASSET,
            poolAddress,
            amount: assetAmountToStake,
            memo: asymDepositMemo
          }
          console.log('ASYM Tx 1/1 ', baseChainStakeTxParam)
          return true
        })
      )

    const symDepositTx = () =>
      FP.pipe(
        sequenceTOption(oPoolAddress, oSymDepositMemo),
        O.map(([poolAddress, { rune: runeMemo, asset: assetMemo }]) => {
          const runeTxParam = {
            chain: runeAsset.chain,
            asset: BASE_CHAIN_ASSET,
            poolAddress,
            // TODO (@Veado) Ask about amount of NativeRune tx, maybe it can be ZERO
            // minimal tx amount of `RuneNative`
            amount: baseAmount(1),
            memo: runeMemo
          }
          console.log('SYM Tx 1/2 (rune):', runeTxParam)
          const assetTxParam = {
            chain: asset.chain,
            asset: asset,
            poolAddress,
            amount: assetAmountToStake,
            memo: assetMemo
          }
          console.log('SYM Tx 2/2 (asset):', assetTxParam)

          return true
        })
      )

    // TODO(@Veado) Call sendStakeTx of `services/chain/txs`
    // and handle results (error/success) in a modal here in `AddStake`
    FP.pipe(
      type === 'asym' ? asymDepositTx() : symDepositTx(),
      O.map((v) => console.log('success:', v)),
      O.getOrElse(() => console.log('no data to run txs'))
    )
  }, [type, oPoolAddress, oSymDepositMemo, runeAsset.chain, assetAmountToStake, oAsymDepositMemo, asset])

  const renderFeeError = useCallback(
    (fee: BaseAmount, balance: AssetAmount, asset: Asset) => {
      const msg = intl.formatMessage(
        { id: 'stake.add.error.chainFeeNotCovered' },
        {
          fee: Helper.formatFee(fee, asset),
          balance: formatAssetAmountCurrency({ amount: balance, asset, trimZeros: true })
        }
      )

      return <Styled.FeeErrorLabel>{msg}</Styled.FeeErrorLabel>
    },
    [intl]
  )

  const oBaseChainFee: O.Option<BaseAmount> = useMemo(
    () =>
      FP.pipe(
        fees,
        RD.toOption,
        O.map(({ base }) => base)
      ),
    [fees]
  )

  const isBaseChainFeeError = useMemo(() => {
    return FP.pipe(
      sequenceTOption(oBaseChainFee, oBaseChainAssetBalance),
      O.fold(
        // Missing (or loading) fees does not mean we can't sent something. No error then.
        () => !O.isNone(oBaseChainFee),
        ([fee, balance]) => balance.amount().isLessThan(fee.amount())
      )
    )
  }, [oBaseChainAssetBalance, oBaseChainFee])

  const renderBaseChainFeeError = useMemo(() => {
    const amount = FP.pipe(
      oBaseChainAssetBalance,
      O.getOrElse(() => ZERO_BASE_AMOUNT),
      baseToAsset
    )

    return FP.pipe(
      oBaseChainFee,
      O.map((fee) => renderFeeError(fee, amount, BASE_CHAIN_ASSET)),
      O.getOrElse(() => <></>)
    )
  }, [oBaseChainAssetBalance, oBaseChainFee, renderFeeError])

  const oCrossChainFee: O.Option<BaseAmount> = useMemo(
    () =>
      FP.pipe(
        fees,
        RD.toOption,
        O.chain(({ cross }) => cross)
      ),
    [fees]
  )

  const isCrossChainFeeError = useMemo(() => {
    if (!isCrossChain) return false

    return FP.pipe(
      sequenceTOption(oCrossChainFee, oCrossChainAssetBalance),
      O.fold(
        // Missing (or loading) fees does not mean we can't sent something. No error then.
        () => !O.isNone(oCrossChainFee),
        ([fee, balance]) => balance.amount().isLessThan(fee.amount())
      )
    )
  }, [isCrossChain, oCrossChainFee, oCrossChainAssetBalance])

  const renderCrossChainFeeError = useMemo(() => {
    const amount = FP.pipe(
      oCrossChainAssetBalance,
      O.getOrElse(() => ZERO_BASE_AMOUNT),
      baseToAsset
    )

    return FP.pipe(
      oCrossChainFee,
      O.map((fee) => renderFeeError(fee, amount, asset)),
      O.getOrElse(() => <></>)
    )
  }, [asset, oCrossChainAssetBalance, oCrossChainFee, renderFeeError])

  const feesLabel = useMemo(
    () =>
      FP.pipe(
        fees,
        RD.fold(
          () => '...',
          () => '...',
          (error) => `${intl.formatMessage({ id: 'common.error' })} ${error?.message ?? ''}`,
          ({ base, cross }) =>
            // Show one or two fees
            `${Helper.formatFee(base, BASE_CHAIN_ASSET)} ${FP.pipe(
              cross,
              O.map((crossFee) => ` + ${Helper.formatFee(crossFee, asset)}`),
              O.getOrElse(() => '')
            )}`
        )
      ),
    [asset, fees, intl]
  )

  const reloadFeesHandler = useCallback(() => reloadFees(type), [reloadFees, type])

  const disabledForm = useMemo(() => isBalanceError || isBaseChainFeeError || isCrossChainFeeError || disabled, [
    disabled,
    isBalanceError,
    isBaseChainFeeError,
    isCrossChainFeeError
  ])

  return (
    <Styled.Container>
      <Styled.BalanceErrorRow>
        <Col xs={24}>{showBalanceError && renderBalanceError}</Col>
      </Styled.BalanceErrorRow>
      <Styled.CardsRow gutter={{ lg: 32 }}>
        <Col xs={24} xl={12}>
          <Styled.AssetCard
            disabled={disabledForm}
            asset={asset}
            selectedAmount={assetAmountToStake}
            maxAmount={maxAssetAmountToStake}
            onChangeAssetAmount={assetAmountChangeHandler}
            price={assetPrice}
            assets={assets}
            percentValue={percentValueToStake}
            onChangePercent={changePercentHandler}
            onChangeAsset={onChangeAsset}
            priceAsset={priceAsset}
          />
        </Col>

        <Col xs={24} xl={12}>
          {!isAsym && (
            <Styled.AssetCard
              disabled={disabledForm}
              asset={runeAsset}
              selectedAmount={runeAmountToStake}
              maxAmount={maxRuneAmountToStake}
              onChangeAssetAmount={runeAmountChangeHandler}
              price={runePrice}
              priceAsset={priceAsset}
            />
          )}
        </Col>
      </Styled.CardsRow>

      <Styled.FeesRow gutter={{ lg: 32 }}>
        <Col xs={24} xl={12}>
          <Styled.FeeRow>
            <Col>
              <Styled.ReloadFeeButton onClick={reloadFeesHandler} disabled={RD.isPending(fees)}>
                <SyncOutlined />
              </Styled.ReloadFeeButton>
            </Col>
            <Col>
              <Styled.FeeLabel disabled={RD.isPending(fees)}>
                {isAsym ? intl.formatMessage({ id: 'common.fee' }) : intl.formatMessage({ id: 'common.fees' })}:{' '}
                {feesLabel}
              </Styled.FeeLabel>
            </Col>
          </Styled.FeeRow>
          <Styled.FeeErrorRow>
            <Col>
              <>
                {
                  // Don't show base-chain-fee error if we already display a error of balances
                  !isBalanceError && isBaseChainFeeError && renderBaseChainFeeError
                }
                {
                  // Don't show x-chain-fee error if we already display a error of balances
                  !isBalanceError && isCrossChainFeeError && renderCrossChainFeeError
                }
              </>
            </Col>
          </Styled.FeeErrorRow>
        </Col>
      </Styled.FeesRow>

      <Styled.DragWrapper>
        <Drag
          title={intl.formatMessage({ id: 'stake.drag' })}
          source={asset}
          target={asset}
          onConfirm={onStakeConfirmed}
          disabled={disabledForm || runeAmountToStake.amount().isZero()}
        />
      </Styled.DragWrapper>
    </Styled.Container>
  )
}
