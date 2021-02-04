import * as Styled from './PoolShares.styles'

export const StakeInfo: React.FC<{ goToStakeInfo: () => void }> = ({ goToStakeInfo }) => (
  <>
    <Styled.InfoButton onClick={goToStakeInfo}>
      <Styled.TextLabel>Analytics</Styled.TextLabel> <Styled.InfoArrow />
    </Styled.InfoButton>
    <Styled.InfoDescription>RUNESTAKE.INFO</Styled.InfoDescription>
  </>
)
