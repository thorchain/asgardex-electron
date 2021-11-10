import * as Styled from './InfoIcon.styles'

type Props = {
  tooltip: string
  color?: Styled.Color
}

export const InfoIcon: React.FC<Props> = ({ tooltip, color = 'primary' }) => (
  <Styled.Tooltip title={tooltip}>
    <Styled.InfoCircleOutlinedIcon color={color} />
  </Styled.Tooltip>
)
