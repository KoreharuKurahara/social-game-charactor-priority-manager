/**
 * UIController - 高度なUI制御機能
 * フロントエンドから呼び出される高度なUI制御API
 */

/**
 * ページネーション付きキャラクター取得
 * @param {Object} options フィルタ・ページネーションオプション
 * @return {Object} ページネーション情報付きキャラクターデータ
 */
function getCharactersWithPagination(options) {
  try {
    options = options || {};
    var page = options.page || 1;
    var pageSize = options.pageSize || 20;
    var sortBy = options.sortBy || 'priority';
    var sortOrder = options.sortOrder || 'desc';
    
    // フィルタ適用
    var characters = CharacterService.getUnownedCharactersWithOptions({
      attribute: options.attribute,
      shopType: options.shopType,
      priorityStatus: options.priorityStatus
    });
    
    // 検索フィルタ
    if (options.search) {
      var searchTerm = options.search.toLowerCase();
      characters = characters.filter(function(char) {
        return char.name.toLowerCase().indexOf(searchTerm) !== -1;
      });
    }
    
    // ソート
    characters = sortCharacters(characters, sortBy, sortOrder);
    
    // ページネーション
    var totalCount = characters.length;
    var totalPages = Math.ceil(totalCount / pageSize);
    var startIndex = (page - 1) * pageSize;
    var endIndex = Math.min(startIndex + pageSize, totalCount);
    var pageCharacters = characters.slice(startIndex, endIndex);
    
    Logger.log('ページネーション結果: ページ' + page + '/' + totalPages + ', ' + pageCharacters.length + '体表示');
    
    return {
      characters: pageCharacters,
      pagination: {
        currentPage: page,
        totalPages: totalPages,
        pageSize: pageSize,
        totalCount: totalCount,
        hasNext: page < totalPages,
        hasPrev: page > 1
      },
      filters: {
        attribute: options.attribute || '',
        shopType: options.shopType || '',
        priorityStatus: options.priorityStatus || '',
        search: options.search || ''
      },
      sort: {
        sortBy: sortBy,
        sortOrder: sortOrder
      }
    };
    
  } catch (error) {
    Logger.log('ページネーション取得エラー: ' + error.toString());
    throw new Error('キャラクターデータの取得に失敗しました: ' + error.message);
  }
}

/**
 * キャラクターソート機能
 */
function sortCharacters(characters, sortBy, sortOrder) {
  return characters.sort(function(a, b) {
    var aValue, bValue;
    
    switch (sortBy) {
      case 'priority':
        aValue = a.priority === null || a.priority === '' ? 0 : Number(a.priority);
        bValue = b.priority === null || b.priority === '' ? 0 : Number(b.priority);
        break;
      case 'name':
        aValue = a.name;
        bValue = b.name;
        break;
      case 'attribute':
        aValue = a.attribute;
        bValue = b.attribute;
        break;
      case 'id':
        aValue = a.id;
        bValue = b.id;
        break;
      default:
        aValue = a.priority === null || a.priority === '' ? 0 : Number(a.priority);
        bValue = b.priority === null || b.priority === '' ? 0 : Number(b.priority);
    }
    
    if (sortOrder === 'asc') {
      return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
    } else {
      return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
    }
  });
}

/**
 * 一括優先度更新
 * @param {Array} updates 更新データの配列 [{rowIndex, priority}, ...]
 * @return {Object} 更新結果
 */
function bulkUpdatePriorities(updates) {
  try {
    var results = {
      success: 0,
      failed: 0,
      errors: []
    };
    
    for (var i = 0; i < updates.length; i++) {
      try {
        var update = updates[i];
        SpreadsheetService.updatePriority(update.rowIndex, update.priority);
        results.success++;
      } catch (error) {
        results.failed++;
        results.errors.push({
          rowIndex: update.rowIndex,
          error: error.message
        });
      }
    }
    
    Logger.log('一括更新結果: 成功' + results.success + '件, 失敗' + results.failed + '件');
    return results;
    
  } catch (error) {
    Logger.log('一括更新エラー: ' + error.toString());
    throw new Error('一括更新に失敗しました: ' + error.message);
  }
}

/**
 * キャラクター詳細情報取得
 * @param {string} characterId キャラクターID
 * @return {Object} 詳細情報
 */
