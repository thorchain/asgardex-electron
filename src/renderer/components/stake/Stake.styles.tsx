import styled from 'styled-components'
import { palette } from 'styled-theme'

import { media } from '../../helpers/styleHelper'
import { Tabs as TabsBase } from '../Tabs/Tabs'
import Button from '../uielements/button'

export const Container = styled('div')`
  min-height: 100%;
  display: flex;
  flex-direction: column;
`

export const TopContainer = styled('div')`
  max-width: 100%;
  margin-bottom: 30px;
`

export const ContentContainer = styled('div')`
  display: flex;
  flex-direction: column;

  ${media.lg`
    flex-direction: row;
    flex: 1;
  `}
`

export const TotalContainer = styled('div')`
  width: 100%;
  background: green;
  margin-bottom: 30px;
  background: ${palette('background', 0)};

  ${media.lg`
    width: 50%;
    margin: 0 10px 0 0;
  `};
`

export const StakeContentContainer = styled('div')`
  width: 100%;
  background: ${palette('background', 0)};
`

export const Tabs = styled(TabsBase)`
  .ant-tabs {
    &-nav {
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
