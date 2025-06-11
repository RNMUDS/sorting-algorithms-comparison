import gradio as gr
import time
import random
import matplotlib
matplotlib.use('Agg')  # バックエンドを先に設定
import matplotlib.pyplot as plt
import matplotlib.font_manager as fm
import numpy as np
from typing import List, Tuple, Dict
import pandas as pd

# japanize_matplotlibをインポートして自動設定
try:
    import japanize_matplotlib
except ImportError:
    # japanize_matplotlibがない場合は手動設定
    # 日本語フォントの設定
    plt.rcParams['font.sans-serif'] = ['Hiragino Sans', 'Hiragino Maru Gothic Pro', 'Yu Gothic', 'Meirio', 'Takao', 'IPAexGothic', 'IPAPGothic', 'VL PGothic', 'Noto Sans CJK JP']
    plt.rcParams['axes.unicode_minus'] = False

# macOS用の日本語フォント設定
import platform
if platform.system() == 'Darwin':  # macOS
    plt.rcParams['font.sans-serif'] = ['Hiragino Sans', 'Hiragino Maru Gothic Pro', 'Yu Gothic', 'Meirio', 'Takao', 'IPAexGothic', 'IPAPGothic', 'VL PGothic', 'Noto Sans CJK JP']
else:  # その他のOS
    plt.rcParams['font.sans-serif'] = ['IPAexGothic', 'IPAPGothic', 'VL PGothic', 'Noto Sans CJK JP', 'DejaVu Sans']

plt.rcParams['axes.unicode_minus'] = False  # マイナス記号の文字化け対策

# ソートアルゴリズムの実装

def bubble_sort(arr: List[int]) -> Tuple[List[int], int, float, List[Dict]]:
    """バブルソート
    隣接する要素を比較し、大小関係が逆なら交換する
    """
    n = len(arr)
    arr_copy = arr.copy()
    comparisons = 0
    steps = []
    
    start_time = time.time()
    
    for i in range(n):
        swapped = False
        step_info = {
            'pass': i + 1,
            'array_state': arr_copy.copy(),
            'description': f'パス {i + 1}: 最大値を右端に移動'
        }
        
        for j in range(0, n - i - 1):
            comparisons += 1
            if arr_copy[j] > arr_copy[j + 1]:
                arr_copy[j], arr_copy[j + 1] = arr_copy[j + 1], arr_copy[j]
                swapped = True
        
        step_info['array_after'] = arr_copy.copy()
        steps.append(step_info)
        
        if not swapped:
            break
    
    end_time = time.time()
    execution_time = (end_time - start_time) * 1000  # ミリ秒に変換
    
    return arr_copy, comparisons, execution_time, steps

def binary_insertion_sort(arr: List[int]) -> Tuple[List[int], int, float, List[Dict]]:
    """二分挿入ソート
    挿入位置を二分探索で効率的に見つける
    """
    arr_copy = arr.copy()
    comparisons = 0
    steps = []
    
    start_time = time.time()
    
    for i in range(1, len(arr_copy)):
        key = arr_copy[i]
        left, right = 0, i
        
        # 二分探索で挿入位置を見つける
        while left < right:
            comparisons += 1
            mid = (left + right) // 2
            if arr_copy[mid] > key:
                right = mid
            else:
                left = mid + 1
        
        # 要素をシフトして挿入
        for j in range(i - 1, left - 1, -1):
            arr_copy[j + 1] = arr_copy[j]
        arr_copy[left] = key
        
        steps.append({
            'iteration': i,
            'inserted_value': key,
            'position': left,
            'array_state': arr_copy.copy(),
            'description': f'値 {key} を位置 {left} に挿入'
        })
    
    end_time = time.time()
    execution_time = (end_time - start_time) * 1000
    
    return arr_copy, comparisons, execution_time, steps

