// ==UserScript==
// @name        Like Spam Highlight
// @namespace   https://github.com/shapoco/likespam
// @match       https://x.com/*
// @match       https://pro.twitter.com/*
// @grant       none
// @version     1.0.259
// @author      Shapoco
// @description いいねスパムリストに収録済みのユーザーを強調表示します。
// @require     https://shapoco.github.io/likespam/gmus/db.js?20240926100029
// @updateURL   https://shapoco.github.io/likespam/gmus/highlighter.js
// @downloadURL https://shapoco.github.io/likespam/gmus/highlighter.js
// @supportURL  https://shapoco.github.io/likespam
// ==/UserScript==

const divFoundUsers = document.createElement('div');
divFoundUsers.style.position = 'fixed';
divFoundUsers.style.left = '10px';
divFoundUsers.style.bottom = '10px';
divFoundUsers.style.fontSize = '8pt';

const aCpMiss = document.createElement('a');
aCpMiss.innerHTML = '未発見IDのコピー';
aCpMiss.href = '#';
aCpMiss.style.margin = '0px 2px 0px 0px';
aCpMiss.style.padding = '0px 5px';
aCpMiss.style.background = '#ccc';
aCpMiss.style.borderRadius = '5px';
aCpMiss.addEventListener('click', copyMissingScreenNames);

var foundUserLinks = {};
var missingScreenNames = {};

{
  const searchUrlRegex = /https:\/\/x.com\/search\?q=(%40\w+(\+OR\+%40\w+)*)&/;
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
      if (!likeSpamAccounts[key].frozen) {
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
  scanElems(document.getElementsByTagName('span'), '@');
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
    }
  }
  if (Object.keys(missingScreenNames).length == 0) {
    aCpMiss.style.display = 'none';
  }
  highlighterTimeoutId = setTimeout(scanSpams, 1000);
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
}

