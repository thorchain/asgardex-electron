import { SwapOutlined as ASwapOutlined } from '@ant-design/icons/lib'
import { Row } from 'antd'
import styled from 'styled-components'
import { palette } from 'styled-theme'

import { media } from '../../helpers/styleHelper'
import { AssetInput as AssetInputBase } from '../uielements/assets/assetInput'
import { Drag as UIDrag } from '../uielements/drag'
import { Label as UILabel } from '../uielements/label'

export const Container = styled('div')`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  position: relative;
  max-width: 538px;
  height: 100%;
  width: 100%;
  margin: auto;
  color: ${palette('text', 0)};
  text-transform: uppercase;
  padding: 60px 0;
`

export const Header = styled('div')`
  text-align: center;
  background: ${palette('gradient', 0)};
  padding: 16px;
  width: 100%;
  margin-bottom: 30px;
  font-size: 18px;
  font-weight: 600;
  color: ${palette('text', 3)};

  ${media.md`
    margin-bottom: 50px;
  `}
`

export const SwapOutlined = styled(ASwapOutlined).attrs({ rotate: 90 })`
  width: 100%;
  color: ${palette('success', 0)};
  ${(props) => (props.disabled ? 'opacity: 0.5; cursor: not-allowed !important;' : '')}
  svg {
    height: 22px;
    width: 22px;
  }
`

export const FormContainer = styled('div')`
  position: relative;
`

export const CurrencyInfoContainer = styled('div')`
  display: none;
  position: absolute;
  top: 0;
  left: 100%;
  padding-left: 15px;
  align-items: center;
  height: 100%;
  color: ${palette('gray', 1)};
  width: max-content;

  ${media.md`
    display: flex;
  `}
`

export const ContentContainer = styled('div')`
  position: relative;
`

export const ValueItemContainer = styled('div')`
  display: flex;
  flex-direction: column;
  align-items: baseline;
  width: 100%;
  position: relative;

  &.valueItemContainer {
    &-out {
      margin-bottom: 10px;
    }

    &-percent {
      padding-bottom: 50px;
    }
  }

  ${media.md`
    flex-direction: row;

    &>*:first-child {
      margin-right: 25px;
      min-width: 60%;
   `}
  }
`

export const SliderContainer = styled('div')`
  width: 100%;
  min-width: 212px;
`

export const InValue = styled('div')`
  display: flex;
  flex-direction: row;

  ${media.md`
    flex-direction: column;
  `}
`

export const InValueTitle = styled('div')`
  margin-right: 10px;
`

export const SubmitContainer = styled('div')`
  display: flex;
  flex-direction: column;
  align-items: center;
`

export const PendingContainer = styled('div')`
  position: absolute;
  display: flex;
  align-items: center;
  justify-content: center;
  top: 60px;
  left: 0;
  z-index: 9;
  background-color: ${palette('gradient', 1)};

  &:not(:empty) {
    width: 100%;
    height: 100%;
  }
`

export const AssetInput = styled(AssetInputBase)<{ hasError?: boolean }>`
  border-color: ${({ hasError }) => (hasError ? palette('error', 0) : palette('primary', 0))};

  & .ant-input {
    border: none;
  }
`

export const Drag = styled(UIDrag)`
  margin-bottom: 10px;
`

export const ErrorLabel = styled(UILabel)`
  margin-bottom: 14px;
  font-family: 'MainFontRegular';
  text-transform: uppercase;
  color: ${palette('error', 0)};
  text-align: center;
`

export const BalanceErrorLabel = styled(ErrorLabel)`
  text-align: left;
`

export const CoinDataWrapper = styled(Row).attrs({
  justify: 'center',
  align: 'middle'
})``

export const CoinDataContainer = styled.div`
  display: flex;
  flex-direction: column;

  .coinData-wrapper {
    &:first-child {
      padding-bottom: 20px;
    }
  }
`

export const TrendContainer = styled(Row).attrs({
  justify: 'center'
})`
  padding-top: 20px;
  width: 100%;
`

export const StepContainer = styled(Row).attrs({
  justify: 'center'
})`
  width: 100%;
  padding: 10px 0;
`

export const StepLabel = styled(UILabel).attrs({
  size: 'small',
  color: 'gray'
})`
  padding-top: 0;
  font-family: 'MainFontRegular';
  text-transform: uppercase;
  text-align: center;
`
