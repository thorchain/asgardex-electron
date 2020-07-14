import { css } from 'styled-components'

import { media } from './styleHelper'

describe('helpers/styleHelpers', () => {
  describe('media', () => {
    it('adds media query for xs', () => {
      const result = css`
        ${media.xs`display: block`}
      `
      expect(result).toEqual(expect.arrayContaining(['(min-width: 0px)', 'display: block']))
    })
    it('adds media query for sm', () => {
      const result = css`
        ${media.sm`display: block`}
      `
      expect(result).toEqual(expect.arrayContaining(['(min-width: 576px)', 'display: block']))
    })
    it('adds media query for md', () => {
      const result = css`
        ${media.md`display: block`}
      `
      expect(result).toEqual(expect.arrayContaining(['(min-width: 768px)', 'display: block']))
    })
    it('adds media query for lg', () => {
      const result = css`
        ${media.lg`display: block`}
      `
      expect(result).toEqual(expect.arrayContaining(['(min-width: 992px)', 'display: block']))
    })
    it('adds media query for xl', () => {
      const result = css`
        ${media.xl`display: block`}
      `
      expect(result).toEqual(expect.arrayContaining(['(min-width: 1200px)', 'display: block']))
    })
    it('adds media query for xxl', () => {
      const result = css`
        ${media.xxl`display: block`}
      `
      expect(result).toEqual(expect.arrayContaining(['(min-width: 1600px)', 'display: block']))
    })
  })
})
