import { CaretRightOutlined } from '@ant-design/icons'
import * as A from 'antd'
import Text from 'antd/lib/typography/Text'
import styled from 'styled-components'
import { palette } from 'styled-theme'

import { Network } from '../../../shared/api/types'
import { Menu } from '../shared/menu'
import { Button as UIButton } from '../uielements/button'
import { ExternalLinkIcon as ExternalLinkIconUI } from '../uielements/common/Common.styles'
import { Label as UILabel } from '../uielements/label'

export const Container = styled.div`
  margin-top: 50px;
  padding: 10px 40px;
  background-color: ${palette('background', 0)};
`

export const Collapse = styled(A.Collapse)`
  &.ant-collapse-icon-position-right > .ant-collapse-item > .ant-collapse-header {
    padding: 5px 0px;
  }

  &.ant-collapse-ghost > .ant-collapse-item > .ant-collapse-content > .ant-collapse-content-box {
    padding: 0;
  }

  &.ant-collapse > .ant-collapse-item > .ant-collapse-header .ant-collapse-arrow {
    right: 0px;
  }
`

export const ExpandIcon = styled(CaretRightOutlined)`
  margin-top: 0px;
  svg {
    width: 20px;
    height: 20px;
    color: ${palette('primary', 0)};
  }
`

export const Title = styled(UILabel)`
  color: ${palette('text', 1)};
  text-transform: uppercase;
  font-family: 'MainFontSemiBold';
  font-size: 22px;
  line-height: 22px;
`

export const CardContainer = styled.div`
  width: 100%;
  padding: 10px 0 20px 0;
`

export const Card = styled(A.Card)`
  border-radius: 5px;
  background-color: ${palette('background', 0)};
  border: 1px solid ${palette('gray', 0)};
`

export const SectionsWrapper = styled.div`
  padding: 20px;
`

export const Section = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: flex-start;
  &:not(:last-child) {
    margin-bottom: 20px;
  }
`

export const SubTitle = styled(UILabel)`
  display: block;
  padding: 0px;
  margin-bottom: 5px;
  color: ${palette('text', 2)};
  font-family: 'MainFontRegular';
  font-size: 12px;
  text-transform: uppercase;
`

export const Label = styled(UILabel)`
  display: block;
  padding: 0px;
  color: ${palette('text', 1)};
  font-family: 'MainFontRegular';
  text-transform: uppercase;
  font-size: 16px;
`

export const ErrorLabel = styled(Label)`
  color: ${palette('error', 1)};
`
export const MenuItem = styled(Menu.Item)`
  display: flex;
  align-items: center;
  padding: 8px 10px;
`

export const DropdownContentWrapper = styled(A.Row)`
  justify-content: space-between;
  padding-right: 0;
  align-items: center;
  width: 100%;
  cursor: pointer;
`

export const MenuItemText = styled(Text)`
  text-transform: uppercase;
  font-family: 'MainFontRegular';
  color: ${palette('text', 1)};
  font-size: 16px;
`

export const UpdatesButton = styled(UIButton).attrs({
  sizevalue: 'xnormal',
  color: 'primary',
  typevalue: 'outline',
  round: 'true'
})`
  font-family: 'MainFontRegular';
  text-transform: uppercase;

  span {
    font-size: 14px;
  }

  :disabled:hover {
    color: ${palette('primary', 0)} !important;
  }

  &.ant-btn-loading-icon {
    margin-right: 10px;
  }

  &.ant-btn {
    min-width: 0;
    padding-left: 20px;
    padding-right: 20px;
  }

  margin: 10px 0;
`

export const ExternalLinkIcon = styled(ExternalLinkIconUI)`
  margin-left: 10px;
  color: ${palette('primary', 0)};
  svg {
    color: inherit;
  }
`

export const NetworkLabel = styled(Text)<{ network: Network }>`
  text-transform: uppercase;
  padding: 0;
  font-size: 16px;
  font-family: 'MainFontRegular';

  color: ${({ network }) => {
    switch (network) {
      case 'mainnet':
        return palette('primary', 0)
      case 'stagenet':
        return palette('danger', 1)
      case 'testnet':
        return palette('warning', 0)
      default:
        return palette('text', 2)
    }
  }};
`
