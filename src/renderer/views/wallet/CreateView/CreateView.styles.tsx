import styled from 'styled-components'

export const Container = styled('div')`
  flex: 1;

  // Need this one to make tabs content to be at least 100% height
  // This is safely 'cause we are not gonna use any additional nested tabs
  .ant-tabs-content {
    flex: 1;
    &-holder {
      display: flex;
    }
  }
`
