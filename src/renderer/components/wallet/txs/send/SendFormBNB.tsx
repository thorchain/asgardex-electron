import React, { useCallback, useMemo } from 'react'

import { Address } from '@thorchain/asgardex-binance'
import {
  formatAssetAmountCurrency,
  assetAmount,
  AssetAmount,
  bn,
  baseToAsset,
  AssetBNB
} from '@thorchain/asgardex-util'
import { Row, Form } from 'antd'
import BigNumber from 'bignumber.js'
import * as FP from 'fp-ts/lib/function'
import * as O from 'fp-ts/lib/Option'
import { useIntl } from 'react-intl'

import { ZERO_ASSET_AMOUNT, ZERO_BN } from '../../../../const'
import { isBnbAsset } from '../../../../helpers/assetHelper'
import { sequenceTOption } from '../../../../helpers/fpHelpers'
import { getBnbAmountFromBalances } from '../../../../helpers/walletHelper'
import { SendTxParams } from '../../../../services/binance/transaction'
import { AddressValidation } from '../../../../services/binance/types'
import { AssetsWithBalance, AssetWithBalance } from '../../../../services/wallet/types'
import { Input, InputBigNumber } from '../../../uielements/input'
import AccountSelector from '../../AccountSelector'
import * as Styled from '../Form.style'
import { validateTxAmountInput } from '../util'
import useChangeAssetHandler from './useChangeAssetHandler'

export type FormValues = {
  recipient: Address
  amount: string
  memo?: string
}

type Props = {
  assetsWB: AssetsWithBalance
  assetWB: AssetWithBalance
  onSubmit: ({ to, amount, asset, memo }: SendTxParams) => void
  isLoading?: boolean
  addressValidation: AddressValidation
  fee: O.Option<AssetAmount>
}

