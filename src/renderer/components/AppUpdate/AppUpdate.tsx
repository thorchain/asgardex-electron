import React, { useMemo } from 'react'

import { Grid } from 'antd'
import { useIntl } from 'react-intl'

import * as Styled from './AppUpdate.styles'

export type AppUpdateModalProps =
  | {
      isOpen: true
      goToUpdates: () => void
      version: string
      close: () => void
    }
  | {
      isOpen: false
    }

export const AppUpdate: React.FC<AppUpdateModalProps> = (props) => {
  const intl = useIntl()
  const isDesktopView = Grid.useBreakpoint()?.lg ?? false

  const okContent = useMemo(
    () => (
      <Styled.OkContent>
        {intl.formatMessage({ id: 'update.link' })} <Styled.ExternalLinkIcon />
      </Styled.OkContent>
    ),
    [intl]
  )

  return props.isOpen ? (
    <Styled.Alert
      action={isDesktopView ? <Styled.OkButton onClick={props.goToUpdates}>{okContent}</Styled.OkButton> : null}
      message={
        <Styled.Content>
          <Styled.Title>{intl.formatMessage({ id: 'update.description' }, { version: props.version })}</Styled.Title>
          {!isDesktopView && <Styled.OkButton onClick={props.goToUpdates}>{okContent}</Styled.OkButton>}
        </Styled.Content>
      }
      onClose={props.close}
      closable
    />
  ) : null
}
