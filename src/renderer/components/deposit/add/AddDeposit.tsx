import React, { useCallback, useMemo, useState } from 'react'

import { SyncOutlined } from '@ant-design/icons'
import * as RD from '@devexperts/remote-data-ts'
import { PoolData } from '@thorchain/asgardex-util'
import {
  Asset,
  AssetAmount,
  AssetRuneNative,
  baseAmount,
  BaseAmount,
  baseToAsset,
  formatAssetAmountCurrency
} from '@xchainjs/xchain-util'
import { Col } from 'antd'
import BigNumber from 'bignumber.js'
import * as FP from 'fp-ts/lib/function'
import * as O from 'fp-ts/lib/Option'
import { useIntl } from 'react-intl'

import { ZERO_BASE_AMOUNT } from '../../../const'
import { sequenceTOption } from '../../../helpers/fpHelpers'
import { SymDepositMemo, Memo, SendDepositTxParams, DepositFeesRD } from '../../../services/chain/types'
import { PoolAddress } from '../../../services/midgard/types'
import { DepositType } from '../../../types/asgardex'
import { Drag } from '../../uielements/drag'
import { formatFee } from '../../uielements/fees/Fees.helper'
import * as Helper from './AddDeposit.helper'
import * as Styled from './AddDeposit.style'

type Props = {
  type: DepositType
  asset: Asset
  assetPrice: BigNumber
  runePrice: BigNumber
  assetBalance: O.Option<BaseAmount>
  runeBalance: O.Option<BaseAmount>
  chainAssetBalance: O.Option<BaseAmount>
  poolAddress: O.Option<PoolAddress>
  asymDepositMemo: O.Option<Memo>
  symDepositMemo: O.Option<SymDepositMemo>
  priceAsset?: Asset
  fees: DepositFeesRD
  reloadFees: (type: DepositType) => void
  assets?: Asset[]
  onDeposit: (p: SendDepositTxParams) => void
  onChangeAsset: (asset: Asset) => void
  disabled?: boolean
  poolData: PoolData
}

