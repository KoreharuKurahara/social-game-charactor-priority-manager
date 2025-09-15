/**
 * 権限テスト用関数
 * 組織外スプレッドシートアクセスの問題を診断
 */

/**
 * 基本接続テスト（スプレッドシートアクセスなし）
 */
function testBasicConnection() {
  return {
    success: true,
    message: 'Google Apps Script基本機能は正常です',
    timestamp: new Date().toLocaleString('ja-JP'),
    userEmail: Session.getActiveUser().getEmail()
  };
}

/**
 * スプレッドシート権限テスト
 */
function testSpreadsheetPermissions() {
  try {
    // 1. 現在のユーザー情報を取得
    var userEmail = Session.getActiveUser().getEmail();
    Logger.log('現在のユーザー: ' + userEmail);
    
    // 2. アクセス可能なスプレッドシートファイルを確認
    var files = DriveApp.getFilesByType(MimeType.GOOGLE_SHEETS);
    var accessibleCount = 0;
    var fileList = [];
    
    // 最大10個まで確認
    while (files.hasNext() && accessibleCount < 10) {
      try {
        var file = files.next();
        var spreadsheet = SpreadsheetApp.openById(file.getId());
        accessibleCount++;
        fileList.push({
          name: file.getName(),
          id: file.getId(),
          owner: file.getOwner() ? file.getOwner().getEmail() : '不明'
        });
      } catch (e) {
        // アクセスできないファイルはスキップ
      }
    }
    
    return {
      success: true,
      count: accessibleCount,
      userEmail: userEmail,
      accessibleFiles: fileList
    };
    
  } catch (error) {
    Logger.log('権限テストエラー: ' + error.toString());
    return {
      success: false,
      error: error.message,
      userEmail: Session.getActiveUser().getEmail()
    };
  }
}

/**
 * 特定のスプレッドシートアクセステスト
 */
function testSpecificSpreadsheet() {
  try {
    // 環境設定からスプレッドシートIDを取得
    var spreadsheetId = '1YGewxot5bVZcgJc3SH20Jqg1rKfpSuSOiq1dmh4Jr5k';
    
    Logger.log('テスト対象スプレッドシートID: ' + spreadsheetId);
    
    // アクセステスト
    var spreadsheet = SpreadsheetApp.openById(spreadsheetId);
    var name = spreadsheet.getName();
    var owner = DriveApp.getFileById(spreadsheetId).getOwner();
    
    // 基本情報を取得
    var sheet = spreadsheet.getActiveSheet();
    var lastRow = sheet.getLastRow();
    var lastColumn = sheet.getLastColumn();
    
    return {
      success: true,
      spreadsheetName: name,
      owner: owner ? owner.getEmail() : '不明',
      rows: lastRow,
      columns: lastColumn,
      canRead: true,
      canWrite: true // 書き込みテストは実際には行わない
    };
    
  } catch (error) {
    Logger.log('特定スプレッドシートアクセスエラー: ' + error.toString());
    
    return {
      success: false,
      error: error.message,
      errorType: getErrorType(error.message)
    };
  }
}

/**
 * エラータイプを判定
 */
function getErrorType(errorMessage) {
  if (errorMessage.indexOf('Permission denied') !== -1) {
    return 'PERMISSION_DENIED';
  } else if (errorMessage.indexOf('not found') !== -1) {
    return 'FILE_NOT_FOUND';
  } else if (errorMessage.indexOf('organization') !== -1) {
    return 'ORGANIZATION_POLICY';
  } else {
    return 'UNKNOWN';
  }
}

/**
 * 組織ポリシー確認
 */
function checkOrganizationPolicy() {
  try {
    var userEmail = Session.getActiveUser().getEmail();
    var domain = userEmail.split('@')[1];
    
    // 組織のドメインを確認
    var isGoogleWorkspace = domain !== 'gmail.com';
    
    return {
      userEmail: userEmail,
      domain: domain,
      isGoogleWorkspace: isGoogleWorkspace,
      recommendation: isGoogleWorkspace ? 
        '組織のGoogle Workspaceアカウントです。組織外ファイルへのアクセスが制限されている可能性があります。' :
        '個人のGoogleアカウントです。通常は外部ファイルにアクセス可能です。'
    };
    
  } catch (error) {
    return {
      error: error.message
    };
  }
}