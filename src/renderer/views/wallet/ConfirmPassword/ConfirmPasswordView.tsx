import React, { useCallback, useMemo, useState } from 'react'

import * as RD from '@devexperts/remote-data-ts'
import * as FP from 'fp-ts/function'
import { useObservableState } from 'observable-hooks'

import { PrivateModal } from '../../../components/modal/private'
import { useWalletContext } from '../../../contexts/WalletContext'

/**
 * @Note
 * This is not a 'usual' view
 * Just a modal 'connected' to the all appropriate services
 */

export const ConfirmPasswordView: React.FC<{
  onSuccess: () => void
  onClose: () => void
}> = ({ onSuccess, onClose }) => {
  const [passwordToValidate, setPasswordToValidate] = useState('')

  const { keystoreService } = useWalletContext()
  const passwordValidationResult$ = useMemo(() => keystoreService.validatePassword$(passwordToValidate), [
    passwordToValidate,
    keystoreService
  ])

  const passwordValidationResult = useObservableState(passwordValidationResult$, RD.initial)

  const closePrivateModal = useCallback(() => {
    onClose()
    setPasswordToValidate('')
  }, [onClose, setPasswordToValidate])

  const onPasswordValidationSucceed = useCallback(() => {
    onSuccess()
    closePrivateModal()
  }, [onSuccess, closePrivateModal])

  const confirmProps = useMemo(
    () =>
      FP.pipe(
        passwordValidationResult,
        RD.fold(
          () => ({
            onCancel: closePrivateModal,
            visible: true,
            onConfirm: setPasswordToValidate
          }),
          () => ({
            visible: true,
            validatingPassword: true,
            onCancel: closePrivateModal,
            onConfirm: () => null
          }),
          () => ({
            visible: true,
            invalidPassword: true,
            onCancel: closePrivateModal,
            onConfirm: setPasswordToValidate
          }),
          () => ({
            visible: true,
            onCancel: closePrivateModal,
            onOk: onPasswordValidationSucceed,
            onConfirm: setPasswordToValidate,
            isSuccess: true
          })
        )
      ),
    [passwordValidationResult, setPasswordToValidate, closePrivateModal, onPasswordValidationSucceed]
  )

  return <PrivateModal {...confirmProps} />
}
