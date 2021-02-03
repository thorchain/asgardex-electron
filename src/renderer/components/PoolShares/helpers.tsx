import * as Styled from './PoolShares.styles'

export const StakeInfo: React.FC<{ goToStakeInfo: () => void }> = ({ goToStakeInfo }) => (
  <Styled.InfoButton onClick={goToStakeInfo}>
    <Styled.TextLabel>Analytics</Styled.TextLabel> <Styled.InfoArrow />
  </Styled.InfoButton>
)

export const DataInfo: React.FC<{ goToDataInfo: () => void }> = ({ goToDataInfo }) => (
  <Styled.InfoButton onClick={goToDataInfo}>
    <Styled.TextLabel>Data</Styled.TextLabel> <Styled.InfoArrow />
  </Styled.InfoButton>
)
