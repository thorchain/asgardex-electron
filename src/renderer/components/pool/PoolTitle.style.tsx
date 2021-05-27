import * as A from 'antd'
import styled from 'styled-components'
import { palette } from 'styled-theme'

import { media } from '../../helpers/styleHelper'
import { Label } from '../uielements/label'

export const Container = styled(A.Row)`
  justify-content: space-between;
  flex-flow: row;
  width: 100%;
  padding: 20px 0 10px 0;
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
  padding-left: 15px;
  ${media.lg`
    font-size: 49px;
    padding-left: 40px;
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
  margin-left: 10px;
  flex-direction: column;
  width: 100%;
  max-width: 100%;
  overflow: hidden;

  ${media.lg`
    width: auto;
  `}
`

export const AssetTitle = styled.p`
  margin-bottom: 0;
  font-size: 17px;
  line-height: 24px;
  font-family: 'MainFontRegular';
  color: ${palette('text', 0)};
  text-transform: uppercase;
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

  ${media.lg`
  font-size: 13px;
  `}
`
