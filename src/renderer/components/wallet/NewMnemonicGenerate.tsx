import React, { useState, useCallback, useMemo } from 'react'

import { generatePhrase } from '@thorchain/asgardex-crypto'
import { Form, Button, Row } from 'antd'
import { Rule } from 'antd/lib/form'
import { Store } from 'antd/lib/form/interface'
import { useIntl } from 'react-intl'

import { InputPassword as Input } from '../uielements/input'
import Label from '../uielements/label'
import { MnemonicPhrase } from './MnemonicPhrase'
import RefreshButton from './RefreshButton'

export type MnemonicInfo = { phrase: string; password: string }

type Props = {
  onSubmit: (info: MnemonicInfo) => void
}
const NewMnemonicGenerate: React.FC<Props> = ({ onSubmit }: Props): JSX.Element => {
  const [loadingMsg, setLoadingMsg] = useState<string>('')
  const intl = useIntl()

  const [phrase, setPhrase] = useState(generatePhrase())

  const phraseWords = useMemo(() => phrase.split(' ').map((word) => ({ text: word, _id: word })), [phrase])

  const handleFormFinish = useCallback(
    async (formData: Store) => {
      try {
        setLoadingMsg(intl.formatMessage({ id: 'wallet.create.creating' }) + '...')
        onSubmit({ phrase, password: formData.password })
      } catch (err) {
        setLoadingMsg('')
      }
    },
    [onSubmit, phrase, intl]
  )

  const rules: Rule[] = useMemo(
    () => [
      { required: true },
      ({ getFieldValue }) => ({
        validator(_, value) {
          if (!value || getFieldValue('password') === value) {
            return Promise.resolve()
          }
          return Promise.reject(intl.formatMessage({ id: 'wallet.create.password.mismatch' }))
        }
      })
    ],
    [intl]
  )

  const copyPhraseToClipborad = useCallback(() => {
    navigator.clipboard.writeText(phrase)
  }, [phrase])
  return (
    <>
      <Row justify="space-between">
        <Label onClick={copyPhraseToClipborad}>{intl.formatMessage({ id: 'wallet.create.copy.phrase' })}</Label>
        <RefreshButton onRefresh={() => setPhrase(generatePhrase())} />
      </Row>
      <MnemonicPhrase words={phraseWords} />
      <Form onFinish={handleFormFinish} labelCol={{ span: 24 }}>
        <Form.Item
          name="password"
          label={intl.formatMessage({ id: 'common.password' })}
          validateTrigger={['onSubmit', 'onBlur']}
          rules={rules}>
          <Input size="large" type="password" />
        </Form.Item>
        <Form.Item
          name="repeatPassword"
          label={intl.formatMessage({ id: 'wallet.create.password.repeat' })}
          dependencies={['password']}
          validateTrigger={['onSubmit', 'onBlur']}
          rules={rules}>
          <Input size="large" type="password" />
        </Form.Item>
        <Form.Item>
          <Button size="large" type="primary" htmlType="submit" block>
            {loadingMsg || intl.formatMessage({ id: 'common.submit' })}
          </Button>
        </Form.Item>
      </Form>
    </>
  )
}

export default NewMnemonicGenerate
