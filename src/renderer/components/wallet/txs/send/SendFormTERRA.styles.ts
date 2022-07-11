import * as A from 'antd'
import Text from 'antd/lib/typography/Text'
import styled from 'styled-components'
import { palette } from 'styled-theme'

export const MenuItemContainer = styled.div`
  display: flex;
  align-items: center;
  padding: 8px 0px;
`

export const DropdownContentWrapper = styled(A.Row)`
  margin-left: 10px;
  justify-content: space-between;
  padding-right: 0;
  align-items: center;
  cursor: pointer;
`

export const MenuItemText = styled(Text)`
  text-transform: uppercase;
  font-family: 'MainFontRegular';
  color: ${palette('text', 1)};
  font-size: 15px;
  margin-left: 5px;
`
