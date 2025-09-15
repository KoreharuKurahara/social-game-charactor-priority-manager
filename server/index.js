/**
 * ローカル開発サーバー
 * Google Apps Scriptの機能をローカルで模擬
 */

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

// ミドルウェア設定
app.use(helmet({
  contentSecurityPolicy: false // 開発環境用
}));
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 静的ファイル配信
app.use('/static', express.static(path.join(__dirname, '../public')));

// モックデータの読み込み
const mockData = require('./mockData');

// ルート設定
app.get('/', (req, res) => {
  // index.htmlを読み込んでローカル用に変換
  const indexPath = path.join(__dirname, '../src/index.html');
  let html = fs.readFileSync(indexPath, 'utf8');
  
  // Google Apps Script用のinclude文をローカル用に変換
  html = html.replace(/<\?!= include\('([^']+)'\); \?>/g, (match, filename) => {
    const filePath = path.join(__dirname, `../src/${filename}.html`);
    console.log(`📄 Include処理: ${filename} -> ${filePath}`);
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, 'utf8');
      console.log(`✅ ファイル読み込み成功: ${filename} (${content.length}文字)`);
      return content;
    } else {
      console.log(`❌ ファイルが見つかりません: ${filePath}`);
      return '';
    }
  });
  
  // 開発用バナーを追加
  html = html.replace('<body>', `<body>
    <div class="dev-banner">
      ローカル開発モード - ポート${PORT} - モックデータ使用中
    </div>`);
  
  // 代替CSSリンクを追加（includeが失敗した場合の備え）
  html = html.replace('</head>', `
    <link rel="stylesheet" href="/static/css/styles.css">
    </head>
  `);
  
  // ローカル開発用のスクリプトを追加
  html = html.replace('</body>', `
    <script>
      // ローカル開発環境フラグ
      window.IS_LOCAL_DEV = true;
      window.API_BASE_URL = 'http://localhost:${PORT}';
      console.log('🔧 ローカル開発モード起動');
      console.log('📡 API Base URL:', window.API_BASE_URL);
    </script>
    <script src="/static/js/local-dev.js"></script>
    </body>
  `);
  
  res.send(html);
});

// デバッグページ
app.get('/debug', (req, res) => {
  const debugPath = path.join(__dirname, '../public/debug.html');
  res.sendFile(debugPath);
});

// API エンドポイント
app.get('/api/statistics', (req, res) => {
  console.log('📊 統計情報API呼び出し');
  try {
    const stats = mockData.getStatistics();
    res.json(stats);
  } catch (error) {
    console.error('❌ 統計情報エラー:', error);
    res.status(500).json({ error: 'Internal Server Error', message: error.message });
  }
});

app.get('/api/characters', (req, res) => {
  console.log('👥 キャラクター取得API呼び出し', req.query);
  try {
    const options = req.query;
    
    // 特殊なクエリパラメータの処理
    if (options.priority === 'high') {
      // 高優先度キャラクター
      const characters = mockData.getUnownedCharactersWithOptions({});
      const highPriority = characters.filter(c => c.priority >= 8);
      res.json(highPriority);
    } else if (options.priority === 'unset') {
      // 優先度未設定キャラクター
      const characters = mockData.getUnownedCharactersWithOptions({});
      const unset = characters.filter(c => c.priority === null);
      res.json(unset);
    } else {
      const result = mockData.getUnownedCharactersWithOptions(options);
      res.json(result);
    }
  } catch (error) {
    console.error('❌ キャラクター取得エラー:', error);
    res.status(500).json({ error: 'Internal Server Error', message: error.message });
  }
});

app.get('/api/characters/paginated', (req, res) => {
  console.log('📄 ページネーションAPI呼び出し', req.query);
  const options = {
    page: parseInt(req.query.page) || 1,
    pageSize: parseInt(req.query.pageSize) || 20,
    sortBy: req.query.sortBy || 'priority',
    sortOrder: req.query.sortOrder || 'desc',
    attribute: req.query.attribute || '',
    shopType: req.query.shopType || '',
    priorityStatus: req.query.priorityStatus || '',
    search: req.query.search || ''
  };
  res.json(mockData.getCharactersWithPagination(options));
});

app.get('/api/characters/:id/details', (req, res) => {
  console.log('🔍 キャラクター詳細API呼び出し', req.params.id);
  res.json(mockData.getCharacterDetails(req.params.id));
});

app.get('/api/dashboard', (req, res) => {
  console.log('📈 ダッシュボードAPI呼び出し');
  res.json(mockData.getDashboardData());
});

app.put('/api/characters/:rowIndex/priority', (req, res) => {
  console.log('✏️ 優先度更新API呼び出し', req.params.rowIndex, req.body.priority);
  const result = mockData.updatePriority(parseInt(req.params.rowIndex), req.body.priority);
  res.json(result);
});

// 開発用エンドポイント
app.get('/api/dev/reload-mock', (req, res) => {
  console.log('🔄 モックデータリロード');
  delete require.cache[require.resolve('./mockData')];
  res.json({ success: true, message: 'モックデータをリロードしました' });
});

app.get('/api/dev/test-data', (req, res) => {
  console.log('🧪 テストデータ確認');
  try {
    console.log('mockData object:', typeof mockData);
    console.log('mockData.getStatistics:', typeof mockData.getStatistics);
    
    const stats = mockData.getStatistics();
    console.log('stats result:', stats);
    
    const characters = mockData.getUnownedCharactersWithOptions({});
    console.log('characters result:', characters ? characters.length : 'null');
    
    res.json({
      stats: stats,
      characterCount: characters.length,
      sampleCharacters: characters.slice(0, 3),
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ テストデータエラー:', error);
    res.status(500).json({ error: 'Internal Server Error', message: error.message, stack: error.stack });
  }
});

app.get('/api/dev/status', (req, res) => {
  res.json({
    status: 'running',
    environment: 'development',
    port: PORT,
    timestamp: new Date().toISOString()
  });
});

// エラーハンドリング
app.use((err, req, res, next) => {
  console.error('❌ サーバーエラー:', err);
  res.status(500).json({
    error: 'Internal Server Error',
    message: err.message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// 404ハンドリング
app.use((req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: `Path ${req.path} not found`
  });
});

// サーバー起動
app.listen(PORT, () => {
  console.log('🚀 ローカル開発サーバーが起動しました');
  console.log(`📍 URL: http://localhost:${PORT}`);
  console.log(`🔧 環境: ${process.env.NODE_ENV || 'development'}`);
  console.log('');
  console.log('利用可能なエンドポイント:');
  console.log('  GET  /                     - Webアプリ');
  console.log('  GET  /api/statistics       - 統計情報');
  console.log('  GET  /api/characters       - キャラクター一覧');
  console.log('  GET  /api/characters/paginated - ページネーション');
  console.log('  GET  /api/dashboard        - ダッシュボード');
  console.log('  PUT  /api/characters/:id/priority - 優先度更新');
  console.log('');
  console.log('開発用:');
  console.log('  GET  /api/dev/status       - サーバー状態');
  console.log('  GET  /api/dev/reload-mock  - モックデータリロード');
});

module.exports = app;