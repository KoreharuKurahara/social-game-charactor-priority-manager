/**
 * 環境設定管理
 * .envファイルの値をGoogle Apps Scriptで使用するための設定
 */

/**
 * 環境設定クラス
 * 本番環境ではPropertiesServiceを使用し、開発時は直接値を設定
 */
var EnvConfig = {
  
  /**
   * スプレッドシートIDを取得
   * @return {string} スプレッドシートID
   */
  getSpreadsheetId: function() {
    // 本番環境: PropertiesServiceから取得
    var spreadsheetId = PropertiesService.getScriptProperties().getProperty('SPREADSHEET_ID');
    
    if (!spreadsheetId) {
      // 開発環境: 直接設定（.envファイルの値）
      spreadsheetId = '1YGewxot5bVZcgJc3SH20Jqg1rKfpSuSOiq1dmh4Jr5k';
    }
    
    if (!spreadsheetId) {
      throw new Error('スプレッドシートIDが設定されていません');
    }
    
    return spreadsheetId;
  },
  
  /**
   * 環境設定を初期化
   * .envファイルの値をPropertiesServiceに設定
   */
  initialize: function() {
    Logger.log('=== 環境設定初期化 ===');
    
    try {
      // .envファイルの値をPropertiesServiceに設定
      var properties = PropertiesService.getScriptProperties();
      
      properties.setProperties({
        'SPREADSHEET_ID': '1YGewxot5bVZcgJc3SH20Jqg1rKfpSuSOiq1dmh4Jr5k',
        'APP_NAME': 'けものフレンズ3優先度管理',
        'DEBUG_MODE': 'true'
      });
      
      Logger.log('✅ 環境設定を初期化しました');
      Logger.log('スプレッドシートID: ' + this.getSpreadsheetId());
      
    } catch (error) {
      Logger.log('❌ 環境設定初期化エラー: ' + error.toString());
    }
  },
  
  /**
   * 現在の設定を表示
   */
  showConfig: function() {
    Logger.log('=== 現在の環境設定 ===');
    
    try {
      var properties = PropertiesService.getScriptProperties();
      var allProperties = properties.getProperties();
      
      Logger.log('PropertiesServiceの設定:');
      for (var key in allProperties) {
        if (key.indexOf('SPREADSHEET') !== -1) {
          // スプレッドシートIDは一部のみ表示
          var value = allProperties[key];
          var maskedValue = value.substring(0, 8) + '...' + value.substring(value.length - 8);
          Logger.log('  ' + key + ': ' + maskedValue);
        } else {
          Logger.log('  ' + key + ': ' + allProperties[key]);
        }
      }
      
      Logger.log('');
      Logger.log('実際に使用される値:');
      Logger.log('  スプレッドシートID: ' + this.getSpreadsheetId().substring(0, 8) + '...');
      
    } catch (error) {
      Logger.log('❌ 設定表示エラー: ' + error.toString());
    }
  },
  
  /**
   * デバッグモードかどうかを確認
   * @return {boolean} デバッグモードフラグ
   */
  isDebugMode: function() {
    var debugMode = PropertiesService.getScriptProperties().getProperty('DEBUG_MODE');
    return debugMode === 'true';
  }
};

/**
 * 初回セットアップ用関数
 * Google Apps Scriptで最初に実行してください
 */
function setupEnvironment() {
  Logger.log('=== 環境セットアップ開始 ===');
  
  EnvConfig.initialize();
  EnvConfig.showConfig();
  
  // 接続テスト
  try {
    var spreadsheet = SpreadsheetApp.openById(EnvConfig.getSpreadsheetId());
    Logger.log('✅ スプレッドシート接続テスト成功');
    Logger.log('スプレッドシート名: ' + spreadsheet.getName());
  } catch (error) {
    Logger.log('❌ スプレッドシート接続テスト失敗: ' + error.toString());
  }
  
  Logger.log('=== 環境セットアップ完了 ===');
}