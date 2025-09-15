/**
 * ローカル開発用モックデータ
 * Google Apps Scriptの機能を模擬
 */

// サンプルキャラクターデータ
let mockCharacters = [
  {
    rowIndex: 2,
    id: '001',
    name: 'サーバル',
    attribute: 'アクティブ',
    hc: 'サバンナの案内人',
    specialShop: true,
    greatShop: false,
    owned: false,
    priority: 9
  },
  {
    rowIndex: 3,
    id: '002',
    name: 'フェネック',
    attribute: 'アクティブ',
    hc: '砂漠の知恵袋',
    specialShop: false,
    greatShop: true,
    owned: true,
    priority: null
  },
  {
    rowIndex: 4,
    id: '003',
    name: 'アライグマ',
    attribute: 'アクティブ',
    hc: '手先が器用なのだ',
    specialShop: false,
    greatShop: false,
    owned: false,
    priority: 7
  },
  {
    rowIndex: 5,
    id: '004',
    name: 'かばん',
    attribute: 'フレンドリー',
    hc: 'みんなの友達',
    specialShop: true,
    greatShop: true,
    owned: true,
    priority: null
  },
  {
    rowIndex: 6,
    id: '005',
    name: 'ラッキービースト',
    attribute: 'マイペース',
    hc: 'パークガイド',
    specialShop: false,
    greatShop: false,
    owned: false,
    priority: 8
  },
  {
    rowIndex: 7,
    id: '006',
    name: 'トキ',
    attribute: 'ラブリー',
    hc: '美しい歌声',
    specialShop: true,
    greatShop: false,
    owned: false,
    priority: 6
  },
  {
    rowIndex: 8,
    id: '007',
    name: 'アルパカ・スリ',
    attribute: 'ラブリー',
    hc: 'カフェの看板娘',
    specialShop: false,
    greatShop: true,
    owned: true,
    priority: null
  },
  {
    rowIndex: 9,
    id: '008',
    name: 'ツチノコ',
    attribute: 'マイペース',
    hc: '幻の存在',
    specialShop: false,
    greatShop: false,
    owned: false,
    priority: 10
  },
  {
    rowIndex: 10,
    id: '009',
    name: 'ヒグマ',
    attribute: 'リラックス',
    hc: '森の番人',
    specialShop: true,
    greatShop: false,
    owned: true,
    priority: null
  },
  {
    rowIndex: 11,
    id: '010',
    name: 'リカオン',
    attribute: 'アクティブ',
    hc: 'チームワーク抜群',
    specialShop: false,
    greatShop: true,
    owned: false,
    priority: 5
  }
];

// 追加のサンプルデータ（ページネーションテスト用）
for (let i = 11; i <= 50; i++) {
  const attributes = ['アクティブ', 'ラブリー', 'フレンドリー', 'リラックス', 'マイペース'];
  const names = ['テストキャラ', 'サンプル', 'ダミー', 'モック', 'デモ'];
  
  mockCharacters.push({
    rowIndex: i + 1,
    id: String(i).padStart(3, '0'),
    name: `${names[i % names.length]}${i}`,
    attribute: attributes[i % attributes.length],
    hc: `テスト用HC情報${i}`,
    specialShop: Math.random() > 0.7,
    greatShop: Math.random() > 0.7,
    owned: Math.random() > 0.8, // 20%の確率で所持済み
    priority: Math.random() > 0.6 ? Math.floor(Math.random() * 10) + 1 : null
  });
}

/**
 * 統計情報を取得
 */
function getStatistics() {
  const total = mockCharacters.length;
  const owned = mockCharacters.filter(c => c.owned).length;
  const unowned = total - owned;
  const prioritySet = mockCharacters.filter(c => !c.owned && c.priority !== null).length;
  
  // 属性別統計
  const attributes = {};
  mockCharacters.filter(c => !c.owned).forEach(c => {
    attributes[c.attribute] = (attributes[c.attribute] || 0) + 1;
  });
  
  // ショップ別統計
  const unownedChars = mockCharacters.filter(c => !c.owned);
  const shops = {
    specialOnly: unownedChars.filter(c => c.specialShop && !c.greatShop).length,
    greatOnly: unownedChars.filter(c => !c.specialShop && c.greatShop).length,
    both: unownedChars.filter(c => c.specialShop && c.greatShop).length,
    neither: unownedChars.filter(c => !c.specialShop && !c.greatShop).length
  };
  
  return {
    total,
    owned,
    unowned,
    attributes,
    priorities: {
      total: unowned,
      set: prioritySet,
      unset: unowned - prioritySet,
      byLevel: {
        high: unownedChars.filter(c => c.priority >= 8).length,
        medium: unownedChars.filter(c => c.priority >= 5 && c.priority < 8).length,
        low: unownedChars.filter(c => c.priority >= 1 && c.priority < 5).length
      }
    },
    shops
  };
}

/**
 * 未所持キャラクターをフィルタオプション付きで取得
 */
