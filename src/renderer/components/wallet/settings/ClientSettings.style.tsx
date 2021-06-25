import styled from 'styled-components'
import { palette } from 'styled-theme'

import { ConnectionStatus as UIConnectionStatus } from '../../shared/icons'
import { Button as UIButton } from '../../uielements/button'
import { ExternalLinkIcon as ExternalLinkIconUI } from '../../uielements/common/Common.style'
import { Label as UILabel } from '../../uielements/label'

export const Section = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 10px;
`

export const Title = styled(UILabel)`
  display: block;
  padding: 0px;
  margin-bottom: 5px;
  color: ${palette('text', 2)};
  font-family: 'MainFontRegular';
  font-size: 12px;
  text-transform: uppercase;
`

export const Label = styled(UILabel)`
  display: block;
  padding: 0px;
  color: ${palette('text', 1)};
  font-family: 'MainFontRegular';
  text-transform: uppercase;
  font-size: 16px;
`

export const ErrorLabel = styled(Label)`
  color: ${palette('error', 1)};
`

export const UpdatesButton = styled(UIButton).attrs({
  sizevalue: 'xnormal',
  color: 'primary',
  typevalue: 'outline',
  round: 'true'
})`
  font-family: 'MainFontRegular';
  text-transform: uppercase;

  span {
    font-size: 14px;
  }

  :disabled:hover {
    color: ${palette('primary', 0)} !important;
  }

  &:not(:last-child) {
    margin-bottom: 10px;
  }

  &.ant-btn-loading-icon {
    margin-right: 10px;
  }

  &.ant-btn {
    min-width: 0;
    padding-left: 20px;
    padding-right: 20px;
  }

  margin: 10px 0;
`

export const ExternalLinkIcon = styled(ExternalLinkIconUI)`
  margin-left: 10px;
  color: ${palette('primary', 0)};
  svg {
    color: inherit;
  }
`

export const ConnectionStatus = styled(UIConnectionStatus)`
  margin-right: 10px;
`

export const ConnectionSubSection = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  padding-bottom: 10px;
`
