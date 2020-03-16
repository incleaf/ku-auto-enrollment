import { chromium, devices } from "playwright";
import { IncomingWebhook } from "@slack/webhook";

require("dotenv").config();

const namesByLolNickname: Record<string, string> = {
  "저 밭 갈게요": "이현수",
  위니: "김우식",
  "부캐 ON": "이호선",
  "Kata Teacher": "이호선",
  "대리 ON": "이호선",
  "Begln Again": "이호선"
};

async function checkWhetherPlayingGame(lolNickname: string) {
  const webhook = new IncomingWebhook(process.env.WEBHOOK_URL);
  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();
  await page.goto(
    `https://www.op.gg/summoner/spectator/userName=${encodeURIComponent(
      lolNickname
    )}`
  );

  const isNotPlayingGame = await page.$eval(".SpectatorError", node =>
    node.innerHTML.includes("is not in an active game.")
  );

  if (!isNotPlayingGame) {
    const name = namesByLolNickname[lolNickname];
    webhook.send(
      `왈왈왈왈왕롤앙왈왈왈왈왈왈!!!!!! ${name}(${lolNickname}) 게임중`
    );
  }

  console.log(`${lolNickname} - isNotPlayingGame?: ${isNotPlayingGame}`);

  await browser.close();
}

(async () => {
  const nicknames = Object.keys(namesByLolNickname);
  for (let nickname of nicknames) {
    await checkWhetherPlayingGame(nickname);
  }
})();
