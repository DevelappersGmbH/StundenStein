import { browser, by, element } from 'protractor';

export class AppPage {
  navigateTo() {
    return browser.get('/');
  }

  getParagraphText() {
    return element(by.css('app-root h1')).getText();
  }

  getTLIssue() {
    return element(by.css('#issue'));
  }

  getTLComment() {
    return element(by.css('#comment'));
  }

  getTLProject() {
    return element(by.css('#project'));
  }

  getTLPlayBtn() {
    return element(by.css('#btnPlay'));
  }

  getTLBillBtn() {
    return element(by.css('#btnBill'));
  }

  getTLStartTime() {
    return element(by.css('#startTime'));
  }

  getTLEndTime() {
    return element(by.css('#endTime'));
  }

  getTLTrackedTime() {
    return element(by.css('#trackedTime'));
  }

  getTLEditBtn() {
    return element(by.css('#btnEdit'));
  }

  getTLDelBtn() {
    return element(by.css('#btnDel'));
  }
}
