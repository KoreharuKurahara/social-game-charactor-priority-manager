/**
 * 簡単なテスト関数
 * エラーを避けて基本機能をテスト
 */

/**
 * 最も基本的なテスト
 */
function runSimpleTest() {
  Logger.log('=== 簡単テスト開始 ===');
  
  var results = {
    tests: 0,
    passed: 0,
    failed: 0
  };
  
  // テスト1: 環境設定
  Logger.log('1. 環境設定テスト');
  results.tests++;
  try {
    var spreadsheetId = EnvConfig.getSpreadsheetId();
    Logger.log('✅ スプレッドシートID取得成功: ' + spreadsheetId.substring(0, 8) + '...');
    results.passed++;
  } catch (error) {
    Logger.log('❌ 環境設定エラー: ' + error.message);
    results.failed++;
  }
  
  // テスト2: スプレッドシート接続
  Logger.log('');
  Logger.log('2. スプレッドシート接続テスト');
  results.tests++;
  try {
    var spreadsheet = getSpreadsheet();
    Logger.log('✅ スプレッドシート接続成功: ' + spreadsheet.getName());
    results.passed++;
  } catch (error) {
    Logger.log('❌ スプレッドシート接続エラー: ' + error.message);
    results.failed++;
  }
  
  // テスト3: データ取得
  Logger.log('');
  Logger.log('3. データ取得テスト');
  results.tests++;
  try {
    var characters = SpreadsheetService.getAllCharacters();
    Logger.log('✅ 全キャラクター取得成功: ' + characters.length + '体');
    
    var unowned = SpreadsheetService.getUnownedCharacters();
    Logger.log('✅ 未所持キャラクター取得成功: ' + unowned.length + '体');
    results.passed++;
  } catch (error) {
    Logger.log('❌ データ取得エラー: ' + error.message);
    results.failed++;
  }
  
  // テスト4: 統計情報
  Logger.log('');
  Logger.log('4. 統計情報テスト');
  results.tests++;
  try {
    var stats = CharacterService.getStatistics();
    Logger.log('✅ 統計情報取得成功:');
    Logger.log('  総数: ' + stats.total);
    Logger.log('  所持済み: ' + stats.owned);
    Logger.log('  未所持: ' + stats.unowned);
    Logger.log('  優先度設定済み: ' + stats.priorities.set);
    results.passed++;
  } catch (error) {
    Logger.log('❌ 統計情報エラー: ' + error.message);
    results.failed++;
  }
  
  // テスト5: WebApp API
  Logger.log('');
  Logger.log('5. WebApp APIテスト');
  results.tests++;
  try {
    var apiStats = getStatistics();
    Logger.log('✅ API統計情報取得成功');
    
    var characters = getUnownedCharactersWithOptions({});
    Logger.log('✅ APIキャラクター取得成功: ' + characters.length + '体');
    results.passed++;
  } catch (error) {
    Logger.log('❌ WebApp APIエラー: ' + error.message);
    results.failed++;
  }
  
  // テスト6: UIController
  Logger.log('');
  Logger.log('6. UIControllerテスト');
  results.tests++;
  try {
    var dashboardData = getDashboardData();
    Logger.log('✅ ダッシュボードデータ取得成功');
    Logger.log('  完了率: ' + dashboardData.overview.completionRate + '%');
    
    var paginatedData = getCharactersWithPagination({ page: 1, pageSize: 5 });
    Logger.log('✅ ページネーション取得成功: ' + paginatedData.characters.length + '体');
    results.passed++;
  } catch (error) {
    Logger.log('❌ UIControllerエラー: ' + error.message);
    results.failed++;
  }
  
  // 結果サマリー
  Logger.log('');
  Logger.log('=== 簡単テスト結果 ===');
  Logger.log('総テスト数: ' + results.tests);
  Logger.log('成功: ' + results.passed + ' (' + Math.round(results.passed / results.tests * 100) + '%)');
  Logger.log('失敗: ' + results.failed + ' (' + Math.round(results.failed / results.tests * 100) + '%)');
  
  if (results.failed === 0) {
    Logger.log('');
    Logger.log('🎉 全てのテストが成功しました！');
    Logger.log('✨ アプリケーションは正常に動作しています。');
  } else {
    Logger.log('');
    Logger.log('⚠️  一部のテストが失敗しました。');
  }
  
  return results;
}

/**
 * 超簡単テスト（最低限）
 */
function runMinimalTest() {
  Logger.log('=== 最小限テスト ===');
  
  try {
    // 1. 接続確認
    var spreadsheet = getSpreadsheet();
    Logger.log('✅ 接続OK: ' + spreadsheet.getName());
    
    // 2. データ確認
    var characters = SpreadsheetService.getUnownedCharacters();
    Logger.log('✅ データOK: ' + characters.length + '体');
    
    // 3. API確認
    var stats = getStatistics();
    Logger.log('✅ API OK: 総数' + stats.total);
    
    Logger.log('');
    Logger.log('🎉 最小限テスト成功！基本機能は動作しています。');
    return true;
    
  } catch (error) {
    Logger.log('❌ 最小限テスト失敗: ' + error.message);
    return false;
  }
}

/**
 * 機能別テスト
 */
function testDataAccess() {
  Logger.log('=== データアクセステスト ===');
  
  try {
    // SpreadsheetService
    var validation = SpreadsheetService.validateSpreadsheetStructure();
    Logger.log('構造検証: ' + (validation.isValid ? '✅ OK' : '❌ NG'));
    
    var allChars = SpreadsheetService.getAllCharacters();
    Logger.log('全キャラクター: ✅ ' + allChars.length + '体');
    
    var unownedChars = SpreadsheetService.getUnownedCharacters();
    Logger.log('未所持キャラクター: ✅ ' + unownedChars.length + '体');
    
    return true;
  } catch (error) {
    Logger.log('❌ データアクセスエラー: ' + error.message);
    return false;
  }
}

function testCharacterServices() {
  Logger.log('=== キャラクターサービステスト ===');
  
  try {
    // CharacterService
    var stats = CharacterService.getStatistics();
    Logger.log('統計情報: ✅ 総数' + stats.total);
    
    var filtered = CharacterService.getUnownedCharactersWithOptions({ attribute: 'アクティブ' });
    Logger.log('フィルタ機能: ✅ アクティブ' + filtered.length + '体');
    
    var search = CharacterService.searchCharacters('サーバル');
    Logger.log('検索機能: ✅ "サーバル"' + search.length + '体');
    
    return true;
  } catch (error) {
    Logger.log('❌ キャラクターサービスエラー: ' + error.message);
    return false;
  }
}

function testUIController() {
  Logger.log('=== UIControllerテスト ===');
  
  try {
    // UIController
    var dashboard = getDashboardData();
    Logger.log('ダッシュボード: ✅ 完了率' + dashboard.overview.completionRate + '%');
    
    var paginated = getCharactersWithPagination({ page: 1, pageSize: 10 });
    Logger.log('ページネーション: ✅ ' + paginated.characters.length + '体/ページ');
    
    if (paginated.characters.length > 0) {
      var details = getCharacterDetails(paginated.characters[0].id);
      Logger.log('キャラクター詳細: ✅ ' + details.character.name);
    }
    
    return true;
  } catch (error) {
    Logger.log('❌ UIControllerエラー: ' + error.message);
    return false;
  }
}