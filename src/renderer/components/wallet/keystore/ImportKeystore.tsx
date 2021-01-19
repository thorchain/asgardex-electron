import React, { useCallback, useState, useEffect, useMemo } from 'react'

import { CheckCircleTwoTone, UploadOutlined } from '@ant-design/icons'
import * as RD from '@devexperts/remote-data-ts'
import { Keystore } from '@xchainjs/xchain-crypto'
import { Form, Spin } from 'antd'
import { Store } from 'antd/lib/form/interface'
import Paragraph from 'antd/lib/typography/Paragraph'
import * as FP from 'fp-ts/lib/function'
import * as O from 'fp-ts/lib/Option'
import { useObservableState } from 'observable-hooks'
import { useIntl } from 'react-intl'
import { useHistory } from 'react-router-dom'
import * as Rx from 'rxjs'

import { useBinanceContext } from '../../../contexts/BinanceContext'
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
  const [loadKeystoreState, setLoadKeystoreState] = useState<RD.RemoteData<Error, Keystore>>(RD.initial)
  const [importKeystoreState, setImportKeystoreState] = useState<RD.RemoteData<Error, void>>(RD.initial)

  // (Possible) subscription of loadKeystore$ or importKeystore$
  const [keystoreSub, setKeystoreSub] = useState<O.Option<Rx.Subscription>>(O.none)

  // unsubscribe loadKeystore$ or importKeystore$ subscriptions
  const unsubScribeKeystoreSub = useCallback(() => {
    FP.pipe(
      keystoreSub,
      O.map((sub) => sub.unsubscribe())
    )
  }, [keystoreSub])

  useEffect(() => {
    if (clientViewState === 'ready') {
      unsubScribeKeystoreSub()
      history.push(walletRoutes.assets.template)
    }
  }, [clientViewState, history, intl, unsubScribeKeystoreSub])

  // clean up subscription
  useEffect(() => {
    return () => {
      unsubScribeKeystoreSub()
    }
  }, [unsubScribeKeystoreSub])

  const submitForm = useCallback(
    ({ password }: Store) => {
      FP.pipe(
        loadKeystoreState,
        RD.map((state) => {
          unsubScribeKeystoreSub()
          const sub = importKeystore$(state, password).subscribe(setImportKeystoreState)
          setKeystoreSub(O.some(sub))
          return true
        })
      )
    },
    [importKeystore$, loadKeystoreState, unsubScribeKeystoreSub]
  )

  const uploadKeystore = () => {
    unsubScribeKeystoreSub()
    setImportKeystoreState(RD.initial)
    const sub = loadKeystore$().subscribe(setLoadKeystoreState)
    setKeystoreSub(O.some(sub))
  }

  const renderError = useCallback((msg: string) => <Paragraph style={{ color: 'red' }}>{msg}</Paragraph>, [])

  const renderImportError = useMemo(
    () =>
      FP.pipe(
        importKeystoreState,
        RD.fold(
          () => <></>,
          () => <></>,
          (_) => renderError(intl.formatMessage({ id: 'wallet.imports.error.keystore.import' })),
          () => <></>
        )
      ),
    [importKeystoreState, intl, renderError]
  )

  const renderLoadError = useMemo(
    () =>
      FP.pipe(
        loadKeystoreState,
        RD.fold(
          () => <></>,
          () => <></>,
          (_) => renderError(intl.formatMessage({ id: 'wallet.imports.error.keystore.load' })),
          () => <></>
        )
      ),
    [loadKeystoreState, intl, renderError]
  )

  return (
    <>
      <Styled.Form form={form} onFinish={submitForm} labelCol={{ span: 24 }}>
        {renderLoadError}
        {renderImportError}
        <Spin spinning={RD.isPending(importKeystoreState)} tip={intl.formatMessage({ id: 'common.loading' })}>
          <Styled.KeystoreLabel>{intl.formatMessage({ id: 'wallet.imports.keystore.select' })}</Styled.KeystoreLabel>
          <Form.Item>
            <Styled.KeystoreButton typevalue={'outline'} onClick={uploadKeystore}>
              {RD.isSuccess(loadKeystoreState) ? <CheckCircleTwoTone twoToneColor="#50e3c2" /> : <UploadOutlined />}
              {intl.formatMessage({ id: 'wallet.imports.keystore.upload' })}
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
            disabled={!RD.isSuccess(loadKeystoreState) || RD.isPending(importKeystoreState)}>
            {intl.formatMessage({ id: 'wallet.action.import' }).toUpperCase()}
          </Button>
        </Form.Item>
      </Styled.Form>
    </>
  )
}
