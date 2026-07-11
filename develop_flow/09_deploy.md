# 09 GitHub Pagesへ自動デプロイする

## 目的

完成した計算機をGitHub Pagesへ公開する。

今回はGitHub Actionsを利用し、`main`ブランチへpushしたときに、以下を自動実行する。

```text
GitHubへpush
↓
依存パッケージをインストール
↓
PlaywrightのChromiumをインストール
↓
自動テスト
↓
Viteで本番ビルド
↓
GitHub Pagesへ公開
```

自動テストが失敗した場合は、公開処理を実行しない。

---

## 公開予定URL

GitHubのユーザー名：

```text
kizailent
```

リポジトリ名：

```text
calculator
```

公開予定URL：

```text
https://kizailent.github.io/calculator/
```

---

## 編集・作成するファイル

```text
vite.config.ts
.github/workflows/deploy.yml
develop_flow/09_deploy.md
README.md
```

---

# 1. GitHub PagesのURL構造を理解する

今回のサイトは、次のURLで公開する。

```text
https://kizailent.github.io/calculator/
```

ドメイン直下ではなく、`calculator`というリポジトリ名の下に配置される。

```text
/
└── calculator/
    ├── index.html
    └── assets/
```

そのため、Viteには次の公開パスを設定する必要がある。

```text
/calculator/
```

これを設定しない場合、ブラウザが次のような場所からCSSやJavaScriptを読み込もうとする可能性がある。

```text
https://kizailent.github.io/assets/...
```

本来読み込む場所は次である。

```text
https://kizailent.github.io/calculator/assets/...
```

---

# 2. `vite.config.ts`を作成する

プロジェクトのルートに次のファイルを作る。

```text
vite.config.ts
```

作成コマンド：

```bash
touch vite.config.ts
```

内容：

```typescript
import { defineConfig } from "vite";

export default defineConfig(
  ({ command, isPreview }) => ({
    base:
      command === "build" ||
      isPreview === true
        ? "/calculator/"
        : "/",
  }),
);
```

---

# 3. `base`の意味

```typescript
base: "/calculator/"
```

`base`は、公開時にCSSやJavaScriptなどをどのパスから読み込むかを指定する。

今回の公開URLは次である。

```text
https://kizailent.github.io/calculator/
```

そのため、リポジトリ名を含めた次の値を設定する。

```typescript
"/calculator/"
```

先頭と末尾の両方に`/`が必要である。

---

# 4. 開発時とビルド時で`base`を分ける

今回の設定では、次の条件分岐を使用している。

```typescript
command === "build"
```

本番ビルドの場合：

```text
command = "build"
base = "/calculator/"
```

開発サーバーの場合：

```text
command = "serve"
base = "/"
```

これにより、普段の開発とPlaywrightテストでは、引き続き次のURLを利用できる。

```text
http://127.0.0.1:5173/
```

本番ビルドでは、GitHub Pages向けのパスになる。

```text
/calculator/
```

---

# 5. ローカルでビルドする

設定を追加したら、ビルドを実行する。

```bash
npm run build
```

正常に完了すると、次のフォルダが作成される。

```text
dist/
```

例：

```text
dist/
├── assets/
│   ├── index-xxxxx.js
│   └── index-xxxxx.css
└── index.html
```

---

# 6. ビルドされたHTMLを確認する

次を実行する。

```bash
grep -n "assets" dist/index.html
```

出力されるパスに、`/calculator/`が含まれていることを確認する。

例：

```html
<script
  type="module"
  src="/calculator/assets/index-xxxxx.js"
></script>
```

```html
<link
  rel="stylesheet"
  href="/calculator/assets/index-xxxxx.css"
>
```

次のように`/calculator/`がない場合は、`vite.config.ts`を確認する。

```html
src="/assets/index-xxxxx.js"
```

---

# 7. 本番ビルドをローカルで確認する

次を実行する。

```bash
npm run preview -- --host 127.0.0.1
```

ブラウザで次を開く。

```text
http://127.0.0.1:4173/calculator/
```

確認事項：

- [ ] 計算機が表示される
- [ ] CSSが適用されている
- [ ] 数字入力ができる
- [ ] 四則演算ができる
- [ ] キーボード操作ができる
- [ ] Consoleに404エラーがない
- [ ] JavaScriptファイルを読み込めている
- [ ] CSSファイルを読み込めている

確認後は、ターミナルで次を押して終了する。

```text
Ctrl + C
```

---

# 8. GitHub Actions用フォルダを作る

プロジェクトルートで実行する。

```bash
mkdir -p .github/workflows
```

デプロイ用ファイルを作る。

```bash
touch .github/workflows/deploy.yml
```

フォルダ構成：

```text
.github/
└── workflows/
    └── deploy.yml
```

