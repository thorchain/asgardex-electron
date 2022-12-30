import { Slider, SliderSingleProps } from 'antd'
import styled from 'styled-components'
import { palette } from 'styled-theme'

export const SliderWrapper = styled(Slider)<SliderSingleProps & { error: boolean }>`
  color: inherit;
  margin-left: 0;
  margin-right: 0px;
  margin-bottom: 10px;
  // Default 4px plus 10px for top label
  padding-top: 14px;

  .ant {
    &-slider {
      &-rail {
        height: 2px;
        background-color: ${palette('gray', 1)} !important;
      }

      &-track {
        background-color: ${({ error }) => (error ? palette('error', 0) : palette('success', 0))} !important;
      }

      &-handle {
        width: 14px;
        height: 14px;
        margin-top: -6px;
        margin-left: -6px;
        border: 3px solid;
        border-color: ${({ error }) => (error ? palette('error', 0) : palette('success', 0))} !important;
        background-color: ${palette('background', 1)};
      }

      &-dot {
        display: none;
      }

      &-tooltip {
        padding: 0;
        color: inherit;

        .ant {
          &-tooltip {
            &-arrow {
              display: none;
            }
            &-inner {
              font-size: 14px;
              line-height: 1em;
              padding: 0;
              min-height: auto;
              background-color: transparent;
              box-shadow: none;
              color: inherit;
            }
          }
        }
      }
    }
  }

  &:hover {
    .ant-slider-track {
      background: ${({ error }) => (error ? palette('error', 0) : palette('primary', 0))};
    }
  }
`

export const SliderLabel = styled.div.attrs({ className: 'sliderLabel' })`
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-family: inherit;
  font-size: 12px;
  color: ${palette('text', 2)};
`
