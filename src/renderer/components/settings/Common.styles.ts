import { CaretRightOutlined } from '@ant-design/icons'
import * as A from 'antd'
import styled from 'styled-components'
import { palette } from 'styled-theme'

import { Label as UILabel } from '../uielements/label'

export const Collapse = styled(A.Collapse)`
  &.ant-collapse-icon-position-right > .ant-collapse-item > .ant-collapse-header {
    padding: 5px 0px;
  }

  &.ant-collapse-ghost > .ant-collapse-item > .ant-collapse-content > .ant-collapse-content-box {
    padding: 0;
  }

  &.ant-collapse > .ant-collapse-item > .ant-collapse-header .ant-collapse-arrow {
    right: 0px;
  }
`

export const ExpandIcon = styled(CaretRightOutlined)`
  margin-top: 0px;
  svg {
    width: 20px;
    height: 20px;
    color: ${palette('primary', 0)};
  }
`

export const Title = styled(UILabel)`
  color: ${palette('text', 1)};
  text-transform: uppercase;
  font-family: 'MainFontSemiBold';
  font-size: 22px;
  line-height: 22px;
`

export const Card = styled(A.Card)`
  border-radius: 5px;
  background-color: ${palette('background', 0)};
  border: 1px solid ${palette('gray', 0)};
`
