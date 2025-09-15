# ローカル開発環境セットアップガイド

## 🚀 クイックスタート

### 1. 依存関係のインストール
```bash
npm install
```

### 2. 開発サーバーの起動
```bash
npm run dev
```

### 3. ブラウザでアクセス
```
http://localhost:3000
```

## 📁 プロジェクト構成

```
├── server/                 # Node.js開発サーバー
│   ├── index.js           # メインサーバーファイル
│   └── mockData.js        # モックデータ
├── public/                # 静的ファイル
│   └── js/
│       └── local-dev.js   # ローカル開発用JavaScript
├── src/                   # Google Apps Script用ソース
│   ├── index.html         # メインHTML
│   ├── styles.html        # CSS
│   └── script.html        # JavaScript
└── package.json           # Node.js設定
```

## 🔧 開発コマンド

### 基本コマンド
```bash
npm run dev          # 開発サーバー起動
npm run start        # 本番モードでサーバー起動
npm test             # テスト実行
npm run lint         # コード品質チェック
npm run format       # コードフォーマット
```

### ビルド・デプロイ
```bash
npm run build        # 本番用ビルド
npm run deploy       # Google Apps Scriptにデプロイ
```

## 🌐 API エンドポイント

### アプリケーションAPI
- `GET /` - Webアプリ
- `GET /api/statistics` - 統計情報
- `GET /api/characters` - キャラクター一覧
- `GET /api/characters/paginated` - ページネーション
- `GET /api/characters/:id/details` - キャラクター詳細
- `GET /api/dashboard` - ダッシュボード
- `PUT /api/characters/:id/priority` - 優先度更新

### 開発用API
- `GET /api/dev/status` - サーバー状態
- `GET /api/dev/reload-mock` - モックデータリロード

## 🧪 テスト・デバッグ

### ブラウザ開発者ツール
```javascript
// 開発用コマンド
devUtils.showDevInfo()        // 開発環境情報表示
devUtils.checkServerStatus()  // サーバー状態確認
devUtils.reloadMockData()     // モックデータリロード
```

### モックデータ
- 50体のサンプルキャラクター
- 20%が所持済み、80%が未所持
- 60%に優先度が設定済み
- 各属性・ショップタイプを網羅

## 🔄 開発ワークフロー

### 1. 機能開発
1. `src/` フォルダでHTML/CSS/JSを編集
2. ローカルサーバーで動作確認
3. 必要に応じてモックデータを調整

### 2. API開発
1. `server/mockData.js` でAPI動作を模擬
2. `server/index.js` でエンドポイント追加
3. `public/js/local-dev.js` でフロントエンド連携

### 3. デプロイ
1. ローカルでテスト完了
2. `npm run deploy` でGoogle Apps Scriptに同期
3. 本番環境で最終確認

## 🐛 トラブルシューティング

### よくある問題

**ポート3000が使用中**
```bash
# 別のポートを使用
PORT=3001 npm run dev
```

**モックデータが更新されない**
```javascript
// ブラウザで実行
devUtils.reloadMockData()
```

**APIエラーが発生**
```javascript
// サーバー状態確認
devUtils.checkServerStatus()
```

### ログ確認
- サーバーログ: ターミナルで確認
- ブラウザログ: 開発者ツールのConsoleタブ
- ネットワーク: 開発者ツールのNetworkタブ

## 📝 開発のヒント

### 効率的な開発
1. **ホットリロード**: ファイル変更時の自動更新
2. **モックデータ**: 実際のスプレッドシートに依存しない開発
3. **API模擬**: Google Apps Scriptと同じインターフェース
4. **デバッグ**: 豊富なログとエラー情報

### コード品質
1. **ESLint**: コード品質チェック
2. **Prettier**: 自動フォーマット
3. **Jest**: 単体テスト
4. **型安全**: TypeScript対応（オプション）

## 🚀 次のステップ

1. **Webpack設定**: バンドル・最適化
2. **TypeScript**: 型安全な開発
3. **Jest**: 単体テスト追加
4. **Cypress**: E2Eテスト
5. **GitHub Actions**: CI/CD自動化