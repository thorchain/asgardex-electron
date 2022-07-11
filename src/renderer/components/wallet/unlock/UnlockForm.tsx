import React, { useCallback, useState, useEffect, useMemo } from 'react'

import Form, { Rule } from 'antd/lib/form'
import * as FP from 'fp-ts/function'
import * as O from 'fp-ts/lib/Option'
import { none, Option, some } from 'fp-ts/lib/Option'
import { useIntl } from 'react-intl'
import { useLocation, useNavigate, useParams } from 'react-router-dom'

import { envOrDefault } from '../../../../shared/utils/env'
import { getUrlSearchParam } from '../../../helpers/url.helper'
import * as appRoutes from '../../../routes/app'
import { ReferrerState } from '../../../routes/types'
import * as walletRoutes from '../../../routes/wallet'
import { KeystoreState } from '../../../services/wallet/types'
import { isLocked, hasImportedKeystore } from '../../../services/wallet/util'
import { RemoveWalletConfirmationModal } from '../../modal/confirmation/RemoveWalletConfirmationModal'
import { BackLink } from '../../uielements/backLink'
import { InputPassword } from '../../uielements/input'
import * as Styled from './UnlockForm.styles'

type FormValues = {
  password: string
}

type Props = {
  keystore: KeystoreState
  unlock?: (state: KeystoreState, password: string) => Promise<void>
  removeKeystore?: () => Promise<void>
}

export const UnlockForm: React.FC<Props> = (props): JSX.Element => {
  const { keystore, unlock: unlockHandler = () => Promise.resolve(), removeKeystore = () => Promise.resolve() } = props

  const [showRemoveModal, setShowRemoveModal] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()
  const params = useParams()
  const intl = useIntl()
  const [form] = Form.useForm<FormValues>()

  const [validPassword, setValidPassword] = useState(false)

  const [unlockError, setUnlockError] = useState<Option<Error>>(none)

  /**
   * Helper to auto-unlock wallet in development mode while hot-relaoding the app
   * Wallet has to be imported and `REACT_APP_WALLET_PASSWORD` has to be set as env before
   */
  useEffect(() => {
    if ($IS_DEV) {
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
      FP.pipe(
        getUrlSearchParam(location.search, walletRoutes.REDIRECT_PARAMETER_NAME),
        O.alt(() => O.some((location.state as ReferrerState)?.referrer || walletRoutes.assets.template)),
        O.map((path) => navigate(path))
      )
    }
  }, [keystore, validPassword, location, navigate, params])

  const passwordValidator = async (_: Rule, value: string) => {
    if (!value) {
      setValidPassword(false)
      return Promise.reject('Value for password required')
    }
    setValidPassword(true)
    return Promise.resolve()
  }

  const submitForm = useCallback(
    async ({ password }: FormValues) => {
      setUnlockError(none)
      await unlockHandler(keystore, password).catch((error) => {
        setUnlockError(some(error))
      })
    },
    [unlockHandler, keystore]
  )

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

        (_: Error) => <Styled.Text>{intl.formatMessage({ id: 'wallet.unlock.error' })}</Styled.Text>
      )(unlockError),
    [unlockError, intl]
  )

  const onOkHandlder = useCallback(async () => {
    await removeKeystore()
    navigate(appRoutes.base.template)
  }, [navigate, removeKeystore])

  return (
    <>
      <RemoveWalletConfirmationModal visible={showRemoveModal} onClose={hideRemoveConfirm} onSuccess={onOkHandlder} />
      <Styled.Header>
        <BackLink style={{ position: 'absolute', top: 0, left: 0 }} />
        <Styled.Text>{intl.formatMessage({ id: 'wallet.unlock.title' })}</Styled.Text>
      </Styled.Header>
      <Styled.Form form={form} onFinish={submitForm}>
        <Styled.Content>
          <div style={{ width: '100%' }}>
            <Styled.Text>{intl.formatMessage({ id: 'wallet.unlock.password' })}</Styled.Text>
            <Styled.PasswordInput
              name="password"
              rules={[{ required: true, validator: passwordValidator }]}
              validateTrigger={['onSubmit', 'onChange']}>
              <InputPassword
                placeholder={intl.formatMessage({ id: 'common.password' }).toUpperCase()}
                size="large"
                autoFocus
              />
            </Styled.PasswordInput>
          </div>
          {renderError}
          <Styled.FormItem>
            <Styled.Actions>
              <Styled.Button
                sizevalue="xnormal"
                color="error"
                typevalue="outline"
                round="true"
                onClick={showRemoveConfirm}>
                {intl.formatMessage({ id: 'wallet.remove.label' })}
              </Styled.Button>
              <Styled.Button
                sizevalue="xnormal"
                round="true"
                size="large"
                type="primary"
                block
                htmlType="submit"
                disabled={!validPassword}>
                {intl.formatMessage({ id: 'wallet.action.unlock' })}
              </Styled.Button>
            </Styled.Actions>
          </Styled.FormItem>
        </Styled.Content>
      </Styled.Form>
    </>
  )
}
