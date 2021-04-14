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
import * as Styled from './Phrase.styles'

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

  const phraseValidator = useCallback(
    async (_: Rule, value: string) => {
      if (!value) {
        return Promise.reject(intl.formatMessage({ id: 'wallet.phrase.error.valueRequired' }))
      }
      const valid = crypto.validatePhrase(value)
      setValidPhrase(valid)
      return valid ? Promise.resolve() : Promise.reject(intl.formatMessage({ id: 'wallet.phrase.error.invalid' }))
    },
    [intl]
  )

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

  const rules: Rule[] = useMemo(
    () => [
      { required: true, message: intl.formatMessage({ id: 'wallet.validations.shouldNotBeEmpty' }) },
      ({ getFieldValue }) => ({
        validator(_, value) {
          if (!value || getFieldValue('password') === value) {
            return Promise.resolve()
          }
          return Promise.reject(intl.formatMessage({ id: 'wallet.password.mismatch' }))
        }
      })
    ],
    [intl]
  )

  const renderError = useMemo(
    () =>
      O.fold(
        () => <></>,
        (error: Error) => (
          <Paragraph>
            {intl.formatMessage({ id: 'wallet.phrase.error.import' })}: {error.toString()}
          </Paragraph>
        )
      )(importError),
    [importError, intl]
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
              typevalue="normal"
              placeholder={intl.formatMessage({ id: 'wallet.imports.enterphrase' }).toUpperCase()}
              rows={5}
              style={{ fontSize: 16 }}
            />
          </Form.Item>
          <Styled.PasswordContainer>
            <Styled.PasswordItem name="password" validateTrigger={['onSubmit', 'onBlur']} rules={rules}>
              <InputPassword
                size="large"
                type="password"
                placeholder={intl.formatMessage({ id: 'common.password' }).toUpperCase()}
              />
            </Styled.PasswordItem>
            <Styled.PasswordItem
              name="repeatPassword"
              dependencies={['password']}
              validateTrigger={['onSubmit', 'onBlur']}
              rules={rules}>
              <InputPassword
                size="large"
                type="password"
                placeholder={intl.formatMessage({ id: 'wallet.password.repeat' }).toUpperCase()}
              />
            </Styled.PasswordItem>
          </Styled.PasswordContainer>
        </Spin>
        <Form.Item style={{ display: 'grid', justifyContent: 'flex-end' }}>
          <Button
            size="large"
            type="primary"
            htmlType="submit"
            round="true"
            style={{ width: 150 }}
            disabled={!validPhrase || importing}>
            Import
          </Button>
        </Form.Item>
      </Form>
    </>
  )
}
