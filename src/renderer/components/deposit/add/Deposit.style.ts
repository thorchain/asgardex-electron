import { CaretRightOutlined } from '@ant-design/icons/lib'
import { Row } from 'antd'
import styled from 'styled-components'
import { palette } from 'styled-theme'

import { media } from '../../../helpers/styleHelper'
import { Alert as UIAlert } from '../../uielements/alert'
import { AssetCard as UIAssetCard } from '../../uielements/assets/assetCard'
import { AssetIcon as UIAssetIcon } from '../../uielements/assets/assetIcon'
import { AssetLabel as UIAssetLabel } from '../../uielements/assets/assetLabel'
import { Button as UIButton } from '../../uielements/button'
import { ViewTxButton as UIViewTxButton } from '../../uielements/button'
import { ExternalLinkIcon as UIExternalLinkIcon } from '../../uielements/common/Common.style'
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

export const AlertRow = styled(Row)`
  width: 100%;
  padding: 0 0 20px 0;

  ${media.xl`
    padding: 0 20px 20px 20px;
`}
`

export const Alert = styled(UIAlert)`
  width: 100%;
  margin: 0;

  ${media.xl`
  margin-right: 20px;
`}
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

export const PendingAssetContainer = styled('div')`
  display: flex;
  flex-direction: row;
  justify-content: center;
  height: 32px;
  margin: 10px 0;

  &:last-child {
    margin: 0;
  }

  > div:first-child {
    margin-right: 10px;
  }
`

export const PendingAssetIcon = styled(UIAssetIcon).attrs({ size: 'small' })`
  margin-right: 5px;
`
export const PendingAssetLabel = styled(UIAssetLabel)`
  padding: 0px;
`
export const PendingAssetAmountLabel = styled(UILabel)`
  font-family: 'MainFontBold';
  padding: 0;
  font-size: 17px;
  line-height: 17px;

  ${media.md`
  font-size: 24px;
  line-height: 24px;
`}
`

export const RecoveryInfoButton = styled(UIButton).attrs({
  typevalue: 'transparent'
})<{ selected: boolean }>`
  &.ant-btn {
    display: inline-flex;
    color: inherit;
  }
  padding-left: 0px;
`
export const RecoveryInfoButtonIcon = styled(CaretRightOutlined)<{ selected: boolean }>`
  transform: ${({ selected }) => (selected ? 'rotateZ(90deg)' : 'rotateZ(0)')};
  color: ${palette('primary', 0)};
`

export const RecoveryInfoButtonLabel = styled(UILabel)`
  font-family: 'MainFontBold';
  text-transform: uppercase;
  font-size: 12px;
  line-height: 15px;
  padding-right: 5px;
`

export const RecoveryDescription = styled(UILabel)`
  font-family: 'MainFontRegular';
  text-transform: uppercase;
  font-size: 12px;
  line-height: 17px;
`

export const OpenRecoveryToolIcon = styled(UIExternalLinkIcon)`
  svg {
    margin-left: 10px;
    color: inherit;
  }
`
