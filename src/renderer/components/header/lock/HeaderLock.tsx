import React, { useCallback, useMemo } from 'react'

import * as FP from 'fp-ts/lib/function'
import * as O from 'fp-ts/lib/Option'
import { useIntl } from 'react-intl'

import { truncateMiddle } from '../../../helpers/stringHelper'
import { KeystoreState } from '../../../services/wallet/types'
import * as WU from '../../../services/wallet/util'
import { Tooltip } from '../../uielements/common/Common.styles'
import { HeaderIconWrapper } from '../HeaderIcon.styles'
import * as Styled from './HeaderLock.styles'

export type Props = {
  keystoreState: KeystoreState
  onPress?: FP.Lazy<void>
  isDesktopView: boolean
}

export const HeaderLock: React.FC<Props> = (props): JSX.Element => {
  const { keystoreState, onPress = FP.constVoid, isDesktopView } = props

  const intl = useIntl()

  const isLocked = useMemo(() => WU.isLocked(keystoreState), [keystoreState])

  const clickHandler = useCallback((_: React.MouseEvent) => onPress(), [onPress])

  const desktopView = useMemo(
    () => (
      <div
        className="relative flex h-[70px] cursor-pointer items-center justify-center pl-[10px]"
        onClick={clickHandler}>
        <div className="">{isLocked ? <Styled.LockIcon /> : <Styled.UnlockIcon />}</div>
        {FP.pipe(
          keystoreState,
          WU.getWalletName,
          O.fold(
            () => <></>,
            (name) => (
              <Tooltip title={name}>
                <p
                  className="dark:text2d absolute -bottom-[6px] whitespace-nowrap
                rounded-full bg-gray0 px-[8px] py-[3px]
                font-main text-[9px] leading-none
                text-text2 dark:bg-gray0d
                dark:text-text2d
                ">
                  {truncateMiddle(name, { start: 3, end: 3, max: 11 })}
                </p>
              </Tooltip>
            )
          )
        )}
      </div>
    ),
    [clickHandler, isLocked, keystoreState]
  )

  const mobileView = useMemo(() => {
    const notImported = !WU.hasImportedKeystore(keystoreState)
    const label = intl.formatMessage({
      id: notImported ? 'wallet.add.label' : isLocked ? 'wallet.unlock.label' : 'wallet.lock.label'
    })

    return (
      <HeaderIconWrapper onClick={clickHandler}>
        <Styled.Label>{label}</Styled.Label>
        {isLocked ? <Styled.LockIcon /> : <Styled.UnlockIcon />}
      </HeaderIconWrapper>
    )
  }, [clickHandler, intl, isLocked, keystoreState])

  return isDesktopView ? desktopView : mobileView
}
