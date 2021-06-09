import React, { useMemo, useCallback } from 'react'

import { Dropdown } from 'antd'
import { MenuProps } from 'antd/lib/menu'
import * as FP from 'fp-ts/function'
import { useIntl } from 'react-intl'

import { Network } from '../../../../shared/api/types'
import { ReactComponent as DownIcon } from '../../../assets/svg/icon-down.svg'
import { AVAILABLE_NETWORKS } from '../../../services/const'
import { Menu } from '../../shared/menu'
import {
  HeaderDropdownWrapper,
  HeaderDropdownMenuItem,
  HeaderDropdownContentWrapper,
  HeaderDropdownMenuItemText,
  HeaderDropdownTitle
} from '../HeaderMenu.style'
import * as Styled from './HeaderNetworkSelector.styles'

type Props = {
  isDesktopView: boolean
  selectedNetwork: Network
  changeNetwork: (network: Network) => void
}

export const HeaderNetworkSelector: React.FC<Props> = ({
  isDesktopView,
  changeNetwork = FP.constVoid,
  selectedNetwork
}) => {
  const intl = useIntl()

  const changeNetworkHandler: MenuProps['onClick'] = useCallback(
    (param) => {
      const asset = param.key as Network
      changeNetwork(asset)
    },
    [changeNetwork]
  )

  // TODO asgdx-team: Remove `networkLabel` if we go live with mainnet
  const networkLabel = (network: Network) => (network === 'mainnet' ? 'chaosnet' : 'testnet')

  const menu = useMemo(
    () => (
      <Menu onClick={changeNetworkHandler}>
        {AVAILABLE_NETWORKS.map((network: Network) => {
          return (
            <HeaderDropdownMenuItem key={network}>
              <HeaderDropdownMenuItemText>
                {/* TODO asgdx-team: Revert it back to `network` if we go live with mainnet */}
                <Styled.NetworkLabel network={networkLabel(network)} />
              </HeaderDropdownMenuItemText>
            </HeaderDropdownMenuItem>
          )
        })}
      </Menu>
    ),
    [changeNetworkHandler]
  )

  return (
    <HeaderDropdownWrapper>
      <Dropdown overlay={menu} trigger={['click']} placement="bottomCenter">
        <HeaderDropdownContentWrapper>
          {!isDesktopView && <HeaderDropdownTitle>{intl.formatMessage({ id: 'common.network' })}</HeaderDropdownTitle>}
          <Styled.Row>
            <HeaderDropdownMenuItemText>
              {/* TODO asgdx-team: Revert it back to `network` if we go live with mainnet */}
              <Styled.NetworkLabel network={networkLabel(selectedNetwork)} />
            </HeaderDropdownMenuItemText>
            <DownIcon />
          </Styled.Row>
        </HeaderDropdownContentWrapper>
      </Dropdown>
    </HeaderDropdownWrapper>
  )
}
