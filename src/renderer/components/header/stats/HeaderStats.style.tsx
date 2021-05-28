import * as A from 'antd'
import Text from 'antd/lib/typography/Text'
import styled from 'styled-components'
import { palette } from 'styled-theme'

export const Wrapper = styled(A.Row)``

export const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 3px 7px;
  background: ${palette('gray', 0)};
  border-radius: 5px;
  margin-right: 10px;

  &::last-child {
    margin-right: 0;
  }
`

export const Label = styled(Text)`
  text-transform: uppercase;
  font-size: 12px;
  line-height: 14px;
  color: ${palette('text', 2)};
  width: auto;
  padding: 0;
  margin: 0;
`

export const SubLabel = styled(Text)`
  text-transform: uppercase;
  font-size: 9px;
  line-height: 12px;
  color: ${palette('text', 2)};
  width: auto;
  padding: 0;
`
