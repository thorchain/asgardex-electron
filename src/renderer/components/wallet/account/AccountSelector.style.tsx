import * as A from 'antd'
import styled from 'styled-components'
import { palette } from 'styled-theme'

import { Label as UILabel } from '../../uielements/label'

export const Card = styled(A.Card)`
  background: ${palette('background', 1)};
  .ant-card-body {
    padding: 20px 35px;
  }
`

export const AssetWrapper = styled.div`
  display: flex;
`

export const AssetInfoWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-between;
  margin-left: 16px;
`

export const AssetTitle = styled.p`
  margin-bottom: 0px;
  font-size: 24px;
  font-family: 'MainFontRegular';
  color: ${palette('text', 0)};
  text-transform: uppercase;
`

export const Label = styled(UILabel).attrs({
  textTransform: 'uppercase',
  color: 'primary',
  size: 'big'
})`
  padding-top: 0;
`
