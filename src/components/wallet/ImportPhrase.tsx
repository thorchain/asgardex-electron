import React, { useCallback, useState, useEffect } from 'react'

import * as crypto from '@thorchain/asgardex-crypto'
import { Form, Button, Input, Spin } from 'antd'
import { Rule } from 'antd/lib/form'
import { Store } from 'antd/lib/form/interface'
import Paragraph from 'antd/lib/typography/Paragraph'
import { right } from 'fp-ts/lib/Either'
import * as E from 'fp-ts/lib/Either'
import { useObservableState } from 'observable-hooks'
import { useHistory } from 'react-router-dom'

import { useBinanceContext } from '../../contexts/BinanceContext'
import { useWalletContext } from '../../contexts/WalletContext'
import * as walletRoutes from '../../routes/wallet'
import { BinanceClientReadyState, BinanceClientState } from '../../services/binance/types'

const ImportPhrase: React.FC = (): JSX.Element => {
  const history = useHistory()
  const [form] = Form.useForm()

  const { keystoreService } = useWalletContext()
  const { clientState$ } = useBinanceContext()
  const clientState = useObservableState(clientState$, right('notready' as BinanceClientReadyState))
  const [importing, setImporting] = useState(false)
  const [importError, setImportError] = useState('')

  useEffect(() => {
    E.fold(
      // handle error while trying to instantiate `BinanceClient`
      (error) => {
        setImporting(false)
        setImportError(`${error}`)
      },
      (value: BinanceClientReadyState) => {
        // reset states
        setImporting(false)
        setImportError('')
        if (value === 'ready') {
          // redirect to wallets assets view
          history.push(walletRoutes.assets.template)
        }
      }
    )(clientState as BinanceClientState)
  }, [clientState, history])

  const [validPhrase, setValidPhrase] = useState(false)
  const [validPassword, setValidPassword] = useState(false)

  const phraseValidator = async (_: Rule, value: string) => {
    if (!value) {
      return Promise.reject('Value for phrase required')
    }
    const valid = crypto.validatePhrase(value)
    setValidPhrase(valid)
    return valid ? Promise.resolve() : Promise.reject('Invalid mnemonic seed phrase')
  }

  const passwordValidator = async (_: Rule, value: string) => {
    if (!value) {
      setValidPassword(false)
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
      setImportError('')
      setImporting(true)
      keystoreService.addKeystore(newPhrase, password).catch((error) => {
        setImporting(false)
        // TODO(@Veado): i18n
        setImportError(`Could not submit phrase ${error}`)
      })
    },
    [keystoreService]
  )

  return (
    <>
      {importError && <Paragraph>{importError}</Paragraph>}
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
            loading={importing}
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