---

# 9. デプロイワークフローを作る

`.github/workflows/deploy.yml`に次を書く。

```yaml
name: Test and deploy to GitHub Pages

on:
  push:
    branches:
      - main

  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: pages
  cancel-in-progress: true

jobs:
  test-and-build:
    runs-on: ubuntu-latest

    steps:
      - name: Checkout repository
        uses: actions/checkout@v7

      - name: Set up Node.js
        uses: actions/setup-node@v6
        with:
          node-version: lts/*
          cache: npm

      - name: Install dependencies
        run: npm ci

      - name: Install Playwright Chromium
        run: npx playwright install --with-deps chromium

      - name: Run automated tests
        run: npm run test:chromium

      - name: Build application
        run: npm run build

      - name: Configure GitHub Pages
        uses: actions/configure-pages@v6

      - name: Upload GitHub Pages artifact
        uses: actions/upload-pages-artifact@v5
        with:
          path: ./dist

  deploy:
    needs: test-and-build

    runs-on: ubuntu-latest

    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}

    steps:
      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v5
```

---

# 10. ワークフロー名

```yaml
name: Test and deploy to GitHub Pages
```

GitHubのActions画面に表示される名前である。

---

# 11. 実行条件

```yaml
on:
  push:
    branches:
      - main
```

`main`ブランチへpushしたときに、自動実行する。

```yaml
workflow_dispatch:
```

GitHubのActions画面から、手動でも実行できるようにする。

---

# 12. GitHub Pages用の権限

```yaml
permissions:
  contents: read
  pages: write
  id-token: write
```

それぞれの役割：

```text
contents: read
→ リポジトリのファイルを読み取る

pages: write
→ GitHub Pagesへ公開する

id-token: write
→ GitHub Pagesへの安全な認証に使用する
```

---

# 13. 同時デプロイを制御する

```yaml
concurrency:
  group: pages
  cancel-in-progress: true
```

短時間に複数回pushした場合、古いデプロイ処理を中止して、新しい処理を優先する。

---

# 14. `test-and-build`ジョブ

```yaml
test-and-build:
```

このジョブでは、以下を実行する。

```text
コード取得
Node.js準備
npm ci
Playwright準備
自動テスト
本番ビルド
distをアップロード
```

---

# 15. GitHubからコードを取得する

```yaml
- name: Checkout repository
  uses: actions/checkout@v7
```

GitHub Actionsの実行環境へ、リポジトリの内容を取得する。

---

# 16. Node.jsを準備する

```yaml
- name: Set up Node.js
  uses: actions/setup-node@v6
  with:
    node-version: lts/*
    cache: npm
```

LTS版のNode.jsを利用する。

```yaml
cache: npm
```

を設定することで、npmパッケージの取得を効率化する。

---

# 17. `npm ci`で依存パッケージを導入する

```yaml
- name: Install dependencies
  run: npm ci
```

GitHub Actionsなどの自動実行環境では、通常`npm install`ではなく`npm ci`を使用する。

`package-lock.json`に記録されたバージョンを使用して、依存パッケージを再現する。

そのため、次のファイルをGitへ登録しておく必要がある。

```text
package-lock.json
```

---

# 18. Playwrightを準備する

```yaml
- name: Install Playwright Chromium
  run: npx playwright install --with-deps chromium
```

Chromium本体と、実行に必要なLinux側の依存パッケージをインストールする。

今回はデプロイ前の確認として、Chromiumのテストを実行する。

---

# 19. 自動テストを実行する

```yaml
- name: Run automated tests
  run: npm run test:chromium
```

08で作成したPlaywrightテストを実行する。

テストが1件でも失敗した場合、このジョブは失敗する。

その後の以下の処理は実行されない。

```text
ビルド
artifactのアップロード
デプロイ
```

つまり、不具合のある状態で公開されるのを防げる。

---

# 20. 本番ビルドを実行する

```yaml
- name: Build application
  run: npm run build
```

Viteが本番用ファイルを作成する。

出力先：

```text
dist/
```

---

# 21. GitHub Pagesを設定する

```yaml
- name: Configure GitHub Pages
  uses: actions/configure-pages@v6
```

GitHub Pages用のデプロイ環境を準備する。

---

# 22. `dist`をアップロードする

```yaml
- name: Upload GitHub Pages artifact
  uses: actions/upload-pages-artifact@v5
  with:
    path: ./dist
```

公開対象として、Viteが作成した`dist`フォルダをアップロードする。

ソースコード全体ではなく、ビルド済みファイルを公開する。

---

# 23. `deploy`ジョブ

```yaml
deploy:
  needs: test-and-build
```

`needs`は、先に完了する必要があるジョブを指定する。

