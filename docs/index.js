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

function likeSpamRenderStats() {
  const div = document.getElementById('stats');

  const now = new Date();
  const todayStr = now.toLocaleString("sv-SE").substring(0, 10);
  var yestDate = new Date(now.getTime());
  yestDate.setDate(yestDate.getDate() - 1);
  const yestStr = yestDate.toLocaleString("sv-SE").substring(0, 10);

  const totalToday = likeSpams.length;
  var totalAliveToday = 0;
  var totalFrozenToday = 0;

  var addedToday = 0;
  var addedYest = 0;

  var frozenToday = 0;
  var frozenYest = 0;

  Object.values(likeSpams).forEach((spam) => {
    const isFrozen = !!(spam.frozenDate);
    const addedDate = spam.addedDate.toLocaleString("sv-SE");
    const frozenDate = isFrozen ? spam.frozenDate.toLocaleString("sv-SE") : '';
    if (addedDate.startsWith(todayStr)) addedToday += 1;
    if (addedDate.startsWith(yestStr)) addedYest += 1;
    if (frozenDate.startsWith(todayStr)) frozenToday += 1;
    if (frozenDate.startsWith(yestStr)) frozenYest += 1;
    if (isFrozen) totalFrozenToday += 1;
    else totalAliveToday += 1;
  });

  const totalYest = totalToday - addedToday;
  const totalFrozenYest = totalFrozenToday - frozenToday;
  const totalAliveYest = totalYest - totalFrozenYest;

  const totalFrozenTodayPercent = Math.round(totalFrozenToday * 1000 / totalToday) / 10;
  const totalAliveTodayPercent = Math.round(totalAliveToday * 1000 / totalToday) / 10;

  const totalFrozenYestPercent = Math.round(totalFrozenYest * 1000 / totalYest) / 10;
  const totalAliveYestPercent = Math.round(totalAliveYest * 1000 / totalYest) / 10;

  div.innerHTML = 
    '<table>' +
    '<tr><th></th><th>生存 (割合)</th><th>凍結 (増減, 割合)</th><th>合計 (増減)</th></tr>' +
    `<tr><th>今日</th><td>${totalAliveToday} (${totalAliveTodayPercent}%)</td><td>${totalFrozenToday} (+${frozenToday}, ${totalFrozenTodayPercent}%)</td><td>${totalToday} (+${addedToday})</td></tr>` +
    `<tr><th>昨日</th><td>${totalAliveYest} (${totalAliveYestPercent}%)</td><td>${totalFrozenYest} (+${frozenYest}, ${totalFrozenYestPercent}%)</td><td>${totalYest} (+${addedYest})</td></tr>` +
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
