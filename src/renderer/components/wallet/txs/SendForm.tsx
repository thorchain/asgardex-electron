import React, { useCallback, useMemo } from 'react'

import { Address } from '@thorchain/asgardex-binance'
import {
  assetToString,
  Asset,
  formatAssetAmountCurrency,
  assetAmount,
  AssetAmount,
  formatAssetAmount
} from '@thorchain/asgardex-util'
import { Row, Form } from 'antd'
import * as FP from 'fp-ts/lib/function'
import * as O from 'fp-ts/lib/Option'
import { useIntl } from 'react-intl'
import { useHistory } from 'react-router-dom'

import { isBnbAsset, BNB_SYMBOL } from '../../../helpers/assetHelper'
import { getBnbAmount } from '../../../helpers/binanceHelper'
import * as walletRoutes from '../../../routes/wallet'
import { SendTxParams } from '../../../services/binance/transaction'
import { AssetWithBalance, AddressValidation, AssetsWithBalance } from '../../../services/binance/types'
import { Input, InputBigNumber } from '../../uielements/input'
import AccountSelector from './../AccountSelector'
import * as Styled from './Form.style'
import { sendAmountValidator } from './util'

export type FormValues = {
  recipient: Address
  amount: string
  memo?: string
}

type Props = {
  assetsWB: AssetsWithBalance
  assetWB: AssetWithBalance
  onSubmit: ({ to, amount, asset, memo }: SendTxParams) => void
  isLoading: boolean
  addressValidation: AddressValidation
  fee: O.Option<AssetAmount>
}

export const SendForm: React.FC<Props> = (props): JSX.Element => {
  const { onSubmit: onSubmitProp, assetsWB, assetWB, isLoading = false, addressValidation, fee } = props
  const intl = useIntl()
  const history = useHistory()

  const [form] = Form.useForm<FormValues>()

  const bnbAmount = useMemo(() => {
    // return balance of current asset (if BNB)
    if (isBnbAsset(assetWB.asset)) {
      return assetWB.balance
    }
    // or check list of other assets to get bnb balance
    return FP.pipe(
      assetsWB,
      getBnbAmount,
      // no bnb asset == zero amount
      O.getOrElse(() => assetAmount(0))
    )
  }, [assetWB, assetsWB])

  const feeLabel = useMemo(
    () =>
      FP.pipe(
        fee,
        O.fold(
          () => '--',
          (f) => `${formatAssetAmount(f, 6)} ${BNB_SYMBOL}`
        )
      ),
    [fee]
  )

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
    async (_: unknown, value: string) => sendAmountValidator({ input: value, assetWB, fee, intl, bnbAmount }),
    [assetWB, fee, intl, bnbAmount]
  )

  const onSubmit = useCallback(
    ({ amount, recipient, memo }: FormValues) => {
      onSubmitProp({ to: recipient, amount: assetAmount(amount), asset: assetWB.asset, memo })
    },
    [onSubmitProp, assetWB]
  )

  const changeSelectorHandler = (asset: Asset) => {
    const path = walletRoutes.send.path({ asset: assetToString(asset) })
    history.push(path)
  }

  return (
    <Row>
      <Styled.Col span={24}>
        <AccountSelector onChange={changeSelectorHandler} selectedAsset={assetWB.asset} assets={assetsWB} />
        {/* `Form<FormValue>` does not work in `styled(Form)`, so we have to add styles here. All is just needed to have correct types in `onFinish` handler)  */}
        <Form form={form} onFinish={onSubmit} labelCol={{ span: 24 }} style={{ padding: '30px' }}>
          <Styled.SubForm>
            <Styled.CustomLabel size="big">{intl.formatMessage({ id: 'common.address' })}</Styled.CustomLabel>
            <Form.Item rules={[{ required: true, validator: addressValidator }]} name="recipient">
              <Input color="primary" size="large" disabled={isLoading} />
            </Form.Item>
            <Styled.CustomLabel size="big">{intl.formatMessage({ id: 'common.amount' })}</Styled.CustomLabel>
            <Styled.FormItem rules={[{ required: true, validator: amountValidator }]} name="amount">
              {/* TODO(@Veado) In future decimal will be changed depending on selected asset, currently we have just BNB assets (decimal = 8) */}
              <InputBigNumber min={0} size="large" disabled={isLoading} decimal={8} />
            </Styled.FormItem>
            <Styled.StyledLabel size="big">
              <>
                {intl.formatMessage({ id: 'common.max' })}:{' '}
                {formatAssetAmountCurrency(assetWB.balance, assetToString(assetWB.asset))}
                <br />
                {intl.formatMessage({ id: 'common.fees' })}: {feeLabel}
              </>
            </Styled.StyledLabel>
            <Styled.CustomLabel size="big">{intl.formatMessage({ id: 'common.memo' })}</Styled.CustomLabel>
            <Form.Item name="memo">
              <Input size="large" disabled={isLoading} />
            </Form.Item>
          </Styled.SubForm>
          <Styled.SubmitItem>
            <Styled.Button loading={isLoading} htmlType="submit">
              {intl.formatMessage({ id: 'wallet.action.send' })}
            </Styled.Button>
          </Styled.SubmitItem>
        </Form>
      </Styled.Col>
    </Row>
  )
}
