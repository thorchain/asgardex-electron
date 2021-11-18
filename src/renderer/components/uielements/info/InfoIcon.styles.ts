import { InfoCircleOutlined } from '@ant-design/icons'
import styled from 'styled-components'
import { palette } from 'styled-theme'

export type Color = 'primary' | 'warning' | 'error'

export const InfoCircleOutlinedIcon = styled(InfoCircleOutlined)<{ color: Color }>`
  color: ${({ color }) => palette(color, 0)};
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 3px;
`
