import * as A from 'antd'
import styled from 'styled-components'
import { palette } from 'styled-theme'

import { WalletTypeLabel as WalletTypeLabelUI } from '../../common/Common.styles'
import { Label as UILabel } from '../../label'
import { AssetIcon as UIAssetIcon } from '../assetIcon'

export type AssetDataSize = 'small' | 'big'

export const Wrapper = styled(A.Row).attrs({
  align: 'middle'
})`
  padding: 5px 0px;
  margin-right: 8px;

  &:last-child {
    margin: 0;
  }
`

export const AssetIcon = styled(UIAssetIcon)``

export const TickerLabel = styled(UILabel).attrs({
  textTransform: 'uppercase',
  weight: 'bold'
})`
  height: 18px;
  padding: 0px 16px 0px 11px;
  font-size: 16px;
  line-height: 18px;
`

export const ChainLabel = styled(TickerLabel)`
  color: ${palette('gray', 2)};
  font-size: 12px;
  font-weight: 500;
`

export const AmountLabel = styled(UILabel).attrs({
  textTransform: 'uppercase',
  weight: 'bold'
})`
  font-family: 'MainFontRegular';
  padding-left: 10px;
`

export const PriceLabel = styled(UILabel).attrs({
  textTransform: 'uppercase',
  weight: 'normal',
  color: 'light'
})`
  padding-left: 10px;
  font-family: 'MainFontRegular';
`

export const Col = styled(A.Col)`
  margin-right: 8px;

  &:last-child {
    margin: 0;
  }
`

export const AssetIconContainer = styled.div`
  display: flex;
  align-items: center;
  margin-right: 8px;
  padding: 10px 0;

  position: relative;
`
export const WalletTypeLabel = styled(WalletTypeLabelUI)`
  font-size: 8px;
  line-height: 12px;
  margin-left: 10px;
`
export const LabelContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
`
