import { Layout, Row } from 'antd'
import styled from 'styled-components'
import { palette, size } from 'styled-theme'

import { media } from '../../helpers/styleHelper'

export const Container = styled(Layout.Footer)`
  bottom: 0;
  width: 100vw;
  padding: 20px 20px;

  ${media.md`
    padding: 20px 64px;
    height: ${size('footerHeight')}px;
  `}

  background-color: ${palette('background', 0)};
`
export const IconWrapper = styled.div`
  svg {
    /* needed to be to align svg vertical middle in a row */
    display: block;
    color: ${palette('text', 1)};
  }
  display: inline;
  font-size: 18px;
  :first-child {
    color: ${palette('text', 1)};
    margin-left: 0;
  }
  color: ${palette('text', 1)};
  cursor: pointer;
  margin-left: 12px;

  /* Make sure following id is defined in svg */
  #thorchain_logo {
    > :not(:first-child) {
      fill: ${palette('text', 1)};
    }
  }
`

export const LinkWrapper = styled(Row)`
  margin: 20px 0;
`
