/**
 * 統合テストランナー
 * 全てのテストを統合実行
 */

/**
 * 全テストスイートの実行
 */
function runAllTests() {
  Logger.log('🚀 全テストスイート実行開始');
  Logger.log('実行時刻: ' + new Date().toLocaleString('ja-JP'));
  Logger.log('');
  
  var overallResults = {
    suites: 0,
    totalTests: 0,
    passed: 0,
    failed: 0,
    startTime: new Date().getTime(),
    results: []
  };
  
  try {
    // テストスイート1: 基本機能テスト
    Logger.log('📋 テストスイート1: 基本機能テスト');
    var basicResults = runBasicTests();
    overallResults = mergeResults(overallResults, basicResults, '基本機能テスト');
    
    // テストスイート2: E2Eテスト
    Logger.log('');
    Logger.log('🔄 テストスイート2: E2Eテスト');
    var e2eResults = runE2ETests();
    overallResults = mergeResults(overallResults, e2eResults, 'E2Eテスト');
    
    // テストスイート3: ユーザーシナリオテスト
    Logger.log('');
    Logger.log('👤 テストスイート3: ユーザーシナリオテスト');
    var scenarioResults = runUserScenarioTests();
    overallResults = mergeResults(overallResults, scenarioResults, 'ユーザーシナリオテスト');
    
    // テストスイート4: パフォーマンステスト
    Logger.log('');
    Logger.log('⚡ テストスイート4: パフォーマンステスト');
    runPerformanceTest();
    
    // 最終結果レポート
    generateFinalReport(overallResults);
    
  } catch (error) {
    Logger.log('❌ テストスイート実行エラー: ' + error.toString());
  }
  
  return overallResults;
}

/**
 * 基本機能テスト
 */
function runBasicTests() {
  var results = { total: 0, passed: 0, failed: 0, errors: [] };
  
  // 既存のテスト関数を実行
  try {
    // 設定テスト（簡易版）
    var spreadsheetId = EnvConfig.getSpreadsheetId();
    if (spreadsheetId) {
      results.total++;
      results.passed++;
      Logger.log('✅ 設定テスト');
    } else {
      throw new Error('スプレッドシートIDが設定されていません');
    }
  } catch (error) {
    results.total++;
    results.failed++;
    results.errors.push('設定テスト: ' + error.message);
    Logger.log('❌ 設定テスト: ' + error.message);
  }
  
  try {
    // SpreadsheetServiceテスト
    var characters = SpreadsheetService.getUnownedCharacters();
    if (characters && characters.length >= 0) {
      results.total++;
      results.passed++;
      Logger.log('✅ SpreadsheetServiceテスト (' + characters.length + '体)');
    } else {
      throw new Error('キャラクターデータが取得できません');
    }
  } catch (error) {
    results.total++;
    results.failed++;
    results.errors.push('SpreadsheetServiceテスト: ' + error.message);
    Logger.log('❌ SpreadsheetServiceテスト: ' + error.message);
  }
  
  try {
    // CharacterServiceテスト
    var stats = CharacterService.getStatistics();
    if (stats && typeof stats.total === 'number') {
      results.total++;
      results.passed++;
      Logger.log('✅ CharacterServiceテスト (総数: ' + stats.total + ')');
    } else {
      throw new Error('統計情報が取得できません');
    }
  } catch (error) {
    results.total++;
    results.failed++;
    results.errors.push('CharacterServiceテスト: ' + error.message);
    Logger.log('❌ CharacterServiceテスト: ' + error.message);
  }
  
  try {
    // WebAppAPIテスト
    var apiStats = getStatistics();
    if (apiStats && typeof apiStats.total === 'number') {
      results.total++;
      results.passed++;
      Logger.log('✅ WebAppAPIテスト');
    } else {
      throw new Error('WebApp API が動作しません');
    }
  } catch (error) {
    results.total++;
    results.failed++;
    results.errors.push('WebAppAPIテスト: ' + error.message);
    Logger.log('❌ WebAppAPIテスト: ' + error.message);
  }
  
  return results;
}

/**
 * 結果をマージ
 */
function mergeResults(overall, suiteResults, suiteName) {
  overall.suites++;
  overall.totalTests += suiteResults.total || 0;
  overall.passed += suiteResults.passed || 0;
  overall.failed += suiteResults.failed || 0;
  
  overall.results.push({
    suite: suiteName,
    total: suiteResults.total || 0,
    passed: suiteResults.passed || 0,
    failed: suiteResults.failed || 0,
    errors: suiteResults.errors || []
  });
  
  return overall;
}

/**
 * 最終結果レポート生成
 */