def shell_sort(arr: List[int]) -> Tuple[List[int], int, float, List[Dict]]:
    """シェルソート
    要素を一定間隔で分割してソートし、徐々に間隔を狭める
    """
    arr_copy = arr.copy()
    n = len(arr_copy)
    comparisons = 0
    steps = []
    
    start_time = time.time()
    
    # 初期ギャップを設定
    gap = n // 2
    
    while gap > 0:
        step_info = {
            'gap': gap,
            'description': f'ギャップ {gap} でソート',
            'sub_arrays': []
        }
        
        for i in range(gap, n):
            temp = arr_copy[i]
            j = i
            comparisons += 1
            
            while j >= gap and arr_copy[j - gap] > temp:
                comparisons += 1
                arr_copy[j] = arr_copy[j - gap]
                j -= gap
            
            arr_copy[j] = temp
        
        step_info['array_state'] = arr_copy.copy()
        steps.append(step_info)
        gap //= 2
    
    end_time = time.time()
    execution_time = (end_time - start_time) * 1000
    
    return arr_copy, comparisons, execution_time, steps

def python_builtin_sort(arr: List[int]) -> Tuple[List[int], int, float, List[Dict]]:
    """Python組み込みソート（Timsort）"""
    arr_copy = arr.copy()
    
    start_time = time.time()
    arr_copy.sort()
    end_time = time.time()
    
    execution_time = (end_time - start_time) * 1000
    
    steps = [{
        'description': 'Python組み込みのTimsortアルゴリズムを使用',
        'array_state': arr_copy.copy()
    }]
    
    return arr_copy, -1, execution_time, steps  # 比較回数は計測不可

# 可視化関数

def visualize_sorting_performance(results: Dict) -> plt.Figure:
    """ソートアルゴリズムの性能を可視化"""
    fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(12, 5))
    
    algorithms = list(results.keys())
    comparisons = [results[alg]['comparisons'] if results[alg]['comparisons'] != -1 else 0 for alg in algorithms]
    times = [results[alg]['time'] for alg in algorithms]
    
    # 比較回数のグラフ
    bars1 = ax1.bar(algorithms, comparisons, color=['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4'])
    ax1.set_ylabel('比較回数')
    ax1.set_title('アルゴリズム別比較回数')
    ax1.set_ylim(0, max(comparisons) * 1.2 if comparisons else 1)
    
    # 実行時間のグラフ
    bars2 = ax2.bar(algorithms, times, color=['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4'])
    ax2.set_ylabel('実行時間 (ミリ秒)')
    ax2.set_title('アルゴリズム別実行時間')
    ax2.set_ylim(0, max(times) * 1.2 if times else 1)
    
    # 値をバーの上に表示
    for bars, values in [(bars1, comparisons), (bars2, times)]:
        for bar, value in zip(bars, values):
            if value > 0:
                height = bar.get_height()
                ax = bar.axes
                ax.text(bar.get_x() + bar.get_width()/2., height,
                       f'{value:.2f}' if isinstance(value, float) else str(value),
                       ha='center', va='bottom')
    
    plt.tight_layout()
    return fig

