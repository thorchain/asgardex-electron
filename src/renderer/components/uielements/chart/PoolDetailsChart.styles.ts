import { Chart as ChartJS } from 'chart.js'
import styled from 'styled-components'
import { palette } from 'styled-theme'

import { media } from '../../../helpers/styleHelper'
import { ErrorView as ErrorViewUI } from '../../shared/error'

// https://www.chartjs.org/docs/latest/general/fonts.html#missing-fonts
ChartJS.defaults.font.size = 12
ChartJS.defaults.font.style = 'normal'
ChartJS.defaults.font.family = 'MainFontRegular'

type HeaderToggleProps = {
  primary?: boolean
}

export const ChartContainer = styled.div`
  background: ${palette('background', 0)};
  padding: 10px 20px;
  border-radius: 4px;
  width: 100%;
  height: 100%;
  ${media.sm`
    padding: 10px 20px;
    height: 312px;
  `}
`

export const ChartHeaderType = styled.div`
  display: flex;
  align-items: center;
`

export const ChartHeaderItem = styled.div`
  margin-right: 20px;
  &:last-child {
    margin-right: 0px;
  }
`

export const HeaderContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
`

export const TypeContainer = styled.div`
  display: flex;
  align-items: center;
  & > * {
    margin-right: 20px;
  }
`

export const TimeContainer = styled.div`
  display: flex;
  align-items: center;
  & > * {
    margin-right: 20px;
  }
`

export const HeaderToggle = styled.span`
  color: ${palette('text', 0)};
  font-size: 14px !important;
  text-transform: uppercase;
  font-weight: ${(props: HeaderToggleProps) => (props.primary ? '600' : 'normal')};
  cursor: pointer;
  ${media.sm`
    font-size: 18px;
    &:hover {
      opacity: 0.8;
    }
  `}
`

export const ChartWrapper = styled.div`
  margin-top: 10px;
  position: relative;
  width: calc(100% - 10px);
  height: calc(100% - 40px);
  min-height: 200px;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  align-items: center;
`

export const ErrorView = styled(ErrorViewUI)`
  height: 100%;

  padding: 0;
`