function generateFinalReport(results) {
  var duration = new Date().getTime() - results.startTime;
  
  Logger.log('');
  Logger.log('🎯 ===== 最終テスト結果レポート =====');
  Logger.log('実行時間: ' + Math.round(duration / 1000) + '秒');
  Logger.log('テストスイート数: ' + results.suites);
  Logger.log('総テスト数: ' + results.totalTests);
  Logger.log('成功: ' + results.passed + ' (' + Math.round(results.passed / results.totalTests * 100) + '%)');
  Logger.log('失敗: ' + results.failed + ' (' + Math.round(results.failed / results.totalTests * 100) + '%)');
  
  Logger.log('');
  Logger.log('📊 スイート別結果:');
  for (var i = 0; i < results.results.length; i++) {
    var suite = results.results[i];
    var status = suite.failed === 0 ? '✅' : '❌';
    Logger.log('  ' + status + ' ' + suite.suite + ': ' + suite.passed + '/' + suite.total + ' 成功');
  }
  
  if (results.failed > 0) {
    Logger.log('');
    Logger.log('❌ 失敗したテスト:');
    for (var j = 0; j < results.results.length; j++) {
      var suiteResult = results.results[j];
      if (suiteResult.errors && suiteResult.errors.length > 0) {
        Logger.log('  【' + suiteResult.suite + '】');
        for (var k = 0; k < suiteResult.errors.length; k++) {
          Logger.log('    - ' + suiteResult.errors[k]);
        }
      }
    }
  }
  
  Logger.log('');
  if (results.failed === 0) {
    Logger.log('🎉 全てのテストが成功しました！');
    Logger.log('✨ アプリケーションは本番環境で使用可能です。');
  } else {
    Logger.log('⚠️  一部のテストが失敗しました。');
    Logger.log('🔧 修正後に再度テストを実行してください。');
  }
  
  Logger.log('');
  Logger.log('📋 次のステップ:');
  if (results.failed === 0) {
    Logger.log('  1. Google Apps ScriptでWebアプリをデプロイ');
    Logger.log('  2. 実際のブラウザでUI動作確認');
    Logger.log('  3. 優先度設定機能のテスト');
    Logger.log('  4. フィルタ・ソート機能のテスト');
  } else {
    Logger.log('  1. 失敗したテストの原因を調査');
    Logger.log('  2. 必要な修正を実施');
    Logger.log('  3. 再度テストを実行');
  }
}

/**
 * クイックヘルスチェック
 * 重要な機能のみを素早くテスト
 */
function quickHealthCheck() {
  Logger.log('🏥 クイックヘルスチェック開始');
  
  var checks = [
    { name: 'スプレッドシート接続', test: checkSpreadsheetConnection },
    { name: 'データ取得', test: checkDataRetrieval },
    { name: 'API機能', test: checkAPIFunctions },
    { name: 'UI機能', test: checkUIFunctions }
  ];
  
  var passed = 0;
  var failed = 0;
  
  for (var i = 0; i < checks.length; i++) {
    var check = checks[i];
    try {
      var result = check.test();
      if (result) {
        Logger.log('✅ ' + check.name + ': OK');
        passed++;
      } else {
        Logger.log('❌ ' + check.name + ': NG');
        failed++;
      }
    } catch (error) {
      Logger.log('❌ ' + check.name + ': エラー - ' + error.message);
      failed++;
    }
  }
  
  Logger.log('');
  Logger.log('📊 ヘルスチェック結果: ' + passed + '/' + checks.length + ' 成功');
  
  if (failed === 0) {
    Logger.log('💚 システムは正常に動作しています');
  } else {
    Logger.log('💛 一部の機能に問題があります');
  }
  
  return failed === 0;
}

function checkSpreadsheetConnection() {
  var spreadsheet = getSpreadsheet();
  return spreadsheet && spreadsheet.getName();
}

function checkDataRetrieval() {
  var characters = SpreadsheetService.getUnownedCharacters();
  return characters && characters.length >= 0;
}

function checkAPIFunctions() {
  var stats = getStatistics();
  return stats && typeof stats.total === 'number';
}

function checkUIFunctions() {
  var dashboardData = getDashboardData();
  return dashboardData && dashboardData.overview;
}

/**
 * テスト実行メニュー
 */
function showTestMenu() {
  Logger.log('🧪 ===== テスト実行メニュー =====');
  Logger.log('');
  Logger.log('利用可能なテスト:');
  Logger.log('  1. quickHealthCheck() - クイックヘルスチェック');
  Logger.log('  2. runQuickE2ETest() - 簡易E2Eテスト');
  Logger.log('  3. runE2ETests() - 完全E2Eテスト');
  Logger.log('  4. runUserScenarioTests() - ユーザーシナリオテスト');
  Logger.log('  5. runPerformanceTest() - パフォーマンステスト');
  Logger.log('  6. runAllTests() - 全テストスイート実行');
  Logger.log('');
  Logger.log('推奨実行順序:');
  Logger.log('  初回: quickHealthCheck() → runQuickE2ETest()');
  Logger.log('  詳細: runE2ETests() → runUserScenarioTests()');
  Logger.log('  最終: runAllTests()');
}