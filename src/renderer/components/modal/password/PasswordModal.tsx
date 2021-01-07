import React, { useCallback, useMemo, useState } from 'react'

import * as RD from '@devexperts/remote-data-ts'
import * as FP from 'fp-ts/function'
import { useObservableState } from 'observable-hooks'

import { PrivateModal } from '../../../components/modal/private'
import { ValidatePasswordLD } from '../../../services/wallet/types'

/**
 * Wrapper around `PrivateModal` to validate password using `validatePassword$` stream
 */
export type Props = {
  onSuccess: FP.Lazy<void>
  onClose: FP.Lazy<void>
  validatePassword$: (_: string) => ValidatePasswordLD
}

export const PasswordModal: React.FC<Props> = ({ onSuccess, onClose, validatePassword$ }) => {
  const [passwordToValidate, setPasswordToValidate] = useState('')

  const passwordValidationResult$ = useMemo(() => validatePassword$(passwordToValidate), [
    passwordToValidate,
    validatePassword$
  ])

  const passwordValidationRD = useObservableState(passwordValidationResult$, RD.initial)

  const closePrivateModal = useCallback(() => {
    onClose()
    setPasswordToValidate('')
  }, [onClose, setPasswordToValidate])

  const onPasswordValidationSucceed = useCallback(() => {
    onSuccess()
    closePrivateModal()
  }, [onSuccess, closePrivateModal])

  const confirmProps = useMemo(() => {
    const props = { onCancel: closePrivateModal, visible: true }
    return FP.pipe(
      passwordValidationRD,
      RD.fold(
        () => ({
          ...props,
          onConfirm: setPasswordToValidate
        }),
        () => ({
          ...props,
          validatingPassword: true,
          onConfirm: () => null
        }),
        () => ({
          ...props,
          invalidPassword: true,
          onConfirm: setPasswordToValidate
        }),
        () => ({
          ...props,
          onOk: onPasswordValidationSucceed,
          onConfirm: setPasswordToValidate,
          isSuccess: true
        })
      )
    )
  }, [passwordValidationRD, setPasswordToValidate, closePrivateModal, onPasswordValidationSucceed])

  return <PrivateModal {...confirmProps} />
}
