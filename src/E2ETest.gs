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
    
    // テスト8: 要件9 - 所持ステータス確認・更新機能
    testResults = runTest(testResults, 'test8_OwnershipStatusManagement', '要件9: 所持ステータス確認・更新機能テスト');
    
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
 * テスト8: 要件9 - 所持ステータス確認・更新機能
 */
function test8_OwnershipStatusManagement() {
  try {
    Logger.log('  --- TC-9.1: 所持ステータスの視覚的表示テスト ---');
    
    // 全キャラクターデータを取得（所持済み含む）
    var allCharacters = SpreadsheetService.getAllCharacters();
    if (!allCharacters || allCharacters.length === 0) {
      return { success: false, error: 'キャラクターデータが取得できません' };
    }
    
    // 所持済みと未所持の分類確認
    var ownedCharacters = allCharacters.filter(function(c) { return c.owned; });
    var unownedCharacters = allCharacters.filter(function(c) { return !c.owned; });
    
    Logger.log('    全キャラクター数: ' + allCharacters.length);
    Logger.log('    所持済みキャラクター数: ' + ownedCharacters.length);
    Logger.log('    未所持キャラクター数: ' + unownedCharacters.length);
    
    if (ownedCharacters.length === 0) {
      Logger.log('    ⚠️  所持済みキャラクターがありません（テストデータ要確認）');
    }
    
    Logger.log('  --- TC-9.2: キャラクター詳細機能テスト ---');
    
    // キャラクター詳細取得機能のテスト
    if (allCharacters.length > 0) {
      var testCharacter = allCharacters[0];
      var characterDetails = getCharacterDetails(testCharacter.id);
      
      if (!characterDetails || !characterDetails.character) {
        return { success: false, error: 'キャラクター詳細取得機能が動作しません' };
      }
      
      Logger.log('    キャラクター詳細取得成功: ' + characterDetails.character.name);
      Logger.log('    所持ステータス: ' + (characterDetails.character.owned ? '所持済み' : '未所持'));
      
      // 類似キャラクター機能の確認
      if (characterDetails.similarCharacters) {
        Logger.log('    類似キャラクター数: ' + characterDetails.similarCharacters.length);
      }
    }
    
    Logger.log('  --- TC-9.3: 所持ステータス更新機能テスト ---');
    
    // 所持ステータス更新機能のテスト（実際には更新しない）
    if (unownedCharacters.length > 0) {
      var testUnownedChar = unownedCharacters[0];
      Logger.log('    テスト対象（未所持）: ' + testUnownedChar.name + ' (行' + testUnownedChar.rowIndex + ')');
      
      // 実際の更新はテスト環境でのみ実行
      // var updateResult = SpreadsheetService.updateOwnershipStatus(testUnownedChar.rowIndex, true);
      Logger.log('    所持ステータス更新機能: 利用可能（実際の更新はスキップ）');
    }
    
    if (ownedCharacters.length > 0) {
      var testOwnedChar = ownedCharacters[0];
      Logger.log('    テスト対象（所持済み）: ' + testOwnedChar.name + ' (行' + testOwnedChar.rowIndex + ')');
      Logger.log('    所持ステータス更新機能: 利用可能（実際の更新はスキップ）');
    }
    
    Logger.log('  --- TC-9.4: 統計情報計算テスト ---');
    
    // 統計情報の正確性確認
    var stats = CharacterService.getStatistics();
    var calculatedOwned = ownedCharacters.length;
    var calculatedUnowned = unownedCharacters.length;
    var calculatedTotal = allCharacters.length;
    
    if (stats.owned !== calculatedOwned) {
      return { success: false, error: '統計情報の所持済み数が不正: 期待値' + calculatedOwned + ', 実際' + stats.owned };
    }
    
    if (stats.unowned !== calculatedUnowned) {
      return { success: false, error: '統計情報の未所持数が不正: 期待値' + calculatedUnowned + ', 実際' + stats.unowned };
    }
    
    if (stats.total !== calculatedTotal) {
      return { success: false, error: '統計情報の総数が不正: 期待値' + calculatedTotal + ', 実際' + stats.total };
    }
    
    Logger.log('    統計情報計算: 正確');
    Logger.log('    総数: ' + stats.total + ', 所持済み: ' + stats.owned + ', 未所持: ' + stats.unowned);
    
    // 優先度設定済み数の確認
    var prioritySetCount = unownedCharacters.filter(function(c) {
      return c.priority !== null && c.priority !== '';
    }).length;
    
    if (stats.priorities && stats.priorities.set !== prioritySetCount) {
      return { success: false, error: '優先度設定済み数が不正: 期待値' + prioritySetCount + ', 実際' + stats.priorities.set };
    }
    
    Logger.log('    優先度設定済み数: ' + prioritySetCount);
    
    Logger.log('  --- TC-9.5: ダッシュボード統合テスト ---');
    
    // ダッシュボードデータの整合性確認
    var dashboardData = getDashboardData();
    if (!dashboardData || !dashboardData.overview) {
      return { success: false, error: 'ダッシュボードデータが取得できません' };
    }
    
    var overview = dashboardData.overview;
    if (overview.totalCharacters !== calculatedTotal) {
      return { success: false, error: 'ダッシュボードの総数が不正: 期待値' + calculatedTotal + ', 実際' + overview.totalCharacters };
    }
    
    if (overview.ownedCharacters !== calculatedOwned) {
      return { success: false, error: 'ダッシュボードの所持済み数が不正: 期待値' + calculatedOwned + ', 実際' + overview.ownedCharacters };
    }
    
    if (overview.unownedCharacters !== calculatedUnowned) {
      return { success: false, error: 'ダッシュボードの未所持数が不正: 期待値' + calculatedUnowned + ', 実際' + overview.unownedCharacters };
    }
    
    // 完成率の計算確認
    var expectedCompletionRate = Math.round(calculatedOwned / calculatedTotal * 100);
    if (overview.completionRate !== expectedCompletionRate) {
      return { success: false, error: '完成率が不正: 期待値' + expectedCompletionRate + '%, 実際' + overview.completionRate + '%' };
    }
    
    Logger.log('    ダッシュボード統合: 正常');
    Logger.log('    完成率: ' + overview.completionRate + '%');
    
    Logger.log('  --- TC-9.6: 表示切り替え機能テスト ---');
    
    // 未所持のみ取得
    var unownedOnly = SpreadsheetService.getUnownedCharacters();
    if (unownedOnly.length !== calculatedUnowned) {
      return { success: false, error: '未所持キャラクター取得が不正: 期待値' + calculatedUnowned + ', 実際' + unownedOnly.length };
    }
    
    // 全キャラクター取得
    var allCharsFromService = SpreadsheetService.getAllCharacters();
    if (allCharsFromService.length !== calculatedTotal) {
      return { success: false, error: '全キャラクター取得が不正: 期待値' + calculatedTotal + ', 実際' + allCharsFromService.length };
    }
    
    Logger.log('    表示切り替え機能: 正常');
    Logger.log('    未所持のみ: ' + unownedOnly.length + '体');
    Logger.log('    全キャラクター: ' + allCharsFromService.length + '体');
    
    Logger.log('  --- TC-9.7: エラーハンドリングテスト ---');
    
    // 不正なキャラクターIDでの詳細取得テスト
    try {
      var invalidDetails = getCharacterDetails('INVALID_ID');
      // エラーが発生しなかった場合は問題
      if (invalidDetails) {
        Logger.log('    ⚠️  不正IDでもデータが返されました（要確認）');
      }
    } catch (error) {
      Logger.log('    不正ID処理: 正常にエラーハンドリング');
    }
    
    // 不正な行インデックスでの更新テスト
    try {
      // 実際には更新しないが、関数の存在確認
      if (typeof SpreadsheetService.updateOwnershipStatus === 'function') {
        Logger.log('    所持ステータス更新関数: 利用可能');
      } else {
        return { success: false, error: '所持ステータス更新関数が定義されていません' };
      }
    } catch (error) {
      return { success: false, error: '所持ステータス更新関数のテストでエラー: ' + error.message };
    }
    
    Logger.log('  --- TC-9.8: パフォーマンステスト ---');
    
    // 統計情報計算のパフォーマンス
    var startTime = new Date().getTime();
    var perfStats = CharacterService.getStatistics();
    var statsCalcTime = new Date().getTime() - startTime;
    
    // ダッシュボードデータ取得のパフォーマンス
    startTime = new Date().getTime();
    var perfDashboard = getDashboardData();
    var dashboardTime = new Date().getTime() - startTime;
    
    Logger.log('    統計情報計算時間: ' + statsCalcTime + 'ms');
    Logger.log('    ダッシュボード取得時間: ' + dashboardTime + 'ms');
    
    // パフォーマンス基準（3秒以内）
    if (statsCalcTime > 3000) {
      Logger.log('    ⚠️  統計情報計算が遅い: ' + statsCalcTime + 'ms');
    }
    
    if (dashboardTime > 3000) {
      Logger.log('    ⚠️  ダッシュボード取得が遅い: ' + dashboardTime + 'ms');
    }
    
    Logger.log('  --- 要件9テスト完了 ---');
    
    return { success: true };
    
  } catch (error) {
    return { success: false, error: error.message };
  }
}

