import { Tooltip } from '../common/Common.styles'
import * as Styled from './InfoIcon.styles'

export type Props = {
  tooltip: string
  color?: Styled.Color
}

export const InfoIcon: React.FC<Props> = ({ tooltip, color = 'primary' }) => (
  <Tooltip title={tooltip}>
    <Styled.InfoCircleOutlinedIcon color={color} />
  </Tooltip>
)
