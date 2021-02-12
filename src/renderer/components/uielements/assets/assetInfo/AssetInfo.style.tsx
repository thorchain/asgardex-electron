import { QrcodeOutlined as AQrcodeOutlined } from '@ant-design/icons/lib'
import * as A from 'antd'
import styled from 'styled-components'
import { palette } from 'styled-theme'

import { media } from '../../../../helpers/styleHelper'
import { AddressEllipsis as UIAddressEllipsis } from '../../addressEllipsis'

export const Card = styled(A.Card)`
  .ant-card-body {
    padding: 35px 50px 25px;
    background-color: ${palette('background', 1)};
  }
`

export const CoinInfoWrapper = styled.div`
  margin-left: 30px;
  flex-direction: column;
  width: 100%;
  max-width: 100%;
  overflow: hidden;

  ${media.lg`
    width: auto;
  `}
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

export const InfoContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  margin: 10px 0 0 0;

  ${media.lg`
    margin: 0 0 0 85px;
  `}
`

export const AddressContainer = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  flex-grow: 1;
`

const ICON_SIZE = 20

export const AddressEllipsis = styled(UIAddressEllipsis)`
  margin-right: 5px;
  max-width: 100%;
  overflow: hidden;

  &:only-child {
    margin: auto;
  }

  & svg {
    height: ${ICON_SIZE}px;
    width: ${ICON_SIZE}px;
  }
`

export const QrcodeOutlined = styled(AQrcodeOutlined)`
  cursor: pointer;
  color: ${palette('primary', 0)};

  & svg {
    height: ${ICON_SIZE}px;
    width: ${ICON_SIZE}px;
  }
`

export const CoinPrice = styled.p`
  display: flex;
  align-items: flex-end;
  font-size: 32px;
  font-family: 'MainFontRegular';
  font-weight: 300;
  color: ${palette('text', 0)};
  line-height: 38px;
  text-transform: uppercase;

  ${media.lg`
    margin: 0px;
  `}
`
