/**
 * ローカル開発環境用JavaScript
 * Google Apps Scriptの機能をローカルAPIで置き換え
 */

// ローカル開発環境の場合、google.script.runを模擬
if (window.IS_LOCAL_DEV) {
  console.log('🔧 ローカル開発モードで動作中');

  // Google Apps Script APIの模擬
  window.google = {
    script: {
      run: {
        withSuccessHandler: function (successCallback) {
          return {
            withFailureHandler: function (failureCallback) {
              return createMockAPI(successCallback, failureCallback);
            }
          };
        }
      }
    }
  };

  function createMockAPI(successCallback, failureCallback) {
    return {
      // 統計情報取得
      getStatistics: function () {
        fetchAPI('/api/statistics')
          .then(successCallback)
          .catch(failureCallback);
      },

      // キャラクター取得
      getUnownedCharactersWithOptions: function (options) {
        const params = new URLSearchParams(options);
        fetchAPI(`/api/characters?${params}`)
          .then(successCallback)
          .catch(failureCallback);
      },

      // ページネーション付きキャラクター取得
      getCharactersWithPagination: function (options) {
        const params = new URLSearchParams(options);
        fetchAPI(`/api/characters/paginated?${params}`)
          .then(successCallback)
          .catch(failureCallback);
      },

      // キャラクター詳細取得
      getCharacterDetails: function (characterId) {
        fetchAPI(`/api/characters/${characterId}/details`)
          .then(successCallback)
          .catch(failureCallback);
      },

      // ダッシュボードデータ取得
      getDashboardData: function () {
        fetchAPI('/api/dashboard')
          .then(successCallback)
          .catch(failureCallback);
      },

      // 優先度更新
      updatePriority: function (rowIndex, priority) {
        fetchAPI(`/api/characters/${rowIndex}/priority`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ priority })
        })
          .then(successCallback)
          .catch(failureCallback);
      }
    };
  }

  // API呼び出しヘルパー
  async function fetchAPI(url, options = {}) {
    try {
      const response = await fetch(window.API_BASE_URL + url, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('❌ API呼び出しエラー:', error);
      throw error;
    }
  }

  // 開発用ユーティリティ
  window.devUtils = {
    // モックデータリロード
    reloadMockData: async function () {
      try {
        const result = await fetchAPI('/api/dev/reload-mock');
        console.log('✅ モックデータリロード:', result.message);
        return result;
      } catch (error) {
        console.error('❌ モックデータリロードエラー:', error);
      }
    },

    // サーバー状態確認
    checkServerStatus: async function () {
      try {
        const status = await fetchAPI('/api/dev/status');
        console.log('📊 サーバー状態:', status);
        return status;
      } catch (error) {
        console.error('❌ サーバー状態確認エラー:', error);
      }
    },

    // ローカル開発情報表示
    showDevInfo: function () {
      console.log('🔧 ローカル開発環境情報:');
      console.log('  API Base URL:', window.API_BASE_URL);
      console.log('  開発モード:', window.IS_LOCAL_DEV);
      console.log('');
      console.log('利用可能な開発用コマンド:');
      console.log('  devUtils.reloadMockData() - モックデータリロード');
      console.log('  devUtils.checkServerStatus() - サーバー状態確認');
      console.log('  devUtils.showDevInfo() - この情報を表示');
    }
  };

  // 開発環境表示
  console.log('🎯 開発用コマンド: devUtils.showDevInfo()');

  // ホットリロード機能（簡易版）
  if (window.location.hostname === 'localhost') {
    let lastModified = Date.now();

    setInterval(async () => {
      try {
        const status = await fetchAPI('/api/dev/status');
        // 実際のホットリロードは別途WebSocketなどで実装
      } catch (error) {
        // サーバーが停止している場合は何もしない
      }
    }, 5000);
  }
}