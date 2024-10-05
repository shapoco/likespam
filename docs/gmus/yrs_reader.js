// ==UserScript==
// @name        Yahoo Realtime Search Reader
// @namespace   https://github.com/shapoco/likespam
// @match       https://search.yahoo.co.jp/realtime/search?p=*
// @grant       none
// @version     1.0.35
// @author      Syego
// @description Yahoo! リアルタイム検索の結果からユーザー情報を読み取ります
// @updateURL   https://shapoco.github.io/likespam/gmus/yrs_reader.js
// @downloadURL https://shapoco.github.io/likespam/gmus/yrs_reader.js
// @supportURL  https://shapoco.github.io/likespam
// ==/UserScript==

const yrsrDivUi = document.createElement('div');
yrsrDivUi.style.position = 'fixed';
yrsrDivUi.style.left = '10px';
yrsrDivUi.style.bottom = '10px';
yrsrDivUi.style.fontSize = '9pt';
yrsrDivUi.style.background = '#eee';
yrsrDivUi.innerHTML =
  '<span id="yrsr_status"></span><br>' +
  '<button id="yrsr_copy_button" type="button">Copy</button>';
document.body.appendChild(yrsrDivUi);

document.querySelector('#yrsr_copy_button').addEventListener('click', evt => { yrsrCopySpams(); });

const yrsrSpamNames = [
  'a',
];

const yrsrSpamWords = [
  'get',
  'zy_iove',
  'zy_love',
  'zy_lovergc',
  'いいね',
  'おめでとう',
  'すごい事',
  'スパム',
  'プロフィ一ル',
  '公式',
  '当選',
  '景品',
  '確認',
  '詐欺',
  '通知きた',
  '🎁',
  '🎉',
];

var yrsrScreenNames = {};
var yrsrSpams = [];

var yrsrTimeoutId = setTimeout(yrsrScan, 1000);

var yrsrDivTL = null;

function yrsrScan() {
  yrsrScanInner();
  yrsrTimeoutId = setTimeout(yrsrScan, 1000);
}

function yrsrScanInner() {
  //if (!yrsrDivTL) {
  //  const divs = document.querySelector('div');
  //  const numDivs = divs.length;
  //  for (var idiv = 0; idiv < numDivs; idiv++) {
  //    const div = divs[idiv];
  //    if (div.classList[0].startsWith('Timeline_Timeline_')) {
  //      yrsrDivTL = div;
  //      console.log(`Timeline wrapper found: '.${div.classList[0]}'`);
  //      break;
  //    }
  //  }
  //}
  //const divSr = document.querySelector('#sr');
  //if (!divSr) {
  //  console.log('NOT FOUND: #sr');
  //  return;
  //}

  const divTws = document.querySelectorAll('#sr div[class*="Tweet_TweetContainer_"], #bt div[class*="Tweet_TweetContainer_"]');
  if (!divTws) {
    return;
    console.log('NOT FOUND: div div');
  }

  const numTw = divTws.length;
  console.log(`numTw = ${numTw}`);

  for (var itw = 0; itw < numTw; itw++) {
    const divTw = divTws[itw];
    const spanName = divTw.querySelector('span[class*="Tweet_authorName_"]');
    const aScreenName = divTw.querySelector('a[class*="Tweet_authorID_"]');
    const pBody = divTw.querySelector('p[class*="Tweet_body_"]');

    var spamScore = 0;
    const name = spanName.textContent.trim();
    const screenName = aScreenName.textContent.trim();
    const bodyLower = pBody.textContent.trim().toLowerCase();

    const key = screenName.toLowerCase();

    if (key in yrsrScreenNames) continue;
    yrsrScreenNames[key] = true;

    if (yrsrSpamNames.includes(name.toLowerCase())) spamScore += 5;

    yrsrSpamWords.forEach(key => {
      if (bodyLower.includes(key)) {
        spamScore += 1;
      }
    });

    //console.log(`${screenName}: ${spamScore}`);
    if (spamScore >= 12) {
      yrsrSpams.push(screenName.substring(1));
    }
  }

  document.querySelector('#yrsr_status').innerHTML = `${yrsrSpams.length} spams found.`;
}

function yrsrCopySpams() {
  navigator.clipboard.writeText(yrsrSpams.join(' '));
}

