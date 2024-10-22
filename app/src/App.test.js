const { Builder, By, Key, until } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');

describe('Media Server Frontend', () => {
  let driver;

  beforeAll(async () => {
    driver = await new Builder().forBrowser('chrome').build();
  });

  afterAll(async () => {
    await driver.quit();
  });

  it('should login and add a media item', async () => {
    await driver.get('http://localhost:3000');

    // Login
    await driver.findElement(By.css('button')).click();
    await driver.wait(until.elementLocated(By.css('form')), 5000);

    // Add media item
    await driver.findElement(By.css('input[placeholder="Title"]')).sendKeys('Test Media');
    await driver.findElement(By.css('select')).sendKeys('Video');
    await driver.findElement(By.css('input[placeholder="URL"]')).sendKeys('http://example.com/test.mp4');
    await driver.findElement(By.css('button[type="submit"]')).click();

    // Wait for the new item to appear in the list
    await driver.wait(until.elementLocated(By.xpath('//li[contains(text(), "Test Media")]')), 5000);

    const mediaItems = await driver.findElements(By.css('li'));
    expect(mediaItems.length).toBeGreaterThan(0);

    const lastItem = await mediaItems[mediaItems.length - 1].getText();
    expect(lastItem).toContain('Test Media');
    expect(lastItem).toContain('video');
  });
});
