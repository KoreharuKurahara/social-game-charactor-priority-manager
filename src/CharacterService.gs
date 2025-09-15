/**
 * キャラクターデータ管理サービス
 * SpreadsheetServiceをラップして、より使いやすいAPIを提供
 */

var CharacterService = {
  
  /**
   * 未所持キャラクターを取得（拡張版）
   * @param {Object} options フィルタオプション
   * @return {Array} フィルタされた未所持キャラクター配列
   */
  getUnownedCharactersWithOptions: function(options) {
    options = options || {};
    
    try {
      var unownedCharacters = SpreadsheetService.getUnownedCharacters();
      var filteredCharacters = unownedCharacters;
      
      // 属性フィルタ
      if (options.attribute) {
        filteredCharacters = filteredCharacters.filter(function(char) {
          return char.attribute === options.attribute;
        });
      }
      
      // ショップフィルタ
      if (options.shopType) {
        filteredCharacters = filteredCharacters.filter(function(char) {
          if (options.shopType === 'special') {
            return char.specialShop === true;
          } else if (options.shopType === 'great') {
            return char.greatShop === true;
          } else if (options.shopType === 'both') {
            return char.specialShop === true && char.greatShop === true;
          } else if (options.shopType === 'either') {
            return char.specialShop === true || char.greatShop === true;
          } else if (options.shopType === 'none') {
            return !char.specialShop && !char.greatShop;
          }
          return true;
        });
      }
      
      // 優先度フィルタ
      if (options.priorityStatus) {
        filteredCharacters = filteredCharacters.filter(function(char) {
          var hasPriority = char.priority !== null && char.priority !== '';
          if (options.priorityStatus === 'set') {
            return hasPriority;
          } else if (options.priorityStatus === 'unset') {
            return !hasPriority;
          }
          return true;
        });
      }
      
      Logger.log('フィルタ適用結果: ' + filteredCharacters.length + '体 (元: ' + unownedCharacters.length + '体)');
      return filteredCharacters;
      
    } catch (error) {
      Logger.log('キャラクター取得エラー: ' + error.toString());
      throw new Error('キャラクターデータの取得に失敗しました: ' + error.message);
    }
  },
  
  /**
   * キャラクターを属性別にグループ化
   * @param {Array} characters キャラクター配列
   * @return {Object} 属性別グループ
   */
  groupByAttribute: function(characters) {
    var groups = {};
    
    for (var i = 0; i < characters.length; i++) {
      var char = characters[i];
      var attribute = char.attribute || '不明';
      
      if (!groups[attribute]) {
        groups[attribute] = [];
      }
      groups[attribute].push(char);
    }
    
    return groups;
  },
  
  /**
   * キャラクターを優先度別にグループ化
   * @param {Array} characters キャラクター配列
   * @return {Object} 優先度別グループ
   */
  groupByPriority: function(characters) {
    var groups = {
      'high': [],      // 8-10
      'medium': [],    // 5-7
      'low': [],       // 1-4
      'unset': []      // 未設定
    };
    
    for (var i = 0; i < characters.length; i++) {
      var char = characters[i];
      var priority = char.priority;
      
      if (priority === null || priority === '') {
        groups.unset.push(char);
      } else {
        var numPriority = Number(priority);
        if (numPriority >= 8) {
          groups.high.push(char);
        } else if (numPriority >= 5) {
          groups.medium.push(char);
        } else {
          groups.low.push(char);
        }
      }
    }
    
    return groups;
  },
  
  /**
   * キャラクター統計情報を取得
   * @return {Object} 統計情報
   */
  getStatistics: function() {
    try {
      var allCharacters = SpreadsheetService.getAllCharacters();
      var unownedCharacters = SpreadsheetService.getUnownedCharacters();
      
      // 属性別統計
      var attributeStats = {};
      var priorityStats = {
        total: unownedCharacters.length,
        set: 0,
        unset: 0,
        byLevel: { high: 0, medium: 0, low: 0 }
      };
      
      // ショップ別統計
      var shopStats = {
        specialOnly: 0,
        greatOnly: 0,
        both: 0,
        neither: 0
      };
      
      for (var i = 0; i < unownedCharacters.length; i++) {
        var char = unownedCharacters[i];
        
        // 属性統計
        var attr = char.attribute || '不明';
        attributeStats[attr] = (attributeStats[attr] || 0) + 1;
        
        // 優先度統計
        if (char.priority !== null && char.priority !== '') {
          priorityStats.set++;
          var numPriority = Number(char.priority);
          if (numPriority >= 8) {
            priorityStats.byLevel.high++;
          } else if (numPriority >= 5) {
            priorityStats.byLevel.medium++;
          } else {
            priorityStats.byLevel.low++;
          }
        } else {
          priorityStats.unset++;
        }
        
        // ショップ統計
        if (char.specialShop && char.greatShop) {
          shopStats.both++;
        } else if (char.specialShop) {
          shopStats.specialOnly++;
        } else if (char.greatShop) {
          shopStats.greatOnly++;
        } else {
          shopStats.neither++;
        }
      }
      
      return {
        total: allCharacters.length,
        owned: allCharacters.length - unownedCharacters.length,
        unowned: unownedCharacters.length,
        attributes: attributeStats,
        priorities: priorityStats,
        shops: shopStats
      };
      
    } catch (error) {
      Logger.log('統計情報取得エラー: ' + error.toString());
      throw new Error('統計情報の取得に失敗しました: ' + error.message);
    }
  },
  
  /**
   * 特定のキャラクターを検索
   * @param {string} searchTerm 検索語（名前の部分一致）
   * @return {Array} 検索結果
   */
  searchCharacters: function(searchTerm) {
    try {
      var unownedCharacters = SpreadsheetService.getUnownedCharacters();
      var results = [];
      
      var searchLower = searchTerm.toLowerCase();
      
      for (var i = 0; i < unownedCharacters.length; i++) {
        var char = unownedCharacters[i];
        if (char.name.toLowerCase().indexOf(searchLower) !== -1) {
          results.push(char);
        }
      }
      
      Logger.log('検索結果: "' + searchTerm + '" → ' + results.length + '体');
      return results;
      
    } catch (error) {
      Logger.log('キャラクター検索エラー: ' + error.toString());
      throw new Error('キャラクター検索に失敗しました: ' + error.message);
    }
  },
  
  /**
   * 優先度未設定のキャラクターを取得
   * @return {Array} 優先度未設定キャラクター配列
   */
  getCharactersWithoutPriority: function() {
    return this.getUnownedCharactersWithOptions({
      priorityStatus: 'unset'
    });
  },
  
  /**
   * 高優先度キャラクターを取得
   * @return {Array} 高優先度キャラクター配列（優先度8-10）
   */
  getHighPriorityCharacters: function() {
    try {
      var unownedCharacters = SpreadsheetService.getUnownedCharacters();
      var highPriorityChars = [];
      
      for (var i = 0; i < unownedCharacters.length; i++) {
        var char = unownedCharacters[i];
        var priority = Number(char.priority);
        if (!isNaN(priority) && priority >= 8) {
          highPriorityChars.push(char);
        }
      }
      
      // 優先度順でソート（降順）
      highPriorityChars.sort(function(a, b) {
        return Number(b.priority) - Number(a.priority);
      });
      
      return highPriorityChars;
      
    } catch (error) {
      Logger.log('高優先度キャラクター取得エラー: ' + error.toString());
      throw new Error('高優先度キャラクターの取得に失敗しました: ' + error.message);
    }
  }
};