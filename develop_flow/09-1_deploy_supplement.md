# 09-1 GitHub Actions・デプロイ・料金設定の補足

## 目的

09では、Viteで作成した計算機をGitHub Pagesへ公開した。

この補足では、デプロイ作業中に確認した以下の内容を整理する。

- `Deploy from a branch`と`GitHub Actions`の違い
- Viteの`base`設定
- ビルド結果の確認方法
- ローカルpreviewでCSS・JavaScriptが反映されない場合の確認
- GitHub Actionsの実行状況の見方
- PlaywrightがCI上でタイムアウトした原因
- デプロイ済みサイトの確認場所
- GitHub ActionsとGitHub Pagesの料金
- 予算と通知による課金防止
- Calculatorプロジェクトの最終状態

---

# 1. 今回完成した自動デプロイの流れ

現在のプロジェクトでは、`main`ブランチへpushすると、GitHub Actionsが次の処理を自動実行する。

```text
mainブランチへpush
↓
リポジトリのコードを取得
↓
npm ciで依存関係をインストール
↓
Playwright用のChromiumをインストール
↓
Playwrightによる自動テスト
↓
Viteによる本番ビルド
↓
distをGitHub Pages用Artifactとしてアップロード
↓
GitHub Pagesへデプロイ
```

自動テストが失敗した場合は、ビルド・デプロイへ進まない。

```text
テスト成功
→ 公開する

テスト失敗
→ 公開しない
```

この仕組みによって、不具合を含むコードが公開環境へ反映されるのを防げる。

---

# 2. `Deploy from a branch`とGitHub Actionsの違い

GitHub Pagesには、主に次の公開方法がある。

```text
Deploy from a branch
GitHub Actions
```

## Deploy from a branch

指定したブランチのファイルを、そのままGitHub Pagesへ公開する。

例：

```text
mainブランチのルート
mainブランチのdocsフォルダ
```

次のような、ビルド不要の静的サイトに向いている。

```text
index.html
style.css
main.js
```

ただし、Viteプロジェクトの開発用コードは、そのまま公開するのではなく、本番用に変換する必要がある。

```text
src/main.ts
src/style.css
↓
npm run build
↓
dist/index.html
dist/assets/*.js
dist/assets/*.css
```

---

## GitHub Actions

GitHub Actionsを使うと、公開前に任意の処理を実行できる。

今回のプロジェクトでは、次の処理を自動化した。

```text
テスト
ビルド
Artifactの作成
デプロイ
```

そのため、ViteとPlaywrightを使用する今回のCalculatorでは、GitHub Actionsを利用した。

GitHub Actionsが絶対に必要というわけではない。

しかし、`Deploy from a branch`を使う場合は、ローカルで作成した`dist`を`docs`などへコピーし、生成物もGit管理する必要がある。

```text
コード修正
↓
ローカルでテスト
↓
ローカルでビルド
↓
生成物をdocsへコピー
↓
生成物をコミット
↓
push
```

GitHub Actionsを使えば、通常はソースコードだけを管理し、公開用ファイルはGitHub側で生成できる。

---

# 3. GitHub Pages用の`base`設定

今回の公開先は、GitHub Pagesのプロジェクトサイトである。

```text
ユーザーサイト
└── calculator/
```

そのため、本番環境では静的ファイルを次のパスから読み込む必要がある。

```text
/calculator/assets/
```

Viteの`base`を設定しない場合、次のパスになる可能性がある。

```text
/assets/
```

これでは、GitHub Pages上でCSSやJavaScriptを取得できず、404になる。

---

# 4. 最終的な`vite.config.ts`

開発時・本番ビルド時・preview時で、`base`を切り替える。

```typescript
import { defineConfig } from "vite";

export default defineConfig(
  ({ command, isPreview }) => ({
    base:
      command === "serve" &&
      !isPreview
        ? "/"
        : "/calculator/",
  }),
);
```

この設定による違いは次のとおり。

```text
npm run dev
→ baseは/
→ http://127.0.0.1:5173/

npm run build
→ baseは/calculator/
→ GitHub Pages用のファイルを生成

npm run preview
→ baseは/calculator/
→ ローカルでGitHub Pagesに近い構成を確認
```

---

# 5. ビルド結果を確認する

