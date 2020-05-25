import { crypto } from '@binance-chain/javascript-sdk'
import { KeyStore } from '@binance-chain/javascript-sdk/typings/crypto'
import { delay } from '@thorchain/asgardex-util'
import { Store } from 'antd/lib/form/interface'

import React, { useState, useCallback } from 'react'
import { Form, Input, Button } from 'antd'

const NewMnemonicGenerate: React.FC<{ mnemonic: string }> = ({ mnemonic }): JSX.Element => {
  const [loadingMsg, setLoadingMsg] = useState<string>('')

  const createMnemonicWallet = (mnemonic: string, password: string) => {
    if (!localStorage.getItem('keystore')) {
      const privKey: string = crypto.getPrivateKeyFromMnemonic(mnemonic)
      const keystore: KeyStore = crypto.generateKeyStore(privKey, password)
      // TODO: dynamically set network for client, default is testnet
      const address: string = crypto.getAddressFromPrivateKey(privKey)
      // Temporary store during development
      localStorage.setItem('address', address)
      localStorage.setItem('keystore', JSON.stringify(keystore))
    } else {
      throw Error('keystore already exists')
    }
  }
  const handleFormFinish = useCallback(
    async (vals: Store) => {
      await delay(200)
      try {
        setLoadingMsg('Creating wallet...')
        createMnemonicWallet(mnemonic, vals.password)
      } catch (err) {
        setLoadingMsg('')
        console.log(err)
      }
    },
    [mnemonic]
  )
  return (
    <>
      <h1>Generate the new mnemonic wallet</h1>
      <Form onFinish={handleFormFinish} labelCol={{ span: 24 }}>
        <Form.Item
          name="password"
          label="New Password"
          rules={[{ required: true }]}
          validateTrigger={['onSubmit', 'onChange']}>
          <Input size="large" type="password" />
        </Form.Item>
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
