import React, { useCallback } from 'react'

import { Client as BinanceClient } from '@thorchain/asgardex-binance'
import { Form, Button } from 'antd'
import { Rule } from 'antd/lib/form'
import { Store } from 'antd/lib/form/interface'
import TextArea from 'antd/lib/input/TextArea'

const ImportPhrase: React.FC = (): JSX.Element => {
  const [form] = Form.useForm()

  const checkMnemonic = (_: Rule, value: string): Promise<void> => {
    if (!value) {
      return Promise.reject('Value for phrase required')
    }

    return BinanceClient.validatePhrase(value) ? Promise.resolve() : Promise.reject('Invalid mnemonic seed phrase')
  }
  const handleImportFormSubmit = useCallback(async (values: Store) => {
    // TODO (@Veado) Extract this into helper
    localStorage.setItem('phrase', values.phrase)
  }, [])

  return (
    <Form form={form} onFinish={handleImportFormSubmit} labelCol={{ span: 24 }}>
      <Form.Item
        name="phrase"
        label="Phrase"
        rules={[{ required: true, validator: checkMnemonic }]}
        validateTrigger={['onSubmit', 'onChange']}>
        <TextArea rows={4} />
      </Form.Item>

      <Form.Item>
        <Button size="large" type="primary" htmlType="submit" block>
          Import
        </Button>
      </Form.Item>
    </Form>
  )
}
export default ImportPhrase
