import { InformationCircleIcon } from '@heroicons/react/24/outline'

import { Tooltip } from '../common/Common.styles'

export type Color = 'primary' | 'warning' | 'error' | 'neutral'

export const iconColor: Record<Color, string> = {
  primary: 'text-turquoise',
  warning: 'text-warning0 dark:text-warning0d',
  error: 'text-error0 dark:text-error0d',
  neutral: 'text-text0 dark:text-text0d'
}

export type Props = {
  tooltip: string
  color?: Color
  className?: string
}

export const InfoIcon: React.FC<Props> = ({ tooltip, color = 'primary', className = '' }) => (
  <Tooltip title={tooltip}>
    <InformationCircleIcon className={`${iconColor[color]} h-[20px] w-[20px] ${className}`} />
  </Tooltip>
)
