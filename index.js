const TelegramApi = require("node-telegram-bot-api");
const puppeteer = require('puppeteer');
const dotenv = require('dotenv');
const cron = require('node-cron');

dotenv.config();
const TOKEN = process.env.TOKEN;
const CHAT_ID = process.env.CHAT_ID;
const FRIENDS_LINK = process.env.FRIENDS_LINK;
const FRIENDS_ID = process.env.FRIENDS_ID;
const RACKETLON_LINK = process.env.RACKETLON_LINK;
const RACKETLON_ID = process.env.RACKETLON_ID;
const AB_YAS_LINK = process.env.AB_YAS_LINK;
const AB_YAS_ID = process.env.AB_YAS_ID;
const AB_NAG_LINK = process.env.AB_NAG_LINK;
const AB_NAG_ID = process.env.AB_NAG_ID;
const LUNDA_RECH_LINK = process.env.LUNDA_RECH_LINK;
const LUNDA_RECH_ID = process.env.LUNDA_RECH_ID;
const bot = new TelegramApi(TOKEN, {polling: true});

const weekDay = ["Вс", "Пн", "Вт", "Ср", "Чт", "Пт", "Сб"];

let scrape = async (link) => {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
		let result = "";
    await page.goto(link);
		for(let i=0; i<10; i++){
			result += await getDayData(i, page);
		}
    browser.close();
		return result;
}

const getDayData = async (item, page) => {
	let date = new Date();
	date.setDate(date.getDate()+item);
	const dataLocatorDate = () => date.getFullYear()+"-"+(date.getMonth()+1)+"-"+date.getDate();
	const dateForPost = () => date.getDate()+"."+(date.getMonth()+1)+" "+weekDay[date.getDay()];
	let dayData = "\n\n<strong>📆 "+dateForPost()+"</strong>";
	let bufData = "";
	if(item !== 0){await page.click('[data-locator-date="'+dataLocatorDate()+'"]');}
	try{
		await page.waitForSelector(".time-interval-text", {timeout: 100000});
		bufData = await page.evaluate(() => document.querySelector('app-time-list').innerText);
		bufData = bufData.replace(/(\r\n|\n|\r)/gm, " ");
		bufData = bufData.replace("Утро ", "\n<strong>🌇 Утро</strong>\n");
		bufData = bufData.replace("День ", "\n<strong>🏙 День</strong>\n");
		bufData = bufData.replace("Вечер ", "\n<strong>🌃 Вечер</strong>\n");
	}
	catch(err){
		bufData += "\nСлоты закончились";
		console.log(err);
	}
	dayData += bufData;
	return dayData;
}

const start = async () => {
	bot.on("message", async (msg) => {
		//const text = msg.text;
    //const chatId = msg.chat.id;
    console.log(msg);
		if(msg.text === "/getMeData"){await sendRes();}
	});
}

const sendRes = async () => {
			console.log('bot started');
			let scrapeD = await scrape(FRIENDS_LINK);
			await bot.sendMessage(CHAT_ID, scrapeD, {message_thread_id: FRIENDS_ID, parse_mode: 'HTML'});
			let scrapeT = await scrape(RACKETLON_LINK);
			await bot.sendMessage(CHAT_ID, scrapeT, {message_thread_id: RACKETLON_ID, parse_mode: 'HTML'});
			let scrapeY = await scrape(AB_YAS_LINK);
			await bot.sendMessage(CHAT_ID, scrapeY, {message_thread_id: AB_YAS_ID, parse_mode: 'HTML'});
			let scrapeD1 = await scrape(AB_NAG_LINK);
			await bot.sendMessage(CHAT_ID, scrapeD1, {message_thread_id: AB_NAG_ID, parse_mode: 'HTML'});
			//let scrapeT1 = await scrape(LUNDA_RECH_LINK);
			//await bot.sendMessage(chatId, scrapeT1, {message_thread_id: LUNDA_RECH_ID, parse_mode: 'HTML'});
			//div.ng-star-inserted:nth-child(8) app-staff-tile.master-clickable
			//.masters-list > div:nth-child(2)
			//div.ng-star-inserted
}

//const test = () => {console.log("test");}

start();
cron.schedule('0 7 * * *', async () => {
	console.log("cron work 7:00");
	await sendRes();
});
cron.schedule('0 15 * * *', async () => {
	console.log("cron work 15:00");
	await sendRes();
});
cron.schedule('0 23 * * *', async () => {
	console.log("cron work 23:00");
	await sendRes();
});
