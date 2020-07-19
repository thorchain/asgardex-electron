import React, { useState, useCallback, useMemo } from 'react'

import { generatePhrase } from '@thorchain/asgardex-crypto'
import { Form, Button } from 'antd'
import { Rule } from 'antd/lib/form'
import { Store } from 'antd/lib/form/interface'
import { useIntl } from 'react-intl'

import { InputPassword as Input } from '../uielements/input'
import Label from '../uielements/label'
import { MnemonicPhrase } from './MnemonicPhrase'

export type MnemonicInfo = { phrase: string; password: string }

type Props = {
  onSubmit: (info: MnemonicInfo) => void
}
const NewMnemonicGenerate: React.FC<Props> = ({ onSubmit }: Props): JSX.Element => {
  const [loadingMsg, setLoadingMsg] = useState<string>('')
  const intl = useIntl()

  const phrase = useMemo(() => generatePhrase(), [])

  const phraseWords = useMemo(() => phrase.split(' ').map((word) => ({ text: word, _id: word })), [phrase])

  const createMnemonicWallet = useCallback(() => {
    // TODO (@Veado) Extract this into helper
    localStorage.setItem('phrase', phrase)
  }, [phrase])

  const handleFormFinish = useCallback(
    async (formData: Store) => {
      try {
        setLoadingMsg('Creating wallet...')
        createMnemonicWallet()
        onSubmit({ phrase, password: formData.password })
      } catch (err) {
        setLoadingMsg('')
      }
    },
    [createMnemonicWallet, onSubmit, phrase]
  )

  const rules: Rule[] = useMemo(
    () => [
      { required: true },
      ({ getFieldValue }) => ({
        validator(_, value) {
          if (!value || getFieldValue('password') === value) {
            return Promise.resolve()
          }
          return Promise.reject('Password mismatch!')
        }
      })
    ],
    []
  )

  const copyPhraseToClipborad = useCallback(() => {
    navigator.clipboard.writeText(phrase)
  }, [phrase])
  return (
    <>
      <Label onClick={copyPhraseToClipborad}>{intl.formatMessage({ id: 'wallet.create.copy.phrase' })}</Label>
      <MnemonicPhrase words={phraseWords} />
      <Form onFinish={handleFormFinish} labelCol={{ span: 24 }}>
        <Form.Item name="password" label="Password" validateTrigger={['onSubmit', 'onBlur']} rules={rules}>
          <Input size="large" type="password" />
        </Form.Item>
        <Form.Item
          name="repeatPassword"
          label="Repeat Password"
          dependencies={['password']}
          validateTrigger={['onSubmit', 'onBlur']}
          rules={rules}>
          <Input size="large" type="password" />
        </Form.Item>
        <Form.Item>
          <Button size="large" type="primary" htmlType="submit" block>
            {loadingMsg || 'Submit'}
          </Button>
        </Form.Item>
      </Form>
    </>
  )
}

export default NewMnemonicGenerate
