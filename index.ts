import { chromium, Page } from "playwright";
import { IncomingWebhook } from "@slack/webhook";

require("dotenv").config();

async function autoEnrollment() {
  const webhook = new IncomingWebhook(process.env.WEBHOOK_URL);
  const browser = await chromium.launch({
    devtools: process.env.NODE_ENV !== "production"
  });
  const context = await browser.newContext();
  const page = await context.newPage();
  await page.goto("https://kupis.konkuk.ac.kr/sugang/login/loginTop.jsp");

  const userNameInput = await page.waitForSelector("[name=stdNo]");
  await userNameInput?.type(process.env.USERNAME!);

  const passwordInput = await page.$("[name=pwd]");
  await passwordInput?.type(process.env.PASSWORD!);

  page.evaluate(() => (window as any).Login());
  page.on("popup", async (page: Page) => {
    if (!page.url().includes("/mainFsetNew.jsp")) {
      return;
    }
    await page.goto(
      "https://kupis.konkuk.ac.kr/sugang/acd/cour/aply/courLessinApplyReg.jsp"
    );

    let lastMessage: string | undefined = undefined;

    page.on("dialog", async dialog => {
      const message = dialog.message();
      if (lastMessage !== undefined && lastMessage !== message) {
        webhook.send(message);
      }
      log(message);
      lastMessage = message;
      await dialog.dismiss();
    });

    while (true) {
      await page.evaluate(() => window.actBasEvent("1277"));
      await wait(1000);
    }
  });
}

function wait(duration: number) {
  return new Promise(resolve => setTimeout(resolve, duration));
}

function log(message: string) {
  console.log(`[${new Date().toLocaleString()}] ${message}`);
}

declare var window: any;

autoEnrollment();
