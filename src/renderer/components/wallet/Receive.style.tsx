import { Col, Card } from 'antd'
import styled from 'styled-components'
import { palette } from 'styled-theme'

import Label from '../uielements/label'

type StyledQRWrapperProps = {
  isDesktopView: boolean
}

export const StyledBackLabel = styled(Label)`
  margin-bottom: 18px;
  font-family: 'MainFontRegular';
`

export const StyledCol = styled(Col)`
  padding: 20px 30px;
  background: ${palette('background', 1)};
`

export const StyledCard = styled(Card)<StyledQRWrapperProps>`
  .ant-card-body {
    padding: 0;
    background: ${palette('background', 1)};

    div {
      margin-top: ${(props: StyledQRWrapperProps) => (props.isDesktopView ? '-40px' : 0)};
      margin-bottom: ${(props: StyledQRWrapperProps) => (props.isDesktopView ? '115px' : '45px')};
      display: flex;
      justify-content: center;
    }
  }
`

export const StyledMobileCard = styled(Card)`
  .ant-card-body {
    padding: 0;
    background: ${palette('background', 1)};

    div {
      margin-bottom: 45px;
      display: flex;
      justify-content: center;
    }
  }
`

export const StyledAddressWrapper = styled.label`
  display: flex;
  justify-content: center;
  align-items: center;

  div {
    width: 50%;
  }
`

export const StyledAddress = styled(Label)`
  text-overflow: ellipsis;
  overflow: hidden;
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
