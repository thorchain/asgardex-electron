import React, { useCallback, useState } from 'react'

import { CheckCircleIcon, PencilAltIcon, XCircleIcon } from '@heroicons/react/outline'
import * as FP from 'fp-ts/lib/function'
import * as O from 'fp-ts/lib/Option'
import { useForm } from 'react-hook-form'
import { useIntl } from 'react-intl'

import { MAX_WALLET_NAME_CHARS } from '../../../services/wallet/const'
import { BaseButton, TextButton } from '../button'
import { Input } from '../input/Input'

export type Props = {
  name: string
  names: string[]
  loading?: boolean
  onChange: (name: string) => void
  className?: string
}

type FormData = {
  name: string
}

export const EditableWalletName: React.FC<Props> = (props): JSX.Element => {
  const { name: initialName, names, onChange, loading = false, className = '' } = props

  const [editableName, setEditableName] = useState<O.Option<string>>(O.none)
  const [name, setName] = useState<string>(initialName)

  const intl = useIntl()

  const {
    register,
    formState: { errors },
    reset,
    handleSubmit,
    setError
  } = useForm<FormData>()

  const renderName = useCallback(() => {
    const edit = () => {
      setEditableName(O.some(name))
    }
    return (
      <TextButton
        color="neutral"
        uppercase={false}
        disabled={loading}
        size="large"
        loading={loading}
        className={`flex ${loading ? 'cursor-not-allowed' : 'cursor-pointer'} items-center text-[18px]`}
        onClick={edit}>
        {name}
        <PencilAltIcon className="dark:text0d ml-[5px] h-[20px] w-[20px] text-turquoise" />
      </TextButton>
    )
  }, [loading, name])

  const renderEditableName = useCallback(
    (name: string) => {
      const cancel = () => {
        reset()
        setEditableName(O.none)
      }
      const submit = ({ name }: FormData) => {
        if (names.includes(name)) {
          setError('name', { type: 'custom', message: intl.formatMessage({ id: 'wallet.name.error.duplicated' }) })
        } else {
          setEditableName(O.none)
          onChange(name)
          setName(name)
          reset()
        }
      }

      const keyDownHandler = (e: React.KeyboardEvent<HTMLElement>) => {
        if (e.key === 'Escape') {
          cancel()
        }
      }

      return (
        <form className="flex w-full flex-col items-center" onSubmit={handleSubmit(submit)}>
          <div className="flex w-full items-center justify-center">
            <Input
              id="name"
              className="w-full max-w-[380px]"
              size="large"
              defaultValue={name}
              autoFocus
              uppercase={false}
              maxLength={MAX_WALLET_NAME_CHARS}
              {...register('name', { required: intl.formatMessage({ id: 'wallet.name.error.empty' }) })}
              error={!!errors.name}
              onKeyDown={keyDownHandler}
            />
            <BaseButton className="!p-0 text-turquoise" onClick={handleSubmit(submit)} type="submit">
              <CheckCircleIcon className="ml-[5px] h-[24px] w-[24px]" />
            </BaseButton>
            <XCircleIcon className="ml-[5px] h-[24px] w-[24px] cursor-pointer text-error0" onClick={cancel} />
          </div>
          {errors.name && (
            <p className={`mt-10px font-main text-[14px] uppercase text-error0`}>{errors.name.message}</p>
          )}
        </form>
      )
    },
    [errors.name, handleSubmit, intl, names, onChange, register, reset, setError]
  )

  return (
    <div className={`flex w-full flex-col items-center justify-center ${className}`}>
      <h2 className="w-full text-center font-main text-[12px] uppercase text-text2 dark:text-text2d">
        {intl.formatMessage({ id: 'wallet.name' })}
        {/* show info about max. chars in editable mode only  */}
        {FP.pipe(
          editableName,
          O.fold(
            () => <></>,
            (_) => (
              <span className="pl-5px text-[12px] text-gray1 dark:text-gray1d">
                ({intl.formatMessage({ id: 'wallet.name.maxChars' }, { max: MAX_WALLET_NAME_CHARS })})
              </span>
            )
          )
        )}
      </h2>
      <div
        className={`flex items-center ${loading ? 'opacity-65' : 'opacity-100'} ${
          O.isSome(editableName) ? 'w-full' : ''
        }`}>
        {FP.pipe(editableName, O.fold(renderName, renderEditableName))}
      </div>
    </div>
  )
}
