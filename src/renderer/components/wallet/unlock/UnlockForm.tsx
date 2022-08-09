import React, { useCallback, useState, useEffect, useMemo } from 'react'

import * as FP from 'fp-ts/function'
import * as O from 'fp-ts/lib/Option'
import { useForm } from 'react-hook-form'
import { useIntl } from 'react-intl'
import { useLocation, useNavigate, useParams } from 'react-router-dom'

import { emptyString } from '../../../helpers/stringHelper'
import { getUrlSearchParam } from '../../../helpers/url.helper'
import * as appRoutes from '../../../routes/app'
import { ReferrerState } from '../../../routes/types'
import * as walletRoutes from '../../../routes/wallet'
import { KeystoreState, RemoveAccountHandler } from '../../../services/wallet/types'
import { isLocked, getWalletName } from '../../../services/wallet/util'
import { RemoveWalletConfirmationModal } from '../../modal/confirmation/RemoveWalletConfirmationModal'
import { BackLink } from '../../uielements/backLink'
import { BorderButton, FlatButton } from '../../uielements/button'
import { InputPasswordTW } from '../../uielements/input'

type FormData = {
  password: string
}

export type Props = {
  keystore: KeystoreState
  unlock: (password: string) => Promise<void>
  removeKeystore: RemoveAccountHandler
}

export const UnlockForm: React.FC<Props> = (props): JSX.Element => {
  const { keystore, unlock, removeKeystore } = props

  const [showRemoveModal, setShowRemoveModal] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()
  const params = useParams()
  const intl = useIntl()
  const {
    register,
    formState: { errors },
    handleSubmit
  } = useForm<FormData>()

  const [validPassword, setValidPassword] = useState(false)
  const [unlocking, setUnlocking] = useState(false)

  const [unlockError, setUnlockError] = useState<O.Option<Error>>(O.none)

  /**
   * Helper to auto-unlock wallet in development mode while hot-relaoding the app
   * Wallet has to be imported and `REACT_APP_WALLET_PASSWORD` has to be set as env before
   */
  // useEffect(() => {
  //   if ($IS_DEV) {
  //     const checkPassword = async () => {
  //       const password = envOrDefault(process.env.REACT_APP_WALLET_PASSWORD, '')
  //       if (password && keystore && hasImportedKeystore(keystore) && isLocked(keystore)) {
  //         setUnlocking(true)
  //         await unlockHandler(password).catch((error) => {
  //           setUnlockError(O.some(error))
  //         })
  //         setUnlocking(false)
  //         setValidPassword(true)
  //       }
  //     }
  //     checkPassword()
  //   }
  // }, [keystore, unlockHandler])

  // Re-direct to previous view after unlocking the wallet
  useEffect(() => {
    if (!isLocked(keystore) && validPassword) {
      FP.pipe(
        getUrlSearchParam(location.search, walletRoutes.REDIRECT_PARAMETER_NAME),
        O.alt(() => O.some((location.state as ReferrerState)?.referrer || walletRoutes.assets.template)),
        O.map((path) => navigate(path))
      )
    }
  }, [keystore, location, navigate, params, validPassword])

  const submitForm = useCallback(
    async ({ password }: FormData) => {
      setUnlockError(O.none)
      setUnlocking(true)
      await unlock(password).catch((error) => {
        setUnlockError(O.some(error))
        setValidPassword(false)
      })
      setUnlocking(false)
      setValidPassword(true)
    },
    [unlock]
  )

  const showRemoveConfirm = useCallback(() => {
    setShowRemoveModal(true)
  }, [])

  const hideRemoveConfirm = useCallback(() => {
    setShowRemoveModal(false)
  }, [])

  const renderUnlockError = useMemo(
    () =>
      O.fold(
        () => <></>,
        (_: Error) => (
          <p className="mt-2 font-main text-sm text-error0">{intl.formatMessage({ id: 'wallet.unlock.error' })}</p>
        )
      )(unlockError),
    [unlockError, intl]
  )

  const removeConfirmed = useCallback(async () => {
    const noAccounts = await removeKeystore()
    if (noAccounts >= 1) {
      // unlock screen to unlock another account
      navigate(walletRoutes.locked.path())
    } else {
      // no account -> go to homepage
      navigate(appRoutes.base.template)
    }
  }, [navigate, removeKeystore])

  const walletName = useMemo(
    () =>
      FP.pipe(
        keystore,
        getWalletName,
        O.getOrElse(() => emptyString)
      ),
    [keystore]
  )

  return (
    <>
      <div className="relative flex justify-center">
        <BackLink className="absolute, top-0, left-0" />
        <h1
          className="mb-30px
          inline-block
          w-full
          text-center font-mainSemiBold uppercase text-text1 dark:text-text1d">
          {intl.formatMessage(
            { id: 'wallet.unlock.title' },
            {
              name: walletName
            }
          )}
        </h1>
      </div>
      <form className="flex flex-1 flex-col" onSubmit={handleSubmit(submitForm)}>
        <div
          className="
        flex h-full
        flex-col items-center justify-between bg-bg1 pt-[45px]
        pr-30px pb-[35px] pl-30px dark:bg-bg1d sm:pt-[90px] sm:pr-[60px] sm:pb-[70px] sm:pl-[60px]">
          <div className="w-full">
            <h2 className="mb-30px w-full text-center font-mainSemiBold uppercase text-text1 dark:text-text1d">
              {intl.formatMessage({ id: 'wallet.unlock.password' })}
            </h2>
            <InputPasswordTW
              id="password"
              className="my-0 mx-auto mb-20px w-full max-w-[400px]"
              {...register('password', { required: true })}
              placeholder={intl.formatMessage({ id: 'common.password' }).toUpperCase()}
              size={'normal'}
              autoFocus={true}
              error={errors.password ? intl.formatMessage({ id: 'wallet.password.empty' }) : ''}
              disabled={unlocking}
            />
          </div>
          {renderUnlockError}
          <div className="flex w-full flex-col justify-between sm:flex-row">
            <BorderButton
              className="mb-20px w-full min-w-[200px] sm:mb-0 sm:w-auto sm:max-w-[200px]"
              size="normal"
              color="error"
              onClick={showRemoveConfirm}
              disabled={unlocking}>
              {intl.formatMessage({ id: 'wallet.remove.label' })}
            </BorderButton>
            <FlatButton
              type="submit"
              className="mb-0 w-full min-w-[200px] sm:mb-0 sm:w-auto sm:max-w-[200px]"
              size="normal"
              color="primary"
              disabled={unlocking}
              loading={unlocking}>
              {intl.formatMessage({ id: 'wallet.action.unlock' })}
            </FlatButton>
          </div>
        </div>
      </form>
      <RemoveWalletConfirmationModal
        visible={showRemoveModal}
        onClose={hideRemoveConfirm}
        onSuccess={removeConfirmed}
        walletName={walletName}
      />
    </>
  )
}
