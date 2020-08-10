import React, { useMemo, useState } from 'react'

import * as RD from '@devexperts/remote-data-ts'
import { Asset, bn } from '@thorchain/asgardex-util'
import { Row, Form } from 'antd'
import { Store } from 'antd/lib/form/interface'
import BigNumber from 'bignumber.js'
import { pipe } from 'fp-ts/lib/pipeable'
import { useIntl } from 'react-intl'

import { ASSETS_MAINNET } from '../../../shared/mock/assets'
import { sequenceTRD } from '../../helpers/fpHelpers'
import { BalancesRD } from '../../services/binance/types'
import { bncSymbolToAsset } from '../../services/binance/utils'
import { Input, InputNumber } from '../uielements/input'
import AccountSelector from './AccountSelector'
import * as Styled from './Send.style'

type SendFormProps = {
  balances?: BalancesRD
  initialActiveAsset?: Asset | null
  onSubmit: (recipient: string, amount: number, symbol: string, password?: string) => void
}

export const SendForm: React.FC<SendFormProps> = ({
  onSubmit: onSubmitProp,
  balances = RD.initial,
  initialActiveAsset
}): JSX.Element => {
  const intl = useIntl()
  const [activeAsset, setActiveAsset] = useState<Asset & { balance?: BigNumber }>(
    initialActiveAsset || ASSETS_MAINNET.BOLT
  )

  const balancesValue = useMemo(
    () =>
      pipe(
        balances,
        RD.map((balances) =>
          balances.map((balance) =>
            pipe(
              bncSymbolToAsset(balance.symbol),
              (val) => RD.fromOption(val, () => Error('')),
              RD.map((asset) => ({ ...asset, balance: bn(balance.free) }))
            )
          )
        ),
        RD.chain(sequenceTRD(() => Error('No Data')))
      ),
    [balances]
  )

  const [form] = Styled.Form.useForm()

  const addressValidator = async (_: unknown, value: string) => {
    if (!value || value.length < 8) {
      return Promise.reject(intl.formatMessage({ id: 'wallet.send.errors.address.length' }))
    }
  }
  const amountValidator = async (_: unknown, stringValue: string) => {
    const value = bn(stringValue)
    if (Number.isNaN(value)) {
      return Promise.reject(intl.formatMessage({ id: 'wallet.send.errors.amount.shouldBeNumber' }))
    }

    if (!value.isGreaterThan(0)) {
      return Promise.reject(intl.formatMessage({ id: 'wallet.send.errors.amount.shouldBePositive' }))
    }

    if (value.isGreaterThan(activeAsset.balance || 0)) {
      return Promise.reject('should be less then your balance')
    }

    // @TODO: Add check form Max available amount
  }

  const onSubmit = (data: Store) => {
    onSubmitProp(data.recipient, data.amount, activeAsset.symbol, data.password)
  }

  const renderSelect = useMemo(() => {
    return pipe(
      balancesValue,
      RD.fold(
        () => <></>,
        () => <></>,
        () => <></>,
        (balances) => {
          return <AccountSelector onChange={setActiveAsset} asset={activeAsset} assets={balances} />
        }
      )
    )
  }, [balancesValue, activeAsset])

  return (
    <Row>
      <Styled.Col span={24}>
        {/* AccountSelector needs data - we are using mock data for now */}
        {/*<AccountSelector onChange={setActiveAsset} asset={activeAsset} assets={Object.values(ASSETS_MAINNET)} />*/}
        {renderSelect}
        <Styled.Form form={form} onFinish={onSubmit} labelCol={{ span: 24 }}>
          <Styled.SubForm>
            <Styled.CustomLabel size="big">{intl.formatMessage({ id: 'common.address' })}</Styled.CustomLabel>
            <Form.Item rules={[{ required: true, validator: addressValidator }]} name="recipient">
              <Input color="primary" size="large" />
            </Form.Item>
            <Styled.CustomLabel size="big">{intl.formatMessage({ id: 'common.amount' })}</Styled.CustomLabel>
            <Styled.FormItem rules={[{ required: true, validator: amountValidator }]} name="amount">
              <InputNumber min={0} size="large" />
            </Styled.FormItem>
            <Styled.StyledLabel size="big">MAX: {activeAsset.balance?.toFormat()}</Styled.StyledLabel>
            <Styled.CustomLabel size="big">{intl.formatMessage({ id: 'common.memo' })}</Styled.CustomLabel>
            <Form.Item name="password">
              <Input size="large" />
            </Form.Item>
          </Styled.SubForm>
          <Styled.SubmitItem>
            <Styled.Button htmlType="submit">{intl.formatMessage({ id: 'wallet.action.send' })}</Styled.Button>
          </Styled.SubmitItem>
        </Styled.Form>
      </Styled.Col>
    </Row>
  )
}
