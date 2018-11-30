module.exports = function() {
  this.Given(/^I should see the page title to contain "([^"]*)"$/, {timeout: process.env.StepTimeoutInMS}, function (keyword) {
    expect(browser.getTitle().toLowerCase()).toContain(keyword);
  });
};
