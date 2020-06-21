import React, { useCallback, useState, useEffect } from 'react'

import * as crypto from '@thorchain/asgardex-crypto'
import { Form, Button, Input } from 'antd'
import { Rule } from 'antd/lib/form'
import { Store } from 'antd/lib/form/interface'
import Paragraph from 'antd/lib/typography/Paragraph'
import { none } from 'fp-ts/lib/Option'
import { useObservableState } from 'observable-hooks'
import { useHistory } from 'react-router-dom'

import { useWalletContext } from '../../contexts/WalletContext'
import * as walletRoutes from '../../routes/wallet'
import { isLocked } from '../../services/wallet/util'

const ImportPhrase: React.FC = (): JSX.Element => {
  const history = useHistory()
  const [form] = Form.useForm()

  const { keystoreService } = useWalletContext()
  const keystore = useObservableState(keystoreService.keystore$, none)

  const [validPhrase, setValidPhrase] = useState(false)
  const [validPassword, setValidPassword] = useState(false)

  const mockPw = 'password'
  const mockPhrase = 'empower exit air ring level siren firm puzzle cross lemon few already'

  useEffect(() => {
    // redirect to wallets assets view
    if (!isLocked(keystore)) {
      history.push(walletRoutes.assets.template)
    }
  }, [history, keystore])

  const phraseValidator = async (_: Rule, value: string) => {
    if (!value) {
      return Promise.reject('Value for phrase required')
    }
    const valid = crypto.validatePhrase(value)
    setValidPhrase(valid)
    return valid ? Promise.resolve() : Promise.reject('Invalid mnemonic seed phrase')
  }

  const passwordValidator = async (_: Rule, value: string) => {
    if (!value) {
      setValidPassword(false)
      return Promise.reject('Value for password required')
    }
    if (value.length < 5) {
      setValidPassword(false)
      return Promise.reject('Password needs to have 5 character at least')
    }
    setValidPassword(true)
    return Promise.resolve()
  }

  const onReset = () => {
    form.resetFields()
  }

  const submitForm = useCallback(
    async ({ phrase: newPhrase, password }: Store) => {
      try {
        await keystoreService.addKeystore(newPhrase, password)
        // redirect to wallets assets view
      } catch (error) {
        console.error('could not submit phrase', error)
      }
    },
    [keystoreService]
  )

  return (
    <Form form={form} onFinish={submitForm} labelCol={{ span: 24 }}>
      <Form.Item
        name="phrase"
        rules={[{ required: true, validator: phraseValidator }]}
        validateTrigger={['onSubmit', 'onChange']}>
        <Input.Password placeholder="Enter your phrase" size="large" />
      </Form.Item>
      <Form.Item
        name="password"
        rules={[{ required: true, validator: passwordValidator }]}
        validateTrigger={['onSubmit', 'onChange']}>
        <Input.Password placeholder="Enter your password" size="large" />
      </Form.Item>

      <Form.Item>
        <Button size="large" type="primary" htmlType="submit" block disabled={!validPassword || !validPhrase}>
          Import
        </Button>
        <Button size="large" type="primary" block onClick={onReset}>
          Reset
        </Button>
      </Form.Item>

      {/*
      TODO (@Veado) Remove it!
      Random phrase (just for debugging and lazy testers - it will be removed with any of next PRs...,
      */}
      <Paragraph strong>{mockPhrase}</Paragraph>
      <Paragraph strong>{mockPw}</Paragraph>
    </Form>
  )
}
export default ImportPhrase