/**
 * 要件9専用の詳細テスト（実際の更新を含む）
 * 注意: このテストは実際にデータを変更します
 */
function test8_OwnershipStatusManagement_WithActualUpdates() {
  Logger.log('=== 要件9 実更新テスト（注意: データを変更します） ===');
  
  try {
    // テスト前の状態を記録
    var initialStats = CharacterService.getStatistics();
    Logger.log('テスト前統計: 総数' + initialStats.total + ', 所持済み' + initialStats.owned + ', 未所持' + initialStats.unowned);
    
    // 未所持キャラクターを1体取得
    var unownedChars = SpreadsheetService.getUnownedCharacters();
    if (unownedChars.length === 0) {
      return { success: false, error: 'テスト用の未所持キャラクターがありません' };
    }
    
    var testChar = unownedChars[0];
    Logger.log('テスト対象: ' + testChar.name + ' (行' + testChar.rowIndex + ')');
    
    // TC-9.4: 未所持から所持済みへの更新
    Logger.log('--- 未所持→所持済み更新テスト ---');
    var updateResult1 = SpreadsheetService.updateOwnershipStatus(testChar.rowIndex, true);
    
    if (!updateResult1) {
      return { success: false, error: '所持ステータス更新（未所持→所持済み）に失敗' };
    }
    
    // 更新後の統計確認
    var afterUpdate1Stats = CharacterService.getStatistics();
    Logger.log('更新後統計: 総数' + afterUpdate1Stats.total + ', 所持済み' + afterUpdate1Stats.owned + ', 未所持' + afterUpdate1Stats.unowned);
    
    // 統計の変化確認
    if (afterUpdate1Stats.owned !== initialStats.owned + 1) {
      return { success: false, error: '所持済み数が正しく更新されていません: 期待値' + (initialStats.owned + 1) + ', 実際' + afterUpdate1Stats.owned };
    }
    
    if (afterUpdate1Stats.unowned !== initialStats.unowned - 1) {
      return { success: false, error: '未所持数が正しく更新されていません: 期待値' + (initialStats.unowned - 1) + ', 実際' + afterUpdate1Stats.unowned };
    }
    
    Logger.log('✅ 未所持→所持済み更新: 成功');
    
    // TC-9.5: 所持済みから未所持への更新（元に戻す）
    Logger.log('--- 所持済み→未所持更新テスト（復元） ---');
    var updateResult2 = SpreadsheetService.updateOwnershipStatus(testChar.rowIndex, false);
    
    if (!updateResult2) {
      return { success: false, error: '所持ステータス更新（所持済み→未所持）に失敗' };
    }
    
    // 復元後の統計確認
    var afterUpdate2Stats = CharacterService.getStatistics();
    Logger.log('復元後統計: 総数' + afterUpdate2Stats.total + ', 所持済み' + afterUpdate2Stats.owned + ', 未所持' + afterUpdate2Stats.unowned);
    
    // 元の状態に戻ったか確認
    if (afterUpdate2Stats.owned !== initialStats.owned) {
      return { success: false, error: '所持済み数が元に戻っていません: 期待値' + initialStats.owned + ', 実際' + afterUpdate2Stats.owned };
    }
    
    if (afterUpdate2Stats.unowned !== initialStats.unowned) {
      return { success: false, error: '未所持数が元に戻っていません: 期待値' + initialStats.unowned + ', 実際' + afterUpdate2Stats.unowned };
    }
    
    Logger.log('✅ 所持済み→未所持更新: 成功');
    Logger.log('✅ データ復元: 成功');
    
    // TC-9.6: 統計情報リアルタイム更新確認
    Logger.log('--- 統計情報リアルタイム更新確認 ---');
    
    // ダッシュボードデータも正しく更新されているか確認
    var finalDashboard = getDashboardData();
    if (finalDashboard.overview.ownedCharacters !== afterUpdate2Stats.owned) {
      return { success: false, error: 'ダッシュボードの統計情報が同期されていません' };
    }
    
    Logger.log('✅ ダッシュボード統計同期: 成功');
    
    Logger.log('=== 要件9 実更新テスト完了 ===');
    Logger.log('🎉 全ての所持ステータス管理機能が正常に動作しています');
    
    return { success: true };
    
  } catch (error) {
    Logger.log('❌ 要件9 実更新テストエラー: ' + error.toString());
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
    
    // 5. 要件9: 所持ステータス管理機能
    var allChars = SpreadsheetService.getAllCharacters();
    var ownedCount = allChars.filter(function(c) { return c.owned; }).length;
    var unownedCount = allChars.filter(function(c) { return !c.owned; }).length;
    Logger.log('✅ 要件9: 所持ステータス管理 - 所持済み' + ownedCount + '体, 未所持' + unownedCount + '体');
    
    // キャラクター詳細機能の確認
    if (allChars.length > 0) {
      var testDetails = getCharacterDetails(allChars[0].id);
      if (testDetails && testDetails.character) {
        Logger.log('✅ 要件9: キャラクター詳細機能正常');
      }
    }
    
    Logger.log('');
    Logger.log('🎉 簡易E2Eテスト完了！主要機能は正常に動作しています。');
    
    return true;
    
  } catch (error) {
    Logger.log('❌ 簡易E2Eテストエラー: ' + error.toString());
    return false;
  }
}

