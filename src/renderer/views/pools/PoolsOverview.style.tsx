import * as A from 'antd'
import styled from 'styled-components'
import { palette } from 'styled-theme'

import { Button as UIButton, ButtonProps as UIButtonProps } from '../../components/uielements/button'
import { Label } from '../../components/uielements/label'
import { media } from '../../helpers/styleHelper'

export const Tabs = styled(A.Tabs)`
  ${media.sm`
    flex-grow: 1;

    & .ant-tabs-content-holder {
      display: flex;
    }
  `}
`

export const TabButtonsContainer = styled.div`
  display: flex;
  flex-direction: row;
  margin-bottom: 10px;
`

type TabButtonProps = UIButtonProps & { selected: boolean }

// A wrapper around `UIButton` to provide custom props - needed for custom styles
const TabButtonWrapper: React.FC<TabButtonProps> = ({ children, ...otherProps }) => (
  <UIButton {...otherProps}>{children}</UIButton>
)

export const TabButton = styled(TabButtonWrapper).attrs<TabButtonProps>(({ selected }) => ({
  typevalue: 'transparent',
  // sizevalue: 'xnormal',
  weight: selected ? 'bold' : 'normal'
}))`
  font-size: 16px !important;
  color: ${({ selected }) => palette('text', selected ? 1 : 0)} !important;
`
export const TabPane = styled(A.Tabs.TabPane)``

export const TableAction = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  > :not(:first-child) {
    margin-left: 10px;
  }
`

export const ActionColumn = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
`

export const BlockLeftLabel = styled(Label)`
  display: inline-block;
  width: 100px;
`
