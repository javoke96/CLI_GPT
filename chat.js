const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
const readline = require('readline');
const ora = require('ora');
const spinner = ora({spinner: 'dots'});

puppeteer.use(StealthPlugin());
const { executablePath } = require('puppeteer');

function getUserInput(rl, prompt) {
  return new Promise(resolve => {
    rl.question(prompt, input => {
      resolve(input);
    });
  });
}

async function chat() {

  // INIT
  spinner.start();
  const browser = await puppeteer.launch({ headless: false, executablePath: executablePath() });
  const page = await browser.newPage();
  await page.goto('https://chat.openai.com');
  const rl = readline.createInterface({input: process.stdin,output: process.stdout});

  // LOGIN
  await page.evaluate(() => {[...document.querySelectorAll('button')].find(element => element.textContent === 'Log in').click();});
  await page.waitForNavigation();
  await page.type('#username', 'cloudgroupdev1@gmail.com');
  await page.evaluate(() => {[...document.querySelectorAll('button')].find(element => element.textContent === 'Continue').click();});
  await page.waitForNavigation();
  await page.type('#password', 'Glu0n001');
  await page.evaluate(() => {[...document.querySelectorAll('button')].find(element => element.textContent === 'Continue').click();});

  // PREVIEW SKIP
  await page.waitForNavigation();
  await page.waitForSelector('.btn-neutral');
  await page.evaluate(() => {[...document.querySelectorAll('button')].find(element => element.textContent === 'Next').click();});
  await page.evaluate(() => {[...document.querySelectorAll('button')].find(element => element.textContent === 'Next').click();});
  await page.evaluate(() => {[...document.querySelectorAll('button')].find(element => element.textContent === 'Done').click();});

  // TALK
  await page.waitForSelector('#prompt-textarea');

  let talking = true;

  while (talking) {
    spinner.stop();
    const userPrompt = await getUserInput(rl, '> ');
    spinner.start();

    if(userPrompt.includes('bye')){ talking = false; return;}

    // Enter user prompt into the textarea
    await page.type('#prompt-textarea', userPrompt);
    await page.click('.absolute.rounded-md');
    await page.waitForSelector('.h-4.w-4.mr-1',{timeout: 30*1000});

    const aiResponse = await page.evaluate(() => {
      let response = [];
      const responseList = Array.from(document.querySelectorAll(".group"));

      responseList[responseList.length - 1].querySelector('.markdown.prose').childNodes.forEach(element => {
        if (element.tagName === 'P') {
          response.push(element.textContent);
        } else if (element.tagName === 'PRE') {
          let code = "\n ------------------------- \n";
          code += element.textContent.replace(/.*Copy code/g, '\n').trim().replace(/(.+)/g, '\x1b[34m$1\x1b[0m');
          code += "\n ------------------------- \n";
          response.push(code);
        }
      });

      return response;
    });
    spinner.stop();

    console.log(aiResponse.join('\n'));

  }

}


chat();
