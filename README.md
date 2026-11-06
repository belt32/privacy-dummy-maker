# 個人情報ダミーメーカー

無料・登録不要の架空プロフィール生成ツール。v0.5を元にGitHub Pages向けに調整。

公開先（Pagesの有効化後）: https://belt32.github.io/privacy-dummy-maker/

## GitHub Pagesの設定
Settings → Pages → Deploy from a branch → main / (root) → Save。

## 機能
氏名・架空住所・テスト用電話番号・生年月日の生成、コピー、改善要望文の作成、全5ページの解説。

## 検索設定
全ページのtitle、description、canonical、OGPと、sitemap.xmlを設定済み。
プロジェクト配下のrobots.txtはホストルートのrobots.txtとして扱われません。検索登録時はURLプレフィックスで登録し、sitemap.xmlを送信してください。

## カウンター
GitHub Pagesにはバックエンドがないため無効化し、未集計と表示。ブラウザIDの生成・送信や架空の人数表示はしません。
functions/api/visitors.jsとschema.sqlは、将来Cloudflare D1を導入する場合の元の実装です。GitHub Pagesでは動作しません。

## 注意
氏名が偶然実在の人物と一致する可能性があります。住所と電話番号はデモ用で、第三者への連絡、本人確認や規約に反する登録には使わないでください。
