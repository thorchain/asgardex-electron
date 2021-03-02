import React from 'react'

import { boolean } from '@storybook/addon-knobs'
import { storiesOf } from '@storybook/react'

import { Locale } from '../../../../shared/i18n/types'
import { HeaderLang } from './index'

storiesOf('Components/HeaderLang', module).add('desktop / mobile', () => {
  const isDesktopView = boolean('isDesktopView', false)
  return <HeaderLang isDesktopView={isDesktopView} locale={Locale.EN} />
})
