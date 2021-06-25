import React from 'react'

import { Meta, Story } from '@storybook/react'
import * as FP from 'fp-ts/lib/function'
import * as O from 'fp-ts/lib/Option'

import { getMockRDValueFactory, RDStatus, rdStatusOptions } from '../../../../shared/mock/rdByStatus'
import { OnlineStatus } from '../../../services/app/types'
import { ClientSettings as Component } from './ClientSettings'

type StoryArgs = {
  onlineStatus: OnlineStatus
  updateDataRD: RDStatus
  checkForUpdates: FP.Lazy<void>
  goToReleasePage: (version: string) => void
}

const Template: Story<StoryArgs> = ({ onlineStatus, updateDataRD, checkForUpdates, goToReleasePage }) => {
  const appUpdateState = getMockRDValueFactory<Error, O.Option<string>>(
    () => O.some('2.0.0'),
    () => Error('Error while checking for updates ')
  )(updateDataRD)

  return (
    <Component
      version={'1.0.0'}
      onlineStatus={onlineStatus}
      appUpdateState={appUpdateState}
      checkForUpdates={checkForUpdates}
      goToReleasePage={goToReleasePage}
    />
  )
}

export const Default = Template.bind({})
Default.args = { onlineStatus: OnlineStatus.ON, updateDataRD: 'initial' }

const meta: Meta<StoryArgs> = {
  component: Component,
  title: 'Components/ClientSettings',
  argTypes: {
    onlineStatus: {
      control: { type: 'radio', options: [OnlineStatus.OFF, OnlineStatus.ON] }
    },
    updateDataRD: {
      control: {
        type: 'select',
        options: rdStatusOptions
      }
    },
    checkForUpdates: {
      action: 'checkForUpdates'
    },
    goToReleasePage: {
      action: 'goToReleasePage'
    }
  }
}

export default meta
