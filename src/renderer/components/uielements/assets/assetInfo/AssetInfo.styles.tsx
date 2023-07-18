import { QrcodeOutlined as AQrcodeOutlined } from '@ant-design/icons/lib'
import * as A from 'antd'
import styled from 'styled-components'
import { palette } from 'styled-theme'

import { Label as UILabel } from '../../../../components/uielements/label'
import { media } from '../../../../helpers/styleHelper'
import { AddressEllipsis as UIAddressEllipsis } from '../../addressEllipsis'
import { WalletTypeLabel as WalletTypeLabelUI, AssetSynthLabel as AssetSynthLabelUI } from '../../common/Common.styles'

export const Card = styled(A.Card)`
  .ant-card-body {
    padding: 35px 50px 25px;
    background-color: ${palette('background', 1)};
  }
`

export const AssetInfoWrapper = styled.div`
  margin-left: 30px;
  flex-direction: column;
  width: 100%;
  max-width: 100%;
  overflow: hidden;

  ${media.lg`
    width: auto;
  `}
`

export const AssetTitleWrapper = styled.div`
  display: flex;
  align-items: center;
  margin-top: 5px;
`

export const AssetTitle = styled(UILabel)`
  padding: 0;
  line-height: 100%;
  font-size: 36px;
  font-family: 'MainFontRegular';
  color: ${palette('text', 0)};
  text-transform: uppercase;
  width: auto;
`

export const AssetSubtitle = styled(UILabel)`
  padding: 0;
  font-size: 19px;
  font-family: 'MainFontRegular';
  color: ${palette('text', 2)};
  text-transform: uppercase;
  width: auto;
`

export const InfoContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: space-around;
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
  font-size: 1rem;

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

export const AssetPrice = styled.p`
  padding: 0;
  display: flex;
  align-items: flex-end;
  font-size: 32px;
  font-family: 'MainFontRegular';
  color: ${palette('text', 0)};
  text-transform: uppercase;

  ${media.lg`
    margin: 0px;
  `}
`

export const WalletTypeLabel = styled(WalletTypeLabelUI)`
  margin-left: 10px;
`
export const AssetSynthLabel = styled(AssetSynthLabelUI)`
  margin-top: 2px;
  padding: 1 4px;
  font-size: 12px;
  line-height: 12px;
  width: 52px;
`
export const ChainLabelWrapper = styled.div`
  display: flex;
  align-items: center;
`
