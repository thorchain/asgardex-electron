import styled from 'styled-components'
import { palette } from 'styled-theme'

import { CheckButton as CheckButtonUI } from '../../button/CheckButton'
import { Tooltip as UITooltip } from '../../common/Common.styles'
import { InputBigNumber as InputBigNumberUI } from '../../input'
import { Label } from '../../label'
import { AssetLabel as AssetLabelUI } from '../assetLabel'
import { AssetSelect as AssetSelectUI } from '../assetSelect'

export const AssetCardWrapper = styled.div`
  width: 100%;
`

export const CardBorderWrapper = styled.div<{ error: boolean }>`
  display: flex;
  flex-direction: column;
  margin-bottom: 20px;
  border: 1px solid;
  border-color: ${({ error }) => (error ? palette('error', 0) : palette('gray', 0))};
  border-radius: 3px;
  background-color: ${palette('background', 1)};

  & .coinData-wrapper {
    width: auto;
  }
`

export const CardTopRow = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  min-width: 250px;
  padding: 40px 0;
`

export const AssetCardFooter = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`

export const AssetData = styled.div.attrs({ className: 'asset-data' })`
  display: flex;
  flex-direction: column;
  flex-grow: 1;
  margin-right: 13px;
`

export const FooterLabel = styled(Label).attrs({
  size: 'normal',
  color: 'light',
  weight: 'normal'
})`
  letter-spacing: 0.4px;
  padding: 0;
`

export const MinAmountLabel = styled(Label)`
  padding-top: 0;
  text-transform: uppercase;
`

export const AssetDataWrapper = styled.div`
  width: 100%;
  padding: 0 20px;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
`

export const AssetSelect = styled(AssetSelectUI)``

export const InputBigNumber = styled(InputBigNumberUI).attrs({
  size: 'large'
})`
  padding: 0;
  margin-bottom: 5px;
  box-shadow: none !important;
  border-top: none;
  border-left: none;
  border-right: none;
`

export const SliderWrapper = styled.div`
  padding: 0 5px 20px 10px;
`

export const Header = styled.div`
  display: flex;
  justify-content: space-between;
  padding: 10px 11px 10px 0;
  border-bottom: 1px solid ${palette('gray', 0)};
`

export const Tooltip = styled(UITooltip).attrs({
  overlayStyle: {
    textTransform: 'none',
    fontSize: 14,
    maxWidth: '400px',
    fontFamily: 'MainFontRegular'
  }
})``

export const BalanceLabel = styled(Label)`
  width: auto;
  padding: 0;
`

export const AssetLabel = styled(AssetLabelUI)`
  padding: 0;
  cursor: default;
`

export const AssetSelectContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
`

export const WalletTypeContainer = styled.div`
  height: 40px; // needed to keep height if its content is hidden
  display: flex;
  flex-direction: row;
  align-items: center;
`

export const CheckButton = styled(CheckButtonUI)`
  &.ant-btn {
    font-size: 10px;
  }
`
