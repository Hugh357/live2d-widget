import randomSelection from "./utils.js";


/*
 * 处理messageArray
 * 实现智能识别传统节日、二十四节气、国务院调休、放假、补班
 * 供index.js调用，initModel fetch(waifuPath).then的最后调用，then中的lambda表达式要是async
 *
 * param messageArray: 消息数组
 * param result: fetch(waifuPath)的result
 * return: 修改后的messageArray
 */
async function customWaifuMsg(messageArray, result) {
    // 加载中国节假日，调用时要用await，否则返回值是promise而不是string
    async function loadCNHoliday() {
        // 法定节假日
        const response = await fetch(`https://cdn.jsdelivr.net/gh/lanceliao/china-holiday-calender/holidayCal.ics`);
        return await response.text();
    }

    async function loadCNTraditionalFestival() {
        // 传统节日、24节气
        const response = await fetch(`https://cdn.jsdelivr.net/gh/infinet/lunar-calendar/chinese_lunar_prev_year_next_year.ics`);
        return await response.text();
    }

    let cnHoliday = '';
    let cnFestival = '';
    const now = new Date();
    // 将方法设为同步方法
    cnHoliday = await loadCNHoliday();
    cnFestival = await loadCNTraditionalFestival();
    const nowDate = '' + now.getFullYear() + (now.getMonth() + 1) + now.getDate();
    const nowDate1 = '20220215'
    const festivalRe = new RegExp(`DTSTART.*${nowDate}[\\s\\S]*?SUMMARY:(.*)`);
    const holidayMatch = cnHoliday.match(festivalRe);
    const festivalMatch = cnFestival.match(festivalRe);
    console.log(holidayMatch, '\n', festivalMatch)
    let festivalHolidayNow = ''
    if (festivalMatch === null || festivalMatch[1].split(' ').length < 2) {
        // 不是节日当天，但可能是法定假期
        if (!(holidayMatch === null)) {
            festivalHolidayNow = holidayMatch[1]
            console.log('holidayMatch生效')
        }
        console.log('festivalHolidayNow都不生效')
    } else {
        // 节日当天
        if (!(festivalMatch[1].split(' ').length < 2)) {
            festivalHolidayNow = festivalMatch[1].split(' ')[1]
            console.log('festivalMatch生效')
        }
        console.log('festivalHolidayNow都不生效')
    }
    console.log(holidayMatch, festivalMatch, festivalHolidayNow);
    if (!(festivalHolidayNow === '')) {
        messageArray.push(`今天是<span>${festivalHolidayNow}</span>`);
    }
    // 等加载完welcomeMessage再加载
    // setTimeout(()=>showMessage(`今天是<span>${festivalHolidayNow}</span>`, 7000, 8),8000)
    result.festivals.forEach(({festival, text}) => {
        if (festivalHolidayNow.indexOf(festival) > -1) {
            if (Array.isArray(text)) messageArray = messageArray.concat(text);
            else messageArray.push(text);
        }
    });
    // 扩充消息列表，增加重要消息权重
    if (messageArray.length < 4) {
        messageArray = messageArray.concat(messageArray);
        messageArray.push(randomSelection(result.message.verse));
        let extra_msg = result.message.default;
        let n = 0
        while (messageArray.length < 7 && n < extra_msg.length) {
            messageArray.push(extra_msg[n]);
            n = n + 1;
        }
    }
    return messageArray;
}

export default customWaifuMsg;
