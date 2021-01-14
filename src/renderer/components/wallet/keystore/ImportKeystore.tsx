import React, { useCallback, useState, useEffect, useMemo } from 'react'

import { Form, Spin } from 'antd'
import { Rule } from 'antd/lib/form'
import Paragraph from 'antd/lib/typography/Paragraph'
import * as O from 'fp-ts/lib/Option'
import { none, Option, some } from 'fp-ts/lib/Option'
import { useObservableState } from 'observable-hooks'
import { useIntl } from 'react-intl'
import { useHistory } from 'react-router-dom'

import { ReactComponent as UploadIcon } from '../../../assets/svg/icon-upload-keystore.svg'
import { useBinanceContext } from '../../../contexts/BinanceContext'
import { useWalletContext } from '../../../contexts/WalletContext'
import * as walletRoutes from '../../../routes/wallet'
import { Button } from '../../uielements/button'
import { InputPassword } from '../../uielements/input'
import * as Styled from './Keystore.styles'

export const ImportKeystore: React.FC = (): JSX.Element => {
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
      setImportError(some(new Error('Could not create instance of Client')))
    }
    if (clientViewState === 'ready') {
      // reset states
      setImporting(false)
      setImportError(none)
      // redirect to wallets assets view
      history.push(walletRoutes.assets.template)
    }
  }, [clientViewState, history, keystore])

  const submitForm = useCallback(() => {}, [])

  const rules: Rule[] = useMemo(
    () => [
      { required: true },
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
        // TODO(@Sarawut): i18n
        (error: Error) => <Paragraph>Error while importing keystore: {error.toString()}</Paragraph>
      )(importError),
    [importError]
  )

  return (
    <>
      {renderError}
      <Styled.Form form={form} onFinish={submitForm} labelCol={{ span: 24 }}>
        <Spin spinning={importing} tip={intl.formatMessage({ id: 'common.loading' })}>
          <Styled.KeystoreLabel>{intl.formatMessage({ id: 'wallet.imports.keystore.select' })}</Styled.KeystoreLabel>
          <Form.Item>
            <Styled.KeystoreButton>
              <UploadIcon style={{ marginRight: 10, marginTop: -3 }} />
              {intl.formatMessage({ id: 'wallet.imports.keystore.upload' })}
            </Styled.KeystoreButton>
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
            style={{ width: 150, marginTop: 50 }}
            disabled={importing}>
            Import
          </Button>
        </Form.Item>
      </Styled.Form>
    </>
  )
}
