/**
 * 統合テスト
 * 環境設定からスプレッドシート接続まで一括テスト
 */

/**
 * 完全な動作確認テスト
 * Google Apps Scriptで最初に実行してください
 */
function runCompleteTest() {
  Logger.log('=== 完全動作確認テスト開始 ===');
  
  try {
    // 1. 環境設定テスト
    Logger.log('1. 環境設定テスト');
    EnvConfig.initialize();
    Logger.log('✅ 環境設定完了');
    
    // 2. スプレッドシート接続テスト
    Logger.log('');
    Logger.log('2. スプレッドシート接続テスト');
    var spreadsheet = getSpreadsheet();
    Logger.log('✅ 接続成功: ' + spreadsheet.getName());
    
    // 3. 構造検証テスト
    Logger.log('');
    Logger.log('3. スプレッドシート構造検証');
    var validation = SpreadsheetService.validateSpreadsheetStructure();
    
    if (validation.isValid) {
      Logger.log('✅ 構造検証成功');
    } else {
      Logger.log('⚠️  構造に問題があります:');
      Logger.log('不足している列: ' + validation.missingColumns.join(', '));
    }
    
    // 4. データ取得テスト
    Logger.log('');
    Logger.log('4. データ取得テスト');
    var allCharacters = SpreadsheetService.getAllCharacters();
    var unownedCharacters = SpreadsheetService.getUnownedCharacters();
    
    Logger.log('✅ 全キャラクター: ' + allCharacters.length + '体');
    Logger.log('✅ 未所持キャラクター: ' + unownedCharacters.length + '体');
    
    // 5. 統計情報
    Logger.log('');
    Logger.log('5. 統計情報');
    var ownedCount = allCharacters.length - unownedCharacters.length;
    var prioritySetCount = 0;
    
    for (var i = 0; i < unownedCharacters.length; i++) {
      if (unownedCharacters[i].priority !== null && unownedCharacters[i].priority !== '') {
        prioritySetCount++;
      }
    }
    
    Logger.log('📊 統計:');
    Logger.log('  総キャラクター数: ' + allCharacters.length);
    Logger.log('  所持済み: ' + ownedCount + ' (' + Math.round(ownedCount / allCharacters.length * 100) + '%)');
    Logger.log('  未所持: ' + unownedCharacters.length + ' (' + Math.round(unownedCharacters.length / allCharacters.length * 100) + '%)');
    Logger.log('  優先度設定済み: ' + prioritySetCount + ' / ' + unownedCharacters.length);
    
    // 6. サンプルデータ表示
    if (unownedCharacters.length > 0) {
      Logger.log('');
      Logger.log('6. 未所持キャラクター例（最初の5体）:');
      for (var j = 0; j < Math.min(5, unownedCharacters.length); j++) {
        var char = unownedCharacters[j];
        var shops = [];
        if (char.specialShop) shops.push('スペシャル');
        if (char.greatShop) shops.push('グレート');
        var shopInfo = shops.length > 0 ? ' [' + shops.join(', ') + ']' : '';
        
        Logger.log('  ' + (j + 1) + '. ' + char.name + 
                   ' (' + char.attribute + ')' + 
                   ' 優先度: ' + (char.priority || '未設定') + 
                   shopInfo);
      }
    }
    
    Logger.log('');
    Logger.log('🎉 全テスト完了！');
    Logger.log('問題がなければ、タスク2に進むことができます。');
    
  } catch (error) {
    Logger.log('❌ テストエラー: ' + error.toString());
    Logger.log('スタックトレース: ' + error.stack);
  }
}

/**
 * 簡易接続テスト
 */
function quickConnectionTest() {
  Logger.log('=== 簡易接続テスト ===');
  
  try {
    var spreadsheetId = EnvConfig.getSpreadsheetId();
    Logger.log('スプレッドシートID: ' + spreadsheetId.substring(0, 8) + '...');
    
    var spreadsheet = SpreadsheetApp.openById(spreadsheetId);
    Logger.log('✅ 接続成功');
    Logger.log('スプレッドシート名: ' + spreadsheet.getName());
    Logger.log('シート数: ' + spreadsheet.getSheets().length);
    
    var sheet = spreadsheet.getActiveSheet();
    Logger.log('アクティブシート: ' + sheet.getName());
    Logger.log('データ範囲: ' + sheet.getLastRow() + '行 × ' + sheet.getLastColumn() + '列');
    
  } catch (error) {
    Logger.log('❌ 接続エラー: ' + error.toString());
  }
}