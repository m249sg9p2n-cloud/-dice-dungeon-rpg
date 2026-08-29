Dice Dungeon RPG v0.6.0 — 正式実装基盤版

今回の実装
- ホーム画面を正式ループ用に整理
- 1-1 ゴブリンの森を「1ラン」として管理
- BATTLE 1〜4 → 報酬選択 → BATTLE 5 BOSS
- BOSS撃破 → GOLD BONUS BOX → CLEAR結果 → ホーム
- 死亡 → ラン中GOLDを100%持ち帰り → ホーム
- CLEAR回数・BEST RUN GOLDを保存
- 旧diceRpgGoldを新saveデータへ自動移行
- 今後の永続強化・装備・ガチャ追加用のsaveデータ構造を用意
- 1-2はCOMING SOONとして表示
- v0.5.6の軽量ドット絵5体とダイス演出を維持

現時点では永続強化・装備変更・ガチャ本体は未実装。
次の段階でこのv0.6.0基盤に追加する前提。
