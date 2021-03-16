import { ArrowUpOutlined } from '@ant-design/icons'
import styled from 'styled-components'
import { palette } from 'styled-theme'

export const ExternalLinkIcon = styled(ArrowUpOutlined)`
  transform: rotateZ(45deg);
  color: ${palette('primary', 0)};
  svg {
    height: 20px;
    width: 20px;
  }
`
