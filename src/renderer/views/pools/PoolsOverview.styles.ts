import * as AI from '@ant-design/icons'
import styled, { css } from 'styled-components'
import { palette } from 'styled-theme'

import { AssetsFilter as AssetsFilterUI } from '../../components/AssetsFilter'
import { Label as UILabel } from '../../components/uielements/label'

export const TableAction = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  > :not(:first-child) {
    margin-left: 10px;
  }
`

export const BlockLeftLabel = styled(UILabel)`
  display: inline-block;
  width: 100px;
  font-size: 16px;
  text-align: right;
`

export const Label = styled(UILabel)`
  font-size: 16px;
`
export const AssetsFilter = styled(AssetsFilterUI)`
  margin-bottom: 20px;
`

export const WatchContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100%;
`

const starStyle = css`
  svg {
    fill: ${palette('primary', 0)};
    width: 20px;
    height: 20px;
  }
`

export const StarOutlined = styled(AI.StarOutlined)`
  ${starStyle}
`
export const StarFilled = styled(AI.StarFilled)`
  ${starStyle}
`
