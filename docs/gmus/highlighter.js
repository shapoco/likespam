// ==UserScript==
// @name        Like Spam Highlight
// @namespace   https://github.com/shapoco/likespam
// @match       https://x.com/*
// @grant       none
// @version     1.0.146
// @author      Shapoco
// @description いいねスパムリストに収録済みのユーザーに「収録済」のタグを表示します
// @require     https://shapoco.github.io/likespam/gmus/db.js?20240924094956
// @updateURL   https://shapoco.github.io/likespam/gmus/highlighter.js
// @downloadURL https://shapoco.github.io/likespam/gmus/highlighter.js
// @supportURL  https://shapoco.github.io/likespam
// ==/UserScript==

const spamRegex0 = new RegExp('^@(' + spamScreenNames.join('|') + ')$');
const spamRegex1 = new RegExp('^https://x\\.com/(' + spamScreenNames.join('|') + ')$');

var highlighterTimeoutId = -1;

highlighterTimeoutId = setTimeout(scanSpams, 1000);

function scanSpams() {
  scanElems(document.getElementsByTagName('span'), '@', spamRegex0);
  //scanElems(document.getElementsByTagName('a'), 'https://x.com/', spamRegex1);
}

function scanElems(elems, startMarker, regexp) {
  const n = elems.length;
  for(var i = 0; i < n; i++) {
    const elem = elems[i];
    const innerText = getInnerTextWithAlt(elem);
    if (innerText.startsWith(startMarker) && innerText.match(regexp)) {
      //elem.innerHTML += ' <elem style="background: #e00; color: white; border-radius: 999px; font-weight: bold;">&nbsp;収録済&nbsp;</span>';
      elem.style.background = '#fcc';
      elem.style.borderRadius = '5px';
    }
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