def generate_array(size: int, array_type: str) -> List[int]:
    """指定されたタイプの配列を生成"""
    if array_type == "ランダム":
        return [random.randint(1, 100) for _ in range(size)]
    elif array_type == "ほぼソート済み":
        arr = list(range(1, size + 1))
        # 少しだけ要素を入れ替える
        for _ in range(size // 10):
            i, j = random.randint(0, size-1), random.randint(0, size-1)
            arr[i], arr[j] = arr[j], arr[i]
        return arr
    elif array_type == "逆順":
        return list(range(size, 0, -1))
    else:  # 同じ値
        return [50] * size

def sort_and_compare(array_size: int, array_type: str, show_steps: bool):
    """全てのソートアルゴリズムを実行して比較"""
    # 配列を生成
    original_array = generate_array(array_size, array_type)
    
    # 各アルゴリズムを実行
    algorithms = {
        'バブルソート': bubble_sort,
        '二分挿入ソート': binary_insertion_sort,
        'シェルソート': shell_sort,
        'Python組み込み': python_builtin_sort
    }
    
    results = {}
    steps_text = []
    
    for name, func in algorithms.items():
        sorted_arr, comparisons, exec_time, steps = func(original_array.copy())
        results[name] = {
            'sorted_array': sorted_arr,
            'comparisons': comparisons,
            'time': exec_time,
            'steps': steps
        }
        
        # ステップの詳細を表示
        if show_steps and name != 'Python組み込み':
            steps_text.append(f"\n【{name}のステップ】")
            for i, step in enumerate(steps[:5]):  # 最初の5ステップのみ表示
                steps_text.append(f"ステップ {i+1}: {step['description']}")
                if i == 4 and len(steps) > 5:
                    steps_text.append(f"... (残り {len(steps) - 5} ステップ)")
    
    # 結果の表を作成
    df_data = []
    for name, result in results.items():
        df_data.append({
            'アルゴリズム': name,
            '比較回数': result['comparisons'] if result['comparisons'] != -1 else 'N/A',
            '実行時間 (ms)': f"{result['time']:.4f}",
            '最速比': f"{result['time'] / min(r['time'] for r in results.values()):.2f}x"
        })
    
    df = pd.DataFrame(df_data)
    
    # グラフを作成
    fig = visualize_sorting_performance(results)
    
    # 元の配列とソート後の配列を表示
    array_info = f"元の配列 (最初の20要素): {original_array[:20]}{'...' if len(original_array) > 20 else ''}\n"
    array_info += f"ソート後 (最初の20要素): {results['バブルソート']['sorted_array'][:20]}{'...' if len(original_array) > 20 else ''}"
    
    steps_display = '\n'.join(steps_text) if show_steps else "ステップ表示はオフです"
    
    return df, fig, array_info, steps_display

# Gradioインターフェース
def create_interface():
    with gr.Blocks(title="ソートアルゴリズム比較ツール") as demo:
        gr.Markdown("""
        # 🔄 ソートアルゴリズム比較ツール
        
        様々なソートアルゴリズムの性能を比較し、動作を理解しましょう！
        
        ## 📚 含まれるアルゴリズム
        - **バブルソート**: 隣接要素を比較・交換する基本的なアルゴリズム
        - **二分挿入ソート**: 挿入位置を二分探索で効率化したアルゴリズム
        - **シェルソート**: 間隔を変えながら部分的にソートする高速アルゴリズム
        - **Python組み込み (Timsort)**: 実用的な高性能ハイブリッドアルゴリズム
        """)
        
        with gr.Row():
            with gr.Column(scale=1):
                array_size = gr.Slider(
                    minimum=10,
                    maximum=1000,
                    value=100,
                    step=10,
                    label="配列サイズ",
                    info="ソートする要素数"
                )
                
                array_type = gr.Radio(
                    choices=["ランダム", "ほぼソート済み", "逆順", "同じ値"],
                    value="ランダム",
                    label="配列の種類",
                    info="初期配列の状態"
                )
                
                show_steps = gr.Checkbox(
                    label="詳細ステップを表示",
                    value=True,
                    info="各アルゴリズムの動作過程を表示"
                )
                
                sort_button = gr.Button("ソート実行", variant="primary")
        
        with gr.Row():
            with gr.Column(scale=1):
                results_table = gr.Dataframe(
                    label="性能比較結果",
                    headers=["アルゴリズム", "比較回数", "実行時間 (ms)", "最速比"]
                )
                
                array_display = gr.Textbox(
                    label="配列の状態",
                    lines=3,
                    max_lines=5
                )
        
        with gr.Row():
            performance_chart = gr.Plot(label="性能比較グラフ")
        
        with gr.Row():
            steps_display = gr.Textbox(
                label="アルゴリズムのステップ詳細",
                lines=10,
                max_lines=20
            )
        
        # 説明セクション
        gr.Markdown("""
        ## 💡 アルゴリズムの特徴
        
        ### バブルソート
        - **時間計算量**: O(n²)
        - **特徴**: シンプルだが効率は悪い。教育目的に最適
        
        ### 二分挿入ソート
        - **時間計算量**: O(n²) ※比較回数はO(n log n)
        - **特徴**: 挿入ソートを二分探索で改良。小規模データに有効
        
        ### シェルソート
        - **時間計算量**: O(n^1.25) ～ O(n²)
        - **特徴**: 挿入ソートの改良版。中規模データに効果的
        
        ### Python組み込み (Timsort)
        - **時間計算量**: O(n log n)
        - **特徴**: 実用的な最速アルゴリズム。様々な最適化を含む
        """)
        
        sort_button.click(
            fn=sort_and_compare,
            inputs=[array_size, array_type, show_steps],
            outputs=[results_table, performance_chart, array_display, steps_display]
        )
    
    return demo

if __name__ == "__main__":
    demo = create_interface()
    demo.launch(share=False)