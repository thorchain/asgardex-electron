import * as A from 'antd'
import Text from 'antd/lib/typography/Text'
import styled from 'styled-components'
import { palette } from 'styled-theme'

export const Wrapper = styled(A.Row)``

export const Container = styled.div<{ clickable: boolean }>`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 3px 10px;
  background: ${palette('gray', 0)};
  border-radius: 10px;
  margin-right: 10px;
  min-width: 90px;

  cursor: ${({ clickable }) => (clickable ? 'pointer' : 'not-allowed')};

  &::last-child {
    margin-right: 0;
  }
`

export const Label = styled(Text)<{ loading: boolean }>`
  text-transform: uppercase;
  font-family: 'MainFontBold';
  font-size: 12px;
  line-height: 14px;
  color: ${({ loading }) => (loading ? palette('gray', 2) : palette('text', 2))};
  width: auto;
  padding: 0;
  margin: 0;
  margin-right: 5px;
`

export const Title = styled(Text)`
  text-transform: uppercase;
  font-family: 'MainFontRegular';
  font-size: 9px;
  line-height: 12px;
  color: ${palette('text', 2)};
  width: auto;
  padding: 0;
`
