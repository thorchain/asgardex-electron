import React, { useCallback, useMemo } from 'react'

import * as FP from 'fp-ts/lib/function'
import { useIntl } from 'react-intl'

import { KeystoreState } from '../../../services/wallet/types'
import * as WU from '../../../services/wallet/util'
import { HeaderIconWrapper } from '../HeaderIcon.styles'
import * as Styled from './HeaderLock.styles'

export type Props = {
  keystore: KeystoreState
  onPress?: FP.Lazy<void>
  isDesktopView: boolean
  disabled?: boolean
}

export const HeaderLock: React.FC<Props> = (props): JSX.Element => {
  const { keystore, onPress = FP.constVoid, isDesktopView, disabled = false } = props

  const intl = useIntl()

  const isLocked = useMemo(() => WU.isLocked(keystore), [keystore])

  const clickHandler = useCallback((_: React.MouseEvent) => onPress(), [onPress])

  const desktopView = useMemo(() => (isLocked ? <Styled.LockIcon /> : <Styled.UnlockIcon />), [isLocked])

  const mobileView = useMemo(() => {
    const notImported = !WU.hasImportedKeystore(keystore)
    const label = intl.formatMessage({
      id: notImported ? 'wallet.imports.label' : isLocked ? 'wallet.unlock.label' : 'wallet.lock.label'
    })

    return (
      <>
        <Styled.Label>{label}</Styled.Label>
        {isLocked ? <Styled.LockIcon /> : <Styled.UnlockIcon />}
      </>
    )
  }, [intl, isLocked, keystore])

  return (
    <HeaderIconWrapper onClick={clickHandler} disabled={disabled}>
      <div>{JSON.stringify(keystore)}</div>
      <div>{isLocked}</div>
      {isDesktopView ? desktopView : mobileView}
    </HeaderIconWrapper>
  )
}
