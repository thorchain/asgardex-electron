import React, { useState, useCallback, useMemo } from 'react'

import { generatePhrase } from '@thorchain/asgardex-crypto'
import { Form, Input, Button } from 'antd'
import { Rule } from 'antd/lib/form'
import { Store } from 'antd/lib/form/interface'

type Props = {}
const NewMnemonicGenerate: React.FC<Props> = (_: Props): JSX.Element => {
  const [loadingMsg, setLoadingMsg] = useState<string>('')

  const createMnemonicWallet = () => {
    const phrase = generatePhrase()
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

  const rules: Rule[] = useMemo(
    () => [
      { required: true },
      ({ getFieldValue }) => ({
        validator(_, value) {
          if (!value || getFieldValue('password') === value) {
            return Promise.resolve()
          }
          return Promise.reject('Password mismatch!')
        }
      })
    ],
    []
  )
  return (
    <>
      <h1>Generate the new mnemonic wallet</h1>
      <Form onFinish={handleFormFinish} labelCol={{ span: 24 }}>
        <Form.Item
          name="repeatPassword"
          label="Repeat Password"
          dependencies={['password']}
          validateTrigger={['onSubmit', 'onBlur']}
          rules={rules}>
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
