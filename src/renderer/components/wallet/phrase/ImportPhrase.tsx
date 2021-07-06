import React, { useCallback, useState, useEffect, useMemo } from 'react'

import * as RD from '@devexperts/remote-data-ts'
import * as crypto from '@xchainjs/xchain-crypto'
import { Form } from 'antd'
import { Rule } from 'antd/lib/form'
import { Store } from 'antd/lib/form/interface'
import Paragraph from 'antd/lib/typography/Paragraph'
import * as FP from 'fp-ts/lib/function'
import * as O from 'fp-ts/lib/Option'
import { useObservableState } from 'observable-hooks'
import { useIntl } from 'react-intl'
import { useHistory } from 'react-router-dom'

import { useWalletContext } from '../../../contexts/WalletContext'
import { useKeystoreClientStates } from '../../../hooks/useKeystoreClientStates'
import * as walletRoutes from '../../../routes/wallet'
import { Spin } from '../../shared/loading'
import { InputPassword, InputTextArea } from '../../uielements/input'
import * as Styled from './Phrase.styles'

export const ImportPhrase: React.FC = (): JSX.Element => {
  const history = useHistory()
  const [form] = Form.useForm()

  const intl = useIntl()

  const { keystoreService } = useWalletContext()
  const keystore = useObservableState(keystoreService.keystore$, O.none)

  const { clientStates } = useKeystoreClientStates()

  const [importing, setImporting] = useState(false)
  const [importError, setImportError] = useState<O.Option<Error>>(O.none)

  useEffect(() => {
    FP.pipe(
      clientStates,
      RD.fold(
        () => {
          // reset states
          setImportError(O.none)
          setImporting(false)
        },
        () => {
          setImporting(true)
        },
        (error) => {
          setImportError(O.some(Error(`Could not create client: ${error?.message ?? error.toString()}`)))
        },
        (_) => {
          // redirect to wallets assets view
          history.push(walletRoutes.assets.template)
        }
      )
    )
  }, [clientStates, history, keystore])

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
      setImportError(O.none)
      setImporting(true)
      keystoreService.addKeystore(newPhrase, password).catch((error) => {
        setImporting(false)
        // TODO(@Veado): i18n
        setImportError(O.some(error))
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

  const renderImportError = useMemo(
    () =>
      FP.pipe(
        importError,
        O.fold(
          () => <></>,
          (error: Error) => (
            <Paragraph>
              {intl.formatMessage({ id: 'wallet.phrase.error.import' })}: {error.toString()}
            </Paragraph>
          )
        )
      ),
    [importError, intl]
  )

  return (
    <>
      {renderImportError}
      <Form
        form={form}
        onFinish={submitForm}
        labelCol={{ span: 24 }}
        style={{ width: '100%', padding: 30, paddingTop: 15 }}>
        <Spin spinning={importing} tip={intl.formatMessage({ id: 'common.loading' })}>
          <Styled.Title>{intl.formatMessage({ id: 'wallet.imports.phrase.title' })}</Styled.Title>
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
          <Styled.SubmitButton disabled={!validPhrase || importing}>
            {intl.formatMessage({ id: 'wallet.action.import' })}
          </Styled.SubmitButton>
        </Form.Item>
      </Form>
    </>
  )
}
