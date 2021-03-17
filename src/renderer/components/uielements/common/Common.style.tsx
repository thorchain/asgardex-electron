import { SelectOutlined } from '@ant-design/icons'
import styled from 'styled-components'
import { palette } from 'styled-theme'

export const ExternalLinkIcon = styled(SelectOutlined)`
  svg {
    height: 20px;
    width: 20px;
    transform: scale(-1, 1) translateX(5px);
    color: ${palette('text', 1)};
  }
`
