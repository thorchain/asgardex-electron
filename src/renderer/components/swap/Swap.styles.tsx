import { SwapOutlined as ASwapOutlined } from '@ant-design/icons/lib'
import styled from 'styled-components'
import { palette } from 'styled-theme'

import { media } from '../../helpers/styleHelper'
import AssetInputBase from '../uielements/assets/assetInput'

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
  align-items: center;
  width: 100%;
  
  &.valueItemContainer {
    &-out {
      margin-bottom: 10px;
    }
    
    &-percent {
      margin-bottom: 50px;
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

export const AssetInput = styled(AssetInputBase)`
  & .ant-input {
    border: none;
  }
`
