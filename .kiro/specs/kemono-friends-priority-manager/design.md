# 設計書

## 概要

けものフレンズ3キャラクター優先度管理アプリは、Google Apps ScriptとHTML Serviceを使用したWebアプリケーションです。既存のGoogleスプレッドシートをデータソースとし、二分探索アルゴリズムによる効率的な優先度決定機能を提供します。

## アーキテクチャ

### システム構成

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   フロントエンド   │◄──►│  Google Apps     │◄──►│ Google          │
│   (HTML Service) │    │  Script          │    │ Spreadsheet     │
│                 │    │  (サーバーサイド)   │    │                 │
└─────────────────┘    └──────────────────┘    └─────────────────┘
```

### 技術スタック

- **バックエンド**: Google Apps Script (JavaScript ES5準拠)
- **フロントエンド**: HTML5 + CSS3 + Vanilla JavaScript
- **データストレージ**: Google Spreadsheet
- **デプロイ**: Google Apps Script Web App
- **認証**: Google OAuth (自動処理)

## コンポーネントと インターフェース

### 1. データアクセス層 (SpreadsheetService)

**責務**: スプレッドシートとの全ての読み書き操作を管理

```javascript
class SpreadsheetService {
  // キャラクターデータの取得
  getAllCharacters()
  getUnownedCharacters()
  
  // 優先度の更新
  updatePriority(characterId, priority)
  
  // 所持ステータスの更新
  updateOwnershipStatus(characterId, isOwned)
  
  // データ検証
  validateSpreadsheetStructure()
}
```

**主要メソッド**:
- `getAllCharacters()`: 全キャラクターデータを配列で返却
- `getUnownedCharacters()`: 所持=FALSEのキャラクターのみ抽出
- `updatePriority(rowIndex, priority)`: 指定行の優先度を更新
- `updateOwnershipStatus(rowIndex, isOwned)`: 指定行の所持ステータスを更新
- `validateSpreadsheetStructure()`: 必要な列の存在確認

### 2. 優先度管理層 (PriorityService)

**責務**: 二分探索アルゴリズムと優先度計算ロジック

```javascript
class PriorityService {
  // 二分探索による優先度決定
  startBinarySearch(targetCharacter, existingCharacters)
  processComparison(isTargetPreferred)
  finalizePriority()
  
  // 優先度計算
  calculateOptimalPriority(insertPosition, existingPriorities)
}
```

**二分探索アルゴリズム**:
1. 優先度設定済みキャラクターを優先度順でソート
2. 中央値のキャラクターと比較
3. 結果に基づいて探索範囲を半分に絞り込み
4. 範囲が1つに絞り込まれるまで繰り返し
5. 最終位置に基づいて適切な優先度を計算

### 3. UI管理層 (UIController)

**責務**: ユーザーインターフェースの状態管理と イベント処理

```javascript
class UIController {
  // 画面表示制御
  renderCharacterList(characters)
  renderComparisonView(char1, char2)
  renderFilterControls()
  renderOwnershipToggle()
  
  // イベント処理
  handlePriorityChange(characterId, newPriority)
  handleOwnershipChange(characterId, isOwned)
  handleFilterChange(filterType, filterValue)
  handleSortChange(sortType)
  handleShowOwnedToggle(showOwned)
}
```

### 4. フィルタ・ソート層 (FilterService)

**責務**: データの絞り込みと並び替え処理

```javascript
class FilterService {
  // フィルタリング
  filterByAttribute(characters, attribute)
  filterByShop(characters, shopType)
  
  // ソート
  sortByPriority(characters, order)
  sortByAttribute(characters, attribute)
}
```

## 所持ステータス管理機能の詳細設計

### UI コンポーネント設計

#### 1. キャラクター詳細モーダル

```html
<div class="character-modal" id="characterModal">
  <div class="modal-content">
    <div class="modal-header">
      <h2 class="character-name">サーバル</h2>
      <button class="close-btn" onclick="closeModal()">&times;</button>
    </div>
    <div class="modal-body">
      <div class="character-info">
        <p><strong>通し番号:</strong> 001</p>
        <p><strong>属性:</strong> フレンドリー</p>
        <p><strong>HC:</strong> 5000</p>
      </div>
      <div class="ownership-controls">
        <h3>所持ステータス</h3>
        <div class="ownership-buttons">
          <button class="ownership-btn owned active" onclick="setOwnership(123, true)">
            <i class="icon-check"></i> 所持済み
          </button>
          <button class="ownership-btn unowned" onclick="setOwnership(123, false)">
            <i class="icon-x"></i> 未所持
          </button>
        </div>
      </div>
    </div>
  </div>
</div>
```

#### 2. キャラクター一覧での所持ステータス表示

```html
<div class="character-card owned" onclick="openCharacterModal(123)">
  <div class="ownership-indicator">
    <i class="icon-check"></i>
  </div>
  <div class="character-info">
    <h3>サーバル</h3>
    <p>001 - フレンドリー</p>
  </div>
</div>
```

#### 2. 表示切り替えコントロール

```html
<div class="display-controls">
  <label class="toggle-switch">
    <input type="checkbox" id="showOwnedToggle" onchange="handleShowOwnedToggle()">
    <span class="slider"></span>
    所持済みを含む
  </label>
</div>
```

### データフロー

```
キャラクターカードクリック → モーダル表示 → 所持ステータス変更
                                    ↓
                              UIController → SpreadsheetService → Google Spreadsheet
                                    ↓              ↓              ↓
                              モーダル閉じる ← 状態管理 ← レスポンス処理 ← データ更新完了
                                    ↓
                              一覧画面更新