/**
 * 要件9専用E2Eテスト実行
 */
function runRequirement9E2ETest() {
  Logger.log('=== 要件9専用E2Eテスト ===');
  Logger.log('実行時刻: ' + new Date().toLocaleString('ja-JP'));
  
  var testResults = {
    total: 0,
    passed: 0,
    failed: 0,
    errors: []
  };
  
  try {
    // 要件9の基本機能テスト
    testResults = runTest(testResults, 'test8_OwnershipStatusManagement', '要件9: 所持ステータス確認・更新機能テスト');
    
    // 結果サマリー
    Logger.log('');
    Logger.log('=== 要件9テスト結果サマリー ===');
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
      Logger.log('🎉 要件9の全てのテストが成功しました！');
      Logger.log('所持ステータス確認・更新機能は正常に動作しています。');
    } else {
      Logger.log('');
      Logger.log('⚠️  一部のテストが失敗しました。修正が必要です。');
    }
    
    return testResults;
    
  } catch (error) {
    Logger.log('❌ 要件9テスト実行エラー: ' + error.toString());
    return testResults;
  }
}

/**
 * 要件9実更新テスト実行（データを実際に変更）
 * 注意: このテストは実際にスプレッドシートのデータを変更します
 */
function runRequirement9ActualUpdateTest() {
  Logger.log('=== 要件9実更新テスト（警告: データを変更します） ===');
  Logger.log('実行時刻: ' + new Date().toLocaleString('ja-JP'));
  
  // 確認プロンプト（手動実行時のみ）
  Logger.log('⚠️  このテストは実際にスプレッドシートのデータを変更します。');
  Logger.log('テスト環境でのみ実行してください。');
  
  try {
    var result = test8_OwnershipStatusManagement_WithActualUpdates();
    
    if (result.success) {
      Logger.log('');
      Logger.log('🎉 要件9実更新テストが成功しました！');
      Logger.log('所持ステータス更新機能は正常に動作し、データの整合性も保たれています。');
    } else {
      Logger.log('');
      Logger.log('❌ 要件9実更新テストが失敗しました: ' + result.error);
    }
    
    return result;
    
  } catch (error) {
    Logger.log('❌ 要件9実更新テスト実行エラー: ' + error.toString());
    return { success: false, error: error.message };
  }
}

