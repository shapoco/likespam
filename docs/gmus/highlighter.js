// ==UserScript==
// @name        Like Spam Highlight
// @namespace   https://github.com/shapoco/likespam
// @match       https://x.com/*
// @match       https://pro.twitter.com/*
// @grant       none
// @version     1.0.658
// @author      Shapoco
// @description いいねスパムリストに収録済みのユーザーを強調表示します。
// @require     https://shapoco.github.io/likespam/gmus/db.js?20241002090958
// @updateURL   https://shapoco.github.io/likespam/gmus/highlighter.js
// @downloadURL https://shapoco.github.io/likespam/gmus/highlighter.js
// @supportURL  https://shapoco.github.io/likespam
// ==/UserScript==

function createLinkButton(url, text, color) {
  const a = document.createElement('a');
  a.innerHTML = text;
  a.href = url;
  a.style.margin = '0px 2px 0px 0px';
  a.style.padding = '0px 5px';
  a.style.borderRadius = '5px';
  a.style.background = color;
  return a;
}

const divFoundUsers = document.createElement('div');
divFoundUsers.style.position = 'fixed';
divFoundUsers.style.left = '10px';
divFoundUsers.style.bottom = '10px';
divFoundUsers.style.fontSize = '8pt';

//const aCpMiss = document.createElement('a');
//aCpMiss.innerHTML = '未発見IDのコピー';
//aCpMiss.href = '#';
//aCpMiss.style.margin = '0px 2px 0px 0px';
//aCpMiss.style.padding = '0px 5px';
//aCpMiss.style.background = '#ccc';
//aCpMiss.style.borderRadius = '5px';
const aCpMiss = createLinkButton('javascript:void(0)', '未発見IDのコピー', '#ccc');
aCpMiss.addEventListener('click', copyMissingScreenNames);

const divUserIds = document.createElement('div');
divUserIds.style.position = 'fixed';
divUserIds.style.left = '10px';
divUserIds.style.top = '10px';
divUserIds.style.fontSize = '8pt';

const aCpIds = createLinkButton('javascript:void(0)', '全ての user_id をコピー', '#0ef');
aCpIds.addEventListener('click', copyUserIds);
divUserIds.appendChild(aCpIds);
document.getElementsByTagName('body')[0].appendChild(divUserIds);

const searchUrlRegex = /https:\/\/x.com\/search\?q=(%40\w+(\+OR\+%40\w+)*)&/;

const userIdRegex = /data-testid="(\d+)-(un)?(follow|block)"/;
const profileImageUrlRegex = /(https:\/\/pbs.twimg.com\/[^&]+)&quot;/;

const frozenMessages = [
  'アカウントは凍結されています',
];

var foundUsers = {};
var foundUserLinks = {};
var missingScreenNames = {};

{
  const urlMatch = location.href.match(searchUrlRegex);
  var queryScreenNames = [];
  if (urlMatch) {
    queryScreenNames = urlMatch[1].replaceAll('%40', '').split('+OR+');
    var i = 0;
    queryScreenNames.forEach((e) => {
      const key = e.toLowerCase();
      const a = document.createElement('a');
      a.href = '/' + e;
      a.target = '_blank';
      a.innerHTML = e;
      a.style.margin = '0px 2px 0px 0px';
      a.style.padding = '0px 5px';
      a.style.background =
        !(key in likeSpamAccounts)    ? '#8f8' :
        likeSpamAccounts[key].frozen  ? '#4cf' : '#ccc';
      a.style.borderRadius = '5px';
      foundUserLinks[key] = a;
      if (key in likeSpamAccounts && !likeSpamAccounts[key].frozen) {
        missingScreenNames[key] = true;
      }
      divFoundUsers.appendChild(a);
      if ((i + 1) % 10 == 0 && i < queryScreenNames.length - 1) {
        divFoundUsers.appendChild(document.createElement('br'));
      }
      i += 1;
    });
    divFoundUsers.appendChild(aCpMiss);
    document.getElementsByTagName('body')[0].appendChild(divFoundUsers);
  }
}

var highlighterTimeoutId = -1;

highlighterTimeoutId = setTimeout(scanSpams, 1000);

function scanSpams() {
  const spans = document.getElementsByTagName('span');
  scanElems(spans, '@');

  const numSpans = spans.length;
  for (var ispan = 0; ispan < numSpans; ispan++) {
    const span = spans[ispan];
    if (frozenMessages.includes(span.innerHTML)) {
      if (document.title.length == 0) {
        document.title = '🔵 凍結されています';
        break;
      }
      else if (!document.title.startsWith('🔵')) {
        document.title = '🔵' + document.title;
        break;
      }
    }
  }
}

