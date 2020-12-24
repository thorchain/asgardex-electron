import React, { useCallback, useEffect, useState } from 'react'

import { Form } from 'antd'
import { useIntl } from 'react-intl'

import { Input } from '../../uielements/input'
import { Label } from '../../uielements/label'
import * as Styled from './PrivateModal.style'

type Props = {
  visible: boolean
  invalidPassword?: boolean
  validatingPassword?: boolean
  onConfirm?: (password: string) => void
  onOk?: () => void
  onCancel?: () => void
  isSuccess?: boolean
}

export const PrivateModal: React.FC<Props> = (props): JSX.Element => {
  const { visible, invalidPassword, validatingPassword, onConfirm, onOk, onCancel, isSuccess } = props
  const intl = useIntl()

  /**
   * Call onOk on success only
   */
  useEffect(() => {
    if (isSuccess && onOk) {
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
    onConfirm && onConfirm(password)
  }, [onConfirm, password])
  return (
    <Styled.Modal
      title={intl.formatMessage({ id: 'wallet.password.confirmation' })}
      visible={visible}
      onOk={!validatingPassword ? onConfirmCb : undefined}
      onCancel={onCancel}
      maskClosable={false}
      closable={false}
      okText={intl.formatMessage({ id: 'common.confirm' })}
      cancelText={intl.formatMessage({ id: 'common.cancel' })}>
      <Form autoComplete="off">
        <Form.Item
          className={invalidPassword ? 'has-error' : ''}
          extra={validatingPassword ? `${intl.formatMessage({ id: 'wallet.password.confirmation.pending' })}...` : ''}>
          <Input
            type="password"
            typevalue="normal"
            size="large"
            value={password}
            onChange={onChangePasswordHandler}
            prefix={<Styled.LockOutlined />}
            autoComplete="off"
          />
          {invalidPassword && (
            <Label color="error" textTransform="uppercase">
              {intl.formatMessage({ id: 'wallet.password.confirmation.error' })}!
            </Label>
          )}
        </Form.Item>
      </Form>
    </Styled.Modal>
  )
}
