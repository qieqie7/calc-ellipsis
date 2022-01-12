import path from 'path';
import puppeteer, { Browser, Page } from 'puppeteer';

describe('e2e', () => {
    let browser: Browser; // 浏览器实例
    let page: Page; // 页面实例
    
    beforeAll(async () => {
        // NOTE: 裂开，headless 设置成 false 测试用例有的跑不过去
        browser = await puppeteer.launch({headless: false});
        page = await browser.newPage();
        await page.goto(`file://${path.resolve(__dirname, 'index.html')}`);
    });

    it('最大3行，实际2行，有标签', async () => {
        const btnDom = await page.$('#demo1 .testBtn');
        await btnDom?.click();

        await expect(page.$eval('#demo1 .demo .text', dom => dom.innerHTML)).resolves.toMatch('这是一段只要两行的测试文案');
    });

    it('超过3行，有标签', async () => {
        const btnDom = await page.$('#demo2 .testBtn');
        await btnDom?.click();
        await expect(page.$eval('#demo2 .demo .text', dom => dom.innerHTML)).resolves.toMatch(
            '这是一段明显超出了很多字的测试文案已经超过了很多很多很多了，...',
        );
    });

    it('超过3行，纯英文，有标签', async () => {
        const btnDom = await page.$('#demo3 .testBtn');
        await btnDom?.click();
        await expect(page.$eval('#demo3 .demo .text', (dom: any) => dom.innerHTML)).resolves.toMatch(
            'hello hello hello hello hello hello hello hello hello hello hello h...',
        );
    });

    it('超过3行，无标签', async () => {
        const btnDom = await page.$('#demo4 .testBtn');
        await btnDom?.click();
        await expect(page.$eval('#demo4 .demo .text', (dom: any) => dom.innerHTML)).resolves.toMatch(
            'hello hello hello hello hello hello hello hello hello hello hello hello...',
        );
    });

    it('头部有标签，超过3行，无标签', async () => {
        const btnDom = await page.$('#demo5 .testBtn');
        await btnDom?.click();
        await expect(page.$eval('#demo5 .demo .text', (dom: any) => dom.innerHTML)).resolves.toMatch(
            'hello hello hello hello hello hello hello hello hello hello hello...',
        );
    });

    afterAll(async () => {
        await browser.close();
    });
});

export {};
