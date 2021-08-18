import React from 'react'

import { Row, Col } from 'antd'
import { useIntl } from 'react-intl'

import { Network } from '../../../../shared/api/types'
import * as Styled from './Settings.style'

type Props = {
  selectedNetwork: Network
  ClientSettingsView: React.ComponentType<{}>
}

export const Settings: React.FC<Props> = (props): JSX.Element => {
  const intl = useIntl()
  const { ClientSettingsView } = props

  return (
    <>
      <Row>
        <Col span={24}>
          <Styled.TitleWrapper>
            <Styled.Title>{intl.formatMessage({ id: 'setting.title' })}</Styled.Title>
          </Styled.TitleWrapper>
          <Styled.Divider />
        </Col>
      </Row>
      <Styled.Row>
        <Col span={24}>
          <ClientSettingsView />
        </Col>
      </Styled.Row>
    </>
  )
}
