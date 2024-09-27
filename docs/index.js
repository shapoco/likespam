const likeSpamMenuItems = [
  { "name": "トップ"  , "url": "./"         },
  { "name": "詳細一覧", "url": "table.html" },
  { "name": "補足情報", "url": "info.html"  },
  { "name": "ツール"  , "url": "tools.html" },
];

function likeSpamRenderMenu(index) {
  var i = 0;
  var html = '';
  likeSpamMenuItems.forEach(e => {
    if (index == i) {
      html += `<span class="menu_item menu_selected">${e.name}</span> `;
    }
    else {
      html += `<a class="menu_item" href="${e.url}">${e.name}</a> `;
    }
    i += 1;
  });
  document.getElementById('menu').innerHTML = html;
}

class LikeSpamStatRecord {
  constructor(dateStr) {
    this.dateStr = '';
    this.total = 0;
    this.alive = 0;
    this.frozen = 0;
    this.newAdded = 0;
    this.newFrozen = 0;
  }
}

function likeSpamRenderStats(elemId) {
  const now = new Date();
  const todayStr = now.toLocaleString("sv-SE").substring(0, 10);
  var yestDate = new Date(now.getTime());
  yestDate.setDate(yestDate.getDate() - 1);
  const yestStr = yestDate.toLocaleString("sv-SE").substring(0, 10);

  const depth = 3;

  records = [];

  for (var i = 0; i < depth; i++) {
    var r = new LikeSpamStatRecord();
    var dateObj = new Date(now.getTime());
    dateObj.setDate(dateObj.getDate() - depth + 1 + i);
    r.dateStr = dateObj.toLocaleString("sv-SE").substring(0, 10);
    records.push(r);
  }

  likeSpams.forEach((spam) => {
    const isFrozen = !!(spam.frozenDate);
    const addedDate = spam.addedDate.toLocaleString("sv-SE");
    const frozenDate = isFrozen ? spam.frozenDate.toLocaleString("sv-SE") : '';
    records.forEach(r => {
      if (addedDate.startsWith(r.dateStr)) r.newAdded += 1;
      if (frozenDate.startsWith(r.dateStr)) r.newFrozen += 1;
    });
    if (isFrozen) records[depth - 1].frozen += 1;
  });

  records[depth - 1].total = likeSpams.length;
  records[depth - 1].alive = records[depth - 1].total - records[depth - 1].frozen;
  

  const totalToday = likeSpams.length;
  var aliveToday = 0;
  var frozenToday = 0;

  var newAddedToday = 0;
  var newAddedYest = 0;

  var newFrozenToday = 0;
  var newFrozenYest = 0;

  Object.values(likeSpams).forEach((spam) => {
    const isFrozen = !!(spam.frozenDate);
    const addedDate = spam.addedDate.toLocaleString("sv-SE");
    const frozenDate = isFrozen ? spam.frozenDate.toLocaleString("sv-SE") : '';
    if (addedDate.startsWith(todayStr)) newAddedToday += 1;
    if (addedDate.startsWith(yestStr)) newAddedYest += 1;
    if (frozenDate.startsWith(todayStr)) newFrozenToday += 1;
    if (frozenDate.startsWith(yestStr)) newFrozenYest += 1;
    if (isFrozen) frozenToday += 1;
    else aliveToday += 1;
  });

  const totalYest = totalToday - newAddedToday;
  const totalFrozenYest = frozenToday - newFrozenToday;
  const totalAliveYest = totalYest - totalFrozenYest;

  const totalFrozenTodayPercent = Math.round(frozenToday * 1000 / totalToday) / 10;
  const totalAliveTodayPercent = Math.round(aliveToday * 1000 / totalToday) / 10;

  const totalFrozenYestPercent = Math.round(totalFrozenYest * 1000 / totalYest) / 10;
  const totalAliveYestPercent = Math.round(totalAliveYest * 1000 / totalYest) / 10;

  document.getElementById(elemId).innerHTML = 
    //'<table>' +
    //'<tr><th></th><th>生存 (割合)</th><th>凍結 (増減, 割合)</th><th>合計 (増減)</th></tr>' +
    //`<tr><th>今日</th><td>${totalAliveToday} (${totalAliveTodayPercent}%)</td><td>${totalFrozenToday} (+${frozenToday}, ${totalFrozenTodayPercent}%)</td><td>${totalToday} (+${addedToday})</td></tr>` +
    //`<tr><th>昨日</th><td>${totalAliveYest} (${totalAliveYestPercent}%)</td><td>${totalFrozenYest} (+${frozenYest}, ${totalFrozenYestPercent}%)</td><td>${totalYest} (+${addedYest})</td></tr>` +
    //'</table>';
    '<table>' +
    '<tr><th></th><th>昨日</th><th>今日</th></tr>' +
    '<tr>' +
      '<th>生存アカウント<br>(割合)</th>' +
      `<td style="text-align: center;">${totalAliveYest}<br>(${totalAliveYestPercent}%)</td>` +
      `<td style="text-align: center;"><strong>${aliveToday}</strong><br>(${totalAliveTodayPercent}%)</td>` +
    '</tr>' +
    '<tr>' +
      '<th>凍結アカウント<br>(増減)<br>(割合)</th>' +
      `<td style="text-align: center;">${totalFrozenYest}<br>(+${newFrozenYest})<br>(${totalFrozenYestPercent}%)</td>` +
      `<td style="text-align: center;">${frozenToday}<br>(+${newFrozenToday})<br>(${totalFrozenTodayPercent}%)</td>` +
    '</tr>' +
    '<tr>' +
      '<th>合計<br>(増減)</th>' +
      `<td style="text-align: center;">${totalYest}<br>(+${newAddedYest})</td>` +
      `<td style="text-align: center;">${totalToday}<br>(+${newAddedToday})</td>` +
    '</tr>' +
    '</table>';
}

function likeSpamGetSearchLinkHtml(screenNames, linkText) {
  const url = `https://x.com/search?q=${screenNames.map(e => '%40' + e).join('+OR+')}&src=typed_query&f=user`;
  if (!linkText || linkText.length == 0) {
    linkText = screenNames.map(e => '@' + e).join(' ');
  }
  return `<a href="${url}" target="_blank">${linkText}</a>`;
}

function likeSpamFormatDate(d) {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const tommorow = new Date(today);
  tommorow.setDate(tommorow.getDate() + 1);
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  const isToday = today <= d && d < tommorow;
  const isYesterday = d >= yesterday && d < today;
  const isThisYear = d.getFullYear() === now.getFullYear();

  const hours = d.getHours().toString();
  const minutes = d.getMinutes().toString().padStart(2, '0');

  if (isToday) {
    return `今日 ${hours}:${minutes}`;
  }
  else if (isYesterday) {
    return `昨日 ${hours}:${minutes}`;
  }
  else if (isThisYear) {
    const month = (d.getMonth() + 1);
    const day = d.getDate().toString().padStart(2, '0');
    return `${month}/${day} ${hours}:${minutes}`;
  }
  else {
    const year = d.getFullYear().toString().slice(-2);
    const month = (d.getMonth() + 1);
    const day = d.getDate().toString().padStart(2, '0');
    return `${year}/${month}/${day} ${hours}:${minutes}`;
  }
}

function isSmartPhone() {
  return window.matchMedia && window.matchMedia('(max-device-width: 640px)').matches;
}
