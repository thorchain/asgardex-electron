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
import { InnerForm } from '../../shared/form/Form.styles'
import { Spin } from '../../shared/loading'
import { Button } from '../../uielements/button'
import { InputPassword, Input } from '../../uielements/input'
import { Label } from '../../uielements/label'

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

  const walletId = useMemo(() => new Date().getTime(), [])

  const submitForm = useCallback(
    ({ password, name }: Store) => {
      FP.pipe(
        loadKeystoreState,
        RD.map((keystore) => {
          subscribeImportKeystoreState(
            importKeystore$({ keystore, password, id: walletId, name: name || `wallet-${walletId}` })
          )
          return true
        })
      )
    },
    [importKeystore$, loadKeystoreState, subscribeImportKeystoreState, walletId]
  )

  const uploadKeystore = () => {
    subscribeLoadKeystoreState(loadKeystore$())
  }

  const renderError = (msg: string) => (
    <Label className="mb-[20px]" color="error" textTransform="uppercase" align="center">
      {msg}
    </Label>
  )

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
    [importKeystoreState, intl]
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
    [loadKeystoreState, intl]
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
    [clientStates]
  )

  return (
    <>
      <InnerForm className="w-full p-[30px] pt-[15px]" labelCol={{ span: 24 }} form={form} onFinish={submitForm}>
        {renderClientError}
        <Spin
          spinning={RD.isPending(importKeystoreState) || RD.isPending(loadKeystoreState)}
          tip={intl.formatMessage({ id: 'common.loading' })}>
          <div className="flex flex-col items-center">
            {/* title */}
            <Label className="mb-[10px] w-full" size="big" align="center" textTransform="uppercase">
              {intl.formatMessage({ id: 'wallet.imports.keystore.title' })}
            </Label>
            {/* import button */}
            <Button
              className="mw-[100%] mb-[30px] h-[35px] cursor-pointer py-[5xp] px-[10px] text-[14px]"
              typevalue="outline"
              sizevalue="normal"
              onClick={uploadKeystore}>
              {RD.isSuccess(loadKeystoreState) ? <CheckCircleTwoTone twoToneColor="#50e3c2" /> : <UploadOutlined />}
              {intl.formatMessage({ id: 'wallet.imports.keystore.select' })}
            </Button>
            {renderLoadError}
            {renderImportError}
            {/* password */}
            <div className="flex w-full flex-col items-center">
              <Form.Item
                className="!dark:text-text0d w-full !max-w-[380px]  uppercase !text-text0"
                name="password"
                label={intl.formatMessage({ id: 'common.keystorePassword' })}>
                <InputPassword className="!text-[16px]" size="large" />
              </Form.Item>
            </div>
            {/* name */}
            <div className="flex w-full flex-col items-center">
              <Form.Item
                className="!dark:text-text0d w-full !max-w-[380px] uppercase !text-text0"
                name="name"
                label={'wallet name'}>
                <Input className="!text-[16px]" size="large" maxLength={20} placeholder={`wallet-${walletId}`} />
              </Form.Item>
            </div>
          </div>
        </Spin>
        {/* submit button */}
        <div className="flex flex-col items-center">
          <Button
            className="mt-[50px] min-w-[150px]"
            sizevalue="xnormal"
            type="primary"
            htmlType="submit"
            round="true"
            disabled={!RD.isSuccess(loadKeystoreState) || RD.isPending(importKeystoreState)}>
            {intl.formatMessage({ id: 'wallet.action.import' })}
          </Button>
        </div>
      </InnerForm>
    </>
  )
}
