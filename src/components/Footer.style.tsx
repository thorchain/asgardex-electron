import styled from 'styled-components'
import { palette, key } from 'styled-theme'
import { Layout } from 'antd'
import { media } from '../helpers/styleHelper'
import { Link } from 'react-router-dom'

export const FooterContainer = styled(Layout.Footer)`
  padding: 40px 20px;

  ${media.md`
    padding: 13px 64px;
  `}

  background-color: ${palette('background', 0)};
`
export const FooterIconWrapper = styled.div`
  display: inline;
  font-size: 18px;
  > :first-child {
    color: ${palette('text', 1)};
  }
  color: ${palette('text', 1)};
  cursor: pointer;
  margin-left: 12px;
  :first-child {
    margin-left: 0;
  }

  /* id defined in svg */
  #thorchain_logo {
    > :not(:first-child) {
      fill: ${palette('text', 1)};
    }
  }
`

export const FooterLink = styled(Link)`
  font-size: ${key('sizes.font.normal', '16px')};
  font-weight: bold;
  color: ${palette('text', 1)};
  letter-spacing: 2px;
  cursor: pointer;
  padding-left: 40px;
  :first-child {
    padding-left: 0;
  }
  display: block;
  ${media.md`
    display: inline-block;
  `}
`