```

### 状態管理

```javascript
class CharacterModalManager {
  constructor() {
    this.currentCharacter = null;
    this.isUpdating = false;
  }
  
  openModal(character) {
    this.currentCharacter = character;
    this.renderModal(character);
    this.showModal();
  }
  
  setOwnership(characterId, isOwned) {
    if (this.isUpdating) return;
    
    this.isUpdating = true;
    this.showLoadingState();
    
    // バックエンド更新
    this.updateSpreadsheet(characterId, isOwned)
      .then(() => {
        this.closeModal();
        this.refreshCharacterList();
      })
      .catch(error => {
        this.showError(`更新に失敗しました: ${error.message}`);
      })
      .finally(() => {
        this.isUpdating = false;
        this.hideLoadingState();
      });
  }
  
  closeModal() {
    this.currentCharacter = null;
    this.hideModal();
  }
}
```

## データモデル

### キャラクターオブジェクト

```javascript
{
  rowIndex: number,           // スプレッドシート行番号
  id: string,                // 通し番号
  name: string,              // フレンズ名
  attribute: string,         // 属性
  hc: string,                // HC情報
  specialShop: boolean,      // 6周年直前スペシャルショップ
  greatShop: boolean,        // 6周年記念グレートショップ
  owned: boolean,            // 所持状況
  priority: number | null    // 優先度 (1-10)
}
```

### 二分探索状態オブジェクト

```javascript
{
  targetCharacter: Character,
  sortedCharacters: Character[],
  currentLeft: number,
  currentRight: number,
  currentComparison: Character,
  comparisonHistory: ComparisonResult[]
}
```

## エラーハンドリング

### エラー分類と対応

1. **スプレッドシートアクセスエラー**
   - 権限不足: ユーザーに権限確認を促す
   - シート構造不正: 必要な列の追加を案内
   - 一時的な接続エラー: 自動リトライ機能

2. **データ整合性エラー**
   - 無効な優先度値: 入力値検証とエラーメッセージ表示
   - 重複する優先度: 自動調整または手動解決オプション

3. **UI操作エラー**
   - 無効な操作: 操作ガイダンスの表示
   - セッションタイムアウト: 自動再認証

### エラー処理フロー

```javascript
try {
  // メイン処理
} catch (error) {
  Logger.log('Error: ' + error.toString());
  
  if (error.name === 'SpreadsheetError') {
    showUserFriendlyError('スプレッドシートへのアクセスに失敗しました');
  } else if (error.name === 'ValidationError') {
    showValidationError(error.message);
  } else {
    showGenericError('予期しないエラーが発生しました');
  }
}
```

## テスト戦略

### 1. 単体テスト

**SpreadsheetService**:
- データ取得の正確性
- 更新処理の整合性
- エラー処理の適切性

**PriorityService**:
- 二分探索アルゴリズムの正確性
- 優先度計算の妥当性
- エッジケースの処理

### 2. 統合テスト

- スプレッドシート連携の動作確認
- UI操作からデータ更新までの一連の流れ
- 複数ユーザーでの同時アクセステスト

### 3. ユーザビリティテスト

- 二分探索による優先度決定の使いやすさ
- モバイルデバイスでの操作性
- レスポンス時間の測定

## セキュリティ考慮事項

### 1. データアクセス制御

- Google OAuth による認証
- スプレッドシートの共有設定に依存
- 個人データの適切な取り扱い

### 2. 入力値検証

```javascript
function validatePriority(priority) {
  if (typeof priority !== 'number' || priority < 1 || priority > 10) {
    throw new ValidationError('優先度は1-10の数値で入力してください');
  }
}
```

### 3. XSS対策

- HTML出力時のエスケープ処理
- ユーザー入力の サニタイゼーション

## パフォーマンス最適化

### 1. データ取得の最適化

- 必要な範囲のみの読み込み
- キャッシュ機能の実装
- バッチ処理による更新

### 2. UI応答性の向上

- 非同期処理の活用
- プログレスインジケーターの表示
- 遅延読み込み (Lazy Loading)

### 3. Google Apps Script制限への対応

- 実行時間制限 (6分) を考慮した処理分割
- 1日の実行回数制限への対応
- メモリ使用量の最適化

## ローカル開発環境

### 開発環境アーキテクチャ

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   ローカル開発    │    │  Google Apps     │    │ Google          │
│   サーバー       │◄──►│  Script          │◄──►│ Spreadsheet     │
│   (Node.js)     │    │  (本番環境)       │    │                 │
└─────────────────┘    └──────────────────┘    └─────────────────┘
```

### 技術スタック

- **開発サーバー**: Node.js + Express
- **ビルドツール**: Webpack / Vite
- **ホットリロード**: 自動ブラウザ更新
- **モックAPI**: ローカルでのAPI模擬
- **デプロイツール**: clasp (Google Apps Script CLI)

### 開発ワークフロー

1. **ローカル開発**: Node.js環境でUI開発
2. **モックテスト**: 仮データでの機能確認
3. **統合テスト**: Google Apps Scriptとの連携確認
4. **自動デプロイ**: claspによる本番環境更新

## デプロイメント戦略

### 1. ローカル開発環境

- Node.js + Express サーバー
- ホットリロード機能
- モックデータでの開発
- clasp による自動デプロイ

### 2. ステージング環境

- Google Apps Script テスト環境
- テスト用スプレッドシート
- 機能テスト・E2Eテスト

### 3. 本番環境

- Web アプリとしてデプロイ
- 本番スプレッドシート連携
- パフォーマンス監視

### 4. 更新手順

1. **ローカル開発**: 機能実装・テスト
2. **ステージング**: 統合テスト
3. **本番デプロイ**: 段階的リリース
4. **監視・ロールバック**: 問題対応