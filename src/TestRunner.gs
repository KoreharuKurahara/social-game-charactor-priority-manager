/**
 * テスト実行用ファイル
 * 開発中の動作確認とデバッグ用
 */

/**
 * SpreadsheetServiceのテスト
 */
function testSpreadsheetService() {
  Logger.log('=== SpreadsheetService テスト開始 ===');
  
  try {
    // 1. 構造検証テスト
    Logger.log('1. スプレッドシート構造検証テスト');
    var validation = SpreadsheetService.validateSpreadsheetStructure();
    Logger.log('検証結果: ' + JSON.stringify(validation, null, 2));
    
    if (!validation.isValid) {
      Logger.log('✗ 構造検証失敗。以下の列が不足しています:');
      for (var i = 0; i < validation.missingColumns.length; i++) {
        Logger.log('  - ' + validation.missingColumns[i]);
      }
      return;
    }
    
    // 2. 全キャラクター取得テスト
    Logger.log('2. 全キャラクター取得テスト');
    var allCharacters = SpreadsheetService.getAllCharacters();
    Logger.log('取得したキャラクター数: ' + allCharacters.length);
    
    if (allCharacters.length > 0) {
      Logger.log('最初のキャラクター例: ' + JSON.stringify(allCharacters[0], null, 2));
    }
    
    // 3. 未所持キャラクター取得テスト
    Logger.log('3. 未所持キャラクター取得テスト');
    var unownedCharacters = SpreadsheetService.getUnownedCharacters();
    Logger.log('未所持キャラクター数: ' + unownedCharacters.length);
    
    if (unownedCharacters.length > 0) {
      Logger.log('最初の未所持キャラクター例: ' + JSON.stringify(unownedCharacters[0], null, 2));
    }
    
    // 4. 優先度更新テスト（実際には更新しない）
    Logger.log('4. 優先度更新機能確認');
    if (unownedCharacters.length > 0) {
      var testCharacter = unownedCharacters[0];
      Logger.log('テスト対象キャラクター: ' + testCharacter.name + ' (行' + testCharacter.rowIndex + ')');
      Logger.log('現在の優先度: ' + testCharacter.priority);
      Logger.log('※実際の更新はスキップします（テストのため）');
    }
    
    Logger.log('✓ 全てのテストが完了しました');
    
  } catch (error) {
    Logger.log('✗ テスト中にエラーが発生しました: ' + error.toString());
    Logger.log('スタックトレース: ' + error.stack);
  }
}

/**
 * 設定テスト
 */
function testConfig() {
  Logger.log('=== 設定テスト開始 ===');
  
  try {
    AppConfig.showConfig();
    AppConfig.initialize();
    Logger.log('✓ 設定テスト完了');
  } catch (error) {
    Logger.log('✗ 設定テストエラー: ' + error.toString());
  }
}

/**
 * 全体テスト実行
 */
function runAllTests() {
  Logger.log('=== 全体テスト開始 ===');
  
  testConfig();
  Logger.log('');
  testSpreadsheetService();
  
  Logger.log('=== 全体テスト完了 ===');
}