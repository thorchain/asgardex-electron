import styled from 'styled-components'
import { palette, size, key } from 'styled-theme'
import { Layout } from 'antd'
import { media } from '../helpers/styleHelper'

export const FooterItem = styled.div`
  .footer-logo {
    #Thorchain_logo-copy {
      > :not(:first-child) {
        fill: ${palette('text', 1)};
      }
    }
  }
`

export const FooterContainer = styled(Layout.Footer)`
  padding: 0;

  ${media.xl`
    padding: 24px 0px;
    margin-top: 40px;
  `}
`

export const FooterWrapper = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-direction: column;
  width: 100vw;
  padding: 40px 20px;

  > ${FooterItem} {
    margin-bottom: 20px;
  }

  ${media.sm`
    > ${FooterItem} {
      margin-bottom: 0;
    }
    flex-direction: row;
    position: fixed;
    bottom: 0;
    z-index: 1000;
    height: ${size('footerHeight', '50px')};
    padding: 0 30px;
  `}

  background-color: ${palette('background', 0)};

  /* TODO: Refactor these to avoid using classnames */
  .footer-logo {
    cursor: pointer;
    img {
      height: 30px;
    }
  }

  .footer-links-bar {
    display: flex;
    justify-content: space-between;
    align-items: center;


    a {
      font-size: ${key('sizes.font.normal', '12px')};
      font-weight: bold;
      color: ${palette('text', 1)};
      letter-spacing: 1px;
      cursor: pointer;
      padding-left: 50px;
    }
    a:first-child {
      padding-left: 0;
    }
  }
  .footer-social-bar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 200px;

    a {
      font-size: 18px;
      color: ${palette('text', 1)};
      cursor: pointer;
    }
  }
`
