import { useMemo } from 'react'

import { Asset, assetToString } from '@xchainjs/xchain-util'
import * as FP from 'fp-ts/lib/function'
import * as O from 'fp-ts/lib/Option'
import { useIntl } from 'react-intl'
import { useParams } from 'react-router-dom'

import { ErrorView } from '../../components/shared/error'
import { BackLinkButton } from '../../components/uielements/button'
import { getAssetFromNullableString } from '../../helpers/assetHelper'
import { SaversRouteParams } from '../../routes/pools/savers'

type Props = { asset: Asset }

const Content: React.FC<Props> = ({ asset }): JSX.Element => {
  const { chain } = asset

  return (
    <>
      <BackLinkButton />
      <h1>Savers View</h1>
      <div>chain: {chain}</div>
      <div>asset: {assetToString(asset)}</div>
    </>
  )
}

export const SaversView: React.FC = (): JSX.Element => {
  const { asset } = useParams<SaversRouteParams>()
  const oAsset: O.Option<Asset> = useMemo(() => getAssetFromNullableString(asset), [asset])

  const intl = useIntl()

  return FP.pipe(
    oAsset,
    O.fold(
      () => (
        <ErrorView
          title={intl.formatMessage(
            { id: 'routes.invalid.params' },
            {
              params: `asset: ${asset}`
            }
          )}
        />
      ),
      (asset) => <Content asset={asset} />
    )
  )
}
