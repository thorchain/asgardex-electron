import React, { useCallback, useState, useEffect } from 'react'

import { Form, Input, Button } from 'antd'
import { Rule } from 'antd/lib/form'
import { Store } from 'antd/lib/form/interface'
import Text from 'antd/lib/typography/Text'
import { none } from 'fp-ts/lib/Option'
import { useObservableState } from 'observable-hooks'
import { useHistory, useLocation } from 'react-router-dom'

import { useWalletContext } from '../../contexts/WalletContext'
import { RedirectRouteState } from '../../routes/types'
import * as walletRoutes from '../../routes/wallet'
import { isLocked } from '../../services/wallet/util'

const UnlockView: React.FC = (): JSX.Element => {
  const history = useHistory()
  const location = useLocation<RedirectRouteState>()
  const [form] = Form.useForm()

  const { keystoreService } = useWalletContext()

  const [validPassword, setValidPassword] = useState(false)
  const keystore = useObservableState(keystoreService.keystore$, none)
  const [isLockedError, setIsLockedError] = useState(false)

  // Re-direct to previous view after unlocking the wallet
  useEffect(() => {
    if (!isLocked(keystore) && !!validPassword) {
      const from = location.state?.from?.pathname ?? walletRoutes.assets.template
      history.push(from)
    }
  }, [keystore, validPassword, location, history])

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
      setIsLockedError(false)
      try {
        await keystoreService.unlock(keystore, password)
      } catch (error) {
        setIsLockedError(true)
      }
    },
    [keystoreService, keystore]
  )

  const onReset = () => {
    form.resetFields()
  }

  return (
    <Form form={form} onFinish={submitForm}>
      <Form.Item
        name="password"
        rules={[{ required: true, validator: passwordValidator }]}
        validateTrigger={['onSubmit', 'onChange']}>
        <Input.Password placeholder="Enter your password" size="large" />
      </Form.Item>
      {isLockedError && <Text>Error while trying to unlock the wallet. Check your password and try it again.</Text>}
      <Form.Item>
        <Button size="large" type="primary" block htmlType="submit" disabled={!validPassword}>
          Unlock wallet
        </Button>
        <Button size="large" type="primary" block onClick={onReset}>
          Reset
        </Button>
      </Form.Item>
      <Text>Unlock your Wallet</Text>
    </Form>
  )
}
export default UnlockView
