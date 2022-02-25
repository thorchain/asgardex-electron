import { AssetRuneNative } from '@xchainjs/xchain-util'
import * as A from 'antd'
import styled from 'styled-components'
import { palette } from 'styled-theme'

import { media } from '../../../../helpers/styleHelper'
import { AssetIcon as UIAssetIcon } from '../../../uielements/assets/assetIcon'
import { WalletTypeLabel as WalletTypeLabelUI } from '../../../uielements/common/Common.styles'
import { Label as UILabel } from '../../../uielements/label'

export const Container = styled('div')`
  min-height: 100%;
  width: 100%;
  display: flex;
  flex-direction: column;
  padding: 10px;

  ${media.sm`
    padding: 35px 50px 150px 50px;
  `}
`

export const Header = styled('div')`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  margin-bottom: 20px;

  ${media.sm`
    justify-content: flex-start;
    flex-direction: row;
    margin-bottom: 50px;
  `}
`

export const AssetIcon = styled(UIAssetIcon).attrs({ asset: AssetRuneNative, size: 'large' })`
  margin-bottom: 10px;
  ${media.sm`
    margin: 0 25px 0 0;
  `}
`

export const HeaderTitleWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 10px;

  ${media.sm`
    justify-content: start;
  `}
`

export const HeaderTitle = styled(UILabel)`
  text-transform: uppercase;
  font-size: 24px;
  font-family: 'MainFontRegular';
  color: ${palette('text', 0)};
  padding: 0;
  line-height: 1em;
  text-align: center;
  width: auto;

  ${media.sm`
    font-size: 36px;
    text-align: left;
  `}
`

export const HeaderSubtitle = styled(UILabel)`
  font-size: 16px;
  text-transform: uppercase;
  color: ${palette('text', 2)};
  padding: 0;
  line-height: 1em;
  text-align: center;

  ${media.sm`
    font-size: 19px;
    text-align: left;
  `}
`

export const WalletTypeLabel = styled(WalletTypeLabelUI)`
  margin-left: 10px;
`

export const FormWrapper = styled('div')`
  display: flex;
  flex-direction: column;
  flex-grow: 1;
`

export const FormTitle = styled(UILabel)`
  text-transform: uppercase;
  font-size: 16px;
  padding: 0;
  margin-bottom: 5px;
`

export const Tabs = styled(A.Tabs)`
  ${media.sm`
    flex-grow: 1;

    & .ant-tabs-content-holder {
      display: flex;
    }
  `}
`

export const TabButtonsContainer = styled('div')`
  display: flex;
  flex-direction: row;
  margin-bottom: 15px;
`

export const TabLabel = styled('span')<{ isActive?: boolean }>`
  ${({ isActive }) => (isActive ? 'font-weight: bold; text-decoration: underline' : '')};
`

export const UnbondLabel = styled(TabLabel)`
  color: ${palette('warning', 0)};
`

export const LeaveLabel = styled(TabLabel)`
  color: ${palette('error', 0)};
`

export const TabButton = styled('button')`
  outline: none;
  padding: 0 10px;
  border: 0;
  background: none;
  cursor: pointer;
  text-transform: uppercase;
  margin-right: 5px;
  color: ${palette('primary', 0)};
  font-size: 16px;

  &:first-child {
    padding-left: 0;
  }

  &:last-child {
    padding-right: 0;
    margin: 0;
  }
`

export const TabPane = styled(A.Tabs.TabPane)``
