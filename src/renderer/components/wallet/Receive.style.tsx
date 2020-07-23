import * as A from 'antd'
import styled from 'styled-components'
import { palette } from 'styled-theme'

import UILabel from '../uielements/label'

export const Col = styled(A.Col)`
  padding: 20px 30px;
  background: ${palette('background', 1)};
`

export const Card = styled(A.Card)`
  .ant-card-body {
    padding: 0;
    background: ${palette('background', 1)};
  }
`

type QRWrapperProps = {
  isDesktopView: boolean
}

export const QRWrapper = styled.div<QRWrapperProps>`
  margin-top: ${(props: QRWrapperProps) => (props.isDesktopView ? '-40px' : 0)};
  margin-bottom: ${(props: QRWrapperProps) => (props.isDesktopView ? '115px' : '45px')};
  display: flex;
  justify-content: center;
`

export const MobileCard = styled(Card)`
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

export const AddressWrapper = styled.label`
  display: flex;
  justify-content: center;
  align-items: center;

  div {
    width: 50%;
  }
`

export const Address = styled(UILabel)`
  text-overflow: ellipsis;
  overflow: hidden;
  text-transform: uppercase;
  font-family: 'MainFontRegular';
`

export const Label = styled(UILabel)`
  text-transform: uppercase;
  font-family: 'MainFontRegular';
  font-weight: 600;
  color: ${palette('primary', 0)};
`

export const Div = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
`
