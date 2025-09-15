/**
 * スプレッドシートとの全ての読み書き操作を管理するサービスクラス
 */

/**
 * SpreadsheetServiceクラス
 * スプレッドシートのデータアクセスを担当
 */
var SpreadsheetService = {
  
  /**
   * スプレッドシートの構造を検証
   * @return {Object} 検証結果 {isValid: boolean, missingColumns: Array}
   */
  validateSpreadsheetStructure: function() {
    try {
      var sheet = getSpreadsheet().getActiveSheet();
      var headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
      
      // 必要な列名の定義
      var requiredColumns = [
        '通し番号',
        'フレンズ名', 
        '属性',
        'HC',
        '6周年直前スペシャルショップ',
        '6周年記念グレートショップ',
        '所持',
        '優先度'
      ];
      
      var missingColumns = [];
      var columnIndexes = {};
      
      // 各必要列の存在確認とインデックス記録
      for (var i = 0; i < requiredColumns.length; i++) {
        var columnName = requiredColumns[i];
        var columnIndex = headers.indexOf(columnName);
        
        if (columnIndex === -1) {
          missingColumns.push(columnName);
        } else {
          columnIndexes[columnName] = columnIndex;
        }
      }
      
      var isValid = missingColumns.length === 0;
      
      Logger.log('スプレッドシート構造検証結果: ' + JSON.stringify({
        isValid: isValid,
        missingColumns: missingColumns,
        columnIndexes: columnIndexes
      }));
      
      return {
        isValid: isValid,
        missingColumns: missingColumns,
        columnIndexes: columnIndexes,
        headers: headers
      };
      
    } catch (error) {
      Logger.log('スプレッドシート構造検証エラー: ' + error.toString());
      throw new Error('スプレッドシートの構造を確認できませんでした: ' + error.message);
    }
  },
  
  /**
   * 列のインデックスを取得
   * @return {Object} 列名とインデックスのマッピング
   */
  getColumnIndexes: function() {
    var validation = this.validateSpreadsheetStructure();
    if (!validation.isValid) {
      throw new Error('必要な列が不足しています: ' + validation.missingColumns.join(', '));
    }
    return validation.columnIndexes;
  },
  
  /**
   * 全キャラクターデータを取得
   * @return {Array} キャラクターオブジェクトの配列
   */
  getAllCharacters: function() {
    try {
      var sheet = getSpreadsheet().getActiveSheet();
      var columnIndexes = this.getColumnIndexes();
      
      // データ範囲を取得（ヘッダー行を除く）
      var lastRow = sheet.getLastRow();
      if (lastRow <= 1) {
        Logger.log('データが存在しません');
        return [];
      }
      
      var dataRange = sheet.getRange(2, 1, lastRow - 1, sheet.getLastColumn());
      var data = dataRange.getValues();
      
      var characters = [];
      
      for (var i = 0; i < data.length; i++) {
        var row = data[i];
        var character = {
          rowIndex: i + 2, // スプレッドシートの実際の行番号（1-indexed + ヘッダー行）
          id: row[columnIndexes['通し番号']] || '',
          name: row[columnIndexes['フレンズ名']] || '',
          attribute: row[columnIndexes['属性']] || '',
          hc: row[columnIndexes['HC']] || '',
          specialShop: row[columnIndexes['6周年直前スペシャルショップ']] || false,
          greatShop: row[columnIndexes['6周年記念グレートショップ']] || false,
          owned: row[columnIndexes['所持']] || false,
          priority: row[columnIndexes['優先度']] || null
        };
        
        // 空行をスキップ
        if (character.name.trim() !== '') {
          characters.push(character);
        }
      }
      
      Logger.log('取得したキャラクター数: ' + characters.length);
      return characters;
      
    } catch (error) {
      Logger.log('キャラクターデータ取得エラー: ' + error.toString());
      throw new Error('キャラクターデータの取得に失敗しました: ' + error.message);
    }
  },
  
  /**
   * 未所持キャラクターのみを取得
   * @return {Array} 未所持キャラクターオブジェクトの配列
   */
  getUnownedCharacters: function() {
    try {
      var allCharacters = this.getAllCharacters();
      var unownedCharacters = [];
      
      for (var i = 0; i < allCharacters.length; i++) {
        var character = allCharacters[i];
        // 所持フラグがfalseまたは空の場合を未所持とする
        if (!character.owned) {
          unownedCharacters.push(character);
        }
      }
      
      Logger.log('未所持キャラクター数: ' + unownedCharacters.length);
      return unownedCharacters;
      
    } catch (error) {
      Logger.log('未所持キャラクター取得エラー: ' + error.toString());
      throw new Error('未所持キャラクターの取得に失敗しました: ' + error.message);
    }
  },
  
  /**
   * 指定キャラクターの優先度を更新
   * @param {number} rowIndex スプレッドシートの行番号
   * @param {number} priority 新しい優先度（1-10）
   * @return {boolean} 更新成功フラグ
   */
  updatePriority: function(rowIndex, priority) {
    try {
      // 入力値検証
      if (priority !== null && (typeof priority !== 'number' || priority < 1 || priority > 10)) {
        throw new Error('優先度は1-10の数値で入力してください');
      }
      
      var sheet = getSpreadsheet().getActiveSheet();
      var columnIndexes = this.getColumnIndexes();
      var priorityColumn = columnIndexes['優先度'] + 1; // 1-indexedに変換
      
      // 優先度を更新
      sheet.getRange(rowIndex, priorityColumn).setValue(priority);
      
      Logger.log('優先度更新完了: 行' + rowIndex + ' → ' + priority);
      return true;
      
    } catch (error) {
      Logger.log('優先度更新エラー: ' + error.toString());
      throw new Error('優先度の更新に失敗しました: ' + error.message);
    }
  },
  
  /**
   * 指定キャラクターの所持ステータスを更新
   * @param {number} rowIndex スプレッドシートの行番号
   * @param {boolean} isOwned 所持ステータス（true: 所持済み, false: 未所持）
   * @return {boolean} 更新成功フラグ
   */
  updateOwnershipStatus: function(rowIndex, isOwned) {
    try {
      // 入力値検証
      if (typeof isOwned !== 'boolean') {
        throw new Error('所持ステータスはtrue/falseで指定してください');
      }
      
      var sheet = getSpreadsheet().getActiveSheet();
      var columnIndexes = this.getColumnIndexes();
      var ownershipColumn = columnIndexes['所持'] + 1; // 1-indexedに変換
      
      // 所持ステータスを更新
      sheet.getRange(rowIndex, ownershipColumn).setValue(isOwned);
      
      Logger.log('所持ステータス更新完了: 行' + rowIndex + ' → ' + isOwned);
      return true;
      
    } catch (error) {
      Logger.log('所持ステータス更新エラー: ' + error.toString());
      throw new Error('所持ステータスの更新に失敗しました: ' + error.message);
    }
  },
  
  /**
   * 指定キャラクターの詳細情報を取得
   * @param {string} characterId キャラクターID
   * @return {Object} キャラクター詳細情報
   */
  getCharacterById: function(characterId) {
    try {
      var allCharacters = this.getAllCharacters();
      
      for (var i = 0; i < allCharacters.length; i++) {
        if (allCharacters[i].id === characterId) {
          return allCharacters[i];
        }
      }
      
      throw new Error('キャラクターが見つかりません: ' + characterId);
      
    } catch (error) {
      Logger.log('キャラクター詳細取得エラー: ' + error.toString());
      throw new Error('キャラクター詳細の取得に失敗しました: ' + error.message);
    }
  }
};