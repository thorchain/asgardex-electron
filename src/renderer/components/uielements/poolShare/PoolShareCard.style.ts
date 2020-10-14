import styled from 'styled-components'
import { key, palette } from 'styled-theme'

import Label from '../label'

export const Wrapper = styled('div')`
  padding: ${key('sizes.gutter.vertical')};
  background: ${palette('background', 1)};
`

export const Title = styled(Label).attrs({
  textTransform: 'uppercase',
  align: 'center'
})`
  padding: ${key('sizes.gutter.vertical')};
  padding-top: 0;
  font-size: 16px;
  font-weight: 'bold';
  font-family: 'MainFontSemiBold';
`

export const Content = styled.div`
  border-radius: 2px;
  border: 1px solid ${palette('background', 2)};
`
