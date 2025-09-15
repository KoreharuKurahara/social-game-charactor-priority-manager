# Google Apps Script セットアップガイド

## 1. Google Apps Scriptプロジェクトの作成

### 手順
1. [Google Apps Script](https://script.google.com/)にアクセス
2. 「新しいプロジェクト」をクリック
3. プロジェクト名を「けものフレンズ3優先度管理」に変更

## 2. ファイルのアップロード

### 必要なファイル
以下のファイルを順番にGoogle Apps Scriptエディタに追加してください：

1. **Code.gs** - メインエントリーポイント
2. **SpreadsheetService.gs** - データアクセス層
3. **Config.gs** - 設定管理
4. **TestRunner.gs** - テスト用（開発時のみ）

### アップロード方法
1. Google Apps Scriptエディタで「ファイル」→「新規」→「スクリプト」
2. デフォルトの`Code.gs`を削除し、`src/Code.gs`の内容をコピー&ペースト
3. 同様に他のファイルも追加

## 3. スプレッドシートの準備

### 必要な列構成
スプレッドシートに以下の列が必要です（1行目にヘッダー）：

| A | B | C | D | E | F | G | H |
|---|---|---|---|---|---|---|---|
| 通し番号 | フレンズ名 | 属性 | HC | 6周年直前スペシャルショップ | 6周年記念グレートショップ | 所持 | 優先度 |

### データ例
```
1    サーバル      アクティブ  HC情報  TRUE   FALSE  FALSE  8
2    フェネック    アクティブ  HC情報  FALSE  TRUE   TRUE   -
3    アライグマ    アクティブ  HC情報  FALSE  FALSE  FALSE  7
```

## 4. 初期設定

### 4.1 スプレッドシートIDの設定
1. スプレッドシートのURLからIDを取得
   ```
   https://docs.google.com/spreadsheets/d/SPREADSHEET_ID/edit
   ```
2. Google Apps Scriptエディタで以下を実行：
   ```javascript
   AppConfig.setSpreadsheetId("YOUR_SPREADSHEET_ID");
   ```

### 4.2 設定の確認
```javascript
AppConfig.initialize();
```

### 4.3 動作テスト
```javascript
runAllTests();
```

## 5. 権限の設定

初回実行時に以下の権限が要求されます：
- Googleスプレッドシートへのアクセス
- 外部サービスへの接続

「許可」をクリックして権限を付与してください。

## 6. トラブルシューティング

### よくあるエラー

**「スプレッドシートにアクセスできません」**
- スプレッドシートIDが正しく設定されているか確認
- スプレッドシートの共有設定を確認

**「必要な列が不足しています」**
- スプレッドシートの列名が正確に一致しているか確認
- 全角・半角、スペースに注意

**「権限エラー」**
- Google Apps Scriptの実行権限を確認
- スプレッドシートの編集権限を確認

### デバッグ方法
1. `Logger.log()`の出力を「実行」→「ログを表示」で確認
2. `testSpreadsheetService()`でデータ取得をテスト
3. `AppConfig.showConfig()`で設定を確認

## 次のステップ

タスク1が完了したら、タスク2（キャラクターデータ取得機能）に進んでください。