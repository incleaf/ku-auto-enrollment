import { chromium, Page } from "playwright";
import { IncomingWebhook } from "@slack/webhook";

require("dotenv").config();

async function autoEnrollment() {
  const targetSubjects = process.env.TARGET_SUBJECTS.split(",");
  const webhook = new IncomingWebhook(process.env.WEBHOOK_URL);
  const browser = await chromium.launch({
    devtools: process.env.NODE_ENV !== "production"
  });
  try {
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

      page.on("dialog", async dialog => {
        const message = dialog.message();
        if (!message.includes("초과")) {
          webhook.send(message);
        }
        log(message);
        await dialog.dismiss();
      });

      while (true) {
        try {
          for (let subjectId of targetSubjects) {
            // const input = await page.waitForSelector("[name=strSbjtId]");
            // await input?.evaluate((e: HTMLInputElement) => (e.value = ""));
            // await wait(100);
            // await input?.type(subjectId);
            // await page.evaluate(`window.actEvent('set')`);
            // await wait(500);
            const input = await page.waitForSelector("[name=strSbjtId]");
            await input?.evaluate((e: HTMLInputElement) => (e.value = ""));
            await input?.type(subjectId);
            await page.evaluate(`window.actEvent('set')`);
            await wait(400);
          }
        } catch (e) {
          await webhook.send(`Server closed: ${e}`);
          process.exit(-1);
        }
      }
    });
  } catch (e) {
    await browser.close();
    await webhook.send(`Server closed: ${e}`);
  }
}

function wait(duration: number) {
  return new Promise(resolve => setTimeout(resolve, duration));
}

function log(message: string) {
  console.log(`[${new Date().toLocaleString()}] ${message}`);
}

declare var window: any;

autoEnrollment();
