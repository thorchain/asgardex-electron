import React from 'react'
import { FooterWrapper } from './Footer.style'
import { useObservableState } from 'observable-hooks'
import { useThemeContext } from '../contexts/ThemeContext'

type Props = {}

const Footer: React.FC<Props> = (): JSX.Element => {
  const { theme$ } = useThemeContext()
  const theme = useObservableState(theme$)

  return <FooterWrapper theme={theme}>Footer</FooterWrapper>
}

export default Footer