const SendFormBNB: React.FC<Props> = (props): JSX.Element => {
  const { onSubmit, assetsWB, assetWB, isLoading = false, addressValidation, fee: oFee } = props
  const intl = useIntl()

  const changeAssetHandler = useChangeAssetHandler()

  const [form] = Form.useForm<FormValues>()

  const oBnbAmount: O.Option<AssetAmount> = useMemo(() => {
    // return balance of current asset (if BNB)
    if (isBnbAsset(assetWB.asset)) {
      return O.some(baseToAsset(assetWB.amount))
    }
    // or check list of other assets to get bnb balance
    return FP.pipe(assetsWB, getBnbAmountFromBalances)
  }, [assetWB, assetsWB])

  const feeLabel = useMemo(
    () =>
      FP.pipe(
        oFee,
        O.fold(
          () => '--',
          (fee) => formatAssetAmountCurrency({ amount: fee, asset: AssetBNB, trimZeros: true })
        )
      ),
    [oFee]
  )

  const isFeeError = useMemo(() => {
    return FP.pipe(
      sequenceTOption(oFee, oBnbAmount),
      O.fold(
        // Missing (or loading) fees does not mean we can't sent something. No error then.
        () => !O.isNone(oFee),
        ([fee, bnbAmount]) => bnbAmount.amount().isLessThan(fee.amount())
      )
    )
  }, [oBnbAmount, oFee])

  const renderFeeError = useMemo(() => {
    if (!isFeeError) return <></>

    const amount = FP.pipe(
      oBnbAmount,
      // no bnb asset == zero amount
      O.getOrElse(() => ZERO_ASSET_AMOUNT)
    )

    const msg = intl.formatMessage(
      { id: 'wallet.errors.fee.notCovered' },
      {
        balance: formatAssetAmountCurrency({ amount, asset: AssetBNB, trimZeros: true })
      }
    )

    return (
      <Styled.StyledLabel size="big" color="error">
        {msg}
      </Styled.StyledLabel>
    )
  }, [oBnbAmount, intl, isFeeError])

  const addressValidator = useCallback(
    async (_: unknown, value: string) => {
      if (!value) {
        return Promise.reject(intl.formatMessage({ id: 'wallet.errors.address.empty' }))
      }
      if (!addressValidation(value.toLowerCase())) {
        return Promise.reject(intl.formatMessage({ id: 'wallet.errors.address.invalid' }))
      }
    },
    [addressValidation, intl]
  )

  const amountValidator = useCallback(
    async (_: unknown, value: BigNumber) => {
      // max amount for bnb
      const maxBnbAmount = FP.pipe(
        sequenceTOption(oFee, oBnbAmount),
        O.fold(
          // Set maxAmount to zero if we dont know anything about bnb and fee amounts
          () => ZERO_BN,
          ([fee, bnbAmount]) => bnbAmount.amount().minus(fee.amount())
        ),
        assetAmount
      )
      const maxAmount = isBnbAsset(assetWB.asset) ? maxBnbAmount : baseToAsset(assetWB.amount)
      // error messages
      const errors = {
        msg1: intl.formatMessage({ id: 'wallet.errors.amount.shouldBeNumber' }),
        msg2: intl.formatMessage({ id: 'wallet.errors.amount.shouldBeGreaterThan' }, { amount: '0' }),
        msg3: isBnbAsset(assetWB.asset)
          ? intl.formatMessage({ id: 'wallet.errors.amount.shouldBeLessThanBalanceAndFee' })
          : intl.formatMessage({ id: 'wallet.errors.amount.shouldBeLessThanBalance' })
      }
      return validateTxAmountInput({ input: value, maxAmount, errors })
    },
    [assetWB, oFee, intl, oBnbAmount]
  )

  const onFinishHandler = useCallback(
    ({ amount, recipient, memo }: FormValues) => {
      onSubmit({ to: recipient, amount: assetAmount(amount), asset: assetWB.asset, memo })
    },
    [onSubmit, assetWB]
  )

  return (
    <Row>
      <Styled.Col span={24}>
        <AccountSelector onChange={changeAssetHandler} selectedAsset={assetWB.asset} assets={assetsWB} />
        <Styled.Form form={form} initialValues={{ amount: bn(0) }} onFinish={onFinishHandler} labelCol={{ span: 24 }}>
          <Styled.SubForm>
            <Styled.CustomLabel size="big">{intl.formatMessage({ id: 'common.address' })}</Styled.CustomLabel>
            <Form.Item rules={[{ required: true, validator: addressValidator }]} name="recipient">
              <Input color="primary" size="large" disabled={isLoading} />
            </Form.Item>
            <Styled.CustomLabel size="big">{intl.formatMessage({ id: 'common.amount' })}</Styled.CustomLabel>
            <Styled.FormItem rules={[{ required: true, validator: amountValidator }]} name="amount">
              <InputBigNumber min={0} size="large" disabled={isLoading} decimal={8} />
            </Styled.FormItem>
            <Styled.StyledLabel size="big">
              <>
                {intl.formatMessage({ id: 'common.max' })}:{' '}
                {formatAssetAmountCurrency({
                  amount: baseToAsset(assetWB.amount),
                  asset: assetWB.asset,
                  trimZeros: true
                })}
                <br />
                {intl.formatMessage({ id: 'common.fees' })}: {feeLabel}
              </>
            </Styled.StyledLabel>
            {renderFeeError}
            <Styled.CustomLabel size="big">{intl.formatMessage({ id: 'common.memo' })}</Styled.CustomLabel>
            <Form.Item name="memo">
              <Input size="large" disabled={isLoading} />
            </Form.Item>
          </Styled.SubForm>
          <Styled.SubmitItem>
            <Styled.Button loading={isLoading} disabled={isFeeError} htmlType="submit">
              {intl.formatMessage({ id: 'wallet.action.send' })}
            </Styled.Button>
          </Styled.SubmitItem>
        </Styled.Form>
      </Styled.Col>
    </Row>
  )
}

export default SendFormBNB
