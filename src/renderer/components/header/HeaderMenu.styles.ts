import { Row } from 'antd'
import Text from 'antd/lib/typography/Text'
import styled from 'styled-components'
import { palette } from 'styled-theme'

import { media } from '../../helpers/styleHelper'
import { Menu } from '../shared/menu'

export const HeaderDropdownWrapper = styled.div`
  width: 100%;

  ${media.lg`
    width: auto;
    padding: 0;
  `}

  /* id is defined in svg */
  #down_icon {
    cursor: pointer;
    & > * {
      fill: ${palette('primary', 0)};
    }
  }
`

export const HeaderDropdownMenuItem = styled(Menu.Item)`
  display: flex;
  align-items: center;
  padding: 8px 10px;
`
export const HeaderDropdownContentWrapper = styled(Row)`
  justify-content: space-between;
  padding-right: 15px;
  padding-left: 15px;
  height: 60px;
  align-items: center;
  width: 100%;
  cursor: pointer;

  ${media.lg`
    padding-right: 0;
    padding-left: 0;
  `}
`

export const HeaderDropdownTitle = styled(Text)`
  text-transform: uppercase;
  color: ${palette('text', 0)};
`

export const HeaderDropdownMenuItemText = styled(Text)`
  text-transform: uppercase;
  font-family: 'MainFontBold';
  color: ${palette('text', 1)};
  font-size: 16px;
  background: transparent;
`
