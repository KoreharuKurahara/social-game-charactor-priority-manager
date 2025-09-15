/**
 * 既存スプレッドシート接続用テスト
 */

/**
 * 既存スプレッドシートの構造を分析
 */
function analyzeExistingSheet() {
  Logger.log('=== 既存スプレッドシート分析 ===');
  
  // .envファイルで設定されたスプレッドシートIDを使用
  var spreadsheetId = '1YGewxot5bVZcgJc3SH20Jqg1rKfpSuSOiq1dmh4Jr5k';
  
  Logger.log('使用するスプレッドシートID: ' + spreadsheetId);
  
  try {
    // 一時的にIDを設定
    PropertiesService.getScriptProperties().setProperty('SPREADSHEET_ID', spreadsheetId);
    
    var spreadsheet = SpreadsheetApp.openById(spreadsheetId);
    Logger.log('✅ スプレッドシート接続成功');
    Logger.log('スプレッドシート名: ' + spreadsheet.getName());
    
    var sheet = spreadsheet.getActiveSheet();
    Logger.log('シート名: ' + sheet.getName());
    Logger.log('データ行数: ' + sheet.getLastRow());
    Logger.log('データ列数: ' + sheet.getLastColumn());
    
    // ヘッダー行を取得
    if (sheet.getLastRow() > 0) {
      var headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
      Logger.log('現在の列構成:');
      for (var i = 0; i < headers.length; i++) {
        Logger.log('  ' + (i + 1) + '. ' + headers[i]);
      }
      
      // 必要な列の確認
      var requiredColumns = [
        '通し番号', 'フレンズ名', '属性', 'HC',
        '6周年直前スペシャルショップ', '6周年記念グレートショップ',
        '所持', '優先度'
      ];
      
      Logger.log('');
      Logger.log('必要な列の確認:');
      var missingColumns = [];
      
      for (var j = 0; j < requiredColumns.length; j++) {
        var columnName = requiredColumns[j];
        var exists = headers.indexOf(columnName) !== -1;
        Logger.log('  ' + (exists ? '✅' : '❌') + ' ' + columnName);
        if (!exists) {
          missingColumns.push(columnName);
        }
      }
      
      if (missingColumns.length > 0) {
        Logger.log('');
        Logger.log('⚠️  不足している列があります:');
        for (var k = 0; k < missingColumns.length; k++) {
          Logger.log('  - ' + missingColumns[k]);
        }
        Logger.log('これらの列を追加してください。');
      } else {
        Logger.log('');
        Logger.log('🎉 すべての必要な列が揃っています！');
      }
      
      // サンプルデータの表示
      if (sheet.getLastRow() > 1) {
        Logger.log('');
        Logger.log('サンプルデータ（最初の3行）:');
        var sampleData = sheet.getRange(2, 1, Math.min(3, sheet.getLastRow() - 1), sheet.getLastColumn()).getValues();
        for (var l = 0; l < sampleData.length; l++) {
          Logger.log('  行' + (l + 2) + ': ' + JSON.stringify(sampleData[l]));
        }
      }
    }
    
  } catch (error) {
    Logger.log('❌ エラー: ' + error.toString());
    Logger.log('スプレッドシートIDまたはアクセス権限を確認してください');
  }
}

/**
 * 既存スプレッドシートでSpreadsheetServiceをテスト
 */
function testWithExistingSheet() {
  Logger.log('=== 既存スプレッドシートでのSpreadsheetServiceテスト ===');
  
  try {
    // 構造検証
    var validation = SpreadsheetService.validateSpreadsheetStructure();
    if (!validation.isValid) {
      Logger.log('❌ 構造検証失敗');
      Logger.log('不足している列: ' + validation.missingColumns.join(', '));
      return;
    }
    
    Logger.log('✅ 構造検証成功');
    
    // データ取得テスト
    var allCharacters = SpreadsheetService.getAllCharacters();
    Logger.log('✅ 全キャラクター取得: ' + allCharacters.length + '体');
    
    var unownedCharacters = SpreadsheetService.getUnownedCharacters();
    Logger.log('✅ 未所持キャラクター: ' + unownedCharacters.length + '体');
    
    // 統計情報
    var ownedCount = allCharacters.length - unownedCharacters.length;
    var prioritySetCount = 0;
    
    for (var i = 0; i < unownedCharacters.length; i++) {
      if (unownedCharacters[i].priority !== null && unownedCharacters[i].priority !== '') {
        prioritySetCount++;
      }
    }
    
    Logger.log('');
    Logger.log('📊 統計情報:');
    Logger.log('  総キャラクター数: ' + allCharacters.length);
    Logger.log('  所持済み: ' + ownedCount);
    Logger.log('  未所持: ' + unownedCharacters.length);
    Logger.log('  優先度設定済み: ' + prioritySetCount);
    Logger.log('  優先度未設定: ' + (unownedCharacters.length - prioritySetCount));
    
    // 未所持キャラクターの例
    if (unownedCharacters.length > 0) {
      Logger.log('');
      Logger.log('未所持キャラクター例:');
      for (var j = 0; j < Math.min(5, unownedCharacters.length); j++) {
        var char = unownedCharacters[j];
        Logger.log('  ' + char.name + ' (属性: ' + char.attribute + ', 優先度: ' + (char.priority || '未設定') + ')');
      }
    }
    
  } catch (error) {
    Logger.log('❌ テストエラー: ' + error.toString());
  }
}

/**
 * 既存スプレッドシートの完全セットアップ
 * 実行前にanalyzeExistingSheet()でスプレッドシートIDを設定してください
 */
function setupExistingSheet() {
  Logger.log('=== 既存スプレッドシート セットアップ ===');
  
  analyzeExistingSheet();
  Logger.log('');
  testWithExistingSheet();
  
  Logger.log('');
  Logger.log('=== セットアップ完了 ===');
  Logger.log('問題がなければ、次のタスクに進むことができます！');
}