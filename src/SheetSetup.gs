/**
 * 既存スプレッドシートのセットアップ支援
 */

/**
 * 優先度列を自動追加
 * 既存スプレッドシートに「優先度」列がない場合に実行
 */
function addPriorityColumn() {
  Logger.log('=== 優先度列の追加 ===');
  
  try {
    var sheet = getSpreadsheet().getActiveSheet();
    var headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
    
    // 優先度列が既に存在するかチェック
    if (headers.indexOf('優先度') !== -1) {
      Logger.log('✅ 優先度列は既に存在します');
      return;
    }
    
    // 最後の列の次に優先度列を追加
    var newColumn = sheet.getLastColumn() + 1;
    sheet.getRange(1, newColumn).setValue('優先度');
    
    Logger.log('✅ 優先度列を追加しました（列' + newColumn + '）');
    Logger.log('デフォルト値は空白です。必要に応じて値を設定してください。');
    
  } catch (error) {
    Logger.log('❌ 優先度列追加エラー: ' + error.toString());
  }
}

/**
 * スプレッドシートの基本情報を表示
 */
function showSheetInfo() {
  Logger.log('=== スプレッドシート基本情報 ===');
  
  try {
    var spreadsheet = getSpreadsheet();
    var sheet = spreadsheet.getActiveSheet();
    
    Logger.log('スプレッドシート名: ' + spreadsheet.getName());
    Logger.log('シート名: ' + sheet.getName());
    Logger.log('URL: ' + spreadsheet.getUrl());
    Logger.log('最終更新: ' + new Date(spreadsheet.getLastUpdated()));
    Logger.log('データ範囲: A1:' + sheet.getRange(sheet.getLastRow(), sheet.getLastColumn()).getA1Notation());
    
    // 権限確認
    var protection = sheet.getProtections(SpreadsheetApp.ProtectionType.SHEET);
    if (protection.length > 0) {
      Logger.log('⚠️  シートに保護設定があります');
    } else {
      Logger.log('✅ シートは編集可能です');
    }
    
  } catch (error) {
    Logger.log('❌ 情報取得エラー: ' + error.toString());
  }
}

/**
 * データの整合性をチェック
 */
function checkDataIntegrity() {
  Logger.log('=== データ整合性チェック ===');
  
  try {
    var allCharacters = SpreadsheetService.getAllCharacters();
    var issues = [];
    
    for (var i = 0; i < allCharacters.length; i++) {
      var char = allCharacters[i];
      var rowNum = char.rowIndex;
      
      // 必須フィールドのチェック
      if (!char.name || char.name.trim() === '') {
        issues.push('行' + rowNum + ': フレンズ名が空です');
      }
      
      // 優先度の値チェック
      if (char.priority !== null && char.priority !== '') {
        var priority = Number(char.priority);
        if (isNaN(priority) || priority < 1 || priority > 10) {
          issues.push('行' + rowNum + ': 優先度が無効です (' + char.priority + ')');
        }
      }
      
      // 所持フラグのチェック
      if (typeof char.owned !== 'boolean') {
        issues.push('行' + rowNum + ': 所持フラグが無効です (' + char.owned + ')');
      }
    }
    
    if (issues.length === 0) {
      Logger.log('✅ データに問題はありません');
    } else {
      Logger.log('⚠️  以下の問題が見つかりました:');
      for (var j = 0; j < issues.length; j++) {
        Logger.log('  - ' + issues[j]);
      }
    }
    
    Logger.log('');
    Logger.log('データ統計:');
    Logger.log('  総行数: ' + allCharacters.length);
    Logger.log('  有効なデータ行: ' + allCharacters.filter(function(c) { return c.name.trim() !== ''; }).length);
    
  } catch (error) {
    Logger.log('❌ 整合性チェックエラー: ' + error.toString());
  }
}