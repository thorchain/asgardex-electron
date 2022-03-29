import { Col, Row } from 'antd'
import styled from 'styled-components'
import { palette } from 'styled-theme'

import { media } from '../../helpers/styleHelper'
import { Tabs as TabsUI } from '../tabs/Tabs'
import { Button } from '../uielements/button'

export const Container = styled('div')`
  flex: 1;
  width: 100%;
  display: flex;
  flex-direction: column;
`

export const ContentContainer = styled(Row)`
  width: 100%;
  min-height: 100%;
`

export const ShareContentCol = styled(Col).attrs({})`
  margin-top: 20px;
  padding-left: 0px;
  min-height: auto;

  ${media.xl`
    padding-left: 20px;
    margin-top: 0px;
    min-height: 100%;
  `};
`

export const ShareContentWrapper = styled.div<{ alignTop: boolean }>`
  background: ${palette('background', 0)};
  /* min-height for spin loader + empty data icons  */
  min-height: 300px;
  display: flex;
  justify-content: center;
  align-items: ${({ alignTop }) => (alignTop ? 'baseline' : 'center')};
  ${media.xl`
      min-height: 100%;
  `};
`

export const DepositContentCol = styled(Col)`
  background: ${palette('background', 0)};
  min-height: auto;
  ${media.xl`
      min-height: 100%;
  `};
`

export const Tabs = styled(TabsUI)`
  padding-top: 0;
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

export const AdvancedButton = styled(Button)`
  position: relative;

  &.ant-btn {
    padding: 0 9px;
    min-width: auto;
  }

  &:after {
    content: '';
    display: block;
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    height: 5px;
    width: 5px;
    background: currentColor;
    border-radius: 50%;
  }

  ${media.sm`
    &:after {
      display: none;
    }
  `}

  span {
    display: none;

    ${media.sm`
      display: inline-block;
    `}
  }
`

export const AddWalletContainer = styled('div')`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
`