function getCharacterDetails(characterId) {
  Logger.log('getCharacterDetails開始: characterId=' + characterId + ' (型:' + typeof characterId + ')');
  
  // 入力値検証
  if (characterId === null || characterId === undefined || characterId === '') {
    Logger.log('無効なcharacterID: ' + characterId);
    throw new Error('キャラクターIDが無効です: ' + characterId);
  }
  
  try {
    Logger.log('SpreadsheetService.getAllCharacters()呼び出し開始');
    var allCharacters = SpreadsheetService.getAllCharacters();
    Logger.log('getAllCharacters完了: ' + allCharacters.length + '体取得');
    
    var character = null;
    
    // キャラクターIDを文字列として正規化
    var targetId = String(characterId);
    Logger.log('正規化されたID: ' + targetId);
    
    for (var i = 0; i < allCharacters.length; i++) {
      var currentId = String(allCharacters[i].id);
      if (currentId === targetId) {
        character = allCharacters[i];
        Logger.log('キャラクター発見: ' + character.name + ' (インデックス:' + i + ')');
        break;
      }
    }
    
    if (!character) {
      var availableIds = allCharacters.map(function(c) { return String(c.id); }).slice(0, 10);
      Logger.log('キャラクター検索失敗: 対象ID=' + targetId + ' (型:' + typeof targetId + ')');
      Logger.log('利用可能ID (最初の10個): ' + availableIds.join(', '));
      Logger.log('全キャラクター数: ' + allCharacters.length);
      throw new Error('キャラクターが見つかりません: ' + characterId + ' (利用可能: ' + availableIds.slice(0, 3).join(', ') + '...)');
    }
    
    Logger.log('関連情報取得開始');
    
    // 関連情報を追加
    var similarCharacters = [];
    var priorityHistory = [];
    var recommendations = [];
    
    try {
      Logger.log('getSimilarCharacters呼び出し');
      similarCharacters = getSimilarCharacters(character) || [];
      Logger.log('類似キャラクター取得完了: ' + similarCharacters.length + '体');
    } catch (e) {
      Logger.log('類似キャラクター取得エラー: ' + e.toString());
      similarCharacters = [];
    }
    
    try {
      Logger.log('getPriorityHistory呼び出し');
      priorityHistory = getPriorityHistory(character.rowIndex) || [];
      Logger.log('優先度履歴取得完了');
    } catch (e) {
      Logger.log('優先度履歴取得エラー: ' + e.toString());
      priorityHistory = [];
    }
    
    try {
      Logger.log('getRecommendations呼び出し');
      recommendations = getRecommendations(character) || [];
      Logger.log('推奨事項取得完了: ' + recommendations.length + '件');
    } catch (e) {
      Logger.log('推奨事項取得エラー: ' + e.toString());
      recommendations = [];
    }
    
    var details = {
      character: character,
      similarCharacters: similarCharacters,
      priorityHistory: priorityHistory,
      recommendations: recommendations
    };
    
    Logger.log('キャラクター詳細取得成功: ' + character.name + ' (ID: ' + character.id + ')');
    Logger.log('詳細オブジェクト: ' + JSON.stringify({
      hasCharacter: !!details.character,
      characterName: details.character ? details.character.name : 'null',
      similarCount: details.similarCharacters.length,
      historyCount: details.priorityHistory.length,
      recommendationCount: details.recommendations.length
    }));
    
    return details;
    
  } catch (error) {
    Logger.log('キャラクター詳細取得エラー: ' + error.toString());
    Logger.log('エラースタック: ' + (error.stack || 'スタック情報なし'));
    
    // エラーオブジェクトを返すのではなく、エラーを再スローする
    var errorMessage = 'キャラクター詳細の取得に失敗しました: ' + error.message;
    Logger.log('エラーメッセージ: ' + errorMessage);
    throw new Error(errorMessage);
  }
}

/**
 * 類似キャラクター取得
 */
function getSimilarCharacters(targetCharacter) {
  try {
    var unownedCharacters = SpreadsheetService.getUnownedCharacters();
    var similar = [];
    
    for (var i = 0; i < unownedCharacters.length; i++) {
      var char = unownedCharacters[i];
      if (char.id === targetCharacter.id) continue;
      
      var score = 0;
      
      // 属性が同じ
      if (char.attribute === targetCharacter.attribute) score += 3;
      
      // ショップが同じ
      if (char.specialShop === targetCharacter.specialShop) score += 1;
      if (char.greatShop === targetCharacter.greatShop) score += 1;
      
      // 優先度が近い
      if (char.priority && targetCharacter.priority) {
        var diff = Math.abs(Number(char.priority) - Number(targetCharacter.priority));
        if (diff <= 1) score += 2;
        else if (diff <= 2) score += 1;
      }
      
      if (score >= 2) {
        similar.push({
          character: char,
          similarity: score
        });
      }
    }
    
    // スコア順でソート
    similar.sort(function(a, b) {
      return b.similarity - a.similarity;
    });
    
    return similar.slice(0, 5); // 上位5体
    
  } catch (error) {
    Logger.log('類似キャラクター取得エラー: ' + error.toString());
    return [];
  }
}

/**
 * 優先度履歴取得（簡易版）
 */
function getPriorityHistory(rowIndex) {
  // 実際の実装では、別シートに履歴を保存することを推奨
  // ここでは現在の値のみ返す
  try {
    return [{
      date: new Date(),
      priority: null,
      action: 'current'
    }];
  } catch (error) {
    return [];
  }
}

