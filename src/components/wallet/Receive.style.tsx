import { Col, Card } from 'antd'
import styled from 'styled-components'
import { palette } from 'styled-theme'

import Label from '../uielements/label'

export const StyledBackLabel = styled(Label)`
  margin-bottom: 18px;
  font-family: 'MainFontRegular';
`

export const StyledCol = styled(Col)`
  padding: 20px 30px;
  background: ${palette('background', 1)};
`

export const StyledCard = styled(Card)`
  .ant-card-body {
    padding: 0;
    background: ${palette('background', 1)};

    div {
      margin-top: -40px;
      margin-bottom: 115px;
      display: flex;
      justify-content: center;
    }
  }
`

export const StyledAddress = styled(Label)`
  text-transform: uppercase;
  font-family: 'MainFontRegular';
`

export const StyledLabel = styled(Label)`
  text-transform: uppercase;
  font-family: 'MainFontRegular';
  font-weight: 600;
  color: ${palette('primary', 0)};
`

export const StyledDiv = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
`
