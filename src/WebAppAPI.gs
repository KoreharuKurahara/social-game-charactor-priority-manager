/**
 * WebアプリのAPI関数
 * フロントエンドから呼び出される関数群
 */

/**
 * 統計情報を取得
 * @return {Object} 統計情報
 */
function getStatistics() {
  try {
    return CharacterService.getStatistics();
  } catch (error) {
    Logger.log('統計情報取得API エラー: ' + error.toString());
    throw new Error('統計情報の取得に失敗しました');
  }
}

/**
 * フィルタオプション付きで未所持キャラクターを取得
 * @param {Object} options フィルタオプション
 * @return {Array} キャラクター配列
 */
function getUnownedCharactersWithOptions(options) {
  try {
    return CharacterService.getUnownedCharactersWithOptions(options || {});
  } catch (error) {
    Logger.log('キャラクター取得API エラー: ' + error.toString());
    throw new Error('キャラクターデータの取得に失敗しました');
  }
}

/**
 * 優先度を更新
 * @param {number} rowIndex 行番号
 * @param {number|null} priority 優先度
 * @return {boolean} 成功フラグ
 */
function updatePriority(rowIndex, priority) {
  try {
    return SpreadsheetService.updatePriority(rowIndex, priority);
  } catch (error) {
    Logger.log('優先度更新API エラー: ' + error.toString());
    throw new Error('優先度の更新に失敗しました');
  }
}

/**
 * キャラクター検索
 * @param {string} searchTerm 検索語
 * @return {Array} 検索結果
 */
function searchCharacters(searchTerm) {
  try {
    return CharacterService.searchCharacters(searchTerm);
  } catch (error) {
    Logger.log('キャラクター検索API エラー: ' + error.toString());
    throw new Error('キャラクター検索に失敗しました');
  }
}

/**
 * 属性別キャラクター取得
 * @param {string} attribute 属性名
 * @return {Array} キャラクター配列
 */
function getCharactersByAttribute(attribute) {
  try {
    return CharacterService.getUnownedCharactersWithOptions({
      attribute: attribute
    });
  } catch (error) {
    Logger.log('属性別キャラクター取得API エラー: ' + error.toString());
    throw new Error('属性別キャラクターの取得に失敗しました');
  }
}

/**
 * 高優先度キャラクター取得
 * @return {Array} 高優先度キャラクター配列
 */
function getHighPriorityCharacters() {
  try {
    return CharacterService.getHighPriorityCharacters();
  } catch (error) {
    Logger.log('高優先度キャラクター取得API エラー: ' + error.toString());
    throw new Error('高優先度キャラクターの取得に失敗しました');
  }
}

/**
 * 優先度未設定キャラクター取得
 * @return {Array} 優先度未設定キャラクター配列
 */
function getCharactersWithoutPriority() {
  try {
    return CharacterService.getCharactersWithoutPriority();
  } catch (error) {
    Logger.log('優先度未設定キャラクター取得API エラー: ' + error.toString());
    throw new Error('優先度未設定キャラクターの取得に失敗しました');
  }
}

/**
 * アプリケーション情報を取得
 * @return {Object} アプリ情報
 */
function getAppInfo() {
  try {
    var spreadsheet = getSpreadsheet();
    var stats = CharacterService.getStatistics();
    
    return {
      appName: 'けものフレンズ3 優先度管理',
      version: '1.0.0',
      spreadsheetName: spreadsheet.getName(),
      lastUpdated: new Date(),
      totalCharacters: stats.total,
      unownedCharacters: stats.unowned,
      prioritySetCharacters: stats.priorities.set
    };
  } catch (error) {
    Logger.log('アプリ情報取得API エラー: ' + error.toString());
    throw new Error('アプリ情報の取得に失敗しました');
  }
}