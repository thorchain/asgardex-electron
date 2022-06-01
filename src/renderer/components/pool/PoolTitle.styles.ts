import * as AI from '@ant-design/icons'
import * as A from 'antd'
import styled, { css } from 'styled-components'
import { palette } from 'styled-theme'

import { media } from '../../helpers/styleHelper'
import { Label } from '../uielements/label'

export const Container = styled(A.Row)`
  justify-content: space-between;
  flex-flow: row;
  width: 100%;
  margin-top: 20px;
`

export const Price = styled(Label)`
  display: flex;
  width: fit-content;
  place-items: center;
  text-transform: uppercase;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  font-size: 27px;
  padding: 0;
  margin-left: 15px;
  ${media.lg`
    font-size: 49px;
    margin-left: 40px;
  `}
`

export const RowItem = styled(A.Col)`
  display: flex;
  flex-direction: row;
  width: fit-content;
  justify-content: center;
  align-items: center;
`

export const ButtonActions = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  > :not(:first-child) {
    margin-left: 10px;
  }
`

export const TitleContainer = styled.div`
  display: flex;
  flex-direction: row;
  padding: 10px 0;
`

export const AssetWrapper = styled.div`
  margin-left: 25px;
  flex-direction: column;
  width: 100%;
  max-width: 100%;
  overflow: hidden;

  ${media.md`
  margin-left: 35px;
  `}

  ${media.lg`
    width: auto;
    margin-left: 15px;
  `}
`

export const AssetTitle = styled.p`
  margin-bottom: 0;
  font-size: 17px;
  line-height: 24px;
  font-family: 'MainFontRegular';
  color: ${palette('text', 0)};
  text-transform: uppercase;

  ${media.md`
  font-size: 23px;
  line-height: 31px;
  `}

  ${media.lg`
  font-size: 27px;
  line-height: 31px;
  `}
`

export const AssetSubtitle = styled.p`
  margin-bottom: 0px;
  font-size: 9px;
  font-family: 'MainFontRegular';
  color: ${palette('text', 2)};
  text-transform: uppercase;

  ${media.md`
  font-size: 11px;
  `}

  ${media.lg`
  font-size: 13px;
  `}
`

const starStyle = css`
  margin-left: 10px;
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
