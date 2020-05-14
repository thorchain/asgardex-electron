import React, { useState, useCallback } from 'react'

import { Form, Input, Button } from 'antd'
import { Store } from 'antd/lib/form/interface'
import { delay } from '@thorchain/asgardex-util'

const ImportMnemonicForm: React.FC = (): JSX.Element => {
  const [loadingMsg, setLoadingMsg] = useState<string>('')
  const [form] = Form.useForm()

  const importMnemonicWallet = (mnemonic: string, password: string) => {
    const network = 'testnet'
    console.log('importing mnemonic...')
    console.log(`network: ${network}; mnemonic: ${mnemonic}; password: ${password}`)
  }

  const handleImportFormSubmit = useCallback(async (vals: Store) => {
    setLoadingMsg('Generating wallet')
    // Delay to allow for UI render DOM update before CPU takes over keystore/cryto processing
    await delay(200)
    try {
      console.log('trying...')
      importMnemonicWallet(vals.mnemonic, vals.password)
    } catch (err) {
      setLoadingMsg('')
      console.log(err)
    }
  }, [])
  return (
    <Form form={form} onFinish={handleImportFormSubmit} labelCol={{ span: 24 }}>
      <Form.Item name="mnemonic" label="Mnemonic (Phrase)">
        <Input size="large" type="text" />
      </Form.Item>
      <Form.Item name="password" label="New Password">
        <Input size="large" type="password" />
      </Form.Item>
      <Form.Item name="repeatPassword" label="Repeat Password">
        <Input size="large" type="password" />
      </Form.Item>
      <Form.Item>
        <Button size="large" type="primary" htmlType="submit" block>
          {loadingMsg || 'Import'}
        </Button>
      </Form.Item>
    </Form>
  )
}
export default ImportMnemonicForm
