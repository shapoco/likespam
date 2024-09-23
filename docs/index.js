likespam_menu = [
  { "name": "トップ"  , "url": "./"         },
  { "name": "PC用一覧", "url": "table.html" },
  { "name": "補足情報", "url": "info.html"  },
  { "name": "ツール"  , "url": "tools.html" },
];

function render_menu(index) {
  var i = 0;
  var html = '';
  likespam_menu.forEach(e => {
    if (i > 0) html += ' | ';
    if (index == i) {
      html += `<span style='font-weight: bold;'>${e.name}</span>`;
    }
    else {
      html += `<a href="${e.url}">${e.name}</a>`;
    }
    i += 1;
  });
  document.getElementById('menu').innerHTML = html;
}