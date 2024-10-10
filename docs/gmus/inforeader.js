// ==UserScript==
// @name        Spam Info Reader
// @namespace   https://github.com/shapoco/likespam
// @match       https://x.com/search?*
// @grant       none
// @version     1.0.823
// @author      Shapoco
// @description Xの検索結果からスパムアカウントの情報を抽出します
// @require     https://shapoco.github.io/likespam/gmus/db.js?20241011005004
// @updateURL   https://shapoco.github.io/likespam/gmus/inforeader.js
// @downloadURL https://shapoco.github.io/likespam/gmus/inforeader.js
// @supportURL  https://shapoco.github.io/likespam
// ==/UserScript==

const profileTextKeys = ['Zy_Iove', 'Su_Iover', 'Zy_iove', 'Xy_Iove', 'ace_GlFT', '________l__I___', 'ギフト1万円分', 'bit.ly/3ZJEViG', 'Officiai_______', '____I_____l____'];
const nameKeys = [
  '【公式】 いいねされた人はプロフィールをチェックして景品をGET🎁おめでとう🎉',
];
const blackList = [
//  'adrianar87200', 'aesophcynt69168', 'adrianamor21352', 'achmielorz19052', 'abby_rober23863', 'abby_rober9069', 'abbycarlso20835', 'ackermanum62161',
//  'abrams_pat84908', 'abbydavis218913', 'abarcaamy89224', 'adrienneth19619', 'abbywillia66946', 'advorak51481', 'acklair98191', 'aantishin35043',
//  'acosta_hea67784', 'adoehrman7953', 'aanquero69625', 'agarwalmar74858', 'adkinson_a72036', 'abbypink64681', 'adams_mega14727', 'abbysmith156409',
//  'adamsmissy80015', 'adams_eliz50734', 'ablair24790', 'adams_eliz94260', 'aellis99573', 'adkinskath71938', 'addisondea6441', 'adamsvanes97762',
//  'adkinsrach5824', 'abbywoods550187', 'afoell62269', 'aellis60479', 'aboucher69923', 'abigailbel56613', 'ackermantr59026', 'adams_jess96904',
//  'abemis74901', 'adamskiara604', 'aaronbaker29976', 'abigail20454293', 'acosta_lyd92005', 'abbyfisher30611', 'abbythomas59888', 'aellis43362',
//  'ablair55310', 'adamshanna57979', 'abbottlyne10257', 'aimeewrigh24249', 'aimeewilli65936', 'aimeehobbs81330', 'ahuynh93110', 'ahorton88813',
//  'ahorton38532', 'aholt79103', 'ahenderson73195', 'aheiser20890', 'aguirrejen26954', 'aguillonan80140', 'agnesargui97096', 'alicia_joh2495',
//  'alejosjuli33105', 'akostohryz46365', 'aimeemurph37163', 'ahuckstep66341', 'aelfgen34609', 'adrienneva92842',
];

const screenNameRegex = /^@\w+$/;

var dict = {};
var ids = [];
var known_indexes = [];
var numKnown = 0;
var numNormals = 0;

var infoReaderTimeoutId = -1;

const div = document.createElement('div');
div.style.position = 'fixed';
div.style.left = '10px';
div.style.bottom = '50px';
div.style.width = '200px';
div.style.height = '200px';
div.style.background = '#ccc';
div.style.border = 'solid 1px #888';
div.innerHTML =
  '<div id="findspam_status"></div>' +
  '<button id="findspam_btn">Copy all ids</button><br>' +
  '<input type="checkbox" id="findspam_rmv_known" checked><label for="findspam_rmv_known">Remove Knowns</label><br>' +
  '<textarea id="findspan_ids"></textarea>';
document.getElementsByTagName('body')[0].appendChild(div);

document.addEventListener("scroll", (event) => {
    clearTimeout(infoReaderTimeoutId);
    infoReaderTimeoutId = setTimeout(scanUsers, 1000);
});

infoReaderTimeoutId = setTimeout(scanUsers, 2000);

