/**
 * E2E（End-to-End）テストスイート
 * 実装した全機能の統合テスト
 */

/**
 * 全体E2Eテストの実行
 */
function runE2ETests() {
  Logger.log('=== E2Eテスト開始 ===');
  Logger.log('実行時刻: ' + new Date().toLocaleString('ja-JP'));
  
  var testResults = {
    total: 0,
    passed: 0,
    failed: 0,
    errors: []
  };
  
  try {
    // テスト1: 環境設定・基盤機能
    testResults = runTest(testResults, 'test1_Environment', '環境設定・基盤機能テスト');
    
    // テスト2: データアクセス層
    testResults = runTest(testResults, 'test2_DataAccess', 'データアクセス層テスト');
    
    // テスト3: キャラクターサービス
    testResults = runTest(testResults, 'test3_CharacterService', 'キャラクターサービステスト');
    
    // テスト4: WebアプリAPI
    testResults = runTest(testResults, 'test4_WebAppAPI', 'WebアプリAPIテスト');
    
    // テスト5: UIController
    testResults = runTest(testResults, 'test5_UIController', 'UIControllerテスト');
    
    // テスト6: 統合機能テスト
    testResults = runTest(testResults, 'test6_Integration', '統合機能テスト');
    
    // テスト7: パフォーマンステスト
    testResults = runTest(testResults, 'test7_Performance', 'パフォーマンステスト');
    
    // 結果サマリー
    Logger.log('');
    Logger.log('=== E2Eテスト結果サマリー ===');
    Logger.log('総テスト数: ' + testResults.total);
    Logger.log('成功: ' + testResults.passed + ' (' + Math.round(testResults.passed / testResults.total * 100) + '%)');
    Logger.log('失敗: ' + testResults.failed + ' (' + Math.round(testResults.failed / testResults.total * 100) + '%)');
    
    if (testResults.failed > 0) {
      Logger.log('');
      Logger.log('失敗したテスト:');
      for (var i = 0; i < testResults.errors.length; i++) {
        Logger.log('  ❌ ' + testResults.errors[i]);
      }
    }
    
    if (testResults.failed === 0) {
      Logger.log('');
      Logger.log('🎉 全てのE2Eテストが成功しました！');
      Logger.log('アプリケーションは本番環境で使用可能です。');
    } else {
      Logger.log('');
      Logger.log('⚠️  一部のテストが失敗しました。修正が必要です。');
    }
    
    return testResults;
    
  } catch (error) {
    Logger.log('❌ E2Eテスト実行エラー: ' + error.toString());
    return testResults;
  }
}

/**
 * テスト実行ヘルパー
 */
function runTest(testResults, testFunction, testName) {
  testResults.total++;
  
  try {
    Logger.log('');
    Logger.log('--- ' + testName + ' ---');
    
    var result = this[testFunction]();
    
    if (result.success) {
      testResults.passed++;
      Logger.log('✅ ' + testName + ' 成功');
    } else {
      testResults.failed++;
      testResults.errors.push(testName + ': ' + result.error);
      Logger.log('❌ ' + testName + ' 失敗: ' + result.error);
    }
    
  } catch (error) {
    testResults.failed++;
    testResults.errors.push(testName + ': ' + error.message);
    Logger.log('❌ ' + testName + ' エラー: ' + error.toString());
  }
  
  return testResults;
}

/**
 * テスト1: 環境設定・基盤機能
 */
function test1_Environment() {
  try {
    // 環境設定確認
    var spreadsheetId = EnvConfig.getSpreadsheetId();
    if (!spreadsheetId) {
      return { success: false, error: 'スプレッドシートIDが設定されていません' };
    }
    
    // スプレッドシート接続確認
    var spreadsheet = getSpreadsheet();
    if (!spreadsheet) {
      return { success: false, error: 'スプレッドシートに接続できません' };
    }
    
    Logger.log('  スプレッドシート名: ' + spreadsheet.getName());
    Logger.log('  スプレッドシートID: ' + spreadsheetId.substring(0, 8) + '...');
    
    return { success: true };
    
  } catch (error) {
    return { success: false, error: error.message };
  }
}

