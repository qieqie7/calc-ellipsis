import calcDisplayText from '.';

jest.setTimeout(10000);

describe('Baidu', () => {
    beforeAll(async () => {
        await page.goto('https://www.baidu.com');
    });

    it('should be titled "Google"', async () => {
        await expect(page.title()).resolves.toMatch('百度一下，你就知道');
    });
});

