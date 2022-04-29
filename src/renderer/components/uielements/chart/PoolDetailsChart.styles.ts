import { transparentize } from 'polished'
import { Line, Bar, Chart } from 'react-chartjs-2'
import styled from 'styled-components'
import { palette } from 'styled-theme'

import { media } from '../../../helpers/styleHelper'
import { ErrorView as ErrorViewUI } from '../../shared/error'

// https://www.chartjs.org/docs/latest/general/fonts.html#missing-fonts
Chart.defaults.font.size = 12
Chart.defaults.font.style = 'normal'
Chart.defaults.font.family = 'MainFontRegular'

type HeaderToggleProps = {
  primary?: boolean
}

type ChartContainerProps = {
  gradientStart: string
  gradientStop: string
}

// const MAX_HEIGHT = 312

export const ChartContainer = styled.div`
  background: transparent;
  border: 1px solid ${palette('gray', 0)};
  padding: 10px 20px;
  border-radius: 4px;
  width: 100%;
  height: 100%;
  ${media.sm`
    padding: 10px 20px;
    height: 312px;
  `}

  background-image: ${(props: ChartContainerProps) =>
    `linear-gradient(to bottom, ${transparentize(0.7, props.gradientStart)}, ${transparentize(
      1,
      props.gradientStop
    )})`};
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

export const LineChart = styled(Line).attrs({
  type: 'line'
})`
  width: 100%;
`

export const BarChart = styled(Bar).attrs({
  type: 'bar'
})`
  width: 100%;
`

export const ErrorView = styled(ErrorViewUI)`
  height: 100%;

  ${media.md`
  padding: 30px 0;
  `}
`
