import subprocess
import threading
import time

output_lines = []

def run_app():
    proc = subprocess.Popen(['python3', 'sorting_app.py'], 
                           stdout=subprocess.PIPE, 
                           stderr=subprocess.STDOUT,
                           text=True)
    
    for line in proc.stdout:
        output_lines.append(line.strip())
        print(line.strip())
        if "Running on" in line:
            break
    
    proc.terminate()

# スレッドで実行
thread = threading.Thread(target=run_app)
thread.start()

# 最大15秒待つ
thread.join(timeout=15)

# 出力を確認
if output_lines:
    print("\n=== アプリケーション出力 ===")
    for line in output_lines:
        print(line)
else:
    print("出力が取得できませんでした")