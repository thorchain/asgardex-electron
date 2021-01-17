import React, { useCallback, useState, useEffect, useMemo } from 'react'

import { Keystore } from '@xchainjs/xchain-crypto'
import { Form, Spin } from 'antd'
import { Store } from 'antd/lib/form/interface'
import Paragraph from 'antd/lib/typography/Paragraph'
import * as FP from 'fp-ts/lib/function'
import * as O from 'fp-ts/lib/Option'
import { useObservableState } from 'observable-hooks'
import { useIntl } from 'react-intl'
import { useHistory } from 'react-router-dom'

import { useBinanceContext } from '../../../contexts/BinanceContext'
import { liveData } from '../../../helpers/rx/liveData'
import * as walletRoutes from '../../../routes/wallet'
import { ImportKeystoreLD, LoadKeystoreLD } from '../../../services/wallet/types'
import { Button } from '../../uielements/button'
import { InputPassword } from '../../uielements/input'
import * as Styled from './Keystore.styles'

type Props = {
  importKeystore$: (keystore: Keystore, password: string) => ImportKeystoreLD
  loadKeystore$: () => LoadKeystoreLD
}

export const ImportKeystore: React.FC<Props> = (props): JSX.Element => {
  const { importKeystore$, loadKeystore$ } = props

  const history = useHistory()
  const [form] = Form.useForm()

  const intl = useIntl()

  const { clientViewState$ } = useBinanceContext()
  const clientViewState = useObservableState(clientViewState$, 'notready')
  const [importing, setImporting] = useState(false)
  const [importError, setImportError] = useState<O.Option<Error>>(O.none)
  const [keystore, setKeystore] = useState({})
  const [keystoreLoad, setKeystoreLoad] = useState(false)

  useEffect(() => {
    if (clientViewState === 'error') {
      setImporting(false)
      setImportError(O.some(new Error(`${intl.formatMessage({ id: 'wallet.imports.error.instance' })}`)))
    }
    if (clientViewState === 'ready') {
      // reset states
      setImporting(false)
      setImportError(O.none)
      // redirect to wallets assets view
      history.push(walletRoutes.assets.template)
    }
  }, [clientViewState, history, intl])

  const submitForm = useCallback(
    ({ password }: Store) => {
      setImportError(O.none)
      setImporting(true)
      FP.pipe(
        importKeystore$(keystore as Keystore, password),
        liveData.mapLeft((error) => {
          setImporting(false)
          setImportError(O.some(error))
        })
      )
    },
    [importKeystore$, keystore]
  )

  const uploadKeystore = () => {
    loadKeystore$().pipe(
      liveData.map((keystore) => {
        if (keystore) {
          setKeystore(keystore)
          setKeystoreLoad(true)
          setImportError(O.none)
        }
        return FP.constVoid
      }),
      liveData.mapLeft((_) => {
        setImportError(O.some(new Error('Invalid Keystore')))
      })
    )
  }

  const renderError = useMemo(
    () =>
      O.fold(
        () => <></>,
        // TODO(@Veado): i18n
        (_: Error) => (
          <Paragraph style={{ color: 'red' }}>
            {keystoreLoad
              ? intl.formatMessage({ id: 'wallet.imports.error.keystore.load' })
              : intl.formatMessage({ id: 'wallet.imports.error.keystore.import' })}
          </Paragraph>
        )
      )(importError),
    [importError, intl, keystoreLoad]
  )

  return (
    <>
      <Styled.Form form={form} onFinish={submitForm} labelCol={{ span: 24 }}>
        {renderError}
        <Spin spinning={importing} tip={intl.formatMessage({ id: 'common.loading' })}>
          <Styled.KeystoreLabel>{intl.formatMessage({ id: 'wallet.imports.keystore.select' })}</Styled.KeystoreLabel>
          <Form.Item>
            <Styled.KeystoreButton onClick={uploadKeystore}>
              <Styled.UploadIcon />
              {intl.formatMessage({ id: 'wallet.imports.keystore.upload' })}
              {keystoreLoad && <Styled.UploadCheckIcon twoToneColor="#50e3c2" />}
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
