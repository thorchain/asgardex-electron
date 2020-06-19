import React, { useCallback, useMemo, useState, useEffect } from 'react'

import { Form, Input, Button } from 'antd'
import { Rule } from 'antd/lib/form'
import { Store } from 'antd/lib/form/interface'
import Text from 'antd/lib/typography/Text'
import * as E from 'fp-ts/lib/Either'
import { useObservableState } from 'observable-hooks'
import { useHistory, useLocation } from 'react-router-dom'

import { useWalletContext } from '../../contexts/WalletContext'
import { RedirectRouteState } from '../../routes/types'
import * as walletRoutes from '../../routes/wallet'

const LockView: React.FC = (): JSX.Element => {
  const history = useHistory()
  const location = useLocation<RedirectRouteState>()
  const [form] = Form.useForm()

  const { unlock, locked$ } = useWalletContext()

  const [validPassword, setValidPassword] = useState(false)
  const locked = useObservableState(locked$, E.right(true))

  // Re-direct to previous view after unlocking the wallet
  useEffect(() => {
    E.fold(
      (_) => {},
      (isLocked) => {
        console.log('xxx useEffect isLocked:', isLocked)
        if (!isLocked && !!validPassword) {
          const from = location.state?.from?.pathname ?? walletRoutes.assets.template
          history.push(from)
        }
      }
    )(locked)
  }, [locked, validPassword, location, history])

  const passwordValidator = async (_: Rule, value: string) => {
    if (!value) {
      setValidPassword(false)
      return Promise.reject('Value for password required')
    }
    if (value.length < 5) {
      setValidPassword(false)
      return Promise.reject('Password needs to have 5 character at least')
    }
    setValidPassword(true)
    return Promise.resolve()
  }

  const submitForm = useCallback(
    async ({ password }: Store) => {
      await unlock(password)
    },
    [unlock]
  )

  const onReset = () => {
    form.resetFields()
  }

  const renderLockedError = useMemo(() => {
    return E.fold(
      (error: Error) => <Text>Error while trying to unlock the wallet: {error.toString()}</Text>,
      (_) => <></>
    )(locked)
  }, [locked])

  return (
    <Form form={form} onFinish={submitForm}>
      <Form.Item
        name="password"
        rules={[{ required: true, validator: passwordValidator }]}
        validateTrigger={['onSubmit', 'onChange']}>
        <Input.Password placeholder="Enter your password" size="large" />
      </Form.Item>
      {renderLockedError}
      <Form.Item>
        <Button size="large" type="primary" htmlType="submit" disabled={!validPassword}>
          Unlock wallet
        </Button>
        <Button size="large" type="primary" onClick={onReset}>
          Reset
        </Button>
      </Form.Item>
      <Text>Unlock your Wallet</Text>
    </Form>
  )
}
export default LockView