本番用ファイルを作成する。

```bash
npm run build
```

ビルド結果は、通常`dist`に出力される。

```text
dist/
├── index.html
└── assets/
    ├── index-xxxxx.js
    └── index-xxxxx.css
```

`dist/index.html`に書かれたパスを確認する。

```bash
grep -n "assets" dist/index.html
```

今回確認できた例：

```text
<script
  type="module"
  crossorigin
  src="/calculator/assets/index-xxxxx.js"
></script>

<link
  rel="stylesheet"
  crossorigin
  href="/calculator/assets/index-xxxxx.css"
>
```

次の文字列が含まれていれば、GitHub Pages向けの`base`が反映されている。

```text
/calculator/assets/
```

---

# 6. ファイル名に付く文字列について

Viteが生成するJavaScriptやCSSには、次のような文字列が付く。

```text
index-CpAFQ1gJ.js
index-C0MGGAuW.css
```

この部分はハッシュ値である。

```text
CpAFQ1gJ
C0MGGAuW
```

ファイル内容が変わると、ハッシュ値も変わる場合がある。

そのため、ビルドのたびにファイル名が同じでなくても問題ない。

ハッシュ値を付けることで、ブラウザが古いキャッシュではなく、新しいファイルを読み込みやすくなる。

---

# 7. 本番ビルドをローカルで確認する

previewサーバーを起動する。

```bash
npm run preview -- --host 127.0.0.1
```

今回は`base`が`/calculator/`なので、次のパスを開く。

```text
http://127.0.0.1:4173/calculator/
```

確認事項：

- [ ] HTMLが表示される
- [ ] CSSが反映される
- [ ] JavaScriptが実行される
- [ ] ボタンをクリックできる
- [ ] キーボード操作ができる
- [ ] Consoleに404エラーがない

---

# 8. CSS・JavaScriptが反映されていない場合

見た目が素のHTMLに見えたり、ボタンを押しても反応しない場合は、CSSまたはJavaScriptを読み込めていない可能性がある。

ブラウザの開発者ツールを開く。

```text
F12
↓
Network
↓
ページを再読み込み
```

次のファイルを探す。

```text
index-xxxxx.js
index-xxxxx.css
```

ステータスが次なら正常である。

```text
200
```

次の場合は、ファイルを取得できていない。

```text
404
```

Consoleにも次のようなメッセージが出る場合がある。

```text
Failed to load resource
```

---

## ターミナルから確認する

実際のファイル名を指定して確認できる。

```bash
curl -I \
  http://127.0.0.1:4173/calculator/assets/index-xxxxx.js
```

```bash
curl -I \
  http://127.0.0.1:4173/calculator/assets/index-xxxxx.css
```

正常な場合：

```text
HTTP/1.1 200 OK
```

確認後はpreviewを終了する。

```text
Ctrl + C
```

---

# 9. GitHub Actionsの実行状況を見る

対象リポジトリの次の画面を開く。

```text
Actions
```

ワークフロー名：

```text
Test and deploy to GitHub Pages
```

実行履歴では、次の情報を確認できる。

```text
実行したコミット
実行したブランチ
実行者
開始時刻
実行時間
成功または失敗
```

緑色のチェック：

```text
成功
```

赤色の×：

```text
失敗
```

---

# 10. 失敗したステップを確認する

ワークフロー実行をクリックすると、ジョブとステップを確認できる。

例：

```text
Checkout repository
Set up Node.js
Install dependencies
Install Playwright Chromium
Run automated tests
Build application
Configure GitHub Pages
Upload GitHub Pages artifact
Deploy to GitHub Pages
```

赤い×が付いたステップを開き、ログの最後付近を確認する。

よく確認する文字列：

```text
Error:
Process completed with exit code 1.
```

後続のステップに斜線が表示されている場合は、そのステップが失敗したのではなく、前のステップが失敗したため実行されなかった可能性がある。

---

# 11. PlaywrightのCIタイムアウト

GitHub Actionsでは、次のエラーが発生した。

```text
Error: Timed out waiting 60000ms from config.webServer.
```

これは計算機のテストケースが失敗したのではなく、Playwrightがテスト対象のViteサーバーへ接続できず、テスト開始前に終了したことを表す。

```text
GitHub Actions開始
↓
PlaywrightがViteを起動
↓
設定されたURLへ接続を試みる
↓
接続できない
↓
60秒経過
↓
タイムアウト
```

---

# 12. ローカルでは成功し、CIでは失敗した理由

Playwrightには次の設定がある。

```typescript
reuseExistingServer:
  !process.env.CI
```

ローカルでは通常、`CI`環境変数がない。

```text
process.env.CI
→ false相当

reuseExistingServer
→ true
```

そのため、既に起動しているViteサーバーを再利用できる。

一方、GitHub Actionsでは次の状態になる。

```text
process.env.CI
→ true

reuseExistingServer
→ false
```

Playwright自身が、新しくViteを起動する必要がある。

ローカルで既存サーバーを再利用していると、Playwright自身がサーバーを起動できない問題に気付きにくい。

---

# 13. PlaywrightのWebサーバー設定

CIでも確実に同じポートを使用するよう設定する。

```typescript
webServer: {
  command:
    "npm run dev -- --host 127.0.0.1 --port 5173 --strictPort",

  url:
    "http://127.0.0.1:5173",

  reuseExistingServer:
    !process.env.CI,

  timeout:
    120_000,

  stdout:
    "pipe",

  stderr:
    "pipe",
},
```

---

## `--host 127.0.0.1`

Viteが待ち受けるホストを明示する。

```text
127.0.0.1
```

---

## `--port 5173`

Viteのポートを固定する。

```text
5173
```

Playwright側のURLと一致させる。

```typescript
baseURL:
  "http://127.0.0.1:5173"
```

---

## `--strictPort`

5173番ポートを使用できない場合、Viteが自動的に5174番などへ変更するのを防ぐ。

指定しない場合、次の食い違いが起きる可能性がある。

```text
Vite
→ 5174番で起動

Playwright
→ 5173番を待つ

結果
→ タイムアウト
```

`--strictPort`がある場合は、ポートを変更せず、明確なエラーとして終了する。

---

## `timeout`

```typescript
timeout: 120_000
```

Webサーバーの起動を最大120秒待つ。

単位はミリ秒である。

```text
120000ミリ秒
→ 120秒
```

ただし、URLやポートが間違っている場合は、単に時間を長くしても解決しない。

---

## `stdout`と`stderr`

```typescript
stdout: "pipe",
stderr: "pipe",
```

Viteの起動ログをPlaywrightのログへ表示する。

GitHub Actionsで再び失敗した場合、次のようなログを確認できる。

```text
[WebServer] ...
```

これによって、Vite側のエラーを調べやすくなる。

---

# 14. CIと同じ条件をローカルで再現する

Viteの開発サーバーを停止した状態で実行する。

```bash
CI=true npm run test:chromium
```

これにより、ローカルでも次の設定になる。

```text
reuseExistingServer = false
```

Playwrightが自分でViteを起動できるか確認できる。

GitHub Actionsへpushする前に、CIに近い条件でテストできる。

---

# 15. デプロイ済みサイトの確認場所

GitHub Actionsの実行履歴は、次で確認する。

```text
Actions
```

実際に公開された環境や公開URLは、対象リポジトリの次の場所から確認できる。

```text
リポジトリのCode画面
↓
Deployments
↓
github-pages
```

ここでは次の情報を確認できる。

```text
現在のデプロイ
過去のデプロイ履歴
デプロイ元のコミット
公開URL
成功・失敗状態
関連するActionsの実行
```

GitHub Pagesの設定は、次でも確認できる。

```text
Settings
↓
Pages
```

---

# 16. 複数リポジトリのデプロイについて

GitHub標準のDeployments画面は、基本的にリポジトリ単位で確認する。

```text
calculatorリポジトリ
→ calculatorのDeployments

todoリポジトリ
→ todoのDeployments
```

複数の公開アプリを利用者向けに一覧表示したい場合は、別途ポートフォリオサイトを作成する。

例：

```text
ポートフォリオサイト
├── Calculator
├── Todo App
├── Weather App
└── その他のWebアプリ
```

GitHubの内部管理としては各リポジトリのDeploymentsを使用し、作品一覧としてはポートフォリオサイトを使用する。

---

# 17. 今回の料金について

今回のCalculatorでは、次の構成を使用している。

```text
公開リポジトリ
GitHub Pages
標準のGitHub-hosted runner
ubuntu-latest
GitHub Actions
Playwright
Vite
```

現在の利用画面では、支出は次の状態だった。

```text
$0 spent
```

今回の構成では、現時点で支払いは発生していない。

---

# 18. 課金が発生する可能性がある例

今後、次のような機能を利用する場合は、料金設定を改めて確認する。

```text
非公開リポジトリで無料枠を超えるActions利用
大型GitHub-hosted runner
大量のArtifact保存
大量のGitHub Packages利用
Codespaces
Git LFSの無料枠超過
独自ドメインの購入
外部の有料API
有料データベース
有料クラウドサービス
```

独自ドメインを使用する場合、GitHub Pagesではなく、ドメイン販売事業者へ料金を支払うことになる。

---

# 19. Budgets and alertsの設定

GitHubの次の画面を確認した。

```text
Settings
↓
Billing and licensing
↓
Budgets and alerts
```

確認した設定：

```text
Included usage alerts
→ On

Actions budget
→ $0

Stop usage
→ Yes

Actions spent
→ $0
```

同様に、次の製品にも0ドル予算が設定されていた。

```text
AI Credit SKUs
Codespaces
Packages
Actions
Git LFS
```

---

# 20. `$0 budget`と`100%`表示

画面では、予算が次の状態だった。

```text
$0 budget
$0 spent
100%
```

重要なのは、実際の支出欄である。

```text
$0 spent
```

`100%`と表示されていても、それだけで請求が発生していることを意味しない。

今回は0ドルの予算に対する表示であり、実際の支出は0ドルだった。

---

# 21. `Stop usage: Yes`

Actionsに対して次の設定になっていた。

```text
Stop usage
→ Yes
```

これは、有料の従量課金対象となる利用が予算上限へ達した場合、追加利用を停止するための設定である。

今回の設定：

```text
予算
→ $0

予算到達時
→ 利用停止
```

意図しない有料利用を防ぐための安全設定として利用できる。

---

# 22. Included usage alerts

次の設定も有効になっていた。

```text
Included usage alerts: On
```

これは、プランに含まれる利用枠が上限へ近づいた場合の通知に使用される。

予算通知と無料利用枠の通知は別の仕組みである。

```text
予算通知
→ 設定した金額に対する通知

Included usage alerts
→ プランに含まれる利用枠に対する通知
```

両方を確認することで、利用量と料金の状況を把握しやすくなる。

---

# 23. 今後の料金確認方針

新しいサービスを使用する前に、次を確認する。

```text
無料枠があるか
無料枠の上限はいくらか
無料期間終了後に自動課金されるか
支払い方法を登録する必要があるか
予算上限を設定できるか
上限到達時に利用停止できるか
利用量の通知を設定できるか
```

特に次のサービスを追加する場合は、その都度確認する。

```text
外部API
クラウドデータベース
サーバー
ストレージ
認証サービス
AI API
独自ドメイン
```

---

# 24. Calculatorの最終構成

```text
webapp-01-calculator/
├── .github/
│   └── workflows/
│       └── deploy.yml
├── develop_flow/
│   ├── 00_overview.md
│   ├── 01_setup.md
│   ├── 02_html_layout.md
│   ├── 03_css_layout.md
│   ├── 03-1_keyboard_feedback.md
│   ├── 04_number_input.md
│   ├── 05_state_management.md
│   ├── 05-1_decimal_input.md
│   ├── 06_calculation.md
│   ├── 07_error_handling.md
│   ├── 07-1_remaining_features.md
│   ├── 08_automated_testing.md
│   ├── 09_deploy.md
│   └── 09-1_deploy_supplement.md
├── src/
│   ├── main.ts
│   └── style.css
├── tests/
│   └── calculator.spec.ts
├── index.html
├── package.json
├── package-lock.json
├── playwright.config.ts
├── vite.config.ts
└── README.md
```

---

# 25. Calculatorで実装した機能

```text
数字入力
小数点入力
足し算
引き算
掛け算
割り算
連続計算
演算子変更
計算結果の整形
0除算エラー
AC
1文字削除
パーセント
マウス操作
キーボード操作
キーボード押下表現
レスポンシブ表示
```

---

# 26. 開発環境・技術構成

```text
HTML
CSS
TypeScript
Vite
Playwright
Git
GitHub
GitHub Actions
GitHub Pages
```

---

# 27. 自動化した処理

```text
Vite開発サーバーの起動
ChromiumでのE2Eテスト
本番ビルド
GitHub Pages用Artifactの作成
GitHub Pagesへのデプロイ
```

---

# 28. Calculatorで学んだこと

- HTMLの`data-*`属性をTypeScriptから取得できる
- DOM要素へクリックイベントを登録できる
- キーボードイベントを処理できる
- 表示値と計算状態を分けて管理できる
- `let`と`const`を使い分けられる
- TypeScriptのユニオン型で演算子を制限できる
- 文字列として入力を保持し、計算時に数値へ変換できる
- エラー状態をboolean変数で管理できる
- Playwrightで実際のブラウザ操作を自動化できる
- テスト用のCSSセレクターを作成できる
- ローカル環境とCI環境では挙動が異なる場合がある
- Viteの`base`で公開先のパスを調整できる
- GitHub Actionsでテスト・ビルド・デプロイを自動化できる
- GitHub Pagesではビルド済みのArtifactを公開できる
- Actionsのログから失敗した工程を調査できる
- 料金の予算・利用停止・通知設定を確認できる

---

# 29. 今後Calculatorを更新する場合

コードを変更する。

```bash
git status
```

変更をステージングする。

```bash
git add .
```

コミットする。

```bash
git commit -m "Update calculator"
```

GitHubへpushする。

```bash
git push
```

push後は自動的に次が実行される。

```text
Playwrightテスト
↓
Viteビルド
↓
GitHub Pagesへデプロイ
```

Actionsで緑色のチェックが付いたことを確認し、公開サイトを確認する。

---

# 30. 今後Actionsが失敗した場合

次の順番で確認する。

```text
1. Actionsを開く
2. 失敗したworkflow runを開く
3. 赤い×のジョブを開く
4. 赤い×のステップを開く
5. ログ末尾のErrorを確認する
6. ローカルで同じコマンドを実行する
7. 修正する
8. 再度pushする
```

Playwrightの問題なら、まず次を実行する。

```bash
CI=true npm run test:chromium
```

ビルドの問題なら、次を実行する。

```bash
npm run build
```

GitHub Pages用パスの問題なら、次を実行する。

```bash
grep -n "assets" dist/index.html
```

---

# 31. Git差分を確認する

```bash
git status
```

```bash
git diff
```

---

# 32. Gitコミット

補足資料を追加する。

```bash
git add \
  develop_flow/09-1_deploy_supplement.md
```

`develop_flow/README.md`も変更した場合は追加する。

```bash
git add develop_flow/README.md
```

コミットする。

```bash
git commit -m \
  "Add deployment and billing notes"
```

GitHubへpushする。

```bash
git push
```

このpushでも、自動テストとデプロイが実行される。

---

# 33. 完了条件

以下をすべて満たしたため、Calculatorプロジェクトを完成とする。

- [x] 計算機の画面を作成した
- [x] 数字入力を実装した
- [x] 小数点を実装した
- [x] 四則演算を実装した
- [x] 連続計算を実装した
- [x] 0除算のエラー処理を実装した
- [x] ACを実装した
- [x] 1文字削除を実装した
- [x] パーセントを実装した
- [x] キーボード操作を実装した
- [x] レスポンシブ表示に対応した
- [x] Playwrightによる自動テストを作成した
- [x] ローカルで自動テストが成功した
- [x] GitHub Actionsで自動テストが成功した
- [x] Viteの本番ビルドが成功した
- [x] GitHub Pagesへのデプロイが成功した
- [x] 公開サイトで動作を確認した
- [x] Actionsの予算を0ドルに設定した
- [x] 予算到達時の利用停止を有効にした
- [x] Included usage alertsを有効にした
- [x] 現在の支出が0ドルであることを確認した
- [x] GitHubへすべてpushした

---

# プロジェクト完了

```text
Web App 01
Calculator
Completed
```

次は、新しい独立したリポジトリでWeb App 02の開発を開始する。