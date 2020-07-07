import React, { useCallback, useState, useEffect, useMemo } from 'react'

import * as crypto from '@thorchain/asgardex-crypto'
import { Form, Button, Input, Spin } from 'antd'
import { Rule } from 'antd/lib/form'
import { Store } from 'antd/lib/form/interface'
import Paragraph from 'antd/lib/typography/Paragraph'
import * as O from 'fp-ts/lib/Option'
import { none, Option, some } from 'fp-ts/lib/Option'
import { useObservableState } from 'observable-hooks'
import { useHistory } from 'react-router-dom'

import { useBinanceContext } from '../../contexts/BinanceContext'
import { useWalletContext } from '../../contexts/WalletContext'
import * as walletRoutes from '../../routes/wallet'

const ImportPhrase: React.FC = (): JSX.Element => {
  const history = useHistory()
  const [form] = Form.useForm()

  const { keystoreService } = useWalletContext()
  const keystore = useObservableState(keystoreService.keystore$, none)

  const { clientViewState$ } = useBinanceContext()
  const clientViewState = useObservableState(clientViewState$, 'notready')
  const [importing, setImporting] = useState(false)
  const [importError, setImportError] = useState<Option<Error>>(none)

  useEffect(() => {
    if (clientViewState === 'error') {
      setImporting(false)
      setImportError(some(new Error('Could not create instance of BinanceClient')))
    }
    if (clientViewState === 'ready') {
      // reset states
      setImporting(false)
      setImportError(none)
      // redirect to wallets assets view
      history.push(walletRoutes.assets.template)
    }
  }, [clientViewState, history, keystore])

  const [validPhrase, setValidPhrase] = useState(false)
  const [validPassword, setValidPassword] = useState(false)

  const phraseValidator = useCallback(async (_: Rule, value: string) => {
    if (!value) {
      // TODO(@Veado): i18n
      return Promise.reject('Value for phrase required')
    }
    const valid = crypto.validatePhrase(value)
    setValidPhrase(valid)
    // TODO(@Veado): i18n
    return valid ? Promise.resolve() : Promise.reject('Invalid mnemonic seed phrase')
  }, [])

  const passwordValidator = useCallback(async (_: Rule, value: string) => {
    if (!value) {
      setValidPassword(false)
      // TODO(@Veado): i18n
      return Promise.reject('Value for password required')
    }
    setValidPassword(true)
    return Promise.resolve()
  }, [])

  const onReset = useCallback(() => {
    form.resetFields()
  }, [form])

  const submitForm = useCallback(
    ({ phrase: newPhrase, password }: Store) => {
      setImportError(none)
      setImporting(true)
      keystoreService.addKeystore(newPhrase, password).catch((error) => {
        setImporting(false)
        // TODO(@Veado): i18n
        setImportError(some(error))
      })
    },
    [keystoreService]
  )

  const renderError = useMemo(
    () =>
      O.fold(
        () => <></>,
        // TODO(@Veado): i18n
        (error: Error) => <Paragraph>Error while importing passphrase: {error.toString()}</Paragraph>
      )(importError),
    [importError]
  )

  return (
    <>
      {renderError}
      <Form form={form} onFinish={submitForm} labelCol={{ span: 24 }}>
        {/* TODO(@Veado): i18n */}
        <Spin spinning={importing} tip="Loading...">
          <Form.Item
            name="phrase"
            rules={[{ required: true, validator: phraseValidator }]}
            validateTrigger={['onSubmit', 'onChange']}>
            {/* TODO(@Veado): i18n */}
            <Input.Password placeholder="Enter your phrase" size="large" />
          </Form.Item>
          <Form.Item
            name="password"
            rules={[{ required: true, validator: passwordValidator }]}
            validateTrigger={['onSubmit', 'onChange']}>
            {/* TODO(@Veado): i18n */}
            <Input.Password placeholder="Enter your password" size="large" />
          </Form.Item>
        </Spin>
        <Form.Item>
          <Button
            size="large"
            type="primary"
            htmlType="submit"
            block
            disabled={!validPassword || !validPhrase || importing}>
            Import
          </Button>
          <Button size="large" type="primary" block onClick={onReset} disabled={importing}>
            Reset
          </Button>
        </Form.Item>
      </Form>
    </>
  )
}
export default ImportPhrase