function getUnownedCharactersWithOptions(options = {}) {
  let characters = mockCharacters.filter(c => !c.owned);
  
  // 属性フィルタ
  if (options.attribute) {
    characters = characters.filter(c => c.attribute === options.attribute);
  }
  
  // ショップフィルタ
  if (options.shopType) {
    switch (options.shopType) {
      case 'special':
        characters = characters.filter(c => c.specialShop);
        break;
      case 'great':
        characters = characters.filter(c => c.greatShop);
        break;
      case 'both':
        characters = characters.filter(c => c.specialShop && c.greatShop);
        break;
      case 'either':
        characters = characters.filter(c => c.specialShop || c.greatShop);
        break;
      case 'none':
        characters = characters.filter(c => !c.specialShop && !c.greatShop);
        break;
    }
  }
  
  // 優先度フィルタ
  if (options.priorityStatus) {
    if (options.priorityStatus === 'set') {
      characters = characters.filter(c => c.priority !== null);
    } else if (options.priorityStatus === 'unset') {
      characters = characters.filter(c => c.priority === null);
    }
  }
  
  // 検索フィルタ
  if (options.search) {
    const searchTerm = options.search.toLowerCase();
    characters = characters.filter(c => c.name.toLowerCase().includes(searchTerm));
  }
  
  return characters;
}

/**
 * ページネーション付きキャラクター取得
 */
function getCharactersWithPagination(options = {}) {
  const page = parseInt(options.page) || 1;
  const pageSize = parseInt(options.pageSize) || 20;
  const sortBy = options.sortBy || 'priority';
  const sortOrder = options.sortOrder || 'desc';
  
  let characters = getUnownedCharactersWithOptions(options);
  
  // ソート
  characters.sort((a, b) => {
    let aValue, bValue;
    
    switch (sortBy) {
      case 'priority':
        aValue = a.priority === null ? 0 : a.priority;
        bValue = b.priority === null ? 0 : b.priority;
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
        aValue = a.priority === null ? 0 : a.priority;
        bValue = b.priority === null ? 0 : b.priority;
    }
    
    if (sortOrder === 'asc') {
      return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
    } else {
      return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
    }
  });
  
  // ページネーション
  const totalCount = characters.length;
  const totalPages = Math.ceil(totalCount / pageSize);
  const startIndex = (page - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, totalCount);
  const pageCharacters = characters.slice(startIndex, endIndex);
  
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
}

/**
 * キャラクター詳細取得
 */
function getCharacterDetails(characterId) {
  const character = mockCharacters.find(c => c.id === characterId);
  if (!character) {
    throw new Error('キャラクターが見つかりません');
  }
  
  // 類似キャラクター（同じ属性）
  const similarCharacters = mockCharacters
    .filter(c => c.id !== characterId && c.attribute === character.attribute && !c.owned)
    .slice(0, 3)
    .map(c => ({
      character: c,
      similarity: 3 // 簡易版
    }));
  
  return {
    character,
    similarCharacters,
    priorityHistory: [
      {
        date: new Date(),
        priority: character.priority,
        action: 'current'
      }
    ],
    recommendations: [
      {
        type: 'priority',
        message: '優先度を設定することをおすすめします',
        action: 'setPriority'
      }
    ]
  };
}

/**
 * ダッシュボードデータ取得
 */
function getDashboardData() {
  const stats = getStatistics();
  const highPriorityChars = mockCharacters
    .filter(c => !c.owned && c.priority >= 8)
    .sort((a, b) => b.priority - a.priority)
    .slice(0, 5);
  
  return {
    overview: {
      totalCharacters: stats.total,
      ownedCharacters: stats.owned,
      unownedCharacters: stats.unowned,
      prioritySetCharacters: stats.priorities.set,
      completionRate: Math.round(stats.owned / stats.total * 100)
    },
    priorities: {
      high: stats.priorities.byLevel.high,
      unset: stats.priorities.unset,
      highPriorityList: highPriorityChars
    },
    breakdown: {
      attributes: Object.keys(stats.attributes).map(attr => ({
        attribute: attr,
        count: stats.attributes[attr],
        percentage: Math.round(stats.attributes[attr] / stats.unowned * 100)
      })),
      shops: [
        { name: 'スペシャルのみ', count: stats.shops.specialOnly },
        { name: 'グレートのみ', count: stats.shops.greatOnly },
        { name: '両ショップ', count: stats.shops.both },
        { name: 'ショップ対象外', count: stats.shops.neither }
      ]
    },
    recommendations: [
      {
        type: 'action',
        title: '優先度設定を進めましょう',
        message: `${stats.priorities.unset}体のキャラクターの優先度が未設定です`,
        action: 'setPriorities'
      }
    ]
  };
}

/**
 * 優先度更新
 */
function updatePriority(rowIndex, priority) {
  const character = mockCharacters.find(c => c.rowIndex === rowIndex);
  if (!character) {
    throw new Error('キャラクターが見つかりません');
  }
  
  character.priority = priority;
  console.log(`✅ 優先度更新: ${character.name} → ${priority}`);
  
  return { success: true };
}

module.exports = {
  getStatistics,
  getUnownedCharactersWithOptions,
  getCharactersWithPagination,
  getCharacterDetails,
  getDashboardData,
  updatePriority
};