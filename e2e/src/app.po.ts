import { browser, by, element } from 'protractor';

export class AppPage {
  navigateTo() {
    return browser.get('/');
  }

  getParagraphText() {
    return element(by.css('app-root h1')).getText();
  }

  /*getTLIssue() {
    return element(by.id('issue'));
  }

  getTLComment() {
    return element(by.id('comment'));
  }

  getTLProject() {
    return element(by.id('project'));
  }

  getTLPlayBtn() {
    return element(by.id('btnPlay'));
  }

  getTLBillBtn() {
    return element(by.id('btnBill'));
  }

  getTLStartTime() {
    return element(by.id('startTime'));
  }

  getTLEndTime() {
    return element(by.id('endTime'));
  }

  getTLTrackedTime() {
    return element(by.id('trackedTime'));
  }

  getTLEditBtn() {
    return element(by.id('btnEdit'));
  }

  getTLDelBtn() {
    return element(by.id('btnDel'));
  }
  */
}
