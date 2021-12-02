import { SelectOutlined } from '@ant-design/icons'
import * as A from 'antd'
import styled from 'styled-components'
import { palette } from 'styled-theme'

import { Label as UILabel } from '../../../components/uielements/label'

export const ExternalLinkIcon = styled(SelectOutlined)`
  svg {
    height: 20px;
    width: 20px;
    transform: scale(-1, 1) translateX(5px);
    color: ${palette('text', 1)};
  }
`

export const WalletTypeLabel = styled(UILabel).attrs({
  textTransform: 'uppercase',
  size: 'small'
})`
  font-family: 'MainFontRegular';
  color: ${palette('text', 2)};

  background: ${palette('gray', 0)};
  text-shadow: 1px 1px 1px ${palette('background', 1)};
  border-radius: 5px;
  padding: 1px 7px;
  width: auto;
`

export const Tooltip = styled(A.Tooltip).attrs({
  overlayStyle: {
    fontSize: 11,
    maxWidth: '330px',
    fontFamily: 'MainFontRegular',
    textTransform: 'uppercase'
  }
})``

export const TooltipAddress = styled(A.Tooltip).attrs({
  overlayStyle: {
    textTransform: 'none',
    fontSize: 14,
    maxWidth: '400px',
    fontFamily: 'MainFontRegular'
  }
})``
