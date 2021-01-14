import React, { useCallback, useState, useEffect, useMemo } from 'react'

import { CheckCircleTwoTone } from '@ant-design/icons'
import { Keystore } from '@xchainjs/xchain-crypto'
import { Form, Spin } from 'antd'
import { Store } from 'antd/lib/form/interface'
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
  const { loadKeystore } = keystoreService

  const { clientViewState$ } = useBinanceContext()
  const clientViewState = useObservableState(clientViewState$, 'notready')
  const [importing, setImporting] = useState(false)
  const [importError, setImportError] = useState<Option<Error>>(none)
  const [keystore, setKeystore] = useState({})
  const [keystoreLoad, setKeystoreLoad] = useState(false)

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
  }, [clientViewState, history])

  const submitForm = useCallback(
    ({ password }: Store) => {
      setImportError(none)
      setImporting(true)
      keystoreService.importKeystore(keystore as Keystore, password).catch((error) => {
        setImporting(false)
        // TODO(@Veado): i18n
        setImportError(some(error))
      })
    },
    [keystore, keystoreService]
  )

  const uploadKeystore = async () => {
    try {
      const keystore: Keystore = await loadKeystore()
      if (keystore) {
        setKeystore(keystore)
        setKeystoreLoad(true)
        setImportError(none)
      }
    } catch (_) {
      setImportError(some(new Error('Invalid Keystore')))
    }
  }

  const renderError = useMemo(
    () =>
      O.fold(
        () => <></>,
        // TODO(@Veado): i18n
        (error: Error) => (
          <Paragraph style={{ color: 'red' }}>
            Error while {keystoreLoad ? 'loading' : 'importing'} keystore: {error.toString()}
          </Paragraph>
        )
      )(importError),
    [importError, keystoreLoad]
  )

  return (
    <>
      <Styled.Form form={form} onFinish={submitForm} labelCol={{ span: 24 }}>
        {renderError}
        <Spin spinning={importing} tip={intl.formatMessage({ id: 'common.loading' })}>
          <Styled.KeystoreLabel>{intl.formatMessage({ id: 'wallet.imports.keystore.select' })}</Styled.KeystoreLabel>
          <Form.Item>
            <Styled.KeystoreButton onClick={uploadKeystore}>
              <UploadIcon style={{ marginRight: 10, marginTop: -3 }} />
              {intl.formatMessage({ id: 'wallet.imports.keystore.upload' })}
              {keystoreLoad && (
                <CheckCircleTwoTone twoToneColor="#50e3c2" style={{ position: 'absolute', right: 15 }} />
              )}
            </Styled.KeystoreButton>
          </Form.Item>
          <Styled.PasswordContainer>
            <Styled.PasswordItem name="password">
              <InputPassword
                size="large"
                type="password"
                placeholder={intl.formatMessage({ id: 'common.password' }).toUpperCase()}
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
            disabled={!keystoreLoad || importing}>
            Import
          </Button>
        </Form.Item>
      </Styled.Form>
    </>
  )
}
