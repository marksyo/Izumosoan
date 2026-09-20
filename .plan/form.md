
1. Turnstile widgets
https://dash.cloudflare.com/e768fb77618c8989673a7590ea55cbeb/turnstile

Add Widget

Site key
(Click to copy)
0x4AAAAAAE9Wu2df0b05bHJW
Secret key
(Click to copy)
0x4AAAAAAE9WuzUr8YqrDLnIKf4qmMwxJLw


「全申込を1つにまとめる」なら Google Sheets が最適です。

R2 と Google Sheets の比較
R2 で1つのCSVに追記	Google Sheets（推奨）
追記	❌ ネイティブ非対応。読込→行追加→上書きが必要	✅ 行追加がネイティブ
同時送信	⚠️ 競合で行が消えるリスク	✅ 安全（Apps Script側で直列処理）
1つにまとまる	△ 可能だが不安定	✅ 1シートに全部




あなた側で必要な作業（3ステップ）
① Google Sheets を作成 + Apps Script を設置 新しいスプレッドシートを作り、Extensions → Apps Script に以下を貼り付けて Deploy（backend-API.md の推奨に沿った、全フィールド対応版）：

function doPost(e) {
  try {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Sheet1");
    const d = JSON.parse(e.postData.contents);
    sheet.appendRow([
      new Date(),                       // Received
      d.site || "",                     // Site
      d.form || "",                     // Form
      d.requestId || "",                // Request ID
      JSON.stringify(d.data || {}),     // Data (JSON: 氏名/会社/メール/食堂規模/関心方式など)
      d.message || "",                  // Message
      d.status || "New"                 // Status
    ]);
    return ContentService.createTextOutput(JSON.stringify({ success: true }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({ success: false, error: error.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
1行目のヘッダー例: Received | Site | Form | Request ID | Data | Message | Status
Deploy設定: Web app / Execute as: Me / Who has access: Anyone
発行された https://script.google.com/macros/s/XXXX/exec をコピー


5. Webアプリとしてデプロイする
Apps Script右上の、

デプロイ → 新しいデプロイ

を選択します。

デプロイ設定
種類の選択で ウェブアプリ
説明：Website API
次のユーザーとして実行：自分
アクセスできるユーザー：全員
デプロイをクリック
Googleアカウントのアクセス許可を承認
デプロイ後、次のようなURLが表示されます。

https://script.google.com/macros/s/XXXXXXXXXXXXXXXX/exec
この /exec で終わるURLがAPIのエンドポイントです。

デプロイを更新しました。
バージョン 1（2026/09/20 11:00）
デプロイ ID
AKfycbw2YaLmCG-jYATzFKwR8KmQcU_ITZirIKOYvD9RROqOAzR_Wg9KvOqz33UprKTEz8KG
ウェブアプリ
URL
https://script.google.com/macros/s/AKfycbw2YaLmCG-jYATzFKwR8KmQcU_ITZirIKOYvD9RROqOAzR_Wg9KvOqz33UprKTEz8KG/exec

https://script.google.com/macros/s/AKfycbw2YaLmCG-jYATzFKwR8KmQcU_ITZirIKOYvD9RROqOAzR_Wg9KvOqz33UprKTEz8KG/exec

https://script.google.com/macros/s/AKfycbzJlo1EG6Iqg8UTHkAq6XXHOijC4WuCFwkQ9W2gIBx34_KMzKfwZySeVcOzA8g632iW/exec
バージョン 3（2026/09/20 11:17）
デプロイ ID
AKfycbzJlo1EG6Iqg8UTHkAq6XXHOijC4WuCFwkQ9W2gIBx34_KMzKfwZySeVcOzA8g632iW
ウェブアプリ
URL
https://script.google.com/macros/s/AKfycbzJlo1EG6Iqg8UTHkAq6XXHOijC4WuCFwkQ9W2gIBx34_KMzKfwZySeVcOzA8g632iW/exec
npx wrangler secret put GOOGLE_SHEETS_WEBHOOK_IZUMOSOAN

https://script.google.com/macros/s/AKfycbzJlo1EG6Iqg8UTHkAq6XXHOijC4WuCFwkQ9W2gIBx34_KMzKfwZySeVcOzA8g632iW/exec

npx wrangler secret put GOOGLE_SHEETS_APIKEY_IZUMOSOAN
API_KEY = 079293bade3c02bf8ff6c1a8fbe56dc05a846f48222e9cb3067a9dcad40336c1




② Cloudflareにシークレット登録

cd C:\WWW\KaiseiX-website\API_Contactform
npx wrangler secret put GOOGLE_SHEETS_WEBHOOK_IZUMOSOAN
→ ①のexec URLを貼り付け

③ デプロイ

npx wrangler deploy
これで izumosoan の通常フォーム・POC申込の全データが専用シートに1件ずつ追記されます。

補足
LP申込の食堂規模・関心方式は、フロント側で data.message 本文に含めています（metadata にも構造化済み）。Google Sheetsの Data 列に個別フィールドとして出したい場合は、フロントの payload.data に scale/interests を直接入れる調整も可能です。

✅ API_KEY 認証の実装完了
🔑 生成したキー（推奨・Hex 64桁）
079293bade3c02bf8ff6c1a8fbe56dc05a846f48222e9cb3067a9dcad40336c1
この値を Apps Script のスクリプトプロパティ と Cloudflareシークレット の両方に同じものを設定します。

Worker側コード変更（4ファイル・完了）
ファイル	変更内容
types/env.ts	GOOGLE_SHEETS_APIKEY_IZUMOSOAN?: string を追加
config/sites.ts	型に apiKeySecretName? を追加＋izumosoanに設定
services/google-sheets.ts	appendGoogleSheetsContact が apiKey を受け取り payloadに含める
services/storage.ts	シークレットから apiKey を読んで渡す
設計上、apiKey は設定されているサイト（izumosoan）だけ送信され、他サイトは従来通り（apiKey なし）動作します。

あなた側の設定手順（3ステップ）
① Apps Script：スクリプトプロパティに登録
Apps Script エディタ → Project Settings（⚙️）→ Script Properties → Add script property

Property	Value
API_KEY	079293bade3c02bf8ff6c1a8fbe56dc05a846f48222e9cb3067a9dcad40336c1
② Apps Script：doPost をキー照合付きに（前回提示のコードを使用）
d.apiKey !== expectedKey なら UNAUTHORIZED を返す版です。

③ Cloudflare：シークレット登録＋デプロイ
cd C:\WWW\KaiseiX-website\API_Contactform
npx wrangler secret put GOOGLE_SHEETS_APIKEY_IZUMOSOAN
→ 同じキー 079293bade3c02bf8ff6c1a8fbe56dc05a846f48222e9cb3067a9dcad40336c1 を貼り付け

npx wrangler secret put GOOGLE_SHEETS_WEBHOOK_IZUMOSOAN
→ Apps Script の exec URL を貼り付け（まだの場合）

npx wrangler deploy
修正ファイル: sites.ts / env.ts / google-sheets.ts / storage.ts