/**
 * テスト2: データアクセス層
 */
function test2_DataAccess() {
  try {
    // 構造検証
    var validation = SpreadsheetService.validateSpreadsheetStructure();
    if (!validation.isValid) {
      return { success: false, error: '必要な列が不足: ' + validation.missingColumns.join(', ') };
    }
    
    // 全キャラクター取得
    var allCharacters = SpreadsheetService.getAllCharacters();
    if (!allCharacters || allCharacters.length === 0) {
      return { success: false, error: 'キャラクターデータが取得できません' };
    }
    
    // 未所持キャラクター取得
    var unownedCharacters = SpreadsheetService.getUnownedCharacters();
    
    Logger.log('  全キャラクター数: ' + allCharacters.length);
    Logger.log('  未所持キャラクター数: ' + unownedCharacters.length);
    
    // データ整合性確認
    if (unownedCharacters.length > allCharacters.length) {
      return { success: false, error: 'データ整合性エラー: 未所持 > 全体' };
    }
    
    return { success: true };
    
  } catch (error) {
    return { success: false, error: error.message };
  }
}

/**
 * テスト3: キャラクターサービス
 */
function test3_CharacterService() {
  try {
    // 統計情報取得
    var stats = CharacterService.getStatistics();
    if (!stats || typeof stats.total !== 'number') {
      return { success: false, error: '統計情報の取得に失敗' };
    }
    
    // フィルタ機能テスト
    var filteredChars = CharacterService.getUnownedCharactersWithOptions({
      attribute: 'アクティブ'
    });
    
    // 検索機能テスト
    var searchResults = CharacterService.searchCharacters('サーバル');
    
    // 高優先度キャラクター取得
    var highPriorityChars = CharacterService.getHighPriorityCharacters();
    
    Logger.log('  統計情報: 総数' + stats.total + ', 未所持' + stats.unowned);
    Logger.log('  アクティブ属性: ' + filteredChars.length + '体');
    Logger.log('  "サーバル"検索結果: ' + searchResults.length + '体');
    Logger.log('  高優先度キャラクター: ' + highPriorityChars.length + '体');
    
    return { success: true };
    
  } catch (error) {
    return { success: false, error: error.message };
  }
}

/**
 * テスト4: WebアプリAPI
 */
function test4_WebAppAPI() {
  try {
    // 統計情報API
    var stats = getStatistics();
    if (!stats) {
      return { success: false, error: '統計情報APIが動作しません' };
    }
    
    // キャラクター取得API
    var characters = getUnownedCharactersWithOptions({});
    if (!characters) {
      return { success: false, error: 'キャラクター取得APIが動作しません' };
    }
    
    // アプリ情報API
    var appInfo = getAppInfo();
    if (!appInfo) {
      return { success: false, error: 'アプリ情報APIが動作しません' };
    }
    
    Logger.log('  統計情報API: OK');
    Logger.log('  キャラクター取得API: ' + characters.length + '体');
    Logger.log('  アプリ情報API: ' + appInfo.appName);
    
    return { success: true };
    
  } catch (error) {
    return { success: false, error: error.message };
  }
}

/**
 * テスト5: UIController
 */
function test5_UIController() {
  try {
    // ページネーション機能
    var paginatedData = getCharactersWithPagination({
      page: 1,
      pageSize: 10
    });
    
    if (!paginatedData || !paginatedData.characters || !paginatedData.pagination) {
      return { success: false, error: 'ページネーション機能が動作しません' };
    }
    
    // ダッシュボードデータ
    var dashboardData = getDashboardData();
    if (!dashboardData || !dashboardData.overview) {
      return { success: false, error: 'ダッシュボード機能が動作しません' };
    }
    
    // キャラクター詳細（最初のキャラクターで試行）
    if (paginatedData.characters.length > 0) {
      var characterId = paginatedData.characters[0].id;
      var details = getCharacterDetails(characterId);
      
      if (!details || !details.character) {
        return { success: false, error: 'キャラクター詳細機能が動作しません' };
      }
      
      Logger.log('  キャラクター詳細テスト: ' + details.character.name);
    }
    
    Logger.log('  ページネーション: ' + paginatedData.characters.length + '体/ページ');
    Logger.log('  ダッシュボード: 完了率' + dashboardData.overview.completionRate + '%');
    
    return { success: true };
    
  } catch (error) {
    return { success: false, error: error.message };
  }
}

