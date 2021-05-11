import { Row } from 'antd'
import styled from 'styled-components'
import { palette } from 'styled-theme'

import { media } from '../../../helpers/styleHelper'
import { Alert as UIAlert } from '../../uielements/alert'
import { AssetCard as UIAssetCard } from '../../uielements/assets/assetCard'
import { Button as UIButton } from '../../uielements/button'
import { ViewTxButton as UIViewTxButton } from '../../uielements/button'
import { Label as UILabel } from '../../uielements/label'

export const Container = styled.div`
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
    padding: 20px;
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

export const AssetCard = styled(UIAssetCard)`
  width: 100%;
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

export const ExtraContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-between;
`

export const ViewTxButtonTop = styled(UIViewTxButton)`
  padding-bottom: 20px;
`

export const ErrorLabel = styled(UILabel)`
  margin-bottom: 14px;
  font-family: 'MainFontRegular';
  text-transform: uppercase;
  color: ${palette('error', 0)};
  text-align: center;
`

export const SubmitContainer = styled.div`
  margin-top: 50px;
  display: flex;
  flex-direction: column;
  align-items: center;
`
export const SubmitButtonWrapper = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 20px 0;
`

export const SubmitButton = styled(UIButton).attrs({
  type: 'primary',
  round: 'true'
})`
  min-width: 200px !important;
  padding: 0 30px;
  margin-bottom: 20px;
`
