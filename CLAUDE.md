# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 🚀 Gradioアプリケーション起動手順

### 確実な起動方法
```bash
cd /Users/rn/Documents/Claude-Code/sorting-algorithms-comparison
python sorting_app.py  # または python3 sorting_app.py
```

### 起動確認ポイント
- "Running on local URL: http://127.0.0.1:7860" のような表示を確認
- ポート番号は7860または7861になることが多い
- Gradioアプリは起動後、継続的に実行される（タイムアウトは正常）
- Ctrl+C で停止可能

### エラー対処
```bash
# パッケージの再インストール
pip install -r requirements.txt
```

## 📊 プロジェクト概要

ソートアルゴリズムの性能を視覚的に比較するGradioベースのWebアプリケーション。教育目的で設計され、完全な日本語対応。

### 実装アルゴリズム
- **バブルソート**: O(n²) - 基本的な比較ソート
- **二分挿入ソート**: O(n²) - 二分探索を使った挿入ソート
- **シェルソート**: O(n^1.25)～O(n²) - ギャップベースの挿入ソート
- **Python組み込み (Timsort)**: O(n log n) - ハイブリッド安定ソート

## 🛠️ 開発コマンド

### テスト実行
```bash
# Puppeteer UIテスト（スクリーンショット付き）
npm install  # 初回のみ
node test_sorting_app.js

# Pythonクイックテスト
python test_app.py
```

### Git操作
```bash
# 変更をコミット
git add .
git commit -m "メッセージ"
git push origin main
```

## 🏗️ アーキテクチャ

### sorting_app.py の主要機能
- Gradio UIによるインタラクティブなWeb画面
- 配列サイズ: 10～1000要素のスライダー
- 配列タイプ: ランダム、ほぼソート済み、逆順、同じ値
- ステップバイステップ表示モード
- 比較回数と実行時間の二重棒グラフ
- 日本語フォント対応（japanize_matplotlib使用）

### テストインフラ
- **Puppeteerテスト**: ボタンクリック、スクリーンショット撮影、日本語レンダリング確認
- **スクリーンショット機能**: グラフ、テーブル、全体画面のキャプチャ
- **.gitignore**: *.png、node_modules/、__pycache__/を除外

## ⚠️ 重要な注意事項

- macOSでの日本語フォント処理に特別な対応済み
- Gradioのshare=Falseで外部公開を防止
- スクリーンショットファイルは.gitignoreで除外（多数生成されるため）
- GitHub リポジトリ: https://github.com/RNMUDS/sorting-algorithms-comparison