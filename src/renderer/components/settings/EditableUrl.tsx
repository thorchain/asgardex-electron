import React, { useCallback, useEffect, useMemo, useState } from 'react'

import * as RD from '@devexperts/remote-data-ts'
import { CheckCircleIcon, PencilAltIcon, XCircleIcon } from '@heroicons/react/outline'
import * as FP from 'fp-ts/lib/function'
import * as O from 'fp-ts/lib/Option'
import { useForm } from 'react-hook-form'
import { IntlShape, useIntl } from 'react-intl'

import { LiveData } from '../../helpers/rx/liveData'
import { useSubscriptionState } from '../../hooks/useSubscriptionState'
import { BaseButton, BorderButton, TextButton } from '../uielements/button'
import { Input } from '../uielements/input/Input'

type FormData = {
  url: string
}

type TestUrlRD = RD.RemoteData<Error, string>
type TestUrlLD = LiveData<Error, string>
type TestUrlHandler = (url: string, intl: IntlShape) => TestUrlLD

type Props = {
  url: string
  checkUrl$: TestUrlHandler
  successMsg: string
  loading?: boolean
  onChange?: (url: string) => void
  className?: string
}

const EditableUrl: React.FC<Props> = (props): JSX.Element => {
  const { url: initialUrl, className, successMsg, loading = false, onChange = FP.constVoid, checkUrl$ } = props

  const [editableUrl, setEditableUrl] = useState<O.Option<string>>(O.none)
  const [url, setUrl] = useState<string>(initialUrl)

  useEffect(() => {
    setUrl(initialUrl)
  }, [initialUrl])

  const intl = useIntl()

  const {
    register,
    formState: { errors },
    reset,
    handleSubmit,
    getValues,
    setError
  } = useForm<FormData>()

  const {
    state: testUrlState,
    subscribe: subscribeTestUrlState,
    reset: resetTestUrlState
  } = useSubscriptionState<TestUrlRD>(RD.initial)

  const testUrl = useCallback((urlToTest: string): TestUrlLD => checkUrl$(urlToTest, intl), [checkUrl$, intl])

  const testUrlAsPromise = useCallback(
    (urlToTest: string): Promise<TestUrlRD> => testUrl(urlToTest).toPromise(),
    [testUrl]
  )

  const runTestUrlHandler = useCallback(() => {
    const urlToTest = FP.pipe(
      editableUrl, // check editable state
      O.fold(
        () => url, // none editable state: Get value from state
        (_) => getValues().url // editable state: Get value from from
      )
    )
    resetTestUrlState()
    subscribeTestUrlState(testUrl(urlToTest))
  }, [editableUrl, getValues, resetTestUrlState, subscribeTestUrlState, testUrl, url])

  const renderTestUrlResult = useMemo(
    () =>
      FP.pipe(
        testUrlState,
        RD.fold(
          () => <></>,
          () => <></>,
          (error) => (
            <p className={`mt-10px font-main text-[14px] uppercase text-error0`}>
              {error?.message ?? error.toString()}
            </p>
          ),
          (_) => <p className={`mt-10px font-main text-[14px] uppercase text-turquoise`}>{successMsg}</p>
        )
      ),
    [successMsg, testUrlState]
  )

  const renderUrl = useCallback(() => {
    const edit = () => {
      resetTestUrlState()
      setEditableUrl(O.some(url))
    }
    return (
      <div className="flex items-center">
        <TextButton
          className={`flex !p-0 ${loading ? 'cursor-not-allowed' : 'cursor-pointer'} items-center text-[16px]`}
          color="neutral"
          uppercase={false}
          disabled={loading || RD.isPending(testUrlState)}
          size="large"
          loading={loading}
          onClick={edit}>
          {url}
          <PencilAltIcon className="dark:text0d ml-[5px] h-[20px] w-[20px] text-turquoise" />
        </TextButton>
        <BorderButton
          className="ml-10px"
          loading={RD.isPending(testUrlState)}
          disabled={RD.isPending(testUrlState)}
          size="medium"
          color="neutral"
          onClick={runTestUrlHandler}>
          {intl.formatMessage({ id: 'common.test' })}
        </BorderButton>
      </div>
    )
  }, [intl, loading, resetTestUrlState, runTestUrlHandler, testUrlState, url])

  const renderEditableUrl = useCallback(
    (name: string) => {
      const cancel = () => {
        reset()
        resetTestUrlState()
        setEditableUrl(O.none)
      }
      const submit = async ({ url: formUrl }: FormData) => {
        resetTestUrlState()
        // Remove always trailing slash
        const url = formUrl.replace(/\/$/, '')
        if (!url) {
          setError('url', { type: 'custom', message: 'url required' })
        } else {
          testUrlAsPromise(url)
            .then(
              FP.flow(
                RD.fold(
                  () => {},
                  () => {},
                  (error) => setError('url', { type: 'custom', message: error.toString() }),
                  (_) => {
                    setEditableUrl(O.none)
                    onChange(url)
                    setUrl(url)
                    reset()
                  }
                )
              )
            )
            .catch((_) => {
              setError('url', { type: 'custom', message: 'invalid url' })
            })
        }
      }

      const keyDownHandler = (e: React.KeyboardEvent<HTMLElement>) => {
        if (e.key === 'Escape') {
          cancel()
        }
      }
      return (
        <form className="flex w-full flex-col" onSubmit={handleSubmit(submit)}>
          <div className="flex w-full items-center ">
            <Input
              id="url"
              className={`w-full text-[16px]
              ${RD.isSuccess(testUrlState) ? '!ring-turquoise' : ''}
              `}
              size="large"
              defaultValue={name}
              autoFocus
              uppercase={false}
              {...register('url', { required: true })}
              error={!!errors.url || RD.isFailure(testUrlState)}
              onKeyDown={keyDownHandler}
            />
            <BaseButton className="!p-0 text-turquoise" onClick={handleSubmit(submit)} type="submit">
              <CheckCircleIcon className="ml-[5px] h-[24px] w-[24px]" />
            </BaseButton>
            <BaseButton className="!p-0 text-error0" onClick={cancel}>
              <XCircleIcon className="ml-[5px] h-[24px] w-[24px]" />
            </BaseButton>
            <BorderButton
              className="ml-10px"
              loading={RD.isPending(testUrlState)}
              disabled={RD.isPending(testUrlState)}
              size="medium"
              color="neutral"
              onClick={runTestUrlHandler}>
              {intl.formatMessage({ id: 'common.test' })}
            </BorderButton>
          </div>
          {errors.url && <p className={`mt-10px font-main text-[14px] uppercase text-error0`}>{errors.url.message}</p>}
        </form>
      )
    },
    [
      errors.url,
      handleSubmit,
      intl,
      onChange,
      register,
      reset,
      resetTestUrlState,
      runTestUrlHandler,
      setError,
      testUrlAsPromise,
      testUrlState
    ]
  )

  return (
    <div className={`${className}`}>
      {FP.pipe(editableUrl, O.fold(renderUrl, renderEditableUrl))}
      {renderTestUrlResult}
    </div>
  )
}

export default EditableUrl
