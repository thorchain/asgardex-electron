import * as A from 'antd'
import styled from 'styled-components'
import { palette } from 'styled-theme'

import { AssetsFilter as AssetsFilterUI } from '../../components/AssetsFilter'
import { AssetData as AssetDataUI } from '../../components/uielements/assets/assetData'
import { Button as UIButton, ButtonProps as UIButtonProps } from '../../components/uielements/button'
import { Label as UILabel } from '../../components/uielements/label'
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
  flex-direction: column;
  ${media.sm`
    flex-direction: row;
  `}
  margin-bottom: 10px;
`

type TabButtonProps = UIButtonProps & { selected: boolean }

export const TabButton = styled(UIButton).attrs<TabButtonProps>(({ selected }) => ({
  typevalue: 'transparent',
  weight: selected ? 'bold' : 'normal'
}))<TabButtonProps>`
  font-size: 16px !important;
  color: ${({ selected }) => palette('text', selected ? 1 : 0)} !important;
  &:first-child {
    padding-left: 0;
  }
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

export const BlockLeftLabel = styled(UILabel)`
  display: inline-block;
  width: 100px;
  font-size: 16px;
`

export const Label = styled(UILabel)`
  font-size: 16px;
`
export const AssetsFilter = styled(AssetsFilterUI)`
  margin-bottom: 20px;
`
export const AssetData = styled(AssetDataUI)`
  & .ticker {
    font-size: 16px;
  }
`
