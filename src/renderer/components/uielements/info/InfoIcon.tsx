import { Tooltip } from 'antd'

import * as Styled from './InfoIcon.styles'

type Props = {
  tooltip: string
}

export const InfoIcon: React.FC<Props> = ({ tooltip }) => {
  return (
    <Tooltip overlayStyle={{ maxWidth: '100%', whiteSpace: 'nowrap', fontSize: 11 }} title={tooltip}>
      <Styled.InfoCircleOutlinedIcon />
    </Tooltip>
  )
}
