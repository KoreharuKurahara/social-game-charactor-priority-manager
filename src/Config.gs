/**
 * アプリケーション設定ファイル
 * 設定値とユーティリティ関数を管理
 */

/**
 * アプリケーション設定
 */
var AppConfig = {
  
  /**
   * スプレッドシートIDを設定
   * 初回セットアップ時に実行
   * @param {string} spreadsheetId GoogleスプレッドシートのID
   */
  setSpreadsheetId: function(spreadsheetId) {
    PropertiesService.getScriptProperties().setProperty('SPREADSHEET_ID', spreadsheetId);
    Logger.log('スプレッドシートIDを設定しました: ' + spreadsheetId);
  },
  
  /**
   * スプレッドシートIDを取得
   * @return {string} スプレッドシートID
   */
  getSpreadsheetId: function() {
    var spreadsheetId = PropertiesService.getScriptProperties().getProperty('SPREADSHEET_ID');
    if (!spreadsheetId) {
      throw new Error('スプレッドシートIDが設定されていません。AppConfig.setSpreadsheetId()で設定してください。');
    }
    return spreadsheetId;
  },
  
  /**
   * 設定の初期化
   * 初回セットアップ用の関数
   */
  initialize: function() {
    Logger.log('=== アプリケーション初期化 ===');
    
    // スプレッドシートIDの確認
    try {
      var spreadsheetId = this.getSpreadsheetId();
      Logger.log('設定済みスプレッドシートID: ' + spreadsheetId);
      
      // スプレッドシート構造の検証
      var validation = SpreadsheetService.validateSpreadsheetStructure();
      if (validation.isValid) {
        Logger.log('✓ スプレッドシート構造は正常です');
      } else {
        Logger.log('✗ スプレッドシート構造に問題があります');
        Logger.log('不足している列: ' + validation.missingColumns.join(', '));
      }
      
    } catch (error) {
      Logger.log('✗ 初期化エラー: ' + error.toString());
      Logger.log('AppConfig.setSpreadsheetId("YOUR_SPREADSHEET_ID")を実行してください');
    }
  },
  
  /**
   * デバッグ用：設定情報を表示
   */
  showConfig: function() {
    Logger.log('=== 現在の設定 ===');
    try {
      Logger.log('スプレッドシートID: ' + this.getSpreadsheetId());
    } catch (error) {
      Logger.log('スプレッドシートID: 未設定');
    }
  }
};

/**
 * セットアップ用関数
 * 初回実行時にこの関数を呼び出してスプレッドシートIDを設定
 * 
 * 使用方法:
 * 1. Google Apps Scriptエディタでこの関数を選択
 * 2. 実行ボタンをクリック
 * 3. 実行後、AppConfig.setSpreadsheetId('あなたのスプレッドシートID')を実行
 */
function setupApp() {
  Logger.log('=== セットアップ開始 ===');
  Logger.log('1. スプレッドシートのURLからIDを取得してください');
  Logger.log('   例: https://docs.google.com/spreadsheets/d/SPREADSHEET_ID/edit');
  Logger.log('2. 以下のコマンドを実行してください:');
  Logger.log('   AppConfig.setSpreadsheetId("YOUR_SPREADSHEET_ID")');
  Logger.log('3. その後、AppConfig.initialize()を実行して設定を確認してください');
}