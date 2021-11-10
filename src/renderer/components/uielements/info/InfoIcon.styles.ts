import { InfoCircleOutlined } from '@ant-design/icons'
import { Tooltip as TooltipUI } from 'antd'
import styled from 'styled-components'
import { palette } from 'styled-theme'

export type Color = 'primary' | 'warning' | 'error'

export const Tooltip = styled(TooltipUI).attrs({
  overlayStyle: {
    maxWidth: '100%',
    whiteSpace: 'nowrap',
    fontSize: 11,
    fontFamily: 'MainFont',
    textTransform: 'uppercase'
  }
})``

export const InfoCircleOutlinedIcon = styled(InfoCircleOutlined)<{ color: Color }>`
  color: ${({ color }) => palette(color, 0)};
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 3px;
`
