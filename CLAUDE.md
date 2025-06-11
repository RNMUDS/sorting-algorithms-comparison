# Gradioアプリケーション起動手順

## 確実な起動方法

1. **正しいディレクトリに移動**
   ```bash
   cd /Users/rn/Documents/Claude-Code/sorting-algorithms-comparison
   ```

2. **Pythonのバージョン確認**
   ```bash
   python --version  # または python3 --version
   ```

3. **起動コマンド**
   ```bash
   python sorting_app.py
   # または
   python3 sorting_app.py
   ```

## 起動確認ポイント

1. **起動メッセージの確認**
   - "Running on local URL: http://127.0.0.1:7860" のような表示を確認
   - ポート番号は7860または7861になることが多い

2. **バックグラウンド起動の場合**
   ```bash
   python sorting_app.py &
   ```
   - ただし、出力が見えなくなるため推奨しない

3. **エラーが出た場合**
   - パッケージの再インストール: `pip install -r requirements.txt`
   - ポートが使用中の場合は自動的に別のポートが選択される

## 注意事項

- Gradioアプリは起動後、継続的に実行される（タイムアウトは正常）
- Ctrl+C で停止可能
- 起動後、ブラウザで指定されたURLにアクセス