import { AssetRuneNative } from '@xchainjs/xchain-util'
import * as A from 'antd'
import styled from 'styled-components'
import { palette } from 'styled-theme'

import { media } from '../../../../helpers/styleHelper'
import { InnerForm } from '../../../shared/form'
import { AssetIcon as UIAssetIcon } from '../../../uielements/assets/assetIcon'
import { Button as UIButton } from '../../../uielements/button'
import { WalletTypeLabel as WalletTypeLabelUI } from '../../../uielements/common/Common.styles'
import { Fees as UIFees } from '../../../uielements/fees'
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
  font-family: ${({ isActive }) => (isActive ? 'MainFontBold' : 'MainFontRegular')};
  font-weight: ${({ isActive }) => (isActive ? 'bold' : 'normal')};
  text-decoration: ${({ isActive }) => (isActive ? 'underline' : '')};
  color: ${({ isActive }) => (isActive ? palette('primary', 0) : palette('text', 0))};
`

export const TabButton = styled('button')`
  outline: none;
  padding: 0 10px;
  border: 0;
  background: none;
  cursor: pointer;
  text-transform: uppercase;
  margin-right: 5px;
  color: ${palette('text', 0)};
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

export const Form = styled(InnerForm)`
  display: flex;
  height: 100%;
  justify-content: space-between;
  flex-direction: column;
`

export const FormItem = styled(A.Form.Item)`
  margin-bottom: 5px;
`

export const SubmitButtonContainer = styled(A.Form.Item).attrs({
  shouldUpdate: true
})`
  width: 100%;
  margin-top: 30px;

  & .ant-form-item-control-input-content {
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  ${media.sm`
    width: auto;
    margin-top: 0px;
    align-self: flex-end;

    & .ant-form-item-control-input-content {
      align-items: flex-end;
    }
  `}
`

export const SubmitButton = styled(UIButton).attrs({
  color: 'primary',
  round: 'true',
  sizevalue: 'xnormal'
})`
  width: auto;

  ${media.sm`
    width: auto;
  `}
`

export const InputContainer = styled('div')`
  ${media.sm`
    max-width: 630px;
  `}
`

export const InputLabel = styled(UILabel)`
  padding: 0;
  font-size: 16px;
  text-transform: uppercase;
  color: ${palette('gray', 2)};
`

export const Fees = styled(UIFees)`
  padding-bottom: 20px;
`
