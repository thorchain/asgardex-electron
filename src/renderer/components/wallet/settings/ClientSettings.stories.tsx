import React from 'react'

import { Meta, Story } from '@storybook/react'
import * as FP from 'fp-ts/lib/function'
import * as O from 'fp-ts/lib/Option'

import { Locale } from '../../../../shared/i18n/types'
import { getMockRDValueFactory, RDStatus, rdStatusOptions } from '../../../../shared/mock/rdByStatus'
import { ChangeNetworkHandler, OnlineStatus } from '../../../services/app/types'
import { ClientSettings as Component } from './ClientSettings'

type StoryArgs = {
  onlineStatus: OnlineStatus
  updateDataRD: RDStatus
  checkForUpdates: FP.Lazy<void>
  goToReleasePage: (version: string) => void
  changeLocale: (locale: Locale) => void
  changeNetwork: ChangeNetworkHandler
}

const Template: Story<StoryArgs> = ({
  changeNetwork,
  updateDataRD,
  checkForUpdates,
  goToReleasePage,
  changeLocale
}) => {
  const appUpdateState = getMockRDValueFactory<Error, O.Option<string>>(
    () => O.some('2.0.0'),
    () => Error('Error while checking for updates ')
  )(updateDataRD)

  return (
    <Component
      version={'1.0.0'}
      network="testnet"
      changeNetwork={changeNetwork}
      appUpdateState={appUpdateState}
      checkForUpdates={checkForUpdates}
      goToReleasePage={goToReleasePage}
      locale={Locale.EN}
      changeLocale={changeLocale}
    />
  )
}

export const Default = Template.bind({})
Default.args = { onlineStatus: OnlineStatus.ON, updateDataRD: 'initial' }

const meta: Meta<StoryArgs> = {
  component: Component,
  title: 'Components/ClientSettings',
  argTypes: {
    updateDataRD: {
      control: {
        type: 'select',
        options: rdStatusOptions
      }
    },
    changeNetwor: {
      action: 'changeNetwor'
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
