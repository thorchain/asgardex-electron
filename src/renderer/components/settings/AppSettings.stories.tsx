import { ComponentMeta } from '@storybook/react'
import * as FP from 'fp-ts/lib/function'
import * as O from 'fp-ts/lib/Option'

import { Locale } from '../../../shared/i18n/types'
import { getMockRDValueFactory, RDStatus, rdStatusOptions } from '../../../shared/mock/rdByStatus'
import { ChangeNetworkHandler, OnlineStatus } from '../../services/app/types'
import { AppSettings as Component } from './AppSettings'

type StoryArgs = {
  onlineStatus: OnlineStatus
  updateDataRD: RDStatus
  checkForUpdates: FP.Lazy<void>
  goToReleasePage: (version: string) => void
  changeLocale: (locale: Locale) => void
  changeNetwork: ChangeNetworkHandler
  collapsed: boolean
}

const Template = ({
  changeNetwork,
  updateDataRD,
  checkForUpdates,
  goToReleasePage,
  changeLocale,
  collapsed
}: StoryArgs) => {
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
      collapsed={collapsed}
      toggleCollapse={() => console.log('toggle')}
    />
  )
}

export const Default = Template.bind({})

const meta: ComponentMeta<typeof Template> = {
  component: Template,
  title: 'Components/AppSettings',
  argTypes: {
    updateDataRD: {
      control: {
        type: 'select',
        options: rdStatusOptions
      }
    },
    changeNetwork: {
      action: 'changeNetwork'
    },
    checkForUpdates: {
      action: 'checkForUpdates'
    },
    goToReleasePage: {
      action: 'goToReleasePage'
    }
  },
  args: { onlineStatus: OnlineStatus.ON, updateDataRD: 'initial', collapsed: false }
}

export default meta
