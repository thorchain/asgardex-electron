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
  margin-left: 30px;
`

export const AssetTitleWrapper = styled.div`
  display: flex;
  align-items: center;
`
export const AssetTitle = styled.div`
  font-size: 36px;
  font-family: 'MainFontRegular';
  color: ${palette('text', 0)};
  line-height: 100%;
  text-transform: uppercase;
`

export const AssetSubTitle = styled.div`
  font-size: 19px;
  font-family: 'MainFontRegular';
  color: ${palette('text', 2)};
  line-height: 26px;
  text-transform: uppercase;
`

export const ChangeLabel = styled(UILabel).attrs({
  textTransform: 'uppercase',
  color: 'primary',
  size: 'normal'
})`
  padding: 0;
  cursor: pointer;
`

export const WalletTypeLabel = styled(WalletTypeLabelUI)`
  margin-left: 10px;
`
