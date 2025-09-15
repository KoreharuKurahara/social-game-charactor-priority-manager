/**
 * 簡単な動作確認用テスト
 * Google Apps Scriptエディタで実行してください
 */

/**
 * ステップ1: スプレッドシートIDを設定
 * 実行前に、YOUR_SPREADSHEET_IDを実際のIDに置き換えてください
 */
function step1_setSpreadsheetId() {
  // ここに実際のスプレッドシートIDを入力してください
  var spreadsheetId = 'YOUR_SPREADSHEET_ID';
  
  if (spreadsheetId === 'YOUR_SPREADSHEET_ID') {
    Logger.log('❌ スプレッドシートIDを設定してください');
    Logger.log('1. スプレッドシートのURLからIDを取得');
    Logger.log('2. この関数内のYOUR_SPREADSHEET_IDを実際のIDに置き換え');
    Logger.log('3. 再度実行');
    return;
  }
  
  AppConfig.setSpreadsheetId(spreadsheetId);
  Logger.log('✅ スプレッドシートIDを設定しました: ' + spreadsheetId);
}

/**
 * ステップ2: 基本接続テスト
 */
function step2_testConnection() {
  Logger.log('=== 基本接続テスト ===');
  
  try {
    var spreadsheet = getSpreadsheet();
    Logger.log('✅ スプレッドシート接続成功');
    Logger.log('スプレッドシート名: ' + spreadsheet.getName());
    
    var sheet = spreadsheet.getActiveSheet();
    Logger.log('アクティブシート名: ' + sheet.getName());
    Logger.log('データ行数: ' + sheet.getLastRow());
    Logger.log('データ列数: ' + sheet.getLastColumn());
    
  } catch (error) {
    Logger.log('❌ 接続エラー: ' + error.toString());
    Logger.log('スプレッドシートIDとアクセス権限を確認してください');
  }
}

/**
 * ステップ3: 構造検証テスト
 */
function step3_testStructure() {
  Logger.log('=== 構造検証テスト ===');
  
  try {
    var validation = SpreadsheetService.validateSpreadsheetStructure();
    
    if (validation.isValid) {
      Logger.log('✅ スプレッドシート構造は正常です');
      Logger.log('検出された列: ' + JSON.stringify(validation.headers));
    } else {
      Logger.log('❌ スプレッドシート構造に問題があります');
      Logger.log('不足している列:');
      for (var i = 0; i < validation.missingColumns.length; i++) {
        Logger.log('  - ' + validation.missingColumns[i]);
      }
    }
    
  } catch (error) {
    Logger.log('❌ 構造検証エラー: ' + error.toString());
  }
}

/**
 * ステップ4: データ取得テスト
 */
function step4_testDataRetrieval() {
  Logger.log('=== データ取得テスト ===');
  
  try {
    // 全キャラクター取得
    var allCharacters = SpreadsheetService.getAllCharacters();
    Logger.log('✅ 全キャラクター取得成功: ' + allCharacters.length + '体');
    
    if (allCharacters.length > 0) {
      Logger.log('最初のキャラクター例:');
      Logger.log('  名前: ' + allCharacters[0].name);
      Logger.log('  属性: ' + allCharacters[0].attribute);
      Logger.log('  所持: ' + allCharacters[0].owned);
      Logger.log('  優先度: ' + allCharacters[0].priority);
    }
    
    // 未所持キャラクター取得
    var unownedCharacters = SpreadsheetService.getUnownedCharacters();
    Logger.log('✅ 未所持キャラクター取得成功: ' + unownedCharacters.length + '体');
    
    if (unownedCharacters.length > 0) {
      Logger.log('最初の未所持キャラクター例:');
      Logger.log('  名前: ' + unownedCharacters[0].name);
      Logger.log('  属性: ' + unownedCharacters[0].attribute);
      Logger.log('  優先度: ' + unownedCharacters[0].priority);
    }
    
  } catch (error) {
    Logger.log('❌ データ取得エラー: ' + error.toString());
  }
}

/**
 * 全ステップを順番に実行
 * ※事前にstep1でスプレッドシートIDを設定してください
 */
function runQuickTest() {
  Logger.log('=== 簡単動作確認テスト開始 ===');
  
  step2_testConnection();
  Logger.log('');
  step3_testStructure();
  Logger.log('');
  step4_testDataRetrieval();
  
  Logger.log('=== テスト完了 ===');
  Logger.log('問題がある場合は、各ステップを個別に実行してください');
}