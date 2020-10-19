import * as A from 'antd'
import styled from 'styled-components'
import { palette } from 'styled-theme'

import { Label as UILabel } from '../../../uielements/label'

export const Col = styled(A.Col)`
  padding: 0 30px 20px 30px;
  background: ${palette('background', 1)};
`

export const CoinInfoWrapper = styled.div`
  margin-left: 30px;
  flex-direction: column;
`

export const CoinTitle = styled.p`
  margin-bottom: 10px;
  font-size: 32px;
  font-family: 'MainFontRegular';
  color: ${palette('text', 0)};
  line-height: 38px;
  text-transform: uppercase;
`

export const CoinSubtitle = styled.p`
  margin-bottom: 0px;
  font-size: 24px;
  font-family: 'MainFontRegular';
  color: ${palette('text', 0)};
  line-height: 29px;
  text-transform: uppercase;
`
export const Divider = styled(A.Divider)`
  margin: 0px;
  border-top: 1px solid ${palette('gray', 0)};
`

export const Card = styled(A.Card)`
  .ant-card-body {
    padding: 0;
    background: ${palette('background', 1)};
  }
`

type QRWrapperProps = {
  smallView: boolean
}

export const QRWrapper = styled.div<QRWrapperProps>`
  height: ${({ smallView }) => (smallView ? '280px' : '320px')};
  display: flex;
  justify-content: center;
  align-items: center;
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

export const CopyLabel = styled(A.Typography.Text)`
  text-transform: uppercase;
  font-family: 'MainFontRegular';
  color: ${palette('primary', 0)};
  /* icon */
  svg {
    color: ${palette('primary', 0)};
  }
`

export const Div = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
`
