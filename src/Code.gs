/**
 * けものフレンズ3 キャラクター優先度管理アプリ
 * メインエントリーポイント
 */

/**
 * Webアプリのメインページを表示
 */
function doGet() {
  return HtmlService.createTemplateFromFile('index')
    .evaluate()
    .setTitle('けものフレンズ3 優先度管理')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

/**
 * HTMLファイルの内容を取得（include用）
 */
function include(filename) {
  return HtmlService.createHtmlOutputFromFile(filename).getContent();
}

/**
 * スプレッドシートIDの設定
 * 実際の使用時は、PropertiesServiceで管理することを推奨
 */
var SPREADSHEET_ID = 'YOUR_SPREADSHEET_ID_HERE';

/**
 * スプレッドシートオブジェクトを取得
 */
function getSpreadsheet() {
  try {
    var spreadsheetId = EnvConfig.getSpreadsheetId();
    return SpreadsheetApp.openById(spreadsheetId);
  } catch (error) {
    Logger.log('スプレッドシートの取得に失敗: ' + error.toString());
    throw new Error('スプレッドシートにアクセスできません。setupEnvironment()を実行してください。');
  }
}