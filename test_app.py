import subprocess
import time
import sys

# アプリケーションを起動
proc = subprocess.Popen([sys.executable, 'sorting_app.py'], 
                       stdout=subprocess.PIPE, 
                       stderr=subprocess.STDOUT,
                       text=True,
                       bufsize=1)

# 最初の10秒間の出力を確認
start_time = time.time()
while time.time() - start_time < 10:
    line = proc.stdout.readline()
    if line:
        print(line.strip())
        if "Running on" in line:  # Gradioの起動メッセージを検出
            time.sleep(2)  # URLが完全に表示されるまで待つ
            break
    time.sleep(0.1)

# プロセスを終了
proc.terminate()
proc.wait()