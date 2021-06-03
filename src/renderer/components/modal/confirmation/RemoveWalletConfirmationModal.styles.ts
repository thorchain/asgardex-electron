import styled from 'styled-components'
import { palette } from 'styled-theme'

export const Content = styled.div`
  display: flex;
  flex-direction: column;
`

export const TitleText = styled.span`
  margin-bottom: 10px;
  color: ${palette('text', 0)};
  font-size: 17px !important;
  font-weight: 600;
`

export const DescriptionText = styled.span`
  font-size: 17px !important;
`
