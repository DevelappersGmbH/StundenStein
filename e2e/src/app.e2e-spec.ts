import { AppPage } from './app.po';

describe('workspace-project App', () => {
  let page: AppPage;

  beforeEach(() => {
    page = new AppPage();
  });

  it('should display welcome message', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('Welcome to StundenStein!');
  });

  it('should make issue input clickable depending on the mode', () => {
    page.navigateTo();
    page.getTLEditBtn().click();
    page.getTLIssue().click()
      .then(
        function () {
        },
        function () {
          throw new Error('Issue input must be clickable!');
        }
      );

    page.getTLEditBtn().click();
    page.getTLIssue().click()
      .then(
        function () {
          throw new Error('Issue input must be NOT clickable!');
        },
        function () {
        }
      );
  });

// + 5 tests for getTLComment, getTLProject, getTLBillBtn, getTLStartTime, getTLEndTime

  it('should make play button clickable depending on the mode', () => {
    page.navigateTo();
    page.getTLEditBtn().click();
    page.getTLIssue().click()
      .then(
        function () {
          throw new Error('Play button must be NOT clickable!');
        },
        function () {
        }
      );

    page.getTLEditBtn().click();
    page.getTLIssue().click()
      .then(
        function () {
        },
        function () {
          throw new Error('Play button must be clickable!');
        }
      );
  });

  // + 1 test getTLDelBtn

});


