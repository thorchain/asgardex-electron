import React, { useCallback, useState, useEffect, useMemo } from 'react'

import * as crypto from '@thorchain/asgardex-crypto'
import { Form, Button, Input, Spin } from 'antd'
import { Rule } from 'antd/lib/form'
import { Store } from 'antd/lib/form/interface'
import Paragraph from 'antd/lib/typography/Paragraph'
import { right } from 'fp-ts/lib/Either'
import * as E from 'fp-ts/lib/Either'
import * as O from 'fp-ts/lib/Option'
import { none, Option, some } from 'fp-ts/lib/Option'
import { useObservableState } from 'observable-hooks'
import { useHistory } from 'react-router-dom'

import { useBinanceContext } from '../../contexts/BinanceContext'
import { useWalletContext } from '../../contexts/WalletContext'
import * as walletRoutes from '../../routes/wallet'
import { BinanceClientReadyState, BinanceClientState } from '../../services/binance/types'
import { isLocked } from '../../services/wallet/util'

const ImportPhrase: React.FC = (): JSX.Element => {
  const history = useHistory()
  const [form] = Form.useForm()

  const { keystoreService } = useWalletContext()
  const keystore = useObservableState(keystoreService.keystore$, none)

  const { clientState$ } = useBinanceContext()
  const clientState = useObservableState(clientState$, right('notready' as BinanceClientReadyState))
  const [importing, setImporting] = useState(false)
  const [importError, setImportError] = useState<Option<Error>>(none)

  useEffect(() => {
    E.fold(
      // handle error while trying to instantiate `BinanceClient`
      (error: Error) => {
        setImporting(false)
        setImportError(some(error))
      },
      (value: BinanceClientReadyState) => {
        // reset states
        setImporting(false)
        setImportError(none)
        // TODO(@Veado): Fix `clientState` to avoid check of `isLocked` which causes rendering issues
        if (value === 'ready' && !isLocked(keystore)) {
          // redirect to wallets assets view
          history.push(walletRoutes.assets.template)
        }
      }
    )(clientState as BinanceClientState)
  }, [clientState, history, keystore])

  const [validPhrase, setValidPhrase] = useState(false)
  const [validPassword, setValidPassword] = useState(false)

  const phraseValidator = async (_: Rule, value: string) => {
    if (!value) {
      // TODO(@Veado): i18n
      return Promise.reject('Value for phrase required')
    }
    const valid = crypto.validatePhrase(value)
    setValidPhrase(valid)
    // TODO(@Veado): i18n
    return valid ? Promise.resolve() : Promise.reject('Invalid mnemonic seed phrase')
  }

  const passwordValidator = async (_: Rule, value: string) => {
    if (!value) {
      setValidPassword(false)
      // TODO(@Veado): i18n
      return Promise.reject('Value for password required')
    }
    setValidPassword(true)
    return Promise.resolve()
  }

  const onReset = () => {
    form.resetFields()
  }

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
