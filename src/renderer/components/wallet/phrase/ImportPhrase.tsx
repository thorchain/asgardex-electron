import React, { useCallback, useState, useEffect, useMemo } from 'react'

import * as crypto from '@xchainjs/xchain-crypto'
import { Form, Spin } from 'antd'
import { Rule } from 'antd/lib/form'
import { Store } from 'antd/lib/form/interface'
import Paragraph from 'antd/lib/typography/Paragraph'
import * as O from 'fp-ts/lib/Option'
import { none, Option, some } from 'fp-ts/lib/Option'
import { useObservableState } from 'observable-hooks'
import { useIntl } from 'react-intl'
import { useHistory } from 'react-router-dom'

import { useBinanceContext } from '../../../contexts/BinanceContext'
import { useWalletContext } from '../../../contexts/WalletContext'
import * as walletRoutes from '../../../routes/wallet'
import { Button } from '../../uielements/button'
import { InputPassword, InputTextArea } from '../../uielements/input'

export const ImportPhrase: React.FC = (): JSX.Element => {
  const history = useHistory()
  const [form] = Form.useForm()

  const intl = useIntl()

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
      <Form
        form={form}
        onFinish={submitForm}
        labelCol={{ span: 24 }}
        style={{ width: '100%', padding: 30, paddingTop: 15 }}>
        <Spin spinning={importing} tip={intl.formatMessage({ id: 'common.loading' })}>
          <Form.Item
            name="phrase"
            rules={[{ required: true, validator: phraseValidator }]}
            validateTrigger={['onSubmit', 'onChange']}>
            <InputTextArea
              color="primary"
              size="middle"
              typevalue="normal"
              placeholder={intl.formatMessage({ id: 'wallet.imports.enterphrase' }).toUpperCase()}
              rows={5}
            />
          </Form.Item>
          <Form.Item
            name="password"
            rules={[{ required: true, validator: passwordValidator }]}
            validateTrigger={['onSubmit', 'onChange']}>
            <InputPassword
              color="primary"
              size="middle"
              typevalue="normal"
              security="password"
              placeholder={intl.formatMessage({ id: 'common.password' }).toUpperCase()}
              style={{ maxWidth: 280 }}
            />
          </Form.Item>
        </Spin>
        <Form.Item style={{ display: 'grid', justifyContent: 'flex-end' }}>
          <Button
            size="large"
            type="primary"
            htmlType="submit"
            round="true"
            style={{ width: 150 }}
            disabled={!validPassword || !validPhrase || importing}>
            Import
          </Button>
        </Form.Item>
      </Form>
    </>
  )
}
