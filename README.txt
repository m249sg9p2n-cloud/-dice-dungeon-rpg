Dice Dungeon RPG PWA v0.2

■ 追加したもの
- manifest.webmanifest
- Service Worker (オフラインキャッシュ)
- iPhone用ホーム画面アイコン
- standalone表示
- portrait固定
- 既存GOLD保存(localStorage)維持

■ GitHub Pagesでの使い方
1. このZIPを解凍
2. 中身をGitHub Pages用リポジトリのルートへアップロード
3. PagesのURLをSafariで開く
4. 共有ボタン → 「ホーム画面に追加」
5. 追加したアイコンから起動

※ PWAのService Workerは https または localhost で動作します。
※ GitHub Pagesはhttpsなのでそのまま使えます。


v0.3: ダイス効果音/倍率ダイス強調音/攻撃音/666専用音、ダイス回転、斬撃、ダメージ表示、666演出、サウンド切替を追加。


=== v0.4 ===
- 戦闘画面をiPhone 1画面に収まるアプリ型UIへ変更
- 戦闘中はスクロール不要
- safe-area / Dynamic Island / ホームインジケータを考慮
- ③倍率ダイスを金色・大型化・MULTIPLIER表示
- ③が振れる瞬間に発光
- ダイスSEを「カラカラカラ…デン！」系へ変更
- ③だけ長めのカラカラ＋重い確定音
- 攻撃、被弾、撃破、報酬、ボス、666のSEを追加