function scanUsers() {
  const spans = document.getElementsByTagName('span');
  //for (var span in spans) {
  for (var ispan = 0; ispan < spans.length; ispan++) {
    const span = spans[ispan];
    const screenName = span.innerHTML;
    //console.log(screenName);
    //if (!screenName.startsWith('@')) continue;
    if (!screenName.match(screenNameRegex)) continue;
    if (screenName in dict) continue;

    //const div = span.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.childNodes[2];
    const div0 = span.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement;
    if (!div0) continue;

    const div0InnerHTML = div0.innerHTML;

    //const nodesSnapshot1 = document.evaluate('div[1]/div[1]/div/div[1]/a/div/div[1]/span]', div0, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);
    const nodesSnapshot1 = document.evaluate('div[1]/div[1]/div/div[1]/a/div/div[1]/span', div0, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);
    if (!nodesSnapshot1 || nodesSnapshot1 == null) continue;
    //const userName = nodesSnapshot1.snapshotItem(0).innerText;
    const userName = getInnerTextWithAlt(nodesSnapshot1.snapshotItem(0));

    var containsKey = false;

    for (var ikey = 0; ikey < profileTextKeys.length; ikey++) {
      if (div0InnerHTML.includes(profileTextKeys[ikey])) {
        containsKey = true;
        break;
      }
    }

    if (!containsKey) {
      if (nameKeys.includes(userName)) {
        containsKey = true;
      }
    }

    if (!containsKey) {
      if (blackList.includes(screenName.substring(1).toLowerCase())) {
        containsKey = true;
      }
    }

    dict[screenName] = true;

    if (spamScreenNames.includes(screenName.substring(1))) {
      numKnown += 1;
      known_indexes.push(ids.length);
    }

    if (!containsKey && !spamScreenNames.includes(screenName.substring(1))) {
      numNormals += 1;
      continue;
    }

    const regex0 = /data-testid="(\d+)-(un)?(follow|block)"/;
    const match0 = div0.innerHTML.match(regex0);
    const userId = match0[1];

    //const regex1 = /style="text-overflow: unset;">([^<]*)"/;
    //const regex1 = /(特別なご案内です)/;
    //const regex1 = /<span[^>]+style="text-overflow: unset;">([^<]+)<\/span>/;
    //const match1 = div0.innerHTML.match(regex1);
    //const userName = match1[1];

    //const div1 = div0.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement;
    const div1 = div0.parentElement;
    //const regex2 = /(https:\/\/pbs.twimg.com\/profile_images\/\d+\/[-\w]+\.\w+)/;
    //const regex2 = /(https:\/\/pbs.twimg.com\/profile_images\/${userId}\/[-\w]+\.\w+)/;
    const regex2 = /(https:\/\/pbs.twimg.com\/[^&]+)&quot;/;
    //const regex2 = /(https:\/\/\w+(\.\w+)+\/profile_images\/\d+\/[-\w]+\.\w+)/;
    //const regex2 = /(profile_images\/\d+\/[-\w]+\.\w+)/;
    //const regex2 = /(profile_images[^&]+)&quot;/;
    //const regex2 = /(profile_images)/;
    //const regex2 = /(pbs\.twimg\.com)/;
    const match2 = div1.innerHTML.match(regex2);
    const profileImage = match2[1];
    //var profileImage = '';
    ////if (match2) {
    ////  profileImage = match2[1];
    ////}
    //try {
    //  profileImage = match2[1];
    //}
    //catch {}

    //https://pbs.twimg.com/profile_images/1835709222513971201/O5HOnatY_normal.png
    const record =
          getPadRight(userId, 20) + ', ' +
          getPadRight(screenName.substring(1), 25) + ',         , ' +
          getPadRight(toISOStringWithTimezone(new Date()), 25) + ', ' +
          getPadRight('', 25) + ', ' +
          userName + ', ' + profileImage;
    ids.push(record);
    console.log(record);

    //ids.push(screenName);
    //console.log(screenName);
  }

  document.getElementById('findspam_status').innerHTML =
    ids.length.toString() + ' spams, <br>' +
    numKnown + ' knowns, <br>' +
    numNormals + ' normals';
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

function getPadRight(s, n) {
  if (s.length >= n) return s;
  return s + ' '.repeat(n - s.length);
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

// //*[@id="react-root"]/div/div/div[2]/main/div/div/div/div[1]/div/div[3]/section/div/div/div[3]/div/div/button/div/div[2]/div[1]/div[1]/div/div[2]/div/a/div/div/span
//<span class="css-1jxf684 r-bcqeeo r-1ttztb7 r-qvutc0 r-1tl8opc" style="text-overflow: unset;">@woodcutter_YTs_</span>

// //*[@id="react-root"]/div/div/div[2]/main/div/div/div/div[1]/div/div[3]/section/div/div/div[3]/div/div/button/div/div[2]/div[2]

// //*[@id="react-root"]/div/div/div[2]/main/div/div/div/div[1]/div/div[3]/section/div/div/div[1]/div/div/button/div/div[2]/div[1]/div[1]/div/div[1]/a/div/div[1]/span/span[1]
// <span class="css-1jxf684 r-bcqeeo r-1ttztb7 r-qvutc0 r-1tl8opc" style="text-overflow: unset;">【特別なご案内です】 今すぐプロフィ一ル確認して景品GET(キャンペ一ン)へ</span>

// //*[@id="react-root"]/div/div/div[2]/main/div/div/div/div[1]/div/div[3]/section/div/div/div[6]/div/div/button/div/div[2]/div[1]/div[1]/div/div[1]/a/div/div[1]/span
// <span class="css-1jxf684 r-dnmrzs r-1udh08x r-3s2u2q r-bcqeeo r-1ttztb7 r-qvutc0 r-1tl8opc" style="text-overflow: unset;">
//   <span class="css-1jxf684 r-bcqeeo r-1ttztb7 r-qvutc0 r-1tl8opc" style="text-overflow: unset;">【公式】総実績500件突破</span>
//   <img alt="🔥" draggable="false" src="https://abs-0.twimg.com/emoji/v2/svg/1f525.svg" title="炎" class="r-4qtqp9 r-dflpy8 r-k4bwe5 r-1kpi4qh r-pp5qcn r-h9hxbl">
//   <span class="css-1jxf684 r-bcqeeo r-1ttztb7 r-qvutc0 r-1tl8opc" style="text-overflow: unset;">いいねされたらご当選確定！おめでとうございます</span>
//   <img alt="🎉" draggable="false" src="https://abs-0.twimg.com/emoji/v2/svg/1f389.svg" title="クラッカー" class="r-4qtqp9 r-dflpy8 r-k4bwe5 r-1kpi4qh r-pp5qcn r-h9hxbl">
//   <span class="css-1jxf684 r-bcqeeo r-1ttztb7 r-qvutc0 r-1tl8opc r-9iso6" style="text-overflow: unset;"></span>
// </span>

// //*[@id="react-root"]/div/div/div[2]/main/div/div/div/div[1]/div/div[3]/section/div/div/div[1]/div/div/button/div/div[2]/div[1]/div[1]/div/div[1]/a/div/div[1]/span
// <span class="css-1jxf684 r-dnmrzs r-1udh08x r-3s2u2q r-bcqeeo r-1ttztb7 r-qvutc0 r-1tl8opc" style="text-overflow: unset;">
//   <span class="css-1jxf684 r-bcqeeo r-1ttztb7 r-qvutc0 r-1tl8opc" style="text-overflow: unset;">【公式】総実績500件突破</span>
//   <img alt="🔥" draggable="false" src="https://abs-0.twimg.com/emoji/v2/svg/1f525.svg" title="炎" class="r-4qtqp9 r-dflpy8 r-k4bwe5 r-1kpi4qh r-pp5qcn r-h9hxbl">
//   <span class="css-1jxf684 r-bcqeeo r-1ttztb7 r-qvutc0 r-1tl8opc" style="text-overflow: unset;">いいねされたらご当選確定！おめでとうございます</span>
//   <img alt="🎉" draggable="false" src="https://abs-0.twimg.com/emoji/v2/svg/1f389.svg" title="クラッカー" class="r-4qtqp9 r-dflpy8 r-k4bwe5 r-1kpi4qh r-pp5qcn r-h9hxbl">
//   <span class="css-1jxf684 r-bcqeeo r-1ttztb7 r-qvutc0 r-1tl8opc r-9iso6" style="text-overflow: unset;"></span>
// </span>

// //*[@id="react-root"]/div/div/div[2]/main/div/div/div/div[1]/div/div[3]/section/div/div/div[2]/div/div/button/div/div[2]/div[1]/div[2]/button
// <button aria-describedby="id__3vpg9bbvehs" aria-label="フォロー中 @shapoco" role="button" class="css-175oi2r r-sdzlij r-1phboty r-rs99b7 r-lrvibr r-15ysp7h r-4wgw6l r-3pj75a r-1loqt21 r-o7ynqc r-6416eg r-1ny4l3l" data-testid="858142314849378304-unfollow" type="button" style="background-color: rgba(0, 0, 0, 0); border-color: rgb(207, 217, 222);">
//   <div dir="ltr" class="css-146c3p1 r-bcqeeo r-qvutc0 r-1tl8opc r-q4m81j r-a023e6 r-rjixqe r-b88u0q r-1awozwy r-6koalj r-18u37iz r-16y2uox r-1777fci" style="text-overflow: unset; color: rgb(15, 20, 25);">
//     <span class="css-1jxf684 r-dnmrzs r-1udh08x r-3s2u2q r-bcqeeo r-1ttztb7 r-qvutc0 r-1tl8opc r-1b43r93 r-1cwl3u0" style="text-overflow: unset;">
//       <span class="css-1jxf684 r-bcqeeo r-1ttztb7 r-qvutc0 r-1tl8opc" style="text-overflow: unset;">
//         フォロー中
//       </span>
//     </span>
//   </div>
// </button>

// //*[@id="react-root"]/div/div/div[2]/main/div/div/div/div[1]/div/div[3]/section/div/div/div[1]/div/div/button/div/div[1]/div/div/div[2]/div/div[2]/div/a/div[3]/div/div[2]/div/div
// <div class="css-175oi2r r-1niwhzg r-vvn4in r-u6sd8q r-1p0dtai r-1pi2tsx r-1d2f490 r-u8s1d r-zchlnj r-ipm5af r-13qz1uu r-1wyyakw r-4gszlv" style="background-image: url(&quot;https://pbs.twimg.com/profile_images/1835709222513971201/O5HOnatY_normal.png&quot;);"></div>

document.getElementById('findspam_btn').addEventListener("click", (event) => {
  const rmvKnown = document.getElementById('findspam_rmv_known').checked;
  var s = '';
  for (var i = 0; i < ids.length; i++) {
    if (!rmvKnown || !known_indexes.includes(i)) {
      s += ids[i] + '\r\n';
    }
  }
  document.getElementById('findspan_ids').innerHTML = s;
  navigator.clipboard.writeText(s);
});
//function joinIds() {
//  //document.getElementById('findspan_ids').innerHTML = ids.join('\r\n');
//}

