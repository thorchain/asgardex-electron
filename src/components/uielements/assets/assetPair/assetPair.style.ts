import styled from 'styled-components'

export const AssetPairWrapper = styled.div`
  display: flex;
  justify-content: center;

  .asset-data {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    padding-top: 3px;

    &:last-child {
      margin-left: -6px;
    }
  }
`
