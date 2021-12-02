import React, { useCallback, useEffect, useMemo, useState } from 'react'

import * as RD from '@devexperts/remote-data-ts'
import { Form } from 'antd'
import * as FP from 'fp-ts/function'
import { useObservableState } from 'observable-hooks'
import { useIntl } from 'react-intl'

import { ValidatePasswordLD } from '../../../services/wallet/types'
import { Input } from '../../uielements/input'
import { Label } from '../../uielements/label'
import * as Styled from './ConfirmationModal.styles'
import * as CStyled from './WalletPasswordConfirmationModal.styles'

type PasswordModalProps = {
  visible: boolean
  invalidPassword?: boolean
  validatingPassword?: boolean
  onConfirm?: (password: string) => void
  onOk?: FP.Lazy<void>
  onCancel?: FP.Lazy<void>
  isSuccess?: boolean
}

const PasswordModal: React.FC<PasswordModalProps> = (props): JSX.Element => {
  const {
    visible,
    invalidPassword,
    validatingPassword,
    onConfirm = FP.constVoid,
    onOk = FP.constVoid,
    onCancel = FP.constVoid,
    isSuccess
  } = props

  const intl = useIntl()

  /**
   * Call onOk on success only
   */
  useEffect(() => {
    if (isSuccess) {
      onOk()
    }
  }, [isSuccess, onOk])

  const [password, setPassword] = useState('')

  const onChangePasswordHandler = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setPassword(e.target.value)
    },
    [setPassword]
  )

  const onConfirmCb = useCallback(() => {
    onConfirm(password)
  }, [onConfirm, password])

  const onOkCb = useMemo(() => (!validatingPassword ? onConfirmCb : undefined), [validatingPassword, onConfirmCb])

  return (
    // Note: We can't use `ConfirmationModal` here,
    // its `onOkHandler` does not support different `onOk` callbacks, but will always close the modal
    <Styled.Modal
      title={intl.formatMessage({ id: 'wallet.password.confirmation' })}
      visible={visible}
      onOk={onOkCb}
      onCancel={onCancel}
      maskClosable={false}
      closable={false}
      okText={intl.formatMessage({ id: 'common.confirm' })}
      cancelText={intl.formatMessage({ id: 'common.cancel' })}>
      <CStyled.Content>
        <CStyled.WalletIcon />
        <CStyled.Description>
          {intl.formatMessage({ id: 'wallet.password.confirmation.description' })}
        </CStyled.Description>
        <Form autoComplete="off">
          <Form.Item
            className={invalidPassword ? 'has-error' : ''}
            extra={
              validatingPassword ? `${intl.formatMessage({ id: 'wallet.password.confirmation.pending' })}...` : ''
            }>
            <Input
              type="password"
              typevalue="normal"
              size="large"
              value={password}
              onChange={onChangePasswordHandler}
              prefix={<Styled.LockOutlined />}
              autoComplete="off"
              autoFocus
              onPressEnter={onOkCb}
            />
            {invalidPassword && (
              <Label color="error" textTransform="uppercase">
                {intl.formatMessage({ id: 'wallet.password.confirmation.error' })}!
              </Label>
            )}
          </Form.Item>
        </Form>
      </CStyled.Content>
    </Styled.Modal>
  )
}

/**
 * Wrapper around `PasswordModal` to validate password using `validatePassword$` stream
 */
export type Props = {
  onSuccess: FP.Lazy<void>
  onClose: FP.Lazy<void>
  validatePassword$: (_: string) => ValidatePasswordLD
}

export const WalletPasswordConfirmationModal: React.FC<Props> = ({ onSuccess, onClose, validatePassword$ }) => {
  const [passwordToValidate, setPasswordToValidate] = useState('')

  const passwordValidationResult$ = useMemo(
    () => validatePassword$(passwordToValidate),
    [passwordToValidate, validatePassword$]
  )

  const passwordValidationRD = useObservableState(passwordValidationResult$, RD.initial)

  const closePrivateModal = useCallback(() => {
    onClose()
    setPasswordToValidate('')
  }, [onClose, setPasswordToValidate])

  const onPasswordValidationSucceed = useCallback(() => {
    onSuccess()
  }, [onSuccess])

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

  return <PasswordModal {...confirmProps} />
}