function scanElems(elems, startMarker) {
  const n = elems.length;
  for(var i = 0; i < n; i++) {
    const elem = elems[i];
    if (elem.children.length == 1 && elem.children[0].tagName.toLowerCase() == 'span') continue;
    const innerText = getInnerTextWithAlt(elem);
    if (innerText.startsWith(startMarker)) {
      const screenName = innerText.substring(startMarker.length);
      const key = innerText.substring(1).toLowerCase();
      if (key in likeSpamAccounts) {
        //elem.innerHTML += ' <elem style="background: #e00; color: white; border-radius: 999px; font-weight: bold;">&nbsp;収録済&nbsp;</span>';
        elem.style.background = likeSpamAccounts[key].frozen ? 'rgba(64,192,255,0.3)' : 'rgba(255,64,64,0.3)';
        elem.style.borderRadius = '5px';

        if (key in foundUserLinks) {
          foundUserLinks[key].style.background = '#f88';
          delete missingScreenNames[key];
        }
      }

      searchUserId(elem, screenName);
    }
  }
  if (Object.keys(missingScreenNames).length == 0) {
    aCpMiss.style.display = 'none';
  }
  else {
    aCpMiss.style.background = '#ff0';
  }
  aCpMiss.innerHTML = `未発見IDのコピー (${Object.keys(missingScreenNames).length})`;
  highlighterTimeoutId = setTimeout(scanSpams, 1000);
}

function searchUserId(elem, screenName) {
  const key = screenName.toLowerCase();
  if (key in foundUsers) return;

  const div0 = elem.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement;
  if (!div0) return;

  const div1 = div0.parentElement;
  if (!div1) return;

  const snapshot = document.evaluate('div[1]/div[1]/div/div[1]/a/div/div[1]/span', div0, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);
  if (!snapshot || snapshot == null) return;

  const match0 = div0.innerHTML.match(userIdRegex);
  const match1 = div1.innerHTML.match(profileImageUrlRegex);
  const userName = getInnerTextWithAlt(snapshot.snapshotItem(0));

  if (!match0) return;
  const userId = match0[1];
  const profileImage = !!match1 ? match1[1] : '';

  const user = {
    'userId': userId,
    'screenName': screenName,
    'profileImage': profileImage,
    'name': userName,
  };
  foundUsers[key] = user;
  console.log(screenName + ' --> ' + user);
}

function getInnerTextWithAlt(elm) {
  if (elm) {
    if (elm.nodeType === Node.TEXT_NODE) {
      return elm.nodeValue;
    }
    else if (elm.nodeType === Node.ELEMENT_NODE) {
      if (elm.tagName.toLowerCase() === 'img') {
        return elm.alt;
      }
      else {
        let text = '';
        for (let child of elm.childNodes) {
          text += getInnerTextWithAlt(child);
        }
        return text;
      }
    }
  }
  return '';
}

function copyMissingScreenNames(elem) {
  const ids = Object.keys(missingScreenNames).join(' ');
  navigator.clipboard.writeText(ids);
  //navigator.clipboard.writeText(`./freeze.py ${ids}`);
}

function copyUserIds(elem) {
  const s = Object.values(foundUsers).map(user =>
    getPadRight(user.userId, 20) + ', ' +
    getPadRight(user.screenName, 25) + ',         , ' +
    getPadRight(toISOStringWithTimezone(new Date()), 25) + ', ' +
    getPadRight('', 25) + ', ' +
    user.name + ', ' +
    user.profileImage + '\r\n').join('');
  navigator.clipboard.writeText(s);
}

function toISOStringWithTimezone(date) {
  const year = date.getFullYear().toString();
  const month = zeroPadding((date.getMonth() + 1).toString());
  const day = zeroPadding(date.getDate().toString());

  const hour = zeroPadding(date.getHours().toString());
  const minute = zeroPadding(date.getMinutes().toString());
  const second = zeroPadding(date.getSeconds().toString());

  const localDate = `${year}-${month}-${day}`;
  const localTime = `${hour}:${minute}:${second}`;

  const diffFromUtc = date.getTimezoneOffset();

  // UTCだった場合
  if (diffFromUtc === 0) {
    const tzSign = 'Z';
    return `${localDate}T${localTime}${tzSign}`;
  }

  // UTCではない場合
  const tzSign = diffFromUtc < 0 ? '+' : '-';
  const tzHour = zeroPadding((Math.abs(diffFromUtc) / 60).toString());
  const tzMinute = zeroPadding((Math.abs(diffFromUtc) % 60).toString());

  return `${localDate}T${localTime}${tzSign}${tzHour}:${tzMinute}`;
}

function zeroPadding(s) {
  return ('0' + s).slice(-2);
}

function getPadRight(s, n) {
  if (s.length >= n) return s;
  return s + ' '.repeat(n - s.length);
}

