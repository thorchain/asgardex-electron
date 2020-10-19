import * as A from 'antd'
import styled from 'styled-components'
import { palette } from 'styled-theme'

export const Card = styled(A.Card)`
  .ant-card-body {
    padding: 35px 50px 25px;
    background-color: ${palette('background', 1)};
  }
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

export const CoinPrice = styled.p`
  display: flex;
  align-items: flex-end;
  margin-left: 85px;
  margin-bottom: 0px;
  font-size: 32px;
  font-family: 'MainFontRegular';
  font-weight: 300;
  color: ${palette('text', 0)};
  line-height: 38px;
  text-transform: uppercase;
`

export const CoinMobilePrice = styled.p`
  display: flex;
  align-items: flex-end;
  margin: 10px 0px 0px;
  font-size: 32px;
  font-family: 'MainFontRegular';
  font-weight: 300;
  color: ${palette('text', 0)};
  line-height: 38px;
  text-transform: uppercase;
`
