import React, { useCallback, useMemo } from 'react'

import { CheckCircleTwoTone, UploadOutlined } from '@ant-design/icons'
import * as RD from '@devexperts/remote-data-ts'
import { Keystore } from '@xchainjs/xchain-crypto'
import { Form } from 'antd'
import { Store } from 'antd/lib/form/interface'
import * as FP from 'fp-ts/lib/function'
import { useIntl } from 'react-intl'

import { KeystoreClientStates } from '../../../hooks/useKeystoreClientStates'
import { useSubscriptionState } from '../../../hooks/useSubscriptionState'
import { ImportKeystoreLD, ImportKeystoreParams, LoadKeystoreLD } from '../../../services/wallet/types'
import { Spin } from '../../shared/loading'
import { InputPassword } from '../../uielements/input'
import * as Styled from './Keystore.styles'

export type Props = {
  clientStates: KeystoreClientStates
  importKeystore$: (params: ImportKeystoreParams) => ImportKeystoreLD
  loadKeystore$: () => LoadKeystoreLD
}

export const ImportKeystore: React.FC<Props> = (props): JSX.Element => {
  const { importKeystore$, loadKeystore$, clientStates } = props

  const [form] = Form.useForm()

  const intl = useIntl()

  const { state: loadKeystoreState, subscribe: subscribeLoadKeystoreState } = useSubscriptionState<
    RD.RemoteData<Error, Keystore>
  >(RD.initial)

  const { state: importKeystoreState, subscribe: subscribeImportKeystoreState } = useSubscriptionState<
    RD.RemoteData<Error, void>
  >(RD.initial)

  const submitForm = useCallback(
    ({ password }: Store) => {
      FP.pipe(
        loadKeystoreState,
        RD.map((keystore) => {
          const id = new Date().getTime()
          // TODO (@veado) Get name from form
          const name = `asgardex-account-${id}`
          subscribeImportKeystoreState(importKeystore$({ keystore, password, id, name }))
          return true
        })
      )
    },
    [importKeystore$, loadKeystoreState, subscribeImportKeystoreState]
  )

  const uploadKeystore = () => {
    subscribeLoadKeystoreState(loadKeystore$())
  }

  const renderError = useCallback((msg: string) => <Styled.ErrorLabel>{msg}</Styled.ErrorLabel>, [])

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

  const renderClientError = useMemo(
    () =>
      FP.pipe(
        clientStates,
        RD.fold(
          () => <></>,
          () => <></>,
          (error) => renderError(`Could not create client: ${error?.message ?? error.toString()}`),
          () => <></>
        )
      ),
    [clientStates, renderError]
  )

  return (
    <>
      <Styled.Form form={form} onFinish={submitForm} labelCol={{ span: 24 }}>
        {renderLoadError}
        {renderImportError}
        {renderClientError}
        <Spin
          spinning={RD.isPending(importKeystoreState) || RD.isPending(loadKeystoreState)}
          tip={intl.formatMessage({ id: 'common.loading' })}>
          <Form.Item>
            <Styled.Title>{intl.formatMessage({ id: 'wallet.imports.keystore.title' })}</Styled.Title>
            <Styled.KeystoreButton onClick={uploadKeystore}>
              {RD.isSuccess(loadKeystoreState) ? <CheckCircleTwoTone twoToneColor="#50e3c2" /> : <UploadOutlined />}
              {intl.formatMessage({ id: 'wallet.imports.keystore.select' })}
            </Styled.KeystoreButton>
          </Form.Item>
          <Styled.PasswordContainer>
            <Styled.PasswordItem name="password">
              <InputPassword size="large" placeholder={intl.formatMessage({ id: 'common.password' }).toUpperCase()} />
            </Styled.PasswordItem>
          </Styled.PasswordContainer>
        </Spin>
        <Form.Item style={{ display: 'grid', justifyContent: 'flex-end' }}>
          <Styled.SubmitButton disabled={!RD.isSuccess(loadKeystoreState) || RD.isPending(importKeystoreState)}>
            {intl.formatMessage({ id: 'wallet.action.import' })}
          </Styled.SubmitButton>
        </Form.Item>
      </Styled.Form>
    </>
  )
}
