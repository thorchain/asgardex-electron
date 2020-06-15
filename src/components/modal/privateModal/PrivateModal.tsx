import React, { useCallback } from 'react'

import { LockOutlined } from '@ant-design/icons'
import { Form } from 'antd'

import Input from '../../uielements/input'
import { StyledModal } from './PrivateModal.style'

type Props = {
  visible: boolean
  invalidPassword: boolean
  validatingPassword: boolean
  password: string
  onChangePassword?: (password: string) => void
  onOk?: () => void
  onCancel?: () => void
}

const PrivateModal: React.FC<Props> = (props): JSX.Element => {
  const { visible, invalidPassword, validatingPassword, password, onChangePassword, onOk, onCancel } = props

  const onChangePasswordHandler = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (onChangePassword) {
        onChangePassword(e.target.value)
      }
    },
    [onChangePassword]
  )

  return (
    <StyledModal
      title="PASSWORD CONFIRMATION"
      visible={visible}
      onOk={!validatingPassword ? onOk : undefined}
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
            sizevalue="big"
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

export default PrivateModal