/**
 * おすすめ機能
 */
function getRecommendations(character) {
  var recommendations = [];
  
  try {
    // 優先度未設定の場合
    if (!character.priority || character.priority === '') {
      recommendations.push({
        type: 'priority',
        message: '優先度を設定することをおすすめします',
        action: 'setPriority'
      });
    }
    
    // ショップ対象の場合
    if (character.specialShop || character.greatShop) {
      recommendations.push({
        type: 'shop',
        message: 'ショップで入手可能です。期間限定の可能性があります',
        action: 'checkShop'
      });
    }
    
    // 高優先度の場合
    if (character.priority && Number(character.priority) >= 8) {
      recommendations.push({
        type: 'urgent',
        message: '高優先度キャラクターです。早めの取得をおすすめします',
        action: 'prioritize'
      });
    }
    
    return recommendations;
    
  } catch (error) {
    Logger.log('おすすめ生成エラー: ' + error.toString());
    return [];
  }
}

/**
 * ダッシュボード情報取得
 * @return {Object} ダッシュボード用の統合情報
 */
function getDashboardData() {
  try {
    var stats = CharacterService.getStatistics();
    var highPriorityChars = CharacterService.getHighPriorityCharacters();
    var unsetPriorityChars = CharacterService.getCharactersWithoutPriority();
    
    // 属性別統計
    var attributeBreakdown = [];
    for (var attr in stats.attributes) {
      attributeBreakdown.push({
        attribute: attr,
        count: stats.attributes[attr],
        percentage: Math.round(stats.attributes[attr] / stats.unowned * 100)
      });
    }
    
    // ショップ別統計
    var shopBreakdown = [
      { name: 'スペシャルのみ', count: stats.shops.specialOnly },
      { name: 'グレートのみ', count: stats.shops.greatOnly },
      { name: '両ショップ', count: stats.shops.both },
      { name: 'ショップ対象外', count: stats.shops.neither }
    ];
    
    return {
      overview: {
        totalCharacters: stats.total,
        ownedCharacters: stats.owned,
        unownedCharacters: stats.unowned,
        prioritySetCharacters: stats.priorities.set,
        completionRate: Math.round(stats.owned / stats.total * 100)
      },
      priorities: {
        high: highPriorityChars.length,
        unset: unsetPriorityChars.length,
        highPriorityList: highPriorityChars.slice(0, 5) // 上位5体
      },
      breakdown: {
        attributes: attributeBreakdown,
        shops: shopBreakdown
      },
      recommendations: generateDashboardRecommendations(stats, highPriorityChars, unsetPriorityChars)
    };
    
  } catch (error) {
    Logger.log('ダッシュボードデータ取得エラー: ' + error.toString());
    throw new Error('ダッシュボードデータの取得に失敗しました: ' + error.message);
  }
}

/**
 * ダッシュボード用おすすめ生成
 */
function generateDashboardRecommendations(stats, highPriorityChars, unsetPriorityChars) {
  var recommendations = [];
  
  // 優先度未設定が多い場合
  if (unsetPriorityChars.length > stats.unowned * 0.5) {
    recommendations.push({
      type: 'action',
      title: '優先度設定を進めましょう',
      message: unsetPriorityChars.length + '体のキャラクターの優先度が未設定です',
      action: 'setPriorities'
    });
  }
  
  // 高優先度キャラクターがいる場合
  if (highPriorityChars.length > 0) {
    recommendations.push({
      type: 'urgent',
      title: '高優先度キャラクターに注目',
      message: highPriorityChars.length + '体の高優先度キャラクターがいます',
      action: 'viewHighPriority'
    });
  }
  
  // ショップ対象キャラクターがいる場合
  var shopTotal = stats.shops.specialOnly + stats.shops.greatOnly + stats.shops.both;
  if (shopTotal > 0) {
    recommendations.push({
      type: 'info',
      title: 'ショップ対象キャラクターを確認',
      message: shopTotal + '体がショップで入手可能です',
      action: 'viewShopCharacters'
    });
  }
  
  return recommendations;
}

/**
 * 所持ステータス更新（フロントエンドから呼び出し用）
 * @param {number} rowIndex スプレッドシートの行番号
 * @param {boolean} isOwned 所持ステータス
 * @return {boolean} 更新成功フラグ
 */
function updateOwnershipStatus(rowIndex, isOwned) {
  return SpreadsheetService.updateOwnershipStatus(rowIndex, isOwned);
}

/**
 * 全キャラクター取得（フロントエンドから呼び出し用）
 * @return {Array} 全キャラクターの配列
 */
function getAllCharacters() {
  return SpreadsheetService.getAllCharacters();
}

/**
 * 未所持キャラクター取得（フロントエンドから呼び出し用）
 * @return {Array} 未所持キャラクターの配列
 */
function getUnownedCharacters() {
  return SpreadsheetService.getUnownedCharacters();
}