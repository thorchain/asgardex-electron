import React, { useCallback, useState, useEffect, useMemo } from 'react'

import { Form, Input, Button } from 'antd'
import { Rule } from 'antd/lib/form'
import { Store } from 'antd/lib/form/interface'
import Paragraph from 'antd/lib/typography/Paragraph'
import Text from 'antd/lib/typography/Text'
import * as O from 'fp-ts/lib/Option'
import { none, Option, some } from 'fp-ts/lib/Option'
import { useHistory, useLocation } from 'react-router-dom'

import { RedirectRouteState } from '../../routes/types'
import * as walletRoutes from '../../routes/wallet'
import { KeystoreState } from '../../services/wallet/types'
import { isLocked } from '../../services/wallet/util'

type Props = {
  keystore: KeystoreState
  unlockHandler?: (state: KeystoreState, password: string) => Promise<void>
}

const UnlockForm: React.FC<Props> = (props: Props): JSX.Element => {
  const { keystore, unlockHandler = () => Promise.resolve() } = props

  const history = useHistory()
  const location = useLocation<RedirectRouteState>()
  const [form] = Form.useForm()

  const [validPassword, setValidPassword] = useState(false)

  const [unlockError, setUnlockError] = useState<Option<Error>>(none)

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
    setValidPassword(true)
    return Promise.resolve()
  }

  const submitForm = useCallback(
    async ({ password }: Store) => {
      setUnlockError(none)
      await unlockHandler(keystore, password).catch((error) => {
        setUnlockError(some(error))
      })
    },
    [unlockHandler, keystore]
  )

  const onReset = useCallback(() => {
    form.resetFields()
  }, [form])

  const renderError = useMemo(
    () =>
      O.fold(
        () => <></>,

        (_: Error) => (
          <Paragraph>
            {/* TODO(@Veado): i18n */}Could not unlock the wallet. Please check you password and try it again
          </Paragraph>
        )
      )(unlockError),
    [unlockError]
  )

  return (
    <Form form={form} onFinish={submitForm}>
      <Form.Item
        name="password"
        rules={[{ required: true, validator: passwordValidator }]}
        validateTrigger={['onSubmit', 'onChange']}>
        <Input.Password placeholder="Enter your password" size="large" />
      </Form.Item>
      {renderError}
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
export default UnlockForm
