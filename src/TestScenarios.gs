/**
 * 実際のユーザーシナリオに基づくテスト
 */

/**
 * ユーザーシナリオテスト実行
 */
function runUserScenarioTests() {
  Logger.log('=== ユーザーシナリオテスト開始 ===');
  
  var scenarios = [
    'scenario1_NewUserFirstVisit',
    'scenario2_PriorityManagement', 
    'scenario3_CharacterSearch',
    'scenario4_FilterAndSort',
    'scenario5_BulkOperations'
  ];
  
  var results = { passed: 0, failed: 0, errors: [] };
  
  for (var i = 0; i < scenarios.length; i++) {
    try {
      Logger.log('');
      Logger.log('--- シナリオ' + (i + 1) + ' ---');
      
      var result = this[scenarios[i]]();
      
      if (result.success) {
        results.passed++;
        Logger.log('✅ シナリオ' + (i + 1) + ' 成功');
      } else {
        results.failed++;
        results.errors.push('シナリオ' + (i + 1) + ': ' + result.error);
        Logger.log('❌ シナリオ' + (i + 1) + ' 失敗: ' + result.error);
      }
      
    } catch (error) {
      results.failed++;
      results.errors.push('シナリオ' + (i + 1) + ': ' + error.message);
      Logger.log('❌ シナリオ' + (i + 1) + ' エラー: ' + error.toString());
    }
  }
  
  Logger.log('');
  Logger.log('=== ユーザーシナリオテスト結果 ===');
  Logger.log('成功: ' + results.passed + '/' + scenarios.length);
  Logger.log('失敗: ' + results.failed + '/' + scenarios.length);
  
  if (results.failed > 0) {
    Logger.log('失敗したシナリオ:');
    for (var j = 0; j < results.errors.length; j++) {
      Logger.log('  ' + results.errors[j]);
    }
  }
  
  return results;
}

/**
 * シナリオ1: 新規ユーザーの初回訪問
 * 「初めてアプリを使用するユーザーが、全体の状況を把握する」
 */
function scenario1_NewUserFirstVisit() {
  try {
    Logger.log('新規ユーザーがアプリに初回アクセス...');
    
    // 1. ダッシュボード情報を取得
    var dashboardData = getDashboardData();
    if (!dashboardData) {
      return { success: false, error: 'ダッシュボードデータが取得できません' };
    }
    
    Logger.log('  総キャラクター数: ' + dashboardData.overview.totalCharacters);
    Logger.log('  完了率: ' + dashboardData.overview.completionRate + '%');
    
    // 2. 未所持キャラクター一覧を表示
    var characters = getCharactersWithPagination({ page: 1, pageSize: 20 });
    if (!characters || !characters.characters) {
      return { success: false, error: 'キャラクター一覧が取得できません' };
    }
    
    Logger.log('  表示されたキャラクター数: ' + characters.characters.length);
    Logger.log('  総ページ数: ' + characters.pagination.totalPages);
    
    // 3. 推奨事項を確認
    if (dashboardData.recommendations && dashboardData.recommendations.length > 0) {
      Logger.log('  推奨事項: ' + dashboardData.recommendations[0].title);
    }
    
    return { success: true };
    
  } catch (error) {
    return { success: false, error: error.message };
  }
}

/**
 * シナリオ2: 優先度管理
 * 「ユーザーが特定のキャラクターの優先度を設定・変更する」
 */
function scenario2_PriorityManagement() {
  try {
    Logger.log('ユーザーが優先度を管理...');
    
    // 1. 優先度未設定のキャラクターを探す
    var unsetChars = getCharactersWithoutPriority();
    if (!unsetChars || unsetChars.length === 0) {
      Logger.log('  優先度未設定キャラクターなし（全て設定済み）');
      return { success: true };
    }
    
    Logger.log('  優先度未設定キャラクター: ' + unsetChars.length + '体');
    
    // 2. 最初のキャラクターの詳細を確認
    var targetChar = unsetChars[0];
    var details = getCharacterDetails(targetChar.id);
    
    if (!details) {
      return { success: false, error: 'キャラクター詳細が取得できません' };
    }
    
    Logger.log('  対象キャラクター: ' + details.character.name);
    Logger.log('  推奨事項数: ' + details.recommendations.length);
    
    // 3. 類似キャラクターを確認
    if (details.similarCharacters && details.similarCharacters.length > 0) {
      Logger.log('  類似キャラクター: ' + details.similarCharacters[0].character.name);
    }
    
    // 4. 優先度更新（テスト環境では実際に更新しない）
    Logger.log('  優先度更新: テスト環境のため実際の更新はスキップ');
    
    return { success: true };
    
  } catch (error) {
    return { success: false, error: error.message };
  }
}

/**
 * シナリオ3: キャラクター検索
 * 「ユーザーが特定のキャラクターを名前で検索する」
 */
function scenario3_CharacterSearch() {
  try {
    Logger.log('ユーザーがキャラクターを検索...');
    
    // 1. 人気のキャラクター名で検索
    var searchTerms = ['ゲンブ', 'ジュゴン', 'トキ', 'ハブ'];
    var totalResults = 0;
    
    for (var i = 0; i < searchTerms.length; i++) {
      var searchTerm = searchTerms[i];
      var results = searchCharacters(searchTerm);
      
      Logger.log('  "' + searchTerm + '"検索結果: ' + results.length + '体');
      totalResults += results.length;
      
      if (results.length > 0) {
        Logger.log('    例: ' + results[0].name);
      }
    }
    
    // 2. 検索結果をページネーションで表示
    if (totalResults > 0) {
      var paginatedSearch = getCharactersWithPagination({
        search: searchTerms[0],
        page: 1,
        pageSize: 10
      });
      
      if (paginatedSearch && paginatedSearch.characters) {
        Logger.log('  ページネーション検索結果: ' + paginatedSearch.characters.length + '体');
      }
    }
    
    return { success: true };
    
  } catch (error) {
    return { success: false, error: error.message };
  }
}

