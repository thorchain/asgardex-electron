import * as A from 'antd'
import styled from 'styled-components'
import { palette, key } from 'styled-theme'

import { media } from '../../helpers/styleHelper'
import { Label, LabelProps } from '../uielements/label'

export const Tabs = styled(A.Tabs).attrs({
  size: 'large'
})`
  min-height: 100%;
  background-color: ${palette('background', 1)};

  .ant-tabs-content-holder {
    overflow: auto;
  }

  .ant-tabs-ink-bar {
    height: 5px;
    background: ${palette('gradient', 0)};
  }

  .ant-tabs-content {
    min-height: 100%;
  }
`

export const TabLabel = styled(Label)<LabelProps & { active: boolean }>`
  color: ${({ active }) => (active ? palette('primary', 0) : palette('text', 1))};
  padding: 0;
  padding-left: 20px;
  padding-right: 20px;
  font-size: 16px;
  font-family: 'MainFontSemiBold';
  line-height: 19px;
  text-transform: uppercase;
  white-space: nowrap;
  cursor: ${({ disabled }) => (disabled ? 'not-allowed' : 'pointer')};
  &:hover {
    color: ${palette('primary', 0)};
  }
`

export const ContentWrapper = styled('div')<{ centerContent?: boolean }>`
  display: flex;
  flex-direction: column;
  justify-content: ${(props) => (props.centerContent ? 'center' : '')};
  align-items: ${(props) => (props.centerContent ? 'center' : '')};
  min-height: 100%;
  padding: ${key('sizes.gutter.vertical', '0px')};

  ${media.md`
    padding: 40px;
  `}
`