/**
 * テストメニュー表示
 */
function showTestMenu() {
  Logger.log('=== E2Eテストメニュー ===');
  Logger.log('');
  Logger.log('利用可能なテスト関数:');
  Logger.log('');
  Logger.log('1. runE2ETests()');
  Logger.log('   - 全体的なE2Eテストを実行');
  Logger.log('   - 全機能の包括的なテスト');
  Logger.log('');
  Logger.log('2. runQuickE2ETest()');
  Logger.log('   - 簡易E2Eテストを実行');
  Logger.log('   - 主要機能のみの高速テスト');
  Logger.log('');
  Logger.log('3. runRequirement9E2ETest()');
  Logger.log('   - 要件9専用E2Eテストを実行');
  Logger.log('   - 所持ステータス確認・更新機能のテスト');
  Logger.log('   - データは変更しません');
  Logger.log('');
  Logger.log('4. runRequirement9ActualUpdateTest()');
  Logger.log('   - 要件9実更新テストを実行');
  Logger.log('   - ⚠️  実際にデータを変更します');
  Logger.log('   - テスト環境でのみ実行してください');
  Logger.log('');
  Logger.log('5. test8_OwnershipStatusManagement()');
  Logger.log('   - 要件9の基本テストのみ実行');
  Logger.log('   - データは変更しません');
  Logger.log('');
  Logger.log('使用方法: 上記の関数名をGoogle Apps Scriptエディタで実行してください');
}