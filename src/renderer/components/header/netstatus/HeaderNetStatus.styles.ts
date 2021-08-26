import { Row } from 'antd'
import styled from 'styled-components'
import { palette } from 'styled-theme'

import { media } from '../../../helpers/styleHelper'
import { Menu } from '../../shared/menu'
import { Label } from '../../uielements/label'

export const Wrapper = styled(Row)`
  /* id defined in svg */
  #down_icon {
    cursor: pointer;
    & > * {
      fill: ${palette('primary', 0)};
    }
  }

  width: 100%;

  ${media.lg`
    width: auto;
  `}
`

export const MenuItem = styled(Menu.Item).attrs({
  display: 'flex',
  alignItems: 'center',
  padding: '8px 10px'
})``

export const MenuItemHeadline = styled(Label).attrs({
  size: 'normal',
  weight: 'bold',
  textTransform: 'uppercase',
  color: 'normal'
})`
  padding: 0 20px 0 0;
  font-size: 14px;
`

export const MenuItemSubHeadline = styled(Label).attrs({
  size: 'small',
  weight: 'normal',
  textTransform: 'uppercase',
  color: 'normal'
})`
  padding: 0 20px 0 0;
  text-transform: lowercase;
  margin-bottom: 0;
  font-size: 14px;
`
