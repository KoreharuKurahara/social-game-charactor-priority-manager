/**
 * デプロイテスト用関数
 */

/**
 * テスト用のdoGet関数
 * 元のdoGet関数に問題がある場合の代替
 */
function doGetTest() {
  try {
    return HtmlService.createHtmlOutputFromFile('test-index')
      .setTitle('けものフレンズ3 優先度管理 - テスト')
      .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
  } catch (error) {
    Logger.log('doGetTest エラー: ' + error.toString());
    
    // 最小限のHTMLを返す
    var html = HtmlService.createHtmlOutput(`
      <html>
        <body>
          <h1>エラーが発生しました</h1>
          <p>エラー: ${error.message}</p>
          <p>Google Apps Scriptのログを確認してください。</p>
        </body>
      </html>
    `);
    
    return html.setTitle('エラー - けものフレンズ3 優先度管理');
  }
}

/**
 * 基本接続テスト
 */
function testBasicConnection() {
  return {
    success: true,
    message: 'Google Apps Script接続成功',
    timestamp: new Date()
  };
}

/**
 * 元のdoGet関数を一時的に置き換える場合
 * Code.gsのdoGet関数をコメントアウトして、この関数名をdoGetに変更
 */
function doGetSimple() {
  return HtmlService.createHtmlOutput(`
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>けものフレンズ3 優先度管理</title>
      <style>
        body { 
          font-family: Arial, sans-serif; 
          margin: 40px; 
          text-align: center;
          background: #f5f5f5;
        }
        .container {
          max-width: 600px;
          margin: 0 auto;
          background: white;
          padding: 30px;
          border-radius: 10px;
          box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        .btn {
          background: #007bff;
          color: white;
          padding: 10px 20px;
          border: none;
          border-radius: 5px;
          cursor: pointer;
          margin: 10px;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>🦁 けものフレンズ3 優先度管理</h1>
        <p>Webアプリが正常にデプロイされました！</p>
        <button class="btn" onclick="testAPI()">API テスト</button>
        <div id="result" style="margin-top: 20px;"></div>
      </div>
      
      <script>
        function testAPI() {
          document.getElementById('result').innerHTML = '⏳ テスト中...';
          
          google.script.run
            .withSuccessHandler(function(result) {
              document.getElementById('result').innerHTML = 
                '<span style="color: green;">✅ API接続成功！</span>';
            })
            .withFailureHandler(function(error) {
              document.getElementById('result').innerHTML = 
                '<span style="color: red;">❌ エラー: ' + error.message + '</span>';
            })
            .testBasicConnection();
        }
      </script>
    </body>
    </html>
  `).setTitle('けものフレンズ3 優先度管理');
}