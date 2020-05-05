import React from 'react'
import { Button } from 'antd'
import { FooterWrapper } from './Footer.style'
import { useObservableState } from 'observable-hooks'
import { useThemeContext } from '../contexts/ThemeContext'

type Props = {}

const Footer: React.FC<Props> = (_: Props): JSX.Element => {
  const { toggleTheme, themeType$ } = useThemeContext()
  const themeType = useObservableState(themeType$)
  const clickHandler = () => {
    toggleTheme()
  }

  return (
    <FooterWrapper>
      Footer
      <Button type="link" size="small" onClick={clickHandler}>
        Toggle theme
      </Button>
      {themeType}
    </FooterWrapper>
  )
}

export default Footer
