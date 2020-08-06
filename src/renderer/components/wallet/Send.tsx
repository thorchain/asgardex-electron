import React, { useEffect, useState } from 'react'

import * as RD from '@devexperts/remote-data-ts'
import { Row, Form } from 'antd'
import { Store } from 'antd/lib/form/interface'
import { pipe } from 'fp-ts/lib/pipeable'
import { useObservableState } from 'observable-hooks'
import { useIntl } from 'react-intl'

import { ASSETS_MAINNET } from '../../../shared/mock/assets'
import { BinanceContextValue } from '../../contexts/BinanceContext'
import BackLink from '../uielements/backLink'
import { Input, InputNumber } from '../uielements/input'
import AccountSelector from './AccountSelector'
import * as Styled from './Send.style'

type SendProps = {
  transactionService: BinanceContextValue['transaction']
}

const Send: React.FC<SendProps> = ({ transactionService }): JSX.Element => {
  const intl = useIntl()
  const [activeAsset, setActiveAsset] = useState(ASSETS_MAINNET.BOLT)

  useEffect(() => {
    transactionService.resetTx()
  }, [transactionService])

  const transaction = useObservableState(transactionService.transaction$, RD.initial)

  const [form] = Styled.Form.useForm()

  const addressValidator = async (_: unknown, value: string) => {
    if (!value || value.length < 8) {
      return Promise.reject('Address should be at least 8 symbols length')
    }
  }
  const amountValidator = async (_: unknown, stringValue: string) => {
    const value = Number(stringValue)
    if (Number.isNaN(value)) {
      return Promise.reject('Amount should be a number')
    }

    if (value <= 0) {
      return Promise.reject('Amount should be positive')
    }

    // @TODO: Add check form Max available amount
  }

  const onSubmit = (data: Store) => {
    transactionService.pushTx(data.recipient, data.amount, activeAsset.symbol, data.password)
  }

  return (
    <>
      <BackLink />
      {pipe(
        transaction,
        RD.fold(
          () => (
            <Row>
              <Styled.Col span={24}>
                {/* AccountSelector needs data - we are using mock data for now */}
                <AccountSelector onChange={setActiveAsset} asset={activeAsset} assets={Object.values(ASSETS_MAINNET)} />
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
                    <Styled.StyledLabel size="big">MAX 35.3 BNB</Styled.StyledLabel>
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
          ),
          () => <Styled.Result title={<Styled.Text>{intl.formatMessage({ id: 'common.loading' })}</Styled.Text>} />,
          (e) => (
            <Styled.Result
              status="error"
              title={<Styled.Text>{intl.formatMessage({ id: 'common.error' })}</Styled.Text>}
              subTitle={<Styled.Text>{e.message}</Styled.Text>}
              extra={
                <Styled.Button onClick={transactionService.resetTx}>
                  {intl.formatMessage({ id: 'common.back' })}
                </Styled.Button>
              }
            />
          ),
          () => (
            <Styled.Result
              status="success"
              title={<Styled.Text>{intl.formatMessage({ id: 'common.success' })}</Styled.Text>}
              extra={<Styled.Button onClick={transactionService.resetTx}>OK</Styled.Button>}
            />
          )
        )
      )}
    </>
  )
}

export default Send
