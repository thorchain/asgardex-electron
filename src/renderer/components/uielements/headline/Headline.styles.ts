import styled from 'styled-components'

import { Label } from '../label'

export const Headline = styled(Label).attrs({
  size: 'large',
  textTransform: 'uppercase',
  align: 'center'
})`
  padding: 0;
  font-family: 'MainFontBold';
`
