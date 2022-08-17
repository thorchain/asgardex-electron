import React, { useCallback, useState } from 'react'

import { CheckCircleIcon, PencilAltIcon, XCircleIcon } from '@heroicons/react/outline'
import * as FP from 'fp-ts/lib/function'
import * as O from 'fp-ts/lib/Option'
import { useForm } from 'react-hook-form'
import { useIntl } from 'react-intl'

import { MAX_WALLET_NAME_CHARS } from '../../../services/wallet/const'
// import { LoadingIcon } from '../../icons'
import { BaseButton, TextButton } from '../button'
import { Input } from '../input/Input'

export type Props = {
  name: string
  loading?: boolean
  onChange: (name: string) => void
  className?: string
}

type FormData = {
  name: string
}

export const EditableWalletName: React.FC<Props> = (props): JSX.Element => {
  const { name: initialName, onChange, loading = false, className = '' } = props

  const [editableName, setEditableName] = useState<O.Option<string>>(O.none)
  const [name, setName] = useState<string>(initialName)

  const intl = useIntl()

  const {
    register,
    formState: { errors },
    reset,
    handleSubmit
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
        <PencilAltIcon className="dark:text0d ml-[5px] h-[20px] w-[20px] text-text0 dark:text-text0d" />
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
        setEditableName(O.none)
        onChange(name)
        setName(name)
        reset()
      }

      const keyDownHandler = (e: React.KeyboardEvent<HTMLElement>) => {
        if (e.key === 'Escape') {
          cancel()
        }
      }

      return (
        <form className="items-top flex w-full justify-center" onSubmit={handleSubmit(submit)}>
          <Input
            id="name"
            className="w-full !max-w-[380px] pl-[60px]" // 60px offset of icons width to stay in center
            classNameInput="text-[18px] ring-gray1 dark:ring-gray1d"
            size="large"
            disabled={loading}
            defaultValue={name}
            autoFocus
            maxLength={MAX_WALLET_NAME_CHARS}
            {...register('name', { required: true })}
            error={errors.name ? intl.formatMessage({ id: 'wallet.name.error.empty' }) : ''}
            onKeyDown={keyDownHandler}
          />
          <div className="flex h-[35px] items-center">
            <BaseButton className="!p-0 text-turquoise" onClick={handleSubmit(submit)} type="submit">
              <CheckCircleIcon className="ml-[5px] h-[24px] w-[24px]" />
            </BaseButton>
            <XCircleIcon className="ml-[5px] h-[24px] w-[24px] cursor-pointer text-error0" onClick={cancel} />
          </div>
        </form>
      )
    },
    [loading, errors.name, handleSubmit, intl, onChange, register, reset]
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
      <div className={`flex items-center ${loading ? 'opacity-65' : 'opacity-100'}`}>
        {/* show loading icon */}
        {/* {loading && <LoadingIcon className={`mr-[12px] h-[17px] w-[17px] animate-spin group-hover:opacity-70`} />} */}
        {FP.pipe(editableName, O.fold(renderName, renderEditableName))}
      </div>
    </div>
  )
}
