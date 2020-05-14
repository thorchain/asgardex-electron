import React, { useState, useEffect, useRef, useCallback } from 'react'

import { Form, Input, Button } from 'antd'
import { Store } from 'antd/lib/form/interface'

const ImportMnemonicForm: React.FC<{activetab?:boolean}> = ({activetab}): JSX.Element => {
  const [loadingMsg, setLoadingMsg] = useState<string>('')
  let formRef:any = useRef(null)
  useEffect(() => {
    if (!activetab) { formRef.resetFields() }
  },[activetab])

  const importMnemonicWallet = (mnemonic: string, password: string) => {
    const network = 'testnet'
    console.log('importing mnemonic...')
  }

  const handleImportFormSubmit = useCallback((vals:Store) => {
    setLoadingMsg("Generating wallet")
    // Delay to allow for UI render DOM update before CPU takes over keystore processing
    setTimeout(() => {
      try {
        console.log('trying...')
        importMnemonicWallet(vals.mnemonic, vals.password)
      } catch (err) {
        setLoadingMsg('')
        console.log(err)
      }
    }, 200);
  },[])
  return (
    <Form onFinish={handleImportFormSubmit}>
      <Form.Item name="mnemonic" label="Mnemonic (Phrase)">
        <Input size="large" type="text"/>
      </Form.Item>
      <Form.Item name="password" label="New Password">
        <Input size="large" type="password"/>
      </Form.Item>
      <Form.Item name="repeatPassword" label="Repeat Password">
        <Input size="large" type="password"/>
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