/**
 * シナリオ4: フィルタとソート
 * 「ユーザーが属性でフィルタし、優先度順でソートする」
 */
function scenario4_FilterAndSort() {
  try {
    Logger.log('ユーザーがフィルタ・ソート機能を使用...');
    
    // 1. 属性フィルタを適用
    var attributes = ['アクティブ', 'ラブリー', 'フレンドリー', 'リラックス', 'マイペース'];
    
    for (var i = 0; i < attributes.length; i++) {
      var attribute = attributes[i];
      var filtered = getCharactersWithPagination({
        attribute: attribute,
        page: 1,
        pageSize: 10
      });
      
      if (filtered && filtered.characters) {
        Logger.log('  ' + attribute + '属性: ' + filtered.pagination.totalCount + '体');
      }
    }
    
    // 2. ショップフィルタを適用
    var shopTypes = ['special', 'great', 'both', 'either', 'none'];
    
    for (var j = 0; j < shopTypes.length; j++) {
      var shopType = shopTypes[j];
      var shopFiltered = getCharactersWithPagination({
        shopType: shopType,
        page: 1,
        pageSize: 10
      });
      
      if (shopFiltered && shopFiltered.characters) {
        Logger.log('  ショップ(' + shopType + '): ' + shopFiltered.pagination.totalCount + '体');
      }
    }
    
    // 3. ソート機能をテスト
    var sortOptions = [
      { sortBy: 'priority', sortOrder: 'desc' },
      { sortBy: 'name', sortOrder: 'asc' },
      { sortBy: 'attribute', sortOrder: 'asc' }
    ];
    
    for (var k = 0; k < sortOptions.length; k++) {
      var sortOption = sortOptions[k];
      var sorted = getCharactersWithPagination({
        page: 1,
        pageSize: 5,
        sortBy: sortOption.sortBy,
        sortOrder: sortOption.sortOrder
      });
      
      if (sorted && sorted.characters && sorted.characters.length > 0) {
        Logger.log('  ソート(' + sortOption.sortBy + ' ' + sortOption.sortOrder + '): ' + sorted.characters[0].name);
      }
    }
    
    return { success: true };
    
  } catch (error) {
    return { success: false, error: error.message };
  }
}

/**
 * シナリオ5: 一括操作
 * 「ユーザーが複数のキャラクターを効率的に管理する」
 */
function scenario5_BulkOperations() {
  try {
    Logger.log('ユーザーが一括操作を実行...');
    
    // 1. 高優先度キャラクターを一覧表示
    var highPriorityChars = getHighPriorityCharacters();
    Logger.log('  高優先度キャラクター: ' + highPriorityChars.length + '体');
    
    if (highPriorityChars.length > 0) {
      Logger.log('    最高優先度: ' + highPriorityChars[0].name + ' (優先度: ' + highPriorityChars[0].priority + ')');
    }
    
    // 2. 優先度未設定キャラクターを確認
    var unsetChars = getCharactersWithoutPriority();
    Logger.log('  優先度未設定: ' + unsetChars.length + '体');
    
    // 3. 属性別の統計を確認
    var stats = getStatistics();
    if (stats && stats.attributes) {
      Logger.log('  属性別統計:');
      for (var attr in stats.attributes) {
        Logger.log('    ' + attr + ': ' + stats.attributes[attr] + '体');
      }
    }
    
    // 4. ショップ対象キャラクターを確認
    var shopChars = getCharactersWithPagination({
      shopType: 'either',
      page: 1,
      pageSize: 100
    });
    
    if (shopChars) {
      Logger.log('  ショップ対象キャラクター: ' + shopChars.pagination.totalCount + '体');
    }
    
    return { success: true };
    
  } catch (error) {
    return { success: false, error: error.message };
  }
}

/**
 * パフォーマンステスト
 */
function runPerformanceTest() {
  Logger.log('=== パフォーマンステスト ===');
  
  var tests = [
    { name: '大量データ読み込み', func: 'perfTest_DataLoad' },
    { name: 'ページネーション', func: 'perfTest_Pagination' },
    { name: '複合フィルタ', func: 'perfTest_ComplexFilter' },
    { name: '統計計算', func: 'perfTest_Statistics' }
  ];
  
  for (var i = 0; i < tests.length; i++) {
    var test = tests[i];
    var startTime = new Date().getTime();
    
    try {
      this[test.func]();
      var duration = new Date().getTime() - startTime;
      Logger.log('✅ ' + test.name + ': ' + duration + 'ms');
    } catch (error) {
      Logger.log('❌ ' + test.name + ': エラー - ' + error.message);
    }
  }
}

function perfTest_DataLoad() {
  SpreadsheetService.getAllCharacters();
}

function perfTest_Pagination() {
  getCharactersWithPagination({ page: 1, pageSize: 50 });
}

function perfTest_ComplexFilter() {
  getCharactersWithPagination({
    attribute: 'アクティブ',
    shopType: 'either',
    priorityStatus: 'unset',
    sortBy: 'priority',
    sortOrder: 'desc'
  });
}

function perfTest_Statistics() {
  getDashboardData();
}