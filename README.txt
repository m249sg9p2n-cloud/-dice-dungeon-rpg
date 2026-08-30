Dice Dungeon RPG v1.0.0 — HARDCORE
・1-2敵グラフィックを全面描き直し
・1-1/1-2を大幅高難度化
・1-3 呪われた墓地 / 1-4 灼熱の火山を追加
・ステージはクリア順に解禁
・ガチャのプチュン/昇格演出を重く強化
・隠し開発者モード: ホーム「DICE DUNGEON」を4秒以内に10回タップ
  +10,000G / 全ステージ解放 / 全装備入手 / GODガチャ即テスト
・未使用リアルgoblin.pngは削除済み

v1.0.1 DEV FIX
- 開発者モード起動を修正
- DICE DUNGEONを5秒以内に10回タップで起動
- さらに2秒長押しでも起動（テスト時の保険）
- iPhone Safari向け touch/pointer 両対応
- 起動時に振動

v1.0.2 DEV VISIBILITY FIX
- 原因: devMode に class="hidden" が残っており、画面切替後も display:none!important が勝っていた
- devMode を通常の screen と同じ方式に修正
- active 時は必ず表示
- openDevMode() 側でも hidden を除去する二重安全策

v1.1.0 PUCHUN REBUILD
- ガチャ昇格のプチュンを参考動画のタイミング構造に合わせて全面再設計
- 約0.50秒の無予告ホールド -> 80ms放電 -> CRT発光収束 -> 横線 -> 点 -> 約230ms真暗闇
- その後にゲーム独自のGRADE UPを表示
- プチュン音もクリック / 電気ノイズ / ピッチ落下 / 低音停止音の多層構成へ変更
