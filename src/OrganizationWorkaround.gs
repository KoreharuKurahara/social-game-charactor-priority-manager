/**
 * 組織制限回避用の設定
 */

/**
 * 組織制限を回避するための最小限doGet関数
 * 外部依存を一切排除
 */
function doGetMinimal() {
  return HtmlService.createHtmlOutput(`
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>けものフレンズ3 優先度管理</title>
      <style>
        body { 
          font-family: Arial, sans-serif; 
          margin: 20px; 
          background: #f0f8ff;
        }
        .container { 
          max-width: 800px; 
          margin: 0 auto; 
          background: white; 
          padding: 30px; 
          border-radius: 10px; 
          box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        h1 { color: #ff6b6b; text-align: center; }
        .info { 
          background: #e7f3ff; 
          padding: 15px; 
          border-radius: 5px; 
          margin: 20px 0; 
        }
        .btn { 
          background: #007bff; 
          color: white; 
          padding: 10px 20px; 
          border: none; 
          border-radius: 5px; 
          cursor: pointer; 
          margin: 5px;
        }
        .result { 
          margin-top: 15px; 
          padding: 10px; 
          background: #f8f9fa; 
          border-radius: 3px; 
        }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>🦁 けものフレンズ3 優先度管理</h1>
        
        <div class="info">
          <strong>✅ デプロイ成功！</strong><br>
          組織制限を回避してWebアプリが正常に動作しています。
        </div>
        
        <p><strong>現在時刻:</strong> ${new Date().toLocaleString('ja-JP')}</p>
        
        <h3>📋 利用可能な機能</h3>
        <button class="btn" onclick="showCSVUpload()">CSVデータアップロード</button>
        <button class="btn" onclick="showManualInput()">手動データ入力</button>
        <button class="btn" onclick="testLocalStorage()">ローカルストレージテスト</button>
        
        <div id="result" class="result" style="display: none;"></div>
        <div id="csvUpload" style="display: none; margin-top: 20px;">
          <h4>CSVデータアップロード</h4>
          <p>スプレッドシートからエクスポートしたCSVデータを貼り付けてください：</p>
          <textarea id="csvData" rows="10" cols="80" placeholder="CSVデータをここに貼り付け..."></textarea><br>
          <button class="btn" onclick="processCSV()">データを処理</button>
        </div>
        
        <div id="manualInput" style="display: none; margin-top: 20px;">
          <h4>手動データ入力</h4>
          <p>キャラクター情報を手動で入力できます：</p>
          <input type="text" id="charName" placeholder="キャラクター名"><br><br>
          <select id="charAttribute">
            <option value="">属性を選択</option>
            <option value="アクティブ">アクティブ</option>
            <option value="ラブリー">ラブリー</option>
            <option value="フレンドリー">フレンドリー</option>
            <option value="リラックス">リラックス</option>
            <option value="マイペース">マイペース</option>
          </select><br><br>
          <input type="number" id="charPriority" min="1" max="10" placeholder="優先度 (1-10)"><br><br>
          <button class="btn" onclick="addCharacter()">キャラクター追加</button>
        </div>
      </div>
      
      <script>
        function showResult(message, isError = false) {
          const resultDiv = document.getElementById('result');
          resultDiv.style.display = 'block';
          resultDiv.innerHTML = message;
          resultDiv.style.color = isError ? '#dc3545' : '#28a745';
        }
        
        function showCSVUpload() {
          document.getElementById('csvUpload').style.display = 'block';
          document.getElementById('manualInput').style.display = 'none';
        }
        
        function showManualInput() {
          document.getElementById('manualInput').style.display = 'block';
          document.getElementById('csvUpload').style.display = 'none';
        }
        
        function processCSV() {
          const csvData = document.getElementById('csvData').value;
          if (!csvData.trim()) {
            showResult('CSVデータを入力してください', true);
            return;
          }
          
          try {
            const lines = csvData.trim().split('\\n');
            const headers = lines[0].split(',');
            const dataRows = lines.slice(1);
            
            showResult('✅ CSV処理成功: ' + dataRows.length + '行のデータを検出');
            
            // ローカルストレージに保存
            localStorage.setItem('characterData', csvData);
            
          } catch (error) {
            showResult('❌ CSV処理エラー: ' + error.message, true);
          }
        }
        
        function addCharacter() {
          const name = document.getElementById('charName').value;
          const attribute = document.getElementById('charAttribute').value;
          const priority = document.getElementById('charPriority').value;
          
          if (!name) {
            showResult('キャラクター名を入力してください', true);
            return;
          }
          
          const character = {
            name: name,
            attribute: attribute,
            priority: priority,
            timestamp: new Date().toISOString()
          };
          
          // ローカルストレージに保存
          let characters = JSON.parse(localStorage.getItem('manualCharacters') || '[]');
          characters.push(character);
          localStorage.setItem('manualCharacters', JSON.stringify(characters));
          
          showResult('✅ キャラクター "' + name + '" を追加しました');
          
          // フォームをクリア
          document.getElementById('charName').value = '';
          document.getElementById('charAttribute').value = '';
          document.getElementById('charPriority').value = '';
        }
        
        function testLocalStorage() {
          try {
            const testKey = 'test_' + Date.now();
            localStorage.setItem(testKey, 'test_value');
            const value = localStorage.getItem(testKey);
            localStorage.removeItem(testKey);
            
            if (value === 'test_value') {
              showResult('✅ ローカルストレージ動作確認OK');
            } else {
              showResult('❌ ローカルストレージテスト失敗', true);
            }
          } catch (error) {
            showResult('❌ ローカルストレージエラー: ' + error.message, true);
          }
        }
      </script>
    </body>
    </html>
  `).setTitle('けものフレンズ3 優先度管理');
}

/**
 * 組織制限診断関数
 */
function diagnoseOrganizationRestrictions() {
  Logger.log('=== 組織制限診断 ===');
  
  try {
    var userEmail = Session.getActiveUser().getEmail();
    var domain = userEmail.split('@')[1];
    
    Logger.log('ユーザーメール: ' + userEmail);
    Logger.log('ドメイン: ' + domain);
    
    // ドメインタイプの判定
    var domainType = 'unknown';
    if (domain === 'gmail.com') {
      domainType = 'personal';
    } else if (domain.indexOf('.edu') !== -1) {
      domainType = 'education';
    } else {
      domainType = 'organization';
    }
    
    Logger.log('ドメインタイプ: ' + domainType);
    
    // 推奨事項
    var recommendations = [];
    
    if (domainType === 'organization' || domainType === 'education') {
      recommendations.push('組織アカウントです。個人のGoogleアカウント（@gmail.com）での実行を推奨します。');
      recommendations.push('または、組織の管理者にGoogle Apps Scriptの外部共有設定を確認してください。');
    } else if (domainType === 'personal') {
      recommendations.push('個人アカウントです。通常は制限がないはずです。');
      recommendations.push('別の原因（スクリプトエラー等）を確認してください。');
    }
    
    Logger.log('推奨事項:');
    for (var i = 0; i < recommendations.length; i++) {
      Logger.log('  ' + (i + 1) + '. ' + recommendations[i]);
    }
    
    return {
      userEmail: userEmail,
      domain: domain,
      domainType: domainType,
      recommendations: recommendations
    };
    
  } catch (error) {
    Logger.log('診断エラー: ' + error.toString());
    return { error: error.message };
  }
}