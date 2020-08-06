import { Slider } from 'antd'
import styled from 'styled-components'
import { palette } from 'styled-theme'

export const SliderWrapper = styled(Slider)`
  color: inherit;
  margin-left: 0;
  margin-right: 0px;
  margin-bottom: 10px;
  // Default 4px plus 10px for top label
  padding-top: 14px;

  .ant {
    &-slider {
      &-rail {
        height: 4px;
        background: ${palette('gray', 1)};
      }

      &-track {
        background: ${palette('gradient', 0)};
      }

      &-handle {
        width: 14px;
        height: 14px;
        margin-top: -6px;
        margin-left: -6px;
        border: 3px solid ${palette('success', 0)};
        background: ${palette('background', 1)};
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
      background: ${palette('primary', 0)};
    }
  }
`

export const SliderLabel = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 12px;
`
