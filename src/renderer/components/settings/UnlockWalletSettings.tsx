import React from 'react'

import { Collapse } from 'antd'
import * as FP from 'fp-ts/lib/function'
import * as O from 'fp-ts/lib/Option'
import { useIntl } from 'react-intl'

import { KeystoreState } from '../../services/wallet/types'
import { FlatButton } from '../uielements/button'
import * as Styled from './Common.styles'

type Props = {
  keystore: KeystoreState
  unlockHandler: FP.Lazy<void>
  collapsed: boolean
  toggleCollapse: FP.Lazy<void>
}

export const UnlockWalletSettings: React.FC<Props> = (props): JSX.Element => {
  const { unlockHandler, keystore, collapsed, toggleCollapse } = props
  const intl = useIntl()

  return (
    <div className="mt-40px bg-bg0 py-10px px-40px dark:bg-bg0d">
      <Styled.Collapse
        expandIcon={({ isActive }) => <Styled.ExpandIcon rotate={isActive ? 90 : 0} />}
        activeKey={collapsed ? '0' : '1'}
        expandIconPosition="end"
        onChange={toggleCollapse}
        ghost>
        <Collapse.Panel
          header={<Styled.Title>{intl.formatMessage({ id: 'setting.wallet.title' })}</Styled.Title>}
          key={'1'}>
          <div
            className="
          border-1 mt-10px
          mb-20px
          flex min-h-[300px] items-center
          justify-center border-solid border-gray0 bg-bg1 dark:border-gray0d dark:bg-bg1d">
            <FlatButton className="min-w[200px] my-30px px-30px" onClick={unlockHandler}>
              {FP.pipe(
                keystore,
                O.fold(
                  () => intl.formatMessage({ id: 'wallet.imports.label' }),
                  // TODO (@veado) i18n - before 'wallet.unlock.label'
                  ({ name }) => `Unlock ${name}`
                )
              )}
            </FlatButton>
          </div>
        </Collapse.Panel>
      </Styled.Collapse>
    </div>
  )
}
