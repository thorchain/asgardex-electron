import React from 'react'
import { Link } from 'react-router-dom'
import Icon, { TwitterOutlined, GithubOutlined, BranchesOutlined } from '@ant-design/icons'
import { FooterWrapper, FooterContainer, FooterItem } from './Footer.style'
import { useObservableState } from 'observable-hooks'
import { useThemeContext } from '../contexts/ThemeContext'
import TelegramIcon from './shared/icons/Telegram'
import { ReactComponent as ThorChainIcon } from '../assets/svg/logo-thorchain.svg'

type Props = {
  commitHash?: string
}

const Footer: React.FC<Props> = (props: Props): JSX.Element => {
  const { commitHash } = props
  const { theme$ } = useThemeContext()
  const theme = useObservableState(theme$)

  return (
    <FooterContainer theme={theme}>
      <FooterWrapper>
        <FooterItem>
          <a href="https://thorchain.org" target="_blank" rel="noopener noreferrer">
            <ThorChainIcon />
          </a>
        </FooterItem>
        <FooterItem>
          <div className="footer-links-bar">
            <Link to="/stats">STATS</Link>
            <Link to="/network">NETWORK</Link>
            <Link to="/faqs">FAQS</Link>
          </div>
        </FooterItem>
        <FooterItem>
          <div className="footer-social-bar">
            <a href="https://twitter.com/thorchain_org" target="_blank" rel="noopener noreferrer">
              <TwitterOutlined />
            </a>
            <a href="https://t.me/thorchain_org" target="_blank" rel="noopener noreferrer">
              <Icon component={TelegramIcon} />
            </a>
            <a href="https://github.com/thorchain" target="_blank" rel="noopener noreferrer">
              <GithubOutlined />
            </a>
            {commitHash && (
              <a
                href={`https://gitlab.com/thorchain/bepswap/bepswap-web-ui/-/commit/${commitHash}`}
                target="_blank"
                rel="noopener noreferrer">
                <BranchesOutlined />
              </a>
            )}
          </div>
        </FooterItem>
      </FooterWrapper>
    </FooterContainer>
  )
}

export default Footer
