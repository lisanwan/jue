import JuejinHelper from "juejin-helper";
import schedule from "node-schedule";
let ck = {
	// "识别标识（数字字母 建议用qq后面可能会更新qq机器人方式推送消息）":
	// 	"juejin.com的CK",
	ck1: " _tea_utm_cache_2608=undefined; _ga=GA1.2.1794565034.1657189286; __tea_cookie_tokens_2608=%257B%2522web_id%2522%253A%25227117573752141760013%2522%252C%2522user_unique_id%2522%253A%25227117573752141760013%2522%252C%2522timestamp%2522%253A1657189285884%257D; MONITOR_WEB_ID=9d8a80ab-de7a-4736-9949-14259368c55a; _gid=GA1.2.1467177650.1662644951; passport_csrf_token=b2719e26e4658ef50308b721d7c07ed6; passport_csrf_token_default=b2719e26e4658ef50308b721d7c07ed6; _tea_utm_cache_2018=undefined; odin_tt=636ef4e1401646f1c05f52b6a2a58ee20c71c725315287b72dc6f4ff044d5d77a0737a7cc00c6237f8f67849fc1e2badc1c7e2845629c59f052261a02165805a; n_mh=BLcApAJyDWG0xwZfiZl8GXR4GDSJyJhMmvIui04m6B4; passport_auth_status=4829798a70e47a6dd8d3dc2f0a258b62%2C8b35fa48d5e2dc77baf2374f426d5154; passport_auth_status_ss=4829798a70e47a6dd8d3dc2f0a258b62%2C8b35fa48d5e2dc77baf2374f426d5154; sid_guard=e625e3bdbde0820680957d9a4f295667%7C1662645022%7C31536000%7CFri%2C+08-Sep-2023+13%3A50%3A22+GMT; uid_tt=8e7444ac92a33bd8b0e8f6930ba46068; uid_tt_ss=8e7444ac92a33bd8b0e8f6930ba46068; sid_tt=e625e3bdbde0820680957d9a4f295667; sessionid=e625e3bdbde0820680957d9a4f295667; sessionid_ss=e625e3bdbde0820680957d9a4f295667; sid_ucp_v1=1.0.0-KDY5YTU2ZTFiYzk1YWIyZmNmYzc2MjdiZWI0ZjIyZWVmZjE5Njg1ZTEKFwjtpICi8YzOARCe5ueYBhiwFDgCQPEHGgJsZiIgZTYyNWUzYmRiZGUwODIwNjgwOTU3ZDlhNGYyOTU2Njc; ssid_ucp_v1=1.0.0-KDY5YTU2ZTFiYzk1YWIyZmNmYzc2MjdiZWI0ZjIyZWVmZjE5Njg1ZTEKFwjtpICi8YzOARCe5ueYBhiwFDgCQPEHGgJsZiIgZTYyNWUzYmRiZGUwODIwNjgwOTU3ZDlhNGYyOTU2Njc",
};

export async function juejingames(e) {
	const juejin = new JuejinHelper();
	await juejin.login(ck[e.user_id]);
	const seagold = juejin.seagold();

	let signTime = setInterval(async () => {
		await seagold.gameLogin(); // 登陆游戏
		let gameInfo = null;
		const info = await seagold.gameInfo(); // 游戏状态
		if (info.gameStatus === 1) {
			gameInfo = info.gameInfo; // 继续游戏
		} else {
			gameInfo = await seagold.gameStart(); // 开始游戏
		}
		const command = ["U", "L"];
		await seagold.gameCommand(gameInfo.gameId, command); // 执行命令
		const result = await seagold.gameOver(); // 游戏结束
		console.log(
			`本次游戏结束获得${result.gameDiamond}矿石,今日上限${
				result.todayLimitDiamond
			},今日以获取${result.todayDiamond} ${
				result.todayDiamond == result.todayLimitDiamond
					? "今日获取已达上限运行结束"
					: "等待下一次运行"
			}`
		); // => { ... }
		if (result.todayDiamond == result.todayLimitDiamond) {
			clearInterval(signTime);
			juejin.logout();
		}
	}, 12000);
}
export async function auto(e) {
	const juejin = new JuejinHelper();
	await juejin.login(ck[e.user_id]);
	const growth = juejin.growth();
	try {
		let res = await growth.checkIn();
		let resp = await growth.getCurrentPoint();
		// 抽奖
		await growth.drawLottery();
		console.log(`签到成功!剩余矿石${resp}`);
		await juejin.logout();
	} catch (error) {
		let resp = await growth.getCurrentPoint();
		let msg = [error.message, `当前剩余${resp}个矿石`];
		console.log(msg);
		await growth.drawLottery();
		await juejin.logout();
	}
	return true; //返回true 阻挡消息不再往下
}
//cron表达式 分别是 0秒 十分 0时 每天 大概就是这个意思 0 10 0 * * ?
console.log(`启动成功,将在凌晨0:10分开始运行 首次运行请检查app.js是否配置ck`);
schedule.scheduleJob("0 10 0 * * ?", () => {
	console.log(`运行中将在凌晨0:10分开始运行`);
	for (const key in ck) {
		auto({ user_id: key });
		juejingames({ user_id: key });
	}
});
for (const key in ck) {
	console.log(key, ck[key]);
	auto({ user_id: key });
	juejingames({ user_id: key });
}
