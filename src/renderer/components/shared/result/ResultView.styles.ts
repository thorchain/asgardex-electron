import { InfoCircleOutlined } from '@ant-design/icons'
import * as A from 'antd'
import styled from 'styled-components'
import { palette } from 'styled-theme'

import { media } from '../../../helpers/styleHelper'

export const Result = styled(A.Result)`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 150px 20px;
  ${media.lg`
    padding: 50px 10px;
  `}
  background-color: ${palette('background', 1)};

  .ant-result-title {
    text-transform: uppercase;
    font-size: 17px;
    color: ${palette('text', 0)};
  }
  .ant-result-subtitle {
    text-transform: uppercase;
    color: ${palette('text', 1)};
  }
`
export const IconWrapper = styled.div`
  display: inline-block;
  width: 100px;
  height: 100px;
  border-radius: 50%;
  background: ${palette('background', 2)};
`

export const Icon = styled(InfoCircleOutlined)`
  display: flex;
  width: 100%;
  height: 100%;
  justify-content: center;
  align-items: center;
  svg {
    width: 60px;
    height: 60px;
  }
`
