/* eslint jest/expect-expect: off, jest/no-test-callback: off */
import { ClientFunction, Selector } from 'testcafe';
import { getPageUrl } from './helpers';

const getPageTitle = ClientFunction(() => document.title);
const connectSelector = Selector('[data-tid="connect"]');
const clickToConnectLink = t =>
  t.click(Selector('a').withExactText('Connect Wallet'));
const getConnectText = () => connectSelector().innerText;
const assertNoConsoleErrors = async t => {
  const { error } = await t.getBrowserConsoleMessages();
  await t.expect(error).eql([]);
};

fixture`Home Page`.page('../../app/app.html').afterEach(assertNoConsoleErrors);

test('e2e', async t => {
  await t.expect(getPageTitle()).eql('ASGARDEX 0.0.1');
});

test('should open window and contain expected page title', async t => {
  await t.expect(getPageTitle()).eql('ASGARDEX 0.0.1');
});

test(
  'should not have any logs in console of main window',
  assertNoConsoleErrors
);

test('should navigate to Connect Wallet with click on the "Connect Wallet" link', async t => {
  await t
    .click('[data-tid=container] > a')
    .expect(getConnectText())
    .eql('CONNECT\nWALLET');
});

test('should navigate to /connect', async t => {
  await t
    .click('a')
    .expect(getPageUrl())
    .contains('/connect');
});

fixture`Connect Tests`
  .page('../../app/app.html')
  .beforeEach(clickToConnectLink)
  .afterEach(assertNoConsoleErrors);

test('should back to home if back button clicked', async t => {
  await t
    .click('[data-tid="backButton"] > a')
    .expect(Selector('[data-tid="container"]').visible)
    .ok();
});
