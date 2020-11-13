import React, { useCallback, useEffect, useState } from 'react'

import { LockOutlined } from '@ant-design/icons'
import { Form } from 'antd'

import { Input } from '../../uielements/input'
import { StyledModal } from './PrivateModal.style'

type Props = {
  visible: boolean
  invalidPassword?: boolean
  validatingPassword?: boolean
  password?: string
  onConfirm?: (password: string) => void
  onOk?: () => void
  onCancel?: () => void
  isSuccess?: boolean
}

export const PrivateModal: React.FC<Props> = (props): JSX.Element => {
  const { visible, invalidPassword, validatingPassword, onConfirm, onOk, onCancel, isSuccess } = props

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

  const onConfirmP = useCallback(() => {
    onConfirm && onConfirm(password)
  }, [onConfirm, password])
  return (
    <StyledModal
      title="PASSWORD CONFIRMATION"
      visible={visible}
      onOk={!validatingPassword ? onConfirmP : undefined}
      onCancel={onCancel}
      maskClosable={false}
      closable={false}
      okText="CONFIRM"
      cancelText="CANCEL">
      <Form autoComplete="off">
        <Form.Item
          className={invalidPassword ? 'has-error' : ''}
          extra={validatingPassword ? 'Validating password ...' : ''}>
          <Input
            type="password"
            typevalue="ghost"
            size="large"
            value={password}
            onChange={onChangePasswordHandler}
            prefix={<LockOutlined />}
            autoComplete="off"
          />
          {invalidPassword && <div className="ant-form-explain">Password is wrong!</div>}
        </Form.Item>
      </Form>
    </StyledModal>
  )
}
