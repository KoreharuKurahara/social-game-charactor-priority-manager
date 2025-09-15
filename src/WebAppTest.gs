/**
 * Webアプリのテスト関数
 */

/**
 * WebアプリのAPI関数をテスト
 */
function testWebAppAPI() {
  Logger.log('=== WebアプリAPI テスト開始 ===');
  
  try {
    // 1. 統計情報取得テスト
    Logger.log('1. 統計情報取得テスト');
    var stats = getStatistics();
    Logger.log('✅ 統計情報取得成功');
    Logger.log('  総キャラクター: ' + stats.total);
    Logger.log('  未所持: ' + stats.unowned);
    Logger.log('  優先度設定済み: ' + stats.priorities.set);
    
    // 2. キャラクター取得テスト
    Logger.log('');
    Logger.log('2. キャラクター取得テスト');
    var characters = getUnownedCharactersWithOptions({});
    Logger.log('✅ キャラクター取得成功: ' + characters.length + '体');
    
    if (characters.length > 0) {
      Logger.log('最初のキャラクター例:');
      Logger.log('  名前: ' + characters[0].name);
      Logger.log('  属性: ' + characters[0].attribute);
      Logger.log('  優先度: ' + (characters[0].priority || '未設定'));
    }
    
    // 3. フィルタテスト
    Logger.log('');
    Logger.log('3. フィルタテスト');
    
    // 属性フィルタ
    var activeChars = getUnownedCharactersWithOptions({ attribute: 'アクティブ' });
    Logger.log('  アクティブ属性: ' + activeChars.length + '体');
    
    // ショップフィルタ
    var shopChars = getUnownedCharactersWithOptions({ shopType: 'either' });
    Logger.log('  ショップ対象: ' + shopChars.length + '体');
    
    // 優先度フィルタ
    var unsetChars = getUnownedCharactersWithOptions({ priorityStatus: 'unset' });
    Logger.log('  優先度未設定: ' + unsetChars.length + '体');
    
    // 4. 検索テスト
    Logger.log('');
    Logger.log('4. 検索テスト');
    var searchResults = searchCharacters('サーバル');
    Logger.log('✅ "サーバル"検索結果: ' + searchResults.length + '体');
    
    // 5. 特殊取得テスト
    Logger.log('');
    Logger.log('5. 特殊取得テスト');
    var highPriorityChars = getHighPriorityCharacters();
    var noPriorityChars = getCharactersWithoutPriority();
    Logger.log('  高優先度キャラクター: ' + highPriorityChars.length + '体');
    Logger.log('  優先度未設定キャラクター: ' + noPriorityChars.length + '体');
    
    // 6. アプリ情報テスト
    Logger.log('');
    Logger.log('6. アプリ情報テスト');
    var appInfo = getAppInfo();
    Logger.log('✅ アプリ情報取得成功');
    Logger.log('  アプリ名: ' + appInfo.appName);
    Logger.log('  バージョン: ' + appInfo.version);
    Logger.log('  スプレッドシート: ' + appInfo.spreadsheetName);
    
    Logger.log('');
    Logger.log('🎉 WebアプリAPI テスト完了！');
    Logger.log('Webアプリをデプロイする準備ができました。');
    
  } catch (error) {
    Logger.log('❌ WebアプリAPI テストエラー: ' + error.toString());
    Logger.log('スタックトレース: ' + error.stack);
  }
}

/**
 * Webアプリのデプロイ準備確認
 */
function checkDeploymentReadiness() {
  Logger.log('=== デプロイ準備確認 ===');
  
  var checks = [];
  
  try {
    // 1. 環境設定確認
    try {
      var spreadsheetId = EnvConfig.getSpreadsheetId();
      checks.push('✅ 環境設定: OK');
    } catch (error) {
      checks.push('❌ 環境設定: ' + error.message);
    }
    
    // 2. スプレッドシート接続確認
    try {
      var spreadsheet = getSpreadsheet();
      checks.push('✅ スプレッドシート接続: OK (' + spreadsheet.getName() + ')');
    } catch (error) {
      checks.push('❌ スプレッドシート接続: ' + error.message);
    }
    
    // 3. データ取得確認
    try {
      var characters = SpreadsheetService.getUnownedCharacters();
      checks.push('✅ データ取得: OK (' + characters.length + '体)');
    } catch (error) {
      checks.push('❌ データ取得: ' + error.message);
    }
    
    // 4. API関数確認
    try {
      var stats = getStatistics();
      checks.push('✅ API関数: OK');
    } catch (error) {
      checks.push('❌ API関数: ' + error.message);
    }
    
    // 5. HTMLファイル確認
    try {
      var html = HtmlService.createTemplateFromFile('index').evaluate();
      checks.push('✅ HTMLファイル: OK');
    } catch (error) {
      checks.push('❌ HTMLファイル: ' + error.message);
    }
    
    // 結果表示
    Logger.log('デプロイ準備チェック結果:');
    for (var i = 0; i < checks.length; i++) {
      Logger.log('  ' + checks[i]);
    }
    
    var hasErrors = checks.some(function(check) {
      return check.indexOf('❌') !== -1;
    });
    
    if (hasErrors) {
      Logger.log('');
      Logger.log('⚠️  エラーがあります。修正してからデプロイしてください。');
    } else {
      Logger.log('');
      Logger.log('🎉 デプロイ準備完了！');
      Logger.log('「デプロイ」→「新しいデプロイ」でWebアプリを公開できます。');
    }
    
  } catch (error) {
    Logger.log('❌ デプロイ準備確認エラー: ' + error.toString());
  }
}