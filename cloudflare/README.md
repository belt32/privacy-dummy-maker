# 利用ブラウザ数カウンターの接続手順

サイト本体はGitHub Pagesで維持し、Cloudflare Worker + D1で集計します。
接続前はcounter-config.jsのURLを空にしており、ブラウザIDの生成も送信も行いません。

1. CloudflareでWorkers Freeプランを確認。有料プランへの変更や支払方法の追加は不要です。
2. D1データベースを新規作成: privacy-dummy-maker-counter。他のデータベースは変更しません。
3. そのデータベースのConsoleで、このディレクトリのschema.sqlを実行。
4. Workerを新規作成: privacy-dummy-maker-counter。worker.jsをデプロイ。
5. WorkerのBindingsでD1を追加。変数名はDB、対象は2で作成したDB。
6. 発行されたworkers.devのURLを記録し、末尾/api/visitorsのGETが{"total":0}を返すことを確認。
7. counter-config.jsにその正確なHTTPSエンドポイントを設定してGitHubに登録。
8. 公開ページからの登録、同一IDの再送で増えないこと、異常時に架空値を出さないことを確認。

保存するのはランダムなブラウザIDのSHA-256ハッシュだけ。IP、氏名、生成プロフィールはアプリケーションのDBに保存しません。通信先サービスの標準ログ等は別です。
これは認証済みの人数や賛同者数ではありません。データ削除・別端末・自動アクセスなどによる重複や不正な増加を完全には防げません。
Freeプランの上限に達した場合は集計を停止し、有料プランには切り替えません。
