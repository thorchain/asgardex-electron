import * as A from 'antd'
import styled from 'styled-components'
import { palette } from 'styled-theme'

import Headline from '../uielements/headline'
import Label from '../uielements/label'

export const Card = styled(A.Card)`
  .ant-card-body {
    padding: 35px 50px 25px;
    background-color: ${palette('background', 1)};
  }
`

export const MobileCard = styled(A.Card)`
  .ant-card-body {
    padding: 24px;
    background-color: ${palette('background', 1)};
  }
`

export const StyledPriceWrapper = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: ${palette('background', 1)};
`

export const StyledAssetName = styled.h1`
  font-size: 32px;
  font-family: 'MainFontRegular';
  color: ${palette('text', 0)};
  line-height: 1em;
  text-transform: uppercase;
`

export const StyledLabel = styled(Label)`
  margin-bottom: 18px;
  font-family: 'MainFontRegular';
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

export const Divider = styled(A.Divider)`
  margin: 0px;
  border-top: 1px solid ${palette('gray', 0)};
`

export const Row = styled(A.Row)`
  width: 100%;
`

export const Col = styled(A.Col)`
  width: 100%;
`

export const ActionWrapper = styled(Card)`
  display: flex;
  justify-content: center;
  align-items: center;

  .ant-card-body {
    padding: 51px 0px 44px;
    display: flex;
    width: 100%;
    justify-content: space-between;
    background-color: ${palette('background', 1)};
  }
`

export const ActionMobileWrapper = styled(Card)`
  display: flex;
  justify-content: center;
  align-items: center;

  .ant-card-body {
    padding: 20px 0px;
    display: flex;
    width: 100%;
    justify-content: space-between;
    background-color: ${palette('background', 1)};
  }
`
type TableHeadlineProps = {
  isDesktop: boolean
}

export const TableHeadline = styled(Headline)`
  padding: 40px 0 20px 0;
  width: 100%;
  text-align: ${({ isDesktop }: TableHeadlineProps) => (isDesktop ? 'left' : 'center')};
`
