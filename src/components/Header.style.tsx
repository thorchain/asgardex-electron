import styled from 'styled-components'
import { Layout } from 'antd'
import { palette, size } from 'styled-theme'
import { Z_INDEX_MAP } from '../helpers/styleHelper'

export const HeaderContainer = styled(Layout.Header)`
  position: fixed;
  z-index: ${Z_INDEX_MAP.header};
  height: ${size('headerHeight', '50px')};
  width: 100vw;
  background-color: ${palette('background', 0)};

  /* Make sure following id is defined in svg */
  #asgardex_logo {
    > :not(:first-child) {
      fill: ${palette('text', 1)};
    }
  }
`
