const likeSpamMenuItems = [
  { "name": "トップ"  , "url": "./"         },
  { "name": "詳細一覧 (PC用)", "url": "table.html" },
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
    this.title = '';
    this.dateStr = '';
    this.total = 0;
    this.alive = 0;
    this.frozen = 0;
    this.newTotal = 0;
    this.newFrozen = 0;
    this.newAlive = 0;
    this.frozenPercent = 0;
    this.isToday = false;
  }
}

function likeSpamRenderStats(elemId) {
  const now = new Date();
  const todayStr = now.toLocaleString("sv-SE").substring(0, 10);
  var yestDate = new Date(now.getTime());
  yestDate.setDate(yestDate.getDate() - 1);
  const yestStr = yestDate.toLocaleString("sv-SE").substring(0, 10);

  const depth = 5;

  records = [];

  for (var iday = 0; iday < depth; iday++) {
    var r = new LikeSpamStatRecord();
    r.title = 
      (iday == depth - 1) ? '今日' :
      (iday == depth - 2) ? '昨日' : `${depth - iday - 1} 日前`;
    var dateObj = new Date(now.getTime());
    dateObj.setDate(dateObj.getDate() - depth + 1 + iday);
    r.dateStr = dateObj.toLocaleString("sv-SE").substring(0, 10);
    r.isToday = iday >= depth - 1;
    records.push(r);
  }

  likeSpams.forEach((spam) => {
    const isFrozen = !!(spam.frozenDate);
    const addedDate = spam.addedDate.toLocaleString("sv-SE");
    const frozenDate = isFrozen ? spam.frozenDate.toLocaleString("sv-SE") : '';
    records.forEach(r => {
      if (addedDate.startsWith(r.dateStr)) r.newTotal += 1;
      if (frozenDate.startsWith(r.dateStr)) r.newFrozen += 1;
    });
    if (isFrozen) records[depth - 1].frozen += 1;
  });

  records[depth - 1].total = likeSpams.length;
  records[depth - 1].alive = records[depth - 1].total - records[depth - 1].frozen;
  
  for (var iday = depth - 2; iday >= 0; iday--) {
    var thisDay = records[iday];
    const nextDay = records[iday + 1];
    thisDay.total = nextDay.total - nextDay.newTotal;
    thisDay.frozen = nextDay.frozen - nextDay.newFrozen;
    thisDay.alive = thisDay.total - thisDay.frozen;
  }
  for (var iday = 1; iday < depth; iday++) {
    const prevDay = records[iday - 1];
    var thisDay = records[iday];
    thisDay.newAlive = thisDay.alive - prevDay.alive;
  }
  for (var iday = 0; iday < depth; iday++) {
    var thisDay = records[iday];
    thisDay.frozenPercent = Math.round(thisDay.frozen * 1000 / thisDay.total) / 10;
  }
  records.shift();

  function deltaStr(delta) {
    if (delta > 0) return '+' + delta.toString();
    if (delta == 0) return '±0';
    return delta.toString();
  }

  titles = records.map(r => 
    `<th>${r.title}</th>`);
  alives = records.map(r =>
    `<td style="text-align: center;">${r.isToday ? '<strong>' + r.alive + '</strong>' : r.alive}` +
    `<br><span class="gray">(${deltaStr(r.newAlive)})</span></td>`);
  forzens = records.map(r => 
    `<td style="text-align: center;">${r.frozen}` +
    `<br><span class="gray">(${deltaStr(r.newFrozen)})</span></td>`);
  totals = records.map(r => 
    `<td style="text-align: center;">${r.total}` +
    `<br><span class="gray">(${deltaStr(r.newTotal)})</span></td>`);
  percents = records.map(r => 
    `<td style="text-align: center;">${r.frozenPercent}%</td>`);

  var html = '<table>';
  html += `<tr><th></th>${titles.join('')}</tr>`;
  html += `<tr><th>生存<br><span class="gray">(増減)<span></th>${alives.join('')}</tr>`;
  html += `<tr><th>凍結<br><span class="gray">(増減)<span></th>${forzens.join('')}</tr>`;
  html += `<tr><th>合計<br><span class="gray">(増減)<span></th>${totals.join('')}</tr>`;
  html += `<tr><th>凍結率</th>${percents.join('')}</tr>`;
  html += '</table>';
  document.getElementById(elemId).innerHTML = html;
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

function fixContents() {
  const now = new Date();
  const recentDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  recentDay.setDate(recentDay.getDate() - 3);

  const year = recentDay.getFullYear().toString();
  const month = (recentDay.getMonth() + 1).toString();
  const day = recentDay.getDate().toString();
  const dateStr = `${year}-${month}-${day}`;

  document.querySelectorAll('.xsearch_link').forEach(link => {
    link.href = `https://x.com/search?q=%23%E3%81%84%E3%81%84%E3%81%AD%E3%82%B9%E3%83%91%E3%83%A0%20since%3A${dateStr}&src=typed_query&f=top`;
  });
}
