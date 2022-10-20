import { SwapOutlined as ASwapOutlined } from '@ant-design/icons/lib'
import styled, { css } from 'styled-components'
import { palette } from 'styled-theme'

import { media } from '../../helpers/styleHelper'
import { transition } from '../../settings/style-util'
import { Tabs as TabsUI } from '../tabs/Tabs'
import { AssetSelect as AssetSelectUI } from '../uielements/assets/assetSelect'
import { Label as UILabel } from '../uielements/label'

const ICON_SIZE = 16

export const AddressCustomRecipient = styled.div`
  display: flex;
  flex-direction: row;
  font-size: 16px;
  text-transform: uppercase;
  font-family: 'MainFontRegular';
  color: ${palette('text', 1)};
  max-width: 100%;
  margin-right: 5px;
  overflow: hidden;
  &:only-child {
    margin: auto;
  }
  & svg {
    height: ${ICON_SIZE}px;
    width: ${ICON_SIZE}px;
  }
`

export const Tabs = styled(TabsUI)`
  padding-top: 0;
  height: 100%;
  width: 100%;
  .ant-tabs {
    &-nav {
      &:before {
        border-bottom: 1px solid ${palette('gray', 1)};
      }
      padding: 0 10px;
      ${media.sm`
        padding: 0 50px;
    `}
    }
  }
`

export const Container = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  position: relative;
  max-width: 540px;
  width: 100%;
  margin: auto;
`

export const SwapOutlined = styled(ASwapOutlined).attrs({ rotate: 90 })<{ disabled: boolean }>`
  padding: 10px;
  color: ${palette('success', 0)};
  opacity: ${({ disabled = false }) => (disabled ? 0.5 : 1)};
  cursor: ${({ disabled = false }) => (disabled ? 'not-allowed' : 'pointer')};
  svg {
    height: 44px;
    width: 44px;
  }

  ${transition(0.5)};

  ${({ disabled }) =>
    !disabled
      ? css`
          &:hover,
          &.selected {
            box-shadow: 0 0px 15px ${palette('gray', 1)};
          }
        `
      : ''};
`

export const CurrencyInfoContainer = styled.div`
  display: none;
  position: absolute;
  top: 50px;
  bottom: 140px;
  left: 100%;
  padding-left: 15px;
  align-items: center;
  color: ${palette('gray', 1)};
  width: max-content;

  ${media.md`
    display: flex;
  `}
`

export const InValueContainer = styled.div`
  display: flex;
  flex-direction: column;
  padding: 10px 5px 5px 10px;
  width: 100%;
  border: 1px solid ${palette('gray', 0)};

  ${media.md`
    width: auto;
  `}
`

export const ValueTitle = styled(UILabel).attrs({
  color: 'gray',
  textTransform: 'uppercase'
})`
  font-family: 'MainFontRegular';
  margin-right: 10px;
  padding: 0;
  font-size: 12px;
  width: auto;
`

export const ErrorLabel = styled(UILabel)`
  margin-bottom: 14px;
  font-family: 'MainFontRegular';
  text-transform: uppercase;
  color: ${palette('error', 0)};
  text-align: center;
`

export const NoteLabel = styled(UILabel)`
  color: ${palette('text', 2)};
  text-align: center;
  text-transform: uppercase;
`

export const MinAmountLabel = styled(UILabel)`
  padding-left: 5px;
  padding-right: 5px;
  text-transform: uppercase;
  width: auto;
`

export const AssetSelect = styled(AssetSelectUI)``

export const TargetAssetSelect = styled(AssetSelect)``

export const FeeContainer = styled.div`
  width: 100%;
`

export const SubmitContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
`
