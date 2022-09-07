import React, { useMemo } from 'react'

import * as FP from 'fp-ts/lib/function'
import { useIntl } from 'react-intl'

import { KeystoreState } from '../../../services/wallet/types'
import * as WU from '../../../services/wallet/util'
import { LockIcon, UnlockIcon } from '../../icons'
import { HeaderIconWrapper } from '../HeaderIcon.styles'
import * as Styled from './HeaderLock.styles'

export type Props = {
  keystoreState: KeystoreState
  onPress: FP.Lazy<void>
}

export const HeaderLockMobile: React.FC<Props> = (props): JSX.Element => {
  const { keystoreState, onPress } = props

  const intl = useIntl()

  const isLocked = useMemo(() => WU.isLocked(keystoreState), [keystoreState])

  const label = useMemo(() => {
    const notImported = !WU.hasImportedKeystore(keystoreState)
    return intl.formatMessage({
      id: notImported ? 'wallet.add.label' : isLocked ? 'wallet.unlock.label' : 'wallet.lock.label'
    })
  }, [intl, isLocked, keystoreState])

  return (
    <HeaderIconWrapper onClick={() => onPress()}>
      <Styled.Label>{label}</Styled.Label>
      {isLocked ? <LockIcon className="h-[28px] w-[28px]" /> : <UnlockIcon className="h-[28px] w-[28px]" />}
    </HeaderIconWrapper>
  )
}