```text
test-and-buildが成功
↓
deployを開始
```

`test-and-build`が失敗した場合、`deploy`は実行されない。

---

# 24. GitHub Pages環境

```yaml
environment:
  name: github-pages
  url: ${{ steps.deployment.outputs.page_url }}
```

GitHub Pages用の環境を指定する。

デプロイ成功後、GitHub Actionsの実行結果に公開URLが表示される。

---

# 25. GitHub Pagesへ公開する

```yaml
- name: Deploy to GitHub Pages
  id: deployment
  uses: actions/deploy-pages@v5
```

アップロードした`dist`を、GitHub Pagesへ公開する。

---

# 26. YAMLのインデントを確認する

YAMLではインデントが処理構造を表す。

タブではなく、半角スペースを使用する。

例：

```yaml
jobs:
  test-and-build:
    runs-on: ubuntu-latest
```

次のようにインデントが崩れると、ワークフローを読み込めない。

```yaml
jobs:
test-and-build:
runs-on: ubuntu-latest
```

---

# 27. package.jsonを確認する

`package.json`に次のスクリプトがあることを確認する。

```json
{
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview",
    "test": "playwright test",
    "test:ui": "playwright test --ui",
    "test:headed": "playwright test --headed",
    "test:chromium": "playwright test --project=chromium",
    "test:report": "playwright show-report",
    "test:all": "npm run build && playwright test"
  }
}
```

Viteのテンプレートによっては、`build`が次の形になっている場合もある。

```json
"build": "tsc -b && vite build"
```

既存の`build`が正常に動いている場合は、そのままでよい。

---

# 28. デプロイ前の最終確認

ローカルで実行する。

```bash
npm run test:chromium
```

成功後、ビルドする。

```bash
npm run build
```

本番用表示を確認する。

```bash
npm run preview -- --host 127.0.0.1
```

ブラウザ：

```text
http://127.0.0.1:4173/calculator/
```

---

# 29. Gitの変更状況を確認する

```bash
git status
```

主な変更ファイル：

```text
vite.config.ts
.github/workflows/deploy.yml
develop_flow/09_deploy.md
README.md
```

`dist`は通常Gitへ登録しない。

```text
dist/
```

`.gitignore`に次が含まれていることを確認する。

```gitignore
dist
```

Playwrightの一時ファイルも登録しない。

```gitignore
test-results/
playwright-report/
```

---

# 30. GitHubへpushする

変更をステージングする。

```bash
git add \
  vite.config.ts \
  .github/workflows/deploy.yml \
  develop_flow/09_deploy.md
```

READMEも変更した場合：

```bash
git add README.md
```

コミットする。

```bash
git commit -m "Deploy calculator to GitHub Pages"
```

pushする。

```bash
git push
```

---

# 31. GitHub Pagesの公開元を設定する

GitHubで`calculator`リポジトリを開く。

次の順番で移動する。

```text
Settings
↓
Pages
↓
Build and deployment
↓
Source
↓
GitHub Actions
```

`Deploy from a branch`ではなく、次を選択する。

```text
GitHub Actions
```

---

# 32. GitHub Actionsを確認する

リポジトリ上部の次のタブを開く。

```text
Actions
```

次のワークフローを選択する。

```text
Test and deploy to GitHub Pages
```

確認するジョブ：

```text
test-and-build
deploy
```

両方に緑色のチェックが付けば成功である。

---

# 33. 公開サイトを確認する

デプロイ成功後、次を開く。

```text
https://kizailent.github.io/calculator/
```

確認事項：

- [ ] ページが404にならない
- [ ] 計算機が表示される
- [ ] CSSが適用されている
- [ ] 数字入力ができる
- [ ] 小数点入力ができる
- [ ] 四則演算ができる
- [ ] ACが動く
- [ ] Backspaceが動く
- [ ] パーセントが動く
- [ ] キーボード操作ができる
- [ ] 0除算で`Error`になる
- [ ] スマートフォン幅で崩れない
- [ ] Consoleに404エラーがない
- [ ] ConsoleにJavaScriptエラーがない

---

# 34. READMEへ公開URLを追加する

`README.md`に公開サイトを追加する。

```markdown
## Demo

GitHub Pagesで公開しています。

https://kizailent.github.io/calculator/
```

機能も記載する。

```markdown
## Features

- 四則演算
- 小数入力
- 連続計算
- パーセント計算
- 1文字削除
- 0除算のエラー処理
- マウス操作
- キーボード操作
- レスポンシブ対応
- Playwrightによる自動テスト
```

技術構成：

```markdown
## Technologies

- HTML
- CSS
- TypeScript
- Vite
- Playwright
- GitHub Actions
- GitHub Pages
```

---

# 35. README変更後に再度pushする

