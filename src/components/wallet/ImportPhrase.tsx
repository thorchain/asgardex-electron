import React, { useCallback, useState } from 'react'

import { Client as BinanceClient } from '@thorchain/asgardex-binance'
import { Form, Button, Input } from 'antd'
import { Rule } from 'antd/lib/form'
import { Store } from 'antd/lib/form/interface'

import { useWalletContext } from '../../contexts/WalletContext'

const ImportPhrase: React.FC = (): JSX.Element => {
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
    ({ phrase: p }: Store) => {
      phrase.add(p)
    },
    [phrase]
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
    </Form>
  )
}
export default ImportPhrase
