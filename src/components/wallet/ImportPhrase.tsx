import React, { useCallback, useState } from 'react'

import { Client as BinanceClient } from '@thorchain/asgardex-binance'
import { Form, Button, Input } from 'antd'
import { Rule } from 'antd/lib/form'
import { Store } from 'antd/lib/form/interface'
import Paragraph from 'antd/lib/typography/Paragraph'
import { useHistory } from 'react-router-dom'

import { useWalletContext } from '../../contexts/WalletContext'
import * as walletRoutes from '../../routes/wallet'

const ImportPhrase: React.FC = (): JSX.Element => {
  const history = useHistory()
  const [form] = Form.useForm()
  const { phrase } = useWalletContext()

  const [validForm, setValidForm] = useState(false)

  const validatePhrase = (_: Rule, value: string): Promise<void> => {
    if (!value) {
      return Promise.reject('Value for phrase required')
    }
    const valid = BinanceClient.validatePhrase(value)
    setValidForm(valid)
    return valid ? Promise.resolve() : Promise.reject('Invalid mnemonic seed phrase')
  }

  const submitForm = useCallback(
    ({ phrase: newPhrase }: Store) => {
      phrase.add(newPhrase)
      // redirect to wallets assets view
      history.push(walletRoutes.assets.template)
    },
    [history, phrase]
  )

  return (
    <Form form={form} onFinish={submitForm} labelCol={{ span: 24 }}>
      <Form.Item
        name="phrase"
        rules={[{ required: true, validator: validatePhrase }]}
        validateTrigger={['onSubmit', 'onChange']}>
        <Input.Password placeholder="Enter your phrase" size="large" />
      </Form.Item>

      <Form.Item>
        <Button size="large" type="primary" htmlType="submit" block disabled={!validForm}>
          Import
        </Button>
      </Form.Item>

      {/*
      TODO (@Veado) Remove it!
      Random phrase (just for debugging and lazy testers - it will be removed with any of next PRs...,
      */}
      <Paragraph strong>empower exit air ring level siren firm puzzle cross lemon few already</Paragraph>
    </Form>
  )
}
export default ImportPhrase
