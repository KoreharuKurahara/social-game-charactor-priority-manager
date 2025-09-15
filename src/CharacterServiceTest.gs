/**
 * CharacterServiceのテスト
 */

/**
 * CharacterServiceの全機能をテスト
 */
function testCharacterService() {
  Logger.log('=== CharacterService テスト開始 ===');
  
  try {
    // 1. 基本的な未所持キャラクター取得
    Logger.log('1. 基本的な未所持キャラクター取得');
    var allUnowned = CharacterService.getUnownedCharactersWithOptions();
    Logger.log('✅ 未所持キャラクター総数: ' + allUnowned.length);
    
    // 2. 属性フィルタテスト
    Logger.log('');
    Logger.log('2. 属性フィルタテスト');
    var attributes = ['アクティブ', 'ラブリー', 'フレンドリー', 'リラックス', 'マイペース'];
    
    for (var i = 0; i < attributes.length; i++) {
      var attr = attributes[i];
      var filtered = CharacterService.getUnownedCharactersWithOptions({
        attribute: attr
      });
      Logger.log('  ' + attr + ': ' + filtered.length + '体');
    }
    
    // 3. ショップフィルタテスト
    Logger.log('');
    Logger.log('3. ショップフィルタテスト');
    var shopFilters = [
      { type: 'special', name: 'スペシャルショップのみ' },
      { type: 'great', name: 'グレートショップのみ' },
      { type: 'both', name: '両方のショップ' },
      { type: 'either', name: 'いずれかのショップ' },
      { type: 'none', name: 'ショップ対象外' }
    ];
    
    for (var j = 0; j < shopFilters.length; j++) {
      var filter = shopFilters[j];
      var filtered = CharacterService.getUnownedCharactersWithOptions({
        shopType: filter.type
      });
      Logger.log('  ' + filter.name + ': ' + filtered.length + '体');
    }
    
    // 4. 優先度フィルタテスト
    Logger.log('');
    Logger.log('4. 優先度フィルタテスト');
    var prioritySet = CharacterService.getUnownedCharactersWithOptions({
      priorityStatus: 'set'
    });
    var priorityUnset = CharacterService.getUnownedCharactersWithOptions({
      priorityStatus: 'unset'
    });
    Logger.log('  優先度設定済み: ' + prioritySet.length + '体');
    Logger.log('  優先度未設定: ' + priorityUnset.length + '体');
    
    // 5. グループ化テスト
    Logger.log('');
    Logger.log('5. グループ化テスト');
    var attributeGroups = CharacterService.groupByAttribute(allUnowned);
    Logger.log('  属性別グループ:');
    for (var attr in attributeGroups) {
      Logger.log('    ' + attr + ': ' + attributeGroups[attr].length + '体');
    }
    
    var priorityGroups = CharacterService.groupByPriority(allUnowned);
    Logger.log('  優先度別グループ:');
    Logger.log('    高優先度(8-10): ' + priorityGroups.high.length + '体');
    Logger.log('    中優先度(5-7): ' + priorityGroups.medium.length + '体');
    Logger.log('    低優先度(1-4): ' + priorityGroups.low.length + '体');
    Logger.log('    未設定: ' + priorityGroups.unset.length + '体');
    
    // 6. 統計情報テスト
    Logger.log('');
    Logger.log('6. 統計情報テスト');
    var stats = CharacterService.getStatistics();
    Logger.log('📊 詳細統計:');
    Logger.log('  総キャラクター: ' + stats.total + '体');
    Logger.log('  所持済み: ' + stats.owned + '体 (' + Math.round(stats.owned / stats.total * 100) + '%)');
    Logger.log('  未所持: ' + stats.unowned + '体 (' + Math.round(stats.unowned / stats.total * 100) + '%)');
    
    Logger.log('  属性別未所持:');
    for (var attr in stats.attributes) {
      Logger.log('    ' + attr + ': ' + stats.attributes[attr] + '体');
    }
    
    Logger.log('  ショップ別未所持:');
    Logger.log('    スペシャルのみ: ' + stats.shops.specialOnly + '体');
    Logger.log('    グレートのみ: ' + stats.shops.greatOnly + '体');
    Logger.log('    両方: ' + stats.shops.both + '体');
    Logger.log('    対象外: ' + stats.shops.neither + '体');
    
    // 7. 検索テスト
    Logger.log('');
    Logger.log('7. 検索テスト');
    var searchResults = CharacterService.searchCharacters('サーバル');
    Logger.log('  "サーバル"検索結果: ' + searchResults.length + '体');
    if (searchResults.length > 0) {
      for (var k = 0; k < Math.min(3, searchResults.length); k++) {
        Logger.log('    ' + (k + 1) + '. ' + searchResults[k].name);
      }
    }
    
    // 8. 特殊取得メソッドテスト
    Logger.log('');
    Logger.log('8. 特殊取得メソッドテスト');
    var withoutPriority = CharacterService.getCharactersWithoutPriority();
    var highPriority = CharacterService.getHighPriorityCharacters();
    Logger.log('  優先度未設定: ' + withoutPriority.length + '体');
    Logger.log('  高優先度(8-10): ' + highPriority.length + '体');
    
    Logger.log('');
    Logger.log('🎉 CharacterService テスト完了！');
    
  } catch (error) {
    Logger.log('❌ CharacterService テストエラー: ' + error.toString());
    Logger.log('スタックトレース: ' + error.stack);
  }
}

/**
 * 複合フィルタのテスト
 */
function testComplexFilters() {
  Logger.log('=== 複合フィルタテスト ===');
  
  try {
    // 複数条件の組み合わせテスト
    var complexFilter1 = CharacterService.getUnownedCharactersWithOptions({
      attribute: 'アクティブ',
      shopType: 'either',
      priorityStatus: 'unset'
    });
    Logger.log('アクティブ × ショップ対象 × 優先度未設定: ' + complexFilter1.length + '体');
    
    var complexFilter2 = CharacterService.getUnownedCharactersWithOptions({
      attribute: 'ラブリー',
      shopType: 'both'
    });
    Logger.log('ラブリー × 両ショップ対象: ' + complexFilter2.length + '体');
    
    // 結果の詳細表示
    if (complexFilter1.length > 0) {
      Logger.log('');
      Logger.log('アクティブ × ショップ対象 × 優先度未設定 の例:');
      for (var i = 0; i < Math.min(3, complexFilter1.length); i++) {
        var char = complexFilter1[i];
        var shops = [];
        if (char.specialShop) shops.push('スペシャル');
        if (char.greatShop) shops.push('グレート');
        Logger.log('  ' + (i + 1) + '. ' + char.name + ' [' + shops.join(', ') + ']');
      }
    }
    
  } catch (error) {
    Logger.log('❌ 複合フィルタテストエラー: ' + error.toString());
  }
}