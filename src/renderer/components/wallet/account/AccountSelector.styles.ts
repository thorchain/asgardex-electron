import * as A from 'antd'
import styled from 'styled-components'
import { palette } from 'styled-theme'

import { WalletTypeLabel as WalletTypeLabelUI } from '../../uielements/common/Common.styles'
import { Label as UILabel } from '../../uielements/label'

export const Card = styled(A.Card)`
  background: ${palette('background', 1)};
  .ant-card-body {
    padding: 20px 35px;
  }
`

export const AssetWrapper = styled.div`
  display: flex;
  align-items: center;
`

export const AssetInfoWrapper = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  margin-left: 16px;
`

export const AssetTitle = styled.p`
  margin-bottom: 0;
  font-size: 32px;
  font-family: 'MainFontRegular';
  color: ${palette('text', 0)};
  line-height: 38px;
  text-transform: uppercase;
`

export const AssetSubTitle = styled.p`
  margin-bottom: 5px;
  font-size: 18px;
  font-family: 'MainFontRegular';
  color: ${palette('text', 2)};
  line-height: 22px;
  text-transform: uppercase;
`

export const Label = styled(UILabel).attrs({
  textTransform: 'uppercase',
  color: 'primary',
  size: 'big'
})`
  padding: 0;
  cursor: pointer;
`

export const WalletTypeLabel = styled(WalletTypeLabelUI)`
  margin: -20px 0px 0px 10px;
`
