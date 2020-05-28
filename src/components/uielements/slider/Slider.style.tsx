import { Slider } from 'antd'
import styled from 'styled-components'
import { palette } from 'styled-theme'

export const SliderWrapper = styled(Slider)`
  &.ant-slider {
    margin-left: 0px;
    margin-right: 0px;
    margin-bottom: 10px;

    .ant-slider-rail {
      height: 4px;
      background: ${palette('gray', 1)};
    }

    .ant-slider-track {
      background: ${palette('gradient', 0)};
    }

    .ant-slider-handle {
      width: 14px;
      height: 14px;
      margin-top: -6px;
      margin-left: -6px;
      border: 3px solid ${palette('success', 0)};
      background: ${palette('background', 1)};
    }

    .ant-slider-dot {
      display: none;
    }

    &:hover {
      .ant-slider-track {
        background: ${palette('primary', 0)};
      }
    }
  }
`

export const SliderLabel = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 12px;
  color: ${palette('text', 0)};
`
