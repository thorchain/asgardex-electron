import React, { useState, useMemo } from 'react'

import * as RD from '@devexperts/remote-data-ts'
import { Asset, assetAmount, AssetRuneNative, BaseAmount, formatAssetAmountCurrency } from '@xchainjs/xchain-util'
import { Row } from 'antd'
import BigNumber from 'bignumber.js'
import * as FP from 'fp-ts/function'
import { useIntl } from 'react-intl'

import { BASE_CHAIN_ASSET } from '../../../const'
import { eqAsset } from '../../../helpers/fp/eq'
import { WithdrawFeeRD } from '../../../services/chain/types'
import { Fees } from '../../uielements/fees'
import { Label } from '../../uielements/label'
import { ReloadButton } from '../../uielements/reloadButton'
import { getWithdrawAmounts } from './Withdraw.helper'
import * as Styled from './Withdraw.styles'

type Props = {
  depositAsset: Asset
  runePrice: BigNumber
  assetPrice: BigNumber
  selectedCurrencyAsset: Asset
  onWithdraw: (percent: number) => void
  updateFees: () => void
  runeShare: BaseAmount
  assetShare: BaseAmount
  disabled?: boolean
  fee: WithdrawFeeRD
}

export const Withdraw: React.FC<Props> = ({
  onWithdraw,
  depositAsset,
  runePrice,
  assetPrice,
  selectedCurrencyAsset,
  runeShare,
  assetShare,
  disabled: disabledProp,
  fee,
  updateFees
}) => {
  const intl = useIntl()
  const [withdrawPercent, setWithdrawPercent] = useState(disabledProp ? 0 : 50)

  const disabled = useMemo(() => withdrawPercent === 0 || disabledProp, [withdrawPercent, disabledProp])

  const withdrawAmounts = getWithdrawAmounts(runeShare, assetShare, withdrawPercent)
  const renderFee = useMemo(
    () => [
      FP.pipe(
        fee,
        RD.map((fee) => ({
          asset: BASE_CHAIN_ASSET,
          amount: fee
        })),
        (feesRd) => <Fees fees={[feesRd]} />
      )
    ],
    [fee]
  )

  return (
    <Styled.Container>
      <Label weight="bold" textTransform="uppercase">
        {intl.formatMessage({ id: 'deposit.withdraw.title' })}
      </Label>
      <Label>{intl.formatMessage({ id: 'deposit.withdraw.choseText' })}</Label>

      <Styled.Slider
        key={'asset amount slider'}
        value={withdrawPercent}
        onChange={setWithdrawPercent}
        disabled={disabled}
      />
      <Label weight={'bold'} textTransform={'uppercase'}>
        {intl.formatMessage({ id: 'deposit.withdraw.receiveText' })}
      </Label>

      <Styled.AssetContainer>
        <Styled.AssetIcon asset={AssetRuneNative} />
        <Styled.OutputLabel weight={'bold'}>
          {formatAssetAmountCurrency({
            amount: withdrawAmounts.runeWithdraw,
            asset: AssetRuneNative,
            trimZeros: true
          })}
          {/* show pricing if price asset is different only */}
          {!eqAsset.equals(AssetRuneNative, selectedCurrencyAsset) &&
            ` (${formatAssetAmountCurrency({
              amount: assetAmount(withdrawAmounts.runeWithdraw.amount().times(runePrice)),
              asset: selectedCurrencyAsset,
              trimZeros: true
            })})`}
        </Styled.OutputLabel>
      </Styled.AssetContainer>

      <Styled.AssetContainer>
        <Styled.AssetIcon asset={depositAsset} />
        <Styled.OutputLabel weight={'bold'}>
          {formatAssetAmountCurrency({
            amount: withdrawAmounts.assetWithdraw,
            asset: depositAsset,
            trimZeros: true
          })}
          {/* show pricing if price asset is different only */}
          {!eqAsset.equals(depositAsset, selectedCurrencyAsset) &&
            ` (${formatAssetAmountCurrency({
              amount: assetAmount(withdrawAmounts.assetWithdraw.amount().times(assetPrice)),
              asset: selectedCurrencyAsset,
              trimZeros: true
            })})`}
        </Styled.OutputLabel>
      </Styled.AssetContainer>

      <Label disabled={RD.isPending(fee)}>
        <Row align="middle">
          <ReloadButton onClick={updateFees} disabled={RD.isPending(fee)} />
          {renderFee}
        </Row>
      </Label>

      <Styled.Drag
        title={intl.formatMessage({ id: 'deposit.withdraw.drag' })}
        onConfirm={() => onWithdraw(withdrawPercent)}
        disabled={disabled}
      />
    </Styled.Container>
  )
}
