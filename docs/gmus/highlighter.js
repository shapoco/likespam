// ==UserScript==
// @name        Like Spam Highlight
// @namespace   https://github.com/shapoco/likespam
// @match       https://x.com/*
// @grant       none
// @version     1.0
// @author      Shapoco
// @description いいねスパムリストに収録済みのユーザーに「収録済」のタグを表示します
// @require     https://shapoco.github.io/likespam/gmus/db.js
// @updateURL   https://shapoco.github.io/likespam/gmus/highlighter.js
// @downloadURL https://shapoco.github.io/likespam/gmus/highlighter.js
// @supportURL  https://shapoco.github.io/likespam
// ==/UserScript==

const spamRegex = new RegExp('^@(' + spamScreenNames.join('|') + ')$');

setTimeout(scanSpams, 1000);

function scanSpams() {
  console.log('SCROLL');
  const spans = document.getElementsByTagName('span');
  const n = spans.length;
  for(var i = 0; i < n; i++) {
    const span = spans[i];
    if (span.innerHTML.startsWith('@') && span.innerHTML.match(spamRegex)) {
      span.innerHTML += ' <span style="background: #e00; color: white; border-radius: 999px; font-weight: bold;">&nbsp;収録済&nbsp;</span>';
    }
  }
  setTimeout(scanSpams, 1000);
}
