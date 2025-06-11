#!/usr/bin/env python3
import sys
import os

# sorting_app.pyが存在するか確認
if os.path.exists('sorting_app.py'):
    print("✓ sorting_app.py が見つかりました")
    
    # 必要なモジュールをチェック
    try:
        import gradio
        print("✓ Gradio がインストールされています")
    except ImportError:
        print("✗ Gradio がインストールされていません")
        
    try:
        import matplotlib
        print("✓ Matplotlib がインストールされています")
    except ImportError:
        print("✗ Matplotlib がインストールされていません")
        
    try:
        import pandas
        print("✓ Pandas がインストールされています")
    except ImportError:
        print("✗ Pandas がインストールされていません")
        
    try:
        import numpy
        print("✓ NumPy がインストールされています")
    except ImportError:
        print("✗ NumPy がインストールされていません")
    
    # アプリケーションを起動
    print("\n>>> sorting_app.py を起動しています...")
    print(">>> ブラウザで http://127.0.0.1:7860 を開いてください")
    
    # sorting_app.pyを実行
    exec(open('sorting_app.py').read())
else:
    print("✗ sorting_app.py が見つかりません")