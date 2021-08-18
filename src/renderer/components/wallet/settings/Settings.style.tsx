import * as A from 'antd'
import styled from 'styled-components'
import { palette } from 'styled-theme'

import { Label as UILabel } from '../../uielements/label'

export const Container = styled.div`
  padding: 20px 40px 30px 40px;
  background-color: ${palette('background', 1)};
`

export const Title = styled(UILabel)`
  color: ${palette('text', 1)};
  padding-bottom: 20px;
  text-transform: uppercase;
  font-family: 'MainFontRegular';
  font-weight: 600;
  font-size: 22px;
  line-height: 22px;
`

export const Subtitle = styled(UILabel)`
  margin: 10px 0;
  color: ${palette('text', 0)};
  text-transform: uppercase;
  font-family: 'MainFontRegular';
  font-weight: 600;
  font-size: 18px;
`

export const CardContainer = styled.div`
  width: 100%;
`

export const Card = styled(A.Card)`
  border-radius: 5px;
  background-color: ${palette('background', 1)};
  border: 1px solid ${palette('gray', 0)};
`
