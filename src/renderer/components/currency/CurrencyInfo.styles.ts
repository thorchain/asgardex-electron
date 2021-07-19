import { Row } from 'antd'
import Text from 'antd/lib/typography/Text'
import styled from 'styled-components'
import { palette } from 'styled-theme'

import { ReactComponent as SlipSettingsIcon } from '../../assets/svg/icon-settings.svg'

export const Container = styled('div')`
  display: flex;
  flex-direction: column;
  justify-content: center;
  position: relative;
  height: 100%;
  border-left: 1px solid currentColor;
  padding-left: 18px;
  text-transform: uppercase;

  &:before,
  &:after {
    content: ' ';
    position: absolute;
    left: -5px;
    background-color: currentColor;
    height: 10px;
    width: 10px;
    border-radius: 50%;
  }

  &:before {
    top: -5px;
  }

  &:after {
    bottom: -5px;
  }
`

export const DropdownContentWrapper = styled(Row)`
  justify-content: space-between;
  padding-right: 0;
  align-items: center;
  width: 100%;
  cursor: pointer;
`

export const SlipLabel = styled(Text)`
  text-transform: uppercase;
  padding: 0;
  font-size: 16px;
  font-family: 'MainFontRegular';
`

export const SlipSettings = styled(SlipSettingsIcon)<{ active: true | false }>`
  & path {
    fill: ${({ active }) => (active ? palette('text', 2) : palette('gray', 2))};
  }
`
export const SlipTolerancePercent = styled(Text)<{ limit: true | false }>`
  color: ${({ limit }) => (limit ? palette('error', 0) : palette('gray', 2))};
`

export const SlipToleranceText = styled(Text)`
  color: palette('text', 2);
`
