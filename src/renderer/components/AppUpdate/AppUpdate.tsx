import React from 'react'

import { Grid } from 'antd'
import { useIntl } from 'react-intl'

import * as Styled from './AppUpdate.styles'

export type AppUpdateModalProps =
  | {
      isOpen: true
      type: 'success'
      goToUpdates: () => void
      version: string
      close: () => void
    }
  | {
      isOpen: true
      type: 'fail'
      close: () => void
      message: string
    }
  | {
      isOpen: false
    }

export const AppUpdate: React.FC<AppUpdateModalProps> = (props) => {
  const intl = useIntl()
  const isDesktopView = Grid.useBreakpoint()?.lg ?? false

  if (props.isOpen && props.type === 'success') {
    return (
      <Styled.Success
        action={
          isDesktopView ? (
            <Styled.OkButton onClick={props.goToUpdates}>
              <Styled.OkContent>
                {intl.formatMessage({ id: 'update.link' })} <Styled.ExternalLinkIcon />
              </Styled.OkContent>
            </Styled.OkButton>
          ) : null
        }
        message={
          <Styled.Content>
            <Styled.Title>{intl.formatMessage({ id: 'update.description' }, { version: props.version })}</Styled.Title>
            {!isDesktopView && (
              <Styled.OkButton onClick={props.goToUpdates}>
                <Styled.OkContent>
                  <Styled.ExternalLinkIcon />
                </Styled.OkContent>
              </Styled.OkButton>
            )}
          </Styled.Content>
        }
        onClose={props.close}
        closable
      />
    )
  }

  if (props.isOpen && props.type === 'fail') {
    return (
      <Styled.Error
        message={
          <Styled.Content>
            <Styled.Title>{intl.formatMessage({ id: 'update.checkFailed' }, { error: props.message })}</Styled.Title>
          </Styled.Content>
        }
        onClose={props.close}
        closable
      />
    )
  }

  return null
}