```bash
git add README.md
git commit -m "Add live demo URL"
git push
```

このpushでもワークフローが再実行される。

---

# 36. デプロイが失敗した場合

## 自動テストが失敗する

Actionsのログで次を開く。

```text
Run automated tests
```

ローカルでも同じテストを実行する。

```bash
npm run test:chromium
```

修正後に再度pushする。

---

## `npm ci`が失敗する

`package-lock.json`がGitへ登録されているか確認する。

```bash
git status
git ls-files package-lock.json
```

登録されていない場合：

```bash
git add package-lock.json
git commit -m "Add package lock file"
git push
```

---

## 公開ページが404になる

確認事項：

```text
Settings → Pages → SourceがGitHub Actionsか
Actionsのdeployジョブが成功しているか
URLに/calculator/が含まれているか
```

正しいURL：

```text
https://kizailent.github.io/calculator/
```

---

## CSSやJavaScriptが読み込まれない

`vite.config.ts`を確認する。

```typescript
base:
  command === "build"
    ? "/calculator/"
    : "/",
```

ブラウザの開発者ツールで、404になっているファイルのURLを確認する。

正しい例：

```text
https://kizailent.github.io/calculator/assets/index-xxxxx.js
```

誤った例：

```text
https://kizailent.github.io/assets/index-xxxxx.js
```

---

## `deploy`ジョブが実行されない

`test-and-build`ジョブが失敗していないか確認する。

```yaml
needs: test-and-build
```

があるため、テストまたはビルドに失敗するとデプロイされない。

---

## workflowが表示されない

ファイルの場所を確認する。

```text
.github/workflows/deploy.yml
```

次のような場所では認識されない。

```text
github/workflows/deploy.yml
.github/workflow/deploy.yml
```

---

# 37. 公開後の更新方法

今後コードを変更した場合は、通常どおりpushする。

```bash
git add .
git commit -m "Update calculator"
git push
```

自動的に次が実行される。

```text
Playwrightテスト
↓
本番ビルド
↓
GitHub Pages更新
```

手動で`dist`をpushする必要はない。

---

# 38. 発生したエラーを記録する

## エラー内容

```text
ここにActionsのエラーメッセージを書く
```

## 発生した工程

```text
npm ci
Playwright
自動テスト
Vite build
artifact upload
deploy
```

## 原因

```text
ここに原因を書く
```

## 修正内容

```text
ここに修正内容を書く
```

## 再実行結果

```text
成功または失敗
```

---

# 今回学んだこと

作業後、自分が理解した内容を追記する。

例：

- GitHub Pagesではリポジトリ名を含むURLで公開される
- Viteの`base`で静的ファイルの参照元を変更できる
- GitHub Actionsでテスト・ビルド・公開を自動化できる
- 自動テストに失敗したコードの公開を防げる
- `npm ci`でlockファイルどおりに依存関係を再現できる
- Viteのビルド結果は`dist`へ出力される
- GitHub Pagesではビルド済みの`dist`をartifactとして渡す
- `needs`でジョブの実行順序を指定できる
- YAMLではインデントが処理構造を表す
- pushをきっかけに継続的デプロイを実行できる

---

# Gitコミット

```bash
git add \
  vite.config.ts \
  .github/workflows/deploy.yml \
  develop_flow/09_deploy.md \
  README.md
```

```bash
git commit -m "Deploy calculator to GitHub Pages"
```

```bash
git push
```

---

# 完了条件

以下をすべて満たしたら、この工程は完了とする。

- [ ] `vite.config.ts`を作成した
- [ ] 本番ビルドの`base`を`/calculator/`にした
- [ ] ローカルの開発サーバーは`/`で利用できる
- [ ] `npm run test:chromium`が成功する
- [ ] `npm run build`が成功する
- [ ] ローカルのpreviewで表示できる
- [ ] `.github/workflows/deploy.yml`を作成した
- [ ] Actions内でPlaywrightを実行できる
- [ ] テスト失敗時にデプロイされない
- [ ] `dist`をPages用artifactとしてアップロードできる
- [ ] GitHub PagesのSourceをGitHub Actionsにした
- [ ] `test-and-build`ジョブが成功した
- [ ] `deploy`ジョブが成功した
- [ ] 公開URLへアクセスできる
- [ ] 公開環境でCSSが適用される
- [ ] 公開環境で計算機が動作する
- [ ] READMEに公開URLを追加した
- [ ] Consoleに404エラーがない
- [ ] ConsoleにJavaScriptエラーがない
- [ ] GitHubへコミット・pushした

---

# 次の工程

計算機アプリはこれで完成となる。

次は、以下のどちらかへ進む。

```text
10 コードのリファクタリング
```

または、

```text
Webアプリ02の開発開始
```