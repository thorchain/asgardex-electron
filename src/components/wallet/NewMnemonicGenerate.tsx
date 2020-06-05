import React, { useState, useCallback } from 'react'

import { Client as BinanceClient } from '@thorchain/asgardex-binance'
import { Form, Input, Button } from 'antd'
import { Store } from 'antd/lib/form/interface'

type Props = {}
const NewMnemonicGenerate: React.FC<Props> = (_: Props): JSX.Element => {
  const [loadingMsg, setLoadingMsg] = useState<string>('')

  const createMnemonicWallet = () => {
    const phrase = BinanceClient.generatePhrase()
    // TODO (@Veado) Extract this into helper
    localStorage.setItem('phrase', phrase)
  }

  const handleFormFinish = useCallback(async (_: Store) => {
    try {
      setLoadingMsg('Creating wallet...')
      createMnemonicWallet()
    } catch (err) {
      setLoadingMsg('')
    }
  }, [])

  return (
    <>
      <h1>Generate the new mnemonic wallet</h1>
      <Form onFinish={handleFormFinish} labelCol={{ span: 24 }}>
        <Form.Item
          name="repeatPassword"
          label="Repeat Password"
          dependencies={['password']}
          validateTrigger={['onSubmit', 'onBlur']}
          rules={[
            { required: true },
            ({ getFieldValue }) => ({
              validator(_, value) {
                if (!value || getFieldValue('password') === value) {
                  return Promise.resolve()
                }
                return Promise.reject('Password mismatch!')
              }
            })
          ]}>
          <Input size="large" type="password" />
        </Form.Item>
        <Form.Item>
          <Button size="large" type="primary" htmlType="submit" block>
            {loadingMsg || 'Submit'}
          </Button>
        </Form.Item>
      </Form>
    </>
  )
}

export default NewMnemonicGenerate
