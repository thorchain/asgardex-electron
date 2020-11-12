import React, { useCallback, useState } from 'react'

import { LockOutlined } from '@ant-design/icons'
import { Form } from 'antd'

import { Input } from '../../uielements/input'
import { StyledModal } from './PrivateModal.style'

type Props = {
  visible: boolean
  invalidPassword?: boolean
  validatingPassword?: boolean
  password?: string
  onChangePassword?: (password: string) => void
  onOk?: () => void
  onCancel?: () => void
  targetPassword?: string
  onSuccess?: () => void
}

export const PrivateModal: React.FC<Props> = (props): JSX.Element => {
  const {
    visible,
    invalidPassword,
    validatingPassword,
    // password,
    onChangePassword,
    onOk,
    onCancel,
    targetPassword = ''
  } = props

  const [password, setPassword] = useState('')

  const onChangePasswordHandler = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setPassword(e.target.value)
    },
    [onChangePassword]
  )

  const onConfirm = useCallback(() => {
    console.log('confirm --- ', password)
    onChangePassword && onChangePassword(password)
  }, [onChangePassword, password])
  return (
    <StyledModal
      title="PASSWORD CONFIRMATION"
      visible={visible}
      onOk={!validatingPassword ? onConfirm : undefined}
      onCancel={onCancel}
      maskClosable={false}
      closable={false}
      okText="CONFIRM"
      cancelText="CANCEL">
      <Form onFinish={onOk} autoComplete="off">
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
