export function DateFormat(format, time = null) {
    if (!time) time = new Date();
    let o = {
        "M+": time.getMonth() + 1, //month
        "D+": time.getDate(), //day
        "H+": time.getHours(), //hour
        "m+": time.getMinutes(), //minute
        "s+": time.getSeconds(), //second
        "q+": Math.floor((time.getMonth() + 3) / 3), //quarter
        "S": time.getMilliseconds() //millisecond
    }
    if (/(Y+)/.test(format)) format = format.replace(RegExp.$1, (time.getFullYear() + "").substr(4 - RegExp.$1.length));
    for (let k in o)
        if (new RegExp("(" + k + ")").test(format))
            format = format.replace(RegExp.$1, RegExp.$1.length == 1 ? o[k] : ("00" + o[k]).substr(("" + o[k]).length));
    return format;
}
