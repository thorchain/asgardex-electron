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

import { defaultWalletName } from '../../../../shared/utils/wallet'
import { MAX_WALLET_NAME_CHARS } from '../../../services/wallet/const'
import { FlatButton, RefreshButton } from '../../uielements/button'
import { Input, InputPassword } from '../../uielements/input'
import { CopyLabel } from '../../uielements/label'
import { Phrase } from './index'
import * as Styled from './NewPhrase.styles'
import type { WordType } from './NewPhraseConfirm.types'
import { PhraseInfo } from './Phrase.types'

type Props = {
  walletId: number
  onSubmit: (info: PhraseInfo) => void
}

export type FormValues = {
  password: string
  name: string
}

export const NewPhraseGenerate: React.FC<Props> = ({ onSubmit, walletId }: Props): JSX.Element => {
  const [loading, setLoading] = useState(false)
  const intl = useIntl()

  const [phrase, setPhrase] = useState(generatePhrase())

  const initialWalletName = useMemo(() => defaultWalletName(walletId), [walletId])

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
    ({ password, name }: FormValues) => {
      if (!loading) {
        try {
          setLoading(true)
          onSubmit({ phrase, password, name: name || initialWalletName })
        } catch (err) {
          setLoading(false)
        }
      }
    },
    [initialWalletName, loading, onSubmit, phrase]
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
      <Form form={form} onFinish={handleFormFinish} labelCol={{ span: 24 }} className="w-full p-30px pt-15px">
        <div className="flex flex-col items-center">
          <Form.Item
            name="password"
            className="w-full !max-w-[380px]"
            validateTrigger={['onSubmit', 'onBlur']}
            rules={rules}
            label={intl.formatMessage({ id: 'common.password' })}>
            <InputPassword className="!text-lg" size="large" />
          </Form.Item>
          {/* repeat password */}
          <Form.Item
            name="repeatPassword"
            className="w-full !max-w-[380px]"
            dependencies={['password']}
            validateTrigger={['onSubmit', 'onBlur']}
            rules={rules}
            label={intl.formatMessage({ id: 'wallet.password.repeat' })}>
            <InputPassword className="!text-lg" size="large" />
          </Form.Item>
          {/* name */}
          <Form.Item
            name="name"
            className="w-full !max-w-[380px]"
            label={
              <div>
                {intl.formatMessage({ id: 'wallet.name' })}
                <span className="pl-5px text-[12px] text-gray1 dark:text-gray1d">
                  ({intl.formatMessage({ id: 'wallet.name.maxChars' }, { max: MAX_WALLET_NAME_CHARS })})
                </span>
              </div>
            }>
            <Input
              className="!text-lg"
              size="large"
              maxLength={MAX_WALLET_NAME_CHARS}
              placeholder={initialWalletName}
            />
          </Form.Item>
          <FlatButton
            className="mt-20px"
            size="large"
            color="primary"
            type="submit"
            loading={loading}
            disabled={loading}>
            {intl.formatMessage({ id: 'common.next' })}
          </FlatButton>
        </div>
      </Form>
    </>
  )
}