/**
 * テスト6: 統合機能テスト
 */
function test6_Integration() {
  try {
    // 優先度更新テスト（実際には更新しない）
    var unownedChars = SpreadsheetService.getUnownedCharacters();
    if (unownedChars.length === 0) {
      Logger.log('  優先度更新テスト: スキップ（未所持キャラクターなし）');
      return { success: true };
    }
    
    var testChar = unownedChars[0];
    var originalPriority = testChar.priority;
    
    Logger.log('  優先度更新テスト対象: ' + testChar.name);
    Logger.log('  現在の優先度: ' + (originalPriority || '未設定'));
    
    // 実際の更新はテスト環境でのみ実行
    // var updateResult = SpreadsheetService.updatePriority(testChar.rowIndex, 5);
    
    // フィルタとソートの組み合わせテスト
    var complexFilter = CharacterService.getUnownedCharactersWithOptions({
      attribute: 'アクティブ',
      priorityStatus: 'unset'
    });
    
    Logger.log('  複合フィルタテスト: アクティブ×優先度未設定 = ' + complexFilter.length + '体');
    
    return { success: true };
    
  } catch (error) {
    return { success: false, error: error.message };
  }
}

/**
 * テスト7: パフォーマンステスト
 */
function test7_Performance() {
  try {
    var startTime = new Date().getTime();
    
    // 大量データ処理テスト
    var allCharacters = SpreadsheetService.getAllCharacters();
    var dataLoadTime = new Date().getTime() - startTime;
    
    startTime = new Date().getTime();
    var stats = CharacterService.getStatistics();
    var statsTime = new Date().getTime() - startTime;
    
    startTime = new Date().getTime();
    var paginatedData = getCharactersWithPagination({ page: 1, pageSize: 50 });
    var paginationTime = new Date().getTime() - startTime;
    
    Logger.log('  データ読み込み時間: ' + dataLoadTime + 'ms');
    Logger.log('  統計計算時間: ' + statsTime + 'ms');
    Logger.log('  ページネーション時間: ' + paginationTime + 'ms');
    
    // パフォーマンス基準（目安）
    if (dataLoadTime > 5000) {
      return { success: false, error: 'データ読み込みが遅すぎます: ' + dataLoadTime + 'ms' };
    }
    
    if (statsTime > 3000) {
      return { success: false, error: '統計計算が遅すぎます: ' + statsTime + 'ms' };
    }
    
    return { success: true };
    
  } catch (error) {
    return { success: false, error: error.message };
  }
}

/**
 * 簡易E2Eテスト（重要機能のみ）
 */
function runQuickE2ETest() {
  Logger.log('=== 簡易E2Eテスト ===');
  
  try {
    // 1. 基本接続
    var spreadsheet = getSpreadsheet();
    Logger.log('✅ スプレッドシート接続: ' + spreadsheet.getName());
    
    // 2. データ取得
    var characters = SpreadsheetService.getUnownedCharacters();
    Logger.log('✅ データ取得: ' + characters.length + '体');
    
    // 3. API機能
    var stats = getStatistics();
    Logger.log('✅ API機能: 統計情報取得成功');
    
    // 4. UI機能
    var dashboardData = getDashboardData();
    Logger.log('✅ UI機能: ダッシュボードデータ取得成功');
    
    Logger.log('');
    Logger.log('🎉 簡易E2Eテスト完了！主要機能は正常に動作しています。');
    
    return true;
    
  } catch (error) {
    Logger.log('❌ 簡易E2Eテストエラー: ' + error.toString());
    return false;
  }
}