/**
 * 組織外スプレッドシート対応版設定
 */

/**
 * 代替案：CSVアップロード機能
 * 組織外スプレッドシートにアクセスできない場合の対応
 */
var AlternativeConfig = {
  
  /**
   * CSVデータを手動で設定
   * スプレッドシートからエクスポートしたCSVデータを貼り付け
   */
  setCSVData: function(csvText) {
    try {
      PropertiesService.getScriptProperties().setProperty('CSV_DATA', csvText);
      Logger.log('CSVデータを設定しました');
      return true;
    } catch (error) {
      Logger.log('CSVデータ設定エラー: ' + error.toString());
      return false;
    }
  },
  
  /**
   * CSVデータからキャラクター情報を解析
   */
  parseCSVData: function() {
    try {
      var csvText = PropertiesService.getScriptProperties().getProperty('CSV_DATA');
      if (!csvText) {
        throw new Error('CSVデータが設定されていません');
      }
      
      var lines = csvText.split('\n');
      var headers = lines[0].split(',');
      var characters = [];
      
      // ヘッダー行をスキップして処理
      for (var i = 1; i < lines.length; i++) {
        var line = lines[i].trim();
        if (line === '') continue;
        
        var values = line.split(',');
        var character = {
          rowIndex: i + 1, // 仮の行番号
          id: values[0] || '',
          name: values[1] || '',
          attribute: values[2] || '',
          hc: values[3] || '',
          specialShop: values[8] === 'TRUE',
          greatShop: values[9] === 'TRUE',
          owned: values[10] === 'TRUE',
          priority: values[11] || null
        };
        
        if (character.name) {
          characters.push(character);
        }
      }
      
      Logger.log('CSVから' + characters.length + '体のキャラクターを解析');
      return characters;
      
    } catch (error) {
      Logger.log('CSV解析エラー: ' + error.toString());
      throw new Error('CSVデータの解析に失敗しました: ' + error.message);
    }
  },
  
  /**
   * サンプルCSVデータを設定
   * テスト用のダミーデータ
   */
  setSampleData: function() {
    var sampleCSV = `通し番号,フレンズ名,属性,HC,,,,,6周年直前スペシャルショップ,6周年記念グレートショップ,所持,優先度
001,サーバル,アクティブ,HC情報1,,,,,TRUE,FALSE,FALSE,8
002,フェネック,アクティブ,HC情報2,,,,,FALSE,TRUE,TRUE,
003,アライグマ,アクティブ,HC情報3,,,,,FALSE,FALSE,FALSE,7
004,かばん,アクティブ,HC情報4,,,,,TRUE,TRUE,TRUE,
005,ラッキービースト,アクティブ,HC情報5,,,,,FALSE,FALSE,FALSE,9
006,トキ,ラブリー,HC情報6,,,,,TRUE,FALSE,FALSE,6
007,アルパカ・スリ,ラブリー,HC情報7,,,,,FALSE,TRUE,TRUE,
008,ツチノコ,マイペース,HC情報8,,,,,FALSE,FALSE,FALSE,10
009,ヒグマ,リラックス,HC情報9,,,,,TRUE,FALSE,TRUE,
010,リカオン,アクティブ,HC情報10,,,,,FALSE,TRUE,FALSE,5`;
    
    return this.setCSVData(sampleCSV);
  }
};

/**
 * 代替版CharacterService
 * CSVデータを使用してスプレッドシートアクセスを回避
 */
var AlternativeCharacterService = {
  
  /**
   * 未所持キャラクターを取得（CSV版）
   */
  getUnownedCharacters: function() {
    try {
      var allCharacters = AlternativeConfig.parseCSVData();
      var unownedCharacters = allCharacters.filter(function(char) {
        return !char.owned;
      });
      
      Logger.log('CSV版: 未所持キャラクター' + unownedCharacters.length + '体');
      return unownedCharacters;
      
    } catch (error) {
      Logger.log('CSV版キャラクター取得エラー: ' + error.toString());
      throw new Error('キャラクターデータの取得に失敗しました（CSV版）');
    }
  },
  
  /**
   * 統計情報を取得（CSV版）
   */
  getStatistics: function() {
    try {
      var allCharacters = AlternativeConfig.parseCSVData();
      var unownedCharacters = this.getUnownedCharacters();
      
      var prioritySetCount = 0;
      for (var i = 0; i < unownedCharacters.length; i++) {
        if (unownedCharacters[i].priority !== null && unownedCharacters[i].priority !== '') {
          prioritySetCount++;
        }
      }
      
      return {
        total: allCharacters.length,
        owned: allCharacters.length - unownedCharacters.length,
        unowned: unownedCharacters.length,
        priorities: {
          total: unownedCharacters.length,
          set: prioritySetCount,
          unset: unownedCharacters.length - prioritySetCount
        }
      };
      
    } catch (error) {
      Logger.log('CSV版統計情報取得エラー: ' + error.toString());
      throw new Error('統計情報の取得に失敗しました（CSV版）');
    }
  }
};

/**
 * CSV版セットアップ関数
 */
function setupAlternativeMode() {
  Logger.log('=== 代替モード（CSV版）セットアップ ===');
  
  try {
    // サンプルデータを設定
    var success = AlternativeConfig.setSampleData();
    if (success) {
      Logger.log('✅ サンプルCSVデータを設定しました');
      
      // テスト実行
      var characters = AlternativeCharacterService.getUnownedCharacters();
      var stats = AlternativeCharacterService.getStatistics();
      
      Logger.log('✅ CSV版動作テスト成功');
      Logger.log('  未所持キャラクター: ' + characters.length + '体');
      Logger.log('  統計情報: ' + JSON.stringify(stats));
      
      Logger.log('');
      Logger.log('🎉 代替モードの準備完了！');
      Logger.log('組織外スプレッドシートにアクセスできない場合、この方式を使用できます。');
      
    } else {
      Logger.log('❌ サンプルデータの設定に失敗しました');
    }
    
  } catch (error) {
    Logger.log('❌ 代替モードセットアップエラー: ' + error.toString());
  }
}