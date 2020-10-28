import { Row } from 'antd'
import styled from 'styled-components'

import { media } from '../../../helpers/styleHelper'
import { Alert as UIAlert } from '../../uielements/alert'
import { AssetCard as BaseAssetCard } from '../../uielements/assets/assetCard'
import { Button as UIButton } from '../../uielements/button'
import { Label as UILabel } from '../../uielements/label'

export const Container = styled('div')`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  min-height: 100%;
`

export const CardsRow = styled(Row).attrs({
  justify: 'center',
  align: 'top'
})`
  width: 100%;
`

export const BalanceErrorRow = styled(Row)`
  width: 100%;
  padding: 20px 0px;

  ${media.xl`
    padding: 0 20px;
`}
`

export const BalanceAlert = styled(UIAlert)`
  width: 100%;
  margin-right: 20px;
`

export const BalanceErrorLabel = styled(UILabel).attrs({
  color: 'error',
  textTransform: 'uppercase'
})`
  font-family: 'MainFontRegular';
  padding: 0;
`

export const FeesRow = styled(Row)`
  width: 100%;
`

export const AssetCard = styled(BaseAssetCard)`
  width: 100%;
`

export const DragWrapper = styled('div')`
  padding: 20px;
`
export const FeeRow = styled(Row).attrs({
  align: 'middle'
})`
  padding-bottom: 20px;

  ${media.xl`
    padding-bottom: 0px;
`}
`

export const FeeErrorRow = styled(Row).attrs({
  align: 'middle'
})`
  padding-bottom: 20px;

  ${media.xl`
    padding-top: 20px;
    padding-bottom: 0px;
`}
`

export const FeeLabel = styled(UILabel).attrs({
  size: 'normal',
  textTransform: 'uppercase'
})`
  font-family: 'MainFontRegular';
  padding: 0;
  min-width: 150px; /* needed for loader */
`

export const FeeErrorLabel = styled(UILabel).attrs({
  color: 'error',
  textTransform: 'uppercase'
})`
  font-family: 'MainFontRegular';
  padding: 0;
`

export const ReloadFeeButton = styled(UIButton).attrs({
  typevalue: 'outline'
})`
  &.ant-btn {
    /* overridden */
    min-width: auto;
  }
  width: 30px;
  height: 30px;
  margin-right: 10px;
`
