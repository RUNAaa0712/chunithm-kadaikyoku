// CSVデータを保持する変数
let songData = [];
let copyText = ''; // コピー用のテキストを保持

// ページが読み込まれたときにCSVを読み込み、イベントリスナーを設定
window.onload = function () {
  fetch('data.csv')
    .then(response => response.text())
    .then(csvText => {
      songData = parseCSV(csvText);
      setupDropdownListeners(); // ドロップダウンのイベントリスナーを設定
    })
    .catch(error => console.error('Error loading CSV:', error));
};

// CSVをパースする関数
function parseCSV(csvText) {
  const rows = csvText.split('\n');
  const headers = rows[0].split(',');
  return rows.slice(1).map(row => {
    const values = row.split(',');
    return headers.reduce((acc, header, index) => {
      acc[header.trim()] = index === 2 ? parseFloat(values[index].trim()) : values[index].trim();
      return acc;
    }, {});
  });
}

// 各リストボックスの変更時に他のリストボックスを初期化
function setupDropdownListeners() {
  const dropdowns = [
    document.getElementById('range-14'),
    document.getElementById('range-14-plus'),
    document.getElementById('range-15'),
    document.getElementById('range-15-plus')
  ];

  dropdowns.forEach((dropdown, index) => {
    dropdown.addEventListener('change', () => {
      // 他のリストボックスを初期化
      dropdowns.forEach((otherDropdown, otherIndex) => {
        if (index !== otherIndex) {
          otherDropdown.value = ''; // 初期化
        }
      });
    });
  });
}

// 曲を生成する関数
function generateSongs() {
  // 各リストボックスの値を取得
  const ranges = [
    document.getElementById('range-14').value,
    document.getElementById('range-14-plus').value,
    document.getElementById('range-15').value,
    document.getElementById('range-15-plus').value
  ];

  // 選択された値だけを数値としてフィルタリング
  const selectedConstants = ranges
    .filter(value => value !== '') // 空の値（ダミー）は除外
    .map(parseFloat);

  if (selectedConstants.length === 0) {
    alert('1つの範囲を選択してください。');
    return;
  }

  const selectedConstant = selectedConstants[0]; // 選択された定数
  const higherConstant = selectedConstant + 0.1; // 選択された定数+0.1

  // 選択されたロジックを取得
  const logic = document.getElementById('logic-select').value;

  let selectedSongs = [];
  if (logic === 'default') {
    // 定数から2曲、+0.1定数から1曲
    const matchingSongs = songData.filter(song => song.constant === selectedConstant);
    const higherSongs = songData.filter(song => song.constant === higherConstant);

    if (matchingSongs.length < 2 || higherSongs.length < 1) {
      alert('条件に一致する曲が十分にありません。');
      return;
    }

    selectedSongs = [
      ...getRandomUniqueItems(matchingSongs, 2),
      ...getRandomUniqueItems(higherSongs, 1)
    ];
  } else if (logic === 'same-constant') {
    // 同じ定数から3曲
    const matchingSongs = songData.filter(song => song.constant === selectedConstant);

    if (matchingSongs.length < 3) {
      alert('条件に一致する曲が十分にありません。');
      return;
    }

    selectedSongs = getRandomUniqueItems(matchingSongs, 3);
  }

  // 結果を表示
  const resultList = document.getElementById('result');
  resultList.innerHTML = ''; // 結果をクリア

  selectedSongs.forEach(song => {
    const li = document.createElement('li');
    li.textContent = `${song.title} (${song.level}) - 定数: ${song.constant}`;
    resultList.appendChild(li);
  });

  // コピー用テキストを生成
  copyText = selectedSongs.map(song => `[${song.level}] ${song.title}`).join('\n');
}

// ランダムに重複なく曲を選ぶヘルパー関数
function getRandomUniqueItems(array, count) {
  const copy = [...array]; // 配列をコピー
  const selected = [];
  while (selected.length < count && copy.length > 0) {
    const randomIndex = Math.floor(Math.random() * copy.length);
    selected.push(copy.splice(randomIndex, 1)[0]); // ランダムに選んで配列から削除
  }
  return selected;
}

// コピー機能を実装
function copyResults() {
  if (!copyText) {
    alert('生成された結果がありません。先に生成してください。');
    return;
  }

  // Clipboard API を使用してコピー
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(copyText).then(() => {
      alert('結果をクリップボードにコピーしました！');
    }).catch(err => {
      console.error('Clipboard API エラー:', err);
      fallbackCopyText(copyText); // フォールバック処理
    });
  } else {
    // Clipboard API が利用できない場合のフォールバック処理
    fallbackCopyText(copyText);
  }
}

// フォールバック処理: 仮想の textarea を使ったコピー
function fallbackCopyText(text) {
  const textArea = document.createElement('textarea');
  textArea.value = text;
  textArea.style.position = 'fixed'; // 固定位置に配置してスクロール影響を回避
  textArea.style.top = '0';
  textArea.style.left = '0';
  textArea.style.width = '2em';
  textArea.style.height = '2em';
  textArea.style.padding = '0';
  textArea.style.border = 'none';
  textArea.style.outline = 'none';
  textArea.style.boxShadow = 'none';
  textArea.style.background = 'transparent';

  document.body.appendChild(textArea);
  textArea.select();

  try {
    const successful = document.execCommand('copy');
    if (successful) {
      alert('結果をクリップボードにコピーしました！');
    } else {
      alert('コピーに失敗しました。');
    }
  } catch (err) {
    alert('コピー機能をサポートしていないブラウザです。');
    console.error('フォールバックコピーエラー:', err);
  }

  document.body.removeChild(textArea); // textarea を削除
}