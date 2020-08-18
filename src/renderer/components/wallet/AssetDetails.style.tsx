import * as A from 'antd'
import styled from 'styled-components'
import { palette } from 'styled-theme'

import Headline from '../uielements/headline'
import Label from '../uielements/label'

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

export const ActionRow = styled(A.Row)`
  width: 100%;
  padding-top: 30px;
  background-color: ${palette('background', 1)};
`

export const ActionCol = styled(A.Col)`
  width: 100%;
  display: flex;
  padding-bottom: 30px;
  justify-content: center;
  align-items: flex-start;
`

export const ActionWrapper = styled.div`
  width: 100%;
`

type TableHeadlineProps = {
  isDesktop: boolean
}

export const TableHeadline = styled(Headline)`
  padding: 40px 0 20px 0;
  width: 100%;
  text-align: ${({ isDesktop }: TableHeadlineProps) => (isDesktop ? 'left' : 'center')};
`
