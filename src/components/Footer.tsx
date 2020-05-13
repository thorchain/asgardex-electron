import React, { useCallback } from 'react'
import Icon, { TwitterOutlined, GithubOutlined, BranchesOutlined } from '@ant-design/icons'
import { FooterContainer, FooterLink, FooterIconWrapper } from './Footer.style'
import { useObservableState } from 'observable-hooks'
import { useThemeContext } from '../contexts/ThemeContext'
import { ReactComponent as ThorChainIcon } from '../assets/svg/logo-thorchain.svg'
import { ReactComponent as TelegramIcon } from '../assets/svg/telegram.svg'
import { Row, Col } from 'antd'
const { shell } = window.require('electron')

type IconProps = {
  url: string
  children: React.ReactNode
  theme?: unknown
}

const FooterIcon: React.FC<IconProps> = (props: IconProps): JSX.Element => {
  const { children, url, theme } = props
  const clickHandler = useCallback(() => {
    shell.openExternal(url)
  }, [url])

  return (
    <FooterIconWrapper theme={theme} onClick={clickHandler}>
      {children}
    </FooterIconWrapper>
  )
}

type Props = {
  commitHash?: string
}

const Footer: React.FC<Props> = (props: Props): JSX.Element => {
  const { commitHash } = props
  const { theme$ } = useThemeContext()
  const theme = useObservableState(theme$)

  return (
    <FooterContainer theme={theme}>
      <Row justify="space-between" align="middle">
        <Col xs={24} md={3}>
          <FooterIcon theme={theme} url="https://thorchain.org">
            <ThorChainIcon />
          </FooterIcon>
        </Col>
        <Col xs={24} md={18}>
          <Row justify="center" align="middle">
            <FooterLink theme={theme} to="/stats">
              STATS
            </FooterLink>
            <FooterLink theme={theme} to="/network">
              NETWORK
            </FooterLink>
            <FooterLink theme={theme} to="/faqs">
              FAQS
            </FooterLink>
          </Row>
        </Col>
        <Col xs={24} md={3}>
          <Row justify="end" align="middle">
            <FooterIcon url="https://twitter.com/thorchain_org">
              <TwitterOutlined />
            </FooterIcon>
            <FooterIcon url="https://t.me/thorchain_org">
              <Icon component={TelegramIcon} />
            </FooterIcon>
            <FooterIcon url="https://github.com/thorchain">
              <GithubOutlined />
            </FooterIcon>
            {commitHash && (
              <FooterIcon url={`https://github.com/thorchain/asgardex-electron/commit/${commitHash}`}>
                <BranchesOutlined />
              </FooterIcon>
            )}
          </Row>
        </Col>
      </Row>
    </FooterContainer>
  )
}

export default Footer
