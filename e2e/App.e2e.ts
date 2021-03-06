import { getPageTitle, assertNoConsoleErrors, pageUrl } from './helpers'

fixture`App`.page(pageUrl).afterEach(assertNoConsoleErrors)

test('title', async (t) => {
  await t.expect(getPageTitle()).eql('ASGARDEX App')
})
