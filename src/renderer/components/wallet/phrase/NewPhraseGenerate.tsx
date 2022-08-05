import React, { useState, useCallback, useMemo } from 'react'

import { generatePhrase } from '@xchainjs/xchain-crypto'
import Form, { Rule } from 'antd/lib/form'
import * as A from 'fp-ts/lib/Array'
import * as FP from 'fp-ts/lib/function'
import * as NEA from 'fp-ts/lib/NonEmptyArray'
import * as S from 'fp-ts/lib/string'
import { useObservableCallback, useSubscription } from 'observable-hooks'
import { useIntl } from 'react-intl'
import * as RxOp from 'rxjs/operators'

import { Button, RefreshButton } from '../../uielements/button'
import { InputPassword } from '../../uielements/input'
import { CopyLabel } from '../../uielements/label'
import { Phrase } from './index'
import * as Styled from './NewPhrase.styles'
import type { WordType } from './NewPhraseConfirm.types'
import * as StyledPhrase from './Phrase.styles'
import { PhraseInfo } from './Phrase.types'

type Props = {
  onSubmit: (info: PhraseInfo) => void
}

export type FormValues = {
  password: string
}

export const NewPhraseGenerate: React.FC<Props> = ({ onSubmit }: Props): JSX.Element => {
  const [loadingMsg, setLoadingMsg] = useState<string>('')
  const intl = useIntl()

  const [phrase, setPhrase] = useState(generatePhrase())

  const [clickRefreshButtonHandler, refreshButtonClicked$] = useObservableCallback<React.MouseEvent>((event$) =>
    // Delay clicks to give `generatePhrase` some time to process w/o rendering issues
    // see https://github.com/thorchain/asgardex-electron/issues/2054
    event$.pipe(RxOp.debounceTime(100))
  )

  useSubscription(refreshButtonClicked$, () => setPhrase(generatePhrase()))

  const phraseWords: WordType[] = useMemo(
    () =>
      FP.pipe(
        phrase,
        S.split(' '),
        NEA.fromReadonlyNonEmptyArray,
        A.mapWithIndex((index, word) => ({ text: word, _id: `${word}-${index.toString()}` }))
      ),
    [phrase]
  )

  const [form] = Form.useForm<FormValues>()

  const handleFormFinish = useCallback(
    ({ password }: FormValues) => {
      try {
        setLoadingMsg(intl.formatMessage({ id: 'wallet.create.creating' }) + '...')
        onSubmit({ phrase, password: password })
      } catch (err) {
        setLoadingMsg('')
      }
    },
    [onSubmit, phrase, intl]
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

  return (
    <>
      <Styled.TitleContainer justify="space-between">
        <CopyLabel textToCopy={phrase} label={intl.formatMessage({ id: 'wallet.create.copy.phrase' })} />
        <RefreshButton clickHandler={clickRefreshButtonHandler} />
      </Styled.TitleContainer>
      <Phrase words={phraseWords} readOnly={true} />
      <Styled.Form form={form} onFinish={handleFormFinish} labelCol={{ span: 24 }}>
        <StyledPhrase.PasswordContainer>
          <StyledPhrase.PasswordItem name="password" validateTrigger={['onSubmit', 'onBlur']} rules={rules}>
            <InputPassword size="large" placeholder={intl.formatMessage({ id: 'common.password' }).toUpperCase()} />
          </StyledPhrase.PasswordItem>
          <StyledPhrase.PasswordItem
            name="repeatPassword"
            dependencies={['password']}
            validateTrigger={['onSubmit', 'onBlur']}
            rules={rules}>
            <InputPassword
              size="large"
              placeholder={intl.formatMessage({ id: 'wallet.password.repeat' }).toUpperCase()}
            />
          </StyledPhrase.PasswordItem>
        </StyledPhrase.PasswordContainer>
        <Styled.SubmitItem>
          <Button size="large" type="primary" round="true" htmlType="submit">
            {loadingMsg || intl.formatMessage({ id: 'common.next' })}
          </Button>
        </Styled.SubmitItem>
      </Styled.Form>
    </>
  )
}
