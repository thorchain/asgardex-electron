import { css, SimpleInterpolation, FlattenSimpleInterpolation } from 'styled-components'

type MediaKey = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'xxl'

type MediaQueries = {
  [key in MediaKey]: string
}

// Ant design uses breakpoints similar to Bootstrap
// https://ant.design/components/grid/#Col
// https://getbootstrap.com/docs/4.0/layout/overview/#responsive-breakpoints
// and we do the same here
const mediaQueries: MediaQueries = {
  xs: '(min-width: 0px)',
  sm: '(min-width: 576px)',
  md: '(min-width: 768px)',
  lg: '(min-width: 992px)',
  xl: '(min-width: 1200px)',
  xxl: '(min-width: 1600px)'
}

type Media = {
  [key in MediaKey]: (
    styles: TemplateStringsArray,
    ...interpolations: SimpleInterpolation[]
  ) => FlattenSimpleInterpolation
}

/**
 * Helper to provide media queries for any breakpoint we have defined in `MediaQueries`
 */
export const media: Media = Object.keys(mediaQueries).reduce((acc, segment) => {
  // Tagged template to create media queries
  const styledMediaFunction = (styles: TemplateStringsArray, ...interpolations: SimpleInterpolation[]) => css`
    @media ${mediaQueries[segment as MediaKey]} {
      ${css(styles, interpolations)}
    }
  `
  return {
    ...acc,
    [segment]: styledMediaFunction
  }
}, {} as Media)

type ZIndexKey = 'footer' | 'header'
type ZIndexMap = {
  [key in ZIndexKey]: number
}
export const Z_INDEX_MAP: ZIndexMap = {
  header: 1001,
  footer: 1000
}
