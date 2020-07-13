import React, { useCallback, useState, useEffect, useMemo } from 'react'

import { Form, Button, Modal } from 'antd'
import { Rule } from 'antd/lib/form'
import { Store } from 'antd/lib/form/interface'
import Paragraph from 'antd/lib/typography/Paragraph'
import Text from 'antd/lib/typography/Text'
import * as O from 'fp-ts/lib/Option'
import { none, Option, some } from 'fp-ts/lib/Option'
import { useIntl } from 'react-intl'
import { useHistory, useLocation } from 'react-router-dom'

import { InputPassword } from '../../components/uielements/input'
import { IS_PRODUCTION } from '../../const'
import { useWalletContext } from '../../contexts/WalletContext'
import { envOrDefault } from '../../helpers/envHelper'
import { RedirectRouteState } from '../../routes/types'
import * as walletRoutes from '../../routes/wallet'
import { KeystoreState } from '../../services/wallet/types'
import { isLocked, hasImportedKeystore } from '../../services/wallet/util'

type Props = {
  keystore: KeystoreState
  unlockHandler?: (state: KeystoreState, password: string) => Promise<void>
}

const UnlockForm: React.FC<Props> = (props: Props): JSX.Element => {
  const { keystore, unlockHandler = () => Promise.resolve() } = props

  const [showRemoveModal, setShowRemoveModal] = useState(false)
  const history = useHistory()
  const location = useLocation<RedirectRouteState>()
  const intl = useIntl()
  const { keystoreService } = useWalletContext()
  const { removeKeystore } = keystoreService
  const [form] = Form.useForm()

  const [validPassword, setValidPassword] = useState(false)

  const [unlockError, setUnlockError] = useState<Option<Error>>(none)

  /**
   * Helper to auto-unlock wallet in development mode while hot-relaoding the app
   * Wallet has to be imported and `REACT_APP_WALLET_PASSWORD` has to be set as env before
   */
  useEffect(() => {
    if (!IS_PRODUCTION) {
      const checkPassword = async () => {
        const password = envOrDefault(process.env.REACT_APP_WALLET_PASSWORD, '')
        if (password && keystore && hasImportedKeystore(keystore) && isLocked(keystore)) {
          await unlockHandler(keystore, password).catch((error) => {
            setUnlockError(some(error))
          })
          setValidPassword(true)
        }
      }
      checkPassword()
    }
  }, [keystore, unlockHandler])

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

  const showRemoveConfirm = useCallback(() => {
    setShowRemoveModal(true)
  }, [])

  const hideRemoveConfirm = useCallback(() => {
    setShowRemoveModal(false)
  }, [])

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
      <Modal visible={showRemoveModal} onCancel={hideRemoveConfirm} onOk={removeKeystore}>
        {intl.formatMessage({ id: 'wallet.action.remove' })}
      </Modal>
      <Form.Item
        name="password"
        rules={[{ required: true, validator: passwordValidator }]}
        validateTrigger={['onSubmit', 'onChange']}>
        <InputPassword placeholder="Enter your password" size="large" />
      </Form.Item>
      {renderError}
      <Form.Item>
        <Button size="large" type="primary" block htmlType="submit" disabled={!validPassword}>
          Unlock wallet
        </Button>
        <Button size="large" type="primary" block onClick={onReset}>
          Reset
        </Button>
        <Button size="large" type="primary" block onClick={showRemoveConfirm}>
          {intl.formatMessage({ id: 'common.remove' })}
        </Button>
      </Form.Item>
      <Text>Unlock your Wallet</Text>
    </Form>
  )
}
export default UnlockForm
