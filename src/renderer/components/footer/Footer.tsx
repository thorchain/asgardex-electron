import React, { useCallback } from 'react'

import Icon, { TwitterOutlined, GithubOutlined, BranchesOutlined, BugOutlined } from '@ant-design/icons'
import { Row, Col, Grid } from 'antd'
import { useHistory } from 'react-router-dom'

import { ExternalUrl } from '../../../shared/const'
import { ReactComponent as TelegramIcon } from '../../assets/svg/icon-telegram.svg'
import { ReactComponent as ThorChainIcon } from '../../assets/svg/logo-thorchain.svg'
import * as playgroundRoutes from '../../routes/playground'
import { FooterContainer, FooterIconWrapper } from './Footer.style'

type IconProps = {
  url: string
  children: React.ReactNode
  onClick: (url: string) => void
}

const FooterIcon: React.FC<IconProps> = (props: IconProps): JSX.Element => {
  const { children, url, onClick } = props

  const clickHandler = useCallback(() => {
    onClick(url)
  }, [url, onClick])

  return <FooterIconWrapper onClick={clickHandler}>{children}</FooterIconWrapper>
}

type Props = {
  commitHash?: string
  isDev: boolean
}

export const Footer: React.FC<Props> = (props): JSX.Element => {
  const { commitHash, isDev } = props

  const history = useHistory()
  const screens = Grid.useBreakpoint()

  const gotoPlayground = useCallback(() => history.push(playgroundRoutes.base.path()), [history])

  const clickIconHandler = useCallback((url: string) => {
    window.apiUrl.openExternal(url)
  }, [])

  return (
    <FooterContainer>
      <Row justify="space-between" align="middle">
        <Col span={24} md={4}>
          <Row justify={screens.md ? 'start' : 'center'}>
            <FooterIcon url={ExternalUrl.WEBSITE} onClick={clickIconHandler}>
              <ThorChainIcon />
            </FooterIcon>
          </Row>
        </Col>
        <Col span={24} md={14}>
          {/* Disable buttons temporarily for the release (https://github.com/thorchain/asgardex-electron/pull/777) */}
          {/* <FooterLinkWrapper justify="center">
            <FooterLink to="/stats">{intl.formatMessage({ id: 'common.stats' })}</FooterLink>
            <FooterLink to="/network">{intl.formatMessage({ id: 'common.network' })}</FooterLink>
            <FooterLink to="/faqs">{intl.formatMessage({ id: 'common.faqs' })}</FooterLink>
          </FooterLinkWrapper> */}
        </Col>
        <Col span={24} md={6}>
          <Row justify={screens.md ? 'end' : 'center'}>
            <FooterIcon url={ExternalUrl.TWITTER} onClick={clickIconHandler}>
              <TwitterOutlined />
            </FooterIcon>
            <FooterIcon url={ExternalUrl.TELEGRAM} onClick={clickIconHandler}>
              <Icon component={TelegramIcon} />
            </FooterIcon>
            <FooterIcon url={ExternalUrl.GITHUB} onClick={clickIconHandler}>
              <GithubOutlined />
            </FooterIcon>
            {commitHash && (
              <FooterIcon url={`${ExternalUrl.GITHUB_REPO}/commit/${commitHash}`} onClick={clickIconHandler}>
                <BranchesOutlined />
              </FooterIcon>
            )}
            {/* Just for debugging - is hidden in production build */}
            {isDev && (
              <FooterIconWrapper onClick={gotoPlayground}>
                <BugOutlined />
              </FooterIconWrapper>
            )}
          </Row>
        </Col>
      </Row>
    </FooterContainer>
  )
}
