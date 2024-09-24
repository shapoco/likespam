// ==UserScript==
// @name        Like Spam Highlight
// @namespace   https://github.com/shapoco/likespam
// @match       https://x.com/*
// @grant       none
// @version     1.0.145
// @author      Shapoco
// @description いいねスパムリストに収録済みのユーザーに「収録済」のタグを表示します
// @require     https://shapoco.github.io/likespam/gmus/db.js?20240924092447
// @updateURL   https://shapoco.github.io/likespam/gmus/highlighter.js
// @downloadURL https://shapoco.github.io/likespam/gmus/highlighter.js
// @supportURL  https://shapoco.github.io/likespam
// ==/UserScript==

const spamRegex = new RegExp('^@(' + spamScreenNames.join('|') + ')$');

var highlighterTimeoutId = -1;

highlighterTimeoutId = setTimeout(scanSpams, 1000);

function scanSpams() {
  scanElems(document.getElementsByTagName('span'));
  scanElems(document.getElementsByTagName('a'));
}

function scanElems(elems) {
  const n = elems.length;
  for(var i = 0; i < n; i++) {
    const elem = elems[i];
    if (elem.innerHTML.startsWith('@') && elem.innerHTML.match(spamRegex)) {
      elem.innerHTML += ' <elem style="background: #e00; color: white; border-radius: 999px; font-weight: bold;">&nbsp;収録済&nbsp;</span>';
    }
  }
  highlighterTimeoutId = setTimeout(scanSpams, 1000);
}
