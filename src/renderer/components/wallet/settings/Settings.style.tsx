import * as A from 'antd'
import styled from 'styled-components'
import { palette } from 'styled-theme'

import { Label as UILabel } from '../../uielements/label'

export const TitleWrapper = styled.div`
  margin: 0px -8px;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: ${palette('background', 1)};
  min-height: 70px;
`

export const Title = styled(UILabel)`
  color: ${palette('text', 1)};
  padding: 0 40px;
  text-transform: uppercase;
  font-family: 'MainFontRegular';
  font-weight: 600;
  font-size: 22px;
  line-height: 22px;
`

export const Divider = styled(A.Divider)`
  margin: 0;
  border-top: 1px solid ${palette('gray', 0)};
`

export const Subtitle = styled(UILabel)`
  margin: 10px 0;
  color: ${palette('text', 0)};
  text-transform: uppercase;
  font-family: 'MainFontRegular';
  font-weight: 600;
  font-size: 18px;
`

export const Row = styled(A.Row)`
  padding: 10px 30px;
  background-color: ${palette('background', 1)};

  .ant-row {
    margin: 0;
  }
`

export const Card = styled(A.Card)`
  border-radius: 5px;
  background-color: ${palette('background', 1)};
  border: 1px solid ${palette('gray', 0)};
`