export const AddDeposit: React.FC<Props> = (props) => {
  const {
    type,
    asset,
    assetPrice,
    runePrice,
    assetBalance: oAssetBalance,
    runeBalance: oRuneBalance,
    chainAssetBalance: oChainAssetBalance,
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
  const [runeAmountToDeposit, setRuneAmountToDeposit] = useState<BaseAmount>(ZERO_BASE_AMOUNT)
  const [assetAmountToDeposit, setAssetAmountToDeposit] = useState<BaseAmount>(ZERO_BASE_AMOUNT)
  const [percentValueToDeposit, setPercentValueToDeposit] = useState(0)

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

  const maxRuneAmountToDeposit = useMemo(
    (): BaseAmount => Helper.maxRuneAmountToDeposit({ poolData, runeBalance, assetBalance }),
    [assetBalance, poolData, runeBalance]
  )

  const maxAssetAmountToDeposit = useMemo(
    (): BaseAmount => Helper.maxAssetAmountToDeposit({ poolData, runeBalance, assetBalance }),
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
      { id: 'deposit.add.error.nobalance1' },
      {
        asset: asset.ticker
      }
    )

    const noRuneBalancesMsg = intl.formatMessage(
      { id: 'deposit.add.error.nobalance1' },
      {
        asset: AssetRuneNative.ticker
      }
    )

    const noRuneAndAssetBalancesMsg = intl.formatMessage(
      { id: 'deposit.add.error.nobalance2' },
      {
        asset1: asset.ticker,
        asset2: AssetRuneNative.ticker
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

    const title = intl.formatMessage({ id: 'deposit.add.error.nobalances' })

    const msg = type === 'sym' ? symMsg : asymMsg
    return <Styled.BalanceAlert type="warning" message={title} description={msg} />
  }, [asset.ticker, hasAssetBalance, hasRuneBalance, intl, type])

  const runeAmountChangeHandler = useCallback(
    (runeInput: BaseAmount) => {
      let runeQuantity = runeInput.amount().isGreaterThan(maxRuneAmountToDeposit.amount())
        ? maxRuneAmountToDeposit
        : runeInput
      const assetQuantity = Helper.getAssetAmountToDeposit(runeQuantity, poolData)

      if (assetQuantity.amount().isGreaterThan(maxRuneAmountToDeposit.amount())) {
        runeQuantity = Helper.getRuneAmountToDeposit(maxRuneAmountToDeposit, poolData)
        setRuneAmountToDeposit(runeQuantity)
        setAssetAmountToDeposit(maxRuneAmountToDeposit)
        setPercentValueToDeposit(100)
      } else {
        setRuneAmountToDeposit(runeQuantity)
        setAssetAmountToDeposit(assetQuantity)
        // formula: runeQuantity * 100 / maxRuneAmountToDeposit
        const percentToDeposit = maxRuneAmountToDeposit.amount().isGreaterThan(0)
          ? runeQuantity.amount().multipliedBy(100).dividedBy(maxRuneAmountToDeposit.amount()).toNumber()
          : 0
        setPercentValueToDeposit(percentToDeposit)
      }
    },
    [maxRuneAmountToDeposit, poolData]
  )

  const assetAmountChangeHandler = useCallback(
    (assetInput: BaseAmount) => {
      let assetQuantity = assetInput.amount().isGreaterThan(maxRuneAmountToDeposit.amount())
        ? maxRuneAmountToDeposit
        : assetInput
      const runeQuantity = Helper.getRuneAmountToDeposit(assetQuantity, poolData)

      if (runeQuantity.amount().isGreaterThan(maxRuneAmountToDeposit.amount())) {
        assetQuantity = Helper.getAssetAmountToDeposit(runeQuantity, poolData)
        setRuneAmountToDeposit(maxRuneAmountToDeposit)
        setAssetAmountToDeposit(assetQuantity)
        setPercentValueToDeposit(100)
      } else {
        setRuneAmountToDeposit(runeQuantity)
        setAssetAmountToDeposit(assetQuantity)
        // assetQuantity * 100 / maxAssetAmountToDeposit
        const percentToDeposit = maxRuneAmountToDeposit.amount().isGreaterThan(0)
          ? assetQuantity.amount().multipliedBy(100).dividedBy(maxRuneAmountToDeposit.amount()).toNumber()
          : 0
        setPercentValueToDeposit(percentToDeposit)
      }
    },
    [maxRuneAmountToDeposit, poolData]
  )

  const changePercentHandler = useCallback(
    (percent: number) => {
      const runeAmountBN = maxRuneAmountToDeposit.amount().dividedBy(100).multipliedBy(percent)
      const assetAmountBN = maxAssetAmountToDeposit.amount().dividedBy(100).multipliedBy(percent)
      setRuneAmountToDeposit(baseAmount(runeAmountBN))
      setAssetAmountToDeposit(baseAmount(assetAmountBN))
      setPercentValueToDeposit(percent)
    },
    [maxAssetAmountToDeposit, maxRuneAmountToDeposit]
  )

  const confirmDepositHandler = useCallback(() => {
    const asymDepositTx = () =>
      FP.pipe(
        sequenceTOption(oPoolAddress, oAsymDepositMemo),
        O.map(([poolAddress, asymDepositMemo]) => {
          const asymDepositTxParam = {
            asset: asset,
            poolAddress,
            amount: assetAmountToDeposit,
            memo: asymDepositMemo
          }
          console.log('ASYM Tx 1/1 ', asymDepositTxParam)
          return true
        })
      )

    const symDepositTx = () =>
      FP.pipe(
        sequenceTOption(oPoolAddress, oSymDepositMemo),
        O.map(([poolAddress, { rune: runeMemo, asset: assetMemo }]) => {
          const thorchainTxParam = {
            asset: AssetRuneNative,
            poolAddress,
            // TODO (@Veado) NativeRune tx, maybe it can be ZERO
            // minimal tx amount of `RuneNative`
            amount: baseAmount(1),
            memo: runeMemo
          }
          console.log('SYM Tx 1/2 (thorchain):', thorchainTxParam)
          const assetChainTxParam = {
            asset: asset,
            poolAddress,
            amount: assetAmountToDeposit,
            memo: assetMemo
          }
          console.log('SYM Tx 2/2 (asset chain):', assetChainTxParam)

          return true
        })
      )

    // TODO(@Veado) Call sendDepositTx of `services/chain/txs`
    // and handle results (error/success) in a modal here in `AddStake`
    FP.pipe(
      type === 'asym' ? asymDepositTx() : symDepositTx(),
      O.map((v) => console.log('success:', v)),
      O.getOrElse(() => console.log('no data to run txs'))
    )
  }, [type, oPoolAddress, oSymDepositMemo, assetAmountToDeposit, oAsymDepositMemo, asset])

  const renderFeeError = useCallback(
    (fee: BaseAmount, balance: AssetAmount, asset: Asset) => {
      const msg = intl.formatMessage(
        { id: 'deposit.add.error.chainFeeNotCovered' },
        {
          fee: formatFee({ amount: fee, asset }),
          balance: formatAssetAmountCurrency({ amount: balance, asset, trimZeros: true })
        }
      )

      return <Styled.FeeErrorLabel>{msg}</Styled.FeeErrorLabel>
    },
    [intl]
  )

  const oThorchainFee: O.Option<BaseAmount> = useMemo(
    () =>
      FP.pipe(
        fees,
        RD.toOption,
        O.chain(({ thor }) => thor)
      ),
    [fees]
  )

  const isThorchainFeeError = useMemo(() => {
    return FP.pipe(
      sequenceTOption(oThorchainFee, oRuneBalance),
      O.fold(
        // Missing (or loading) fees does not mean we can't sent something. No error then.
        () => !O.isNone(oThorchainFee),
        ([fee, balance]) => balance.amount().isLessThan(fee.amount())
      )
    )
  }, [oRuneBalance, oThorchainFee])

  const renderThorchainFeeError = useMemo(() => {
    const amount = FP.pipe(
      oRuneBalance,
      O.getOrElse(() => ZERO_BASE_AMOUNT),
      baseToAsset
    )

    return FP.pipe(
      oThorchainFee,
      O.map((fee) => renderFeeError(fee, amount, AssetRuneNative)),
      O.getOrElse(() => <></>)
    )
  }, [oRuneBalance, oThorchainFee, renderFeeError])

  const oAssetChainFee: O.Option<BaseAmount> = useMemo(
    () =>
      FP.pipe(
        fees,
        RD.toOption,
        O.map(({ asset }) => asset)
      ),
    [fees]
  )

  const isAssetChainFeeError = useMemo(() => {
    return FP.pipe(
      sequenceTOption(oAssetChainFee, oChainAssetBalance),
      O.fold(
        // Missing (or loading) fees does not mean we can't sent something. No error then.
        () => !O.isNone(oAssetChainFee),
        ([fee, balance]) => balance.amount().isLessThan(fee.amount())
      )
    )
  }, [oAssetChainFee, oChainAssetBalance])

  const renderAssetChainFeeError = useMemo(() => {
    const amount = FP.pipe(
      oChainAssetBalance,
      O.getOrElse(() => ZERO_BASE_AMOUNT),
      baseToAsset
    )

    return FP.pipe(
      oAssetChainFee,
      O.map((fee) => renderFeeError(fee, amount, asset)),
      O.getOrElse(() => <></>)
    )
  }, [oChainAssetBalance, oAssetChainFee, renderFeeError, asset])

  const feesLabel = useMemo(
    () =>
      FP.pipe(
        fees,
        RD.fold(
          () => '...',
          () => '...',
          (error) => `${intl.formatMessage({ id: 'common.error' })} ${error?.message ?? ''}`,
          ({ thor: oThorFee, asset: assetFee }) =>
            // Show one (asym deposit)
            // or
            // two fees (sym)
            `${FP.pipe(
              oThorFee,
              O.map((thorFee) => `${formatFee({ amount: thorFee, asset: AssetRuneNative })} + `),
              O.getOrElse(() => '')
            )} ${formatFee({ amount: assetFee, asset })}`
        )
      ),
    [asset, fees, intl]
  )

  const reloadFeesHandler = useCallback(() => reloadFees(type), [reloadFees, type])

  const disabledForm = useMemo(() => isBalanceError || isThorchainFeeError || disabled, [
    disabled,
    isBalanceError,
    isThorchainFeeError
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
            selectedAmount={assetAmountToDeposit}
            maxAmount={maxAssetAmountToDeposit}
            onChangeAssetAmount={assetAmountChangeHandler}
            price={assetPrice}
            assets={assets}
            percentValue={percentValueToDeposit}
            onChangePercent={changePercentHandler}
            onChangeAsset={onChangeAsset}
            priceAsset={priceAsset}
          />
        </Col>

        <Col xs={24} xl={12}>
          {!isAsym && (
            <Styled.AssetCard
              disabled={disabledForm}
              asset={AssetRuneNative}
              selectedAmount={runeAmountToDeposit}
              maxAmount={maxRuneAmountToDeposit}
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
                  // Don't show thorchain fee error if we already display a error of balances
                  !isBalanceError && isThorchainFeeError && renderThorchainFeeError
                }
                {
                  // Don't show asset chain fee error if we already display a error of balances
                  !isBalanceError && isAssetChainFeeError && renderAssetChainFeeError
                }
              </>
            </Col>
          </Styled.FeeErrorRow>
        </Col>
      </Styled.FeesRow>

      <Styled.DragWrapper>
        <Drag
          title={intl.formatMessage({ id: 'deposit.drag' })}
          onConfirm={confirmDepositHandler}
          disabled={disabledForm || runeAmountToDeposit.amount().isZero()}
        />
      </Styled.DragWrapper>
    </Styled.Container>
  )
}
