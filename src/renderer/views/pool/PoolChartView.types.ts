import * as O from 'fp-ts/lib/Option'

import { ChartDataType, ChartDetails, ChartTimeFrame } from '../../components/uielements/chart/PoolDetailsChart.types'

export type CachedChartData = Record<ChartDataType, Record<ChartTimeFrame, O.Option<ChartDetails>>>
