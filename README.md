# Calculator

HTML・CSS・TypeScriptで開発した、ブラウザ上で動作する電卓アプリです。

四則演算だけでなく、小数、パーセント、1文字削除、キーボード操作、0除算のエラー処理に対応しています。

PlaywrightによるE2Eテストと、GitHub Actionsによるテスト・ビルド・GitHub Pagesへの自動デプロイも実装しました。

本プロジェクトでは、ChatGPTを学習支援ツールとして活用し、設計、実装方針、コードレビュー、エラー調査、テスト設計、デプロイ設定について対話しながら開発しました。

---

## Demo

GitHub Pagesで公開しています。

[Calculatorを開く](https://kizailent.github.io/calculator/)

---

## Repository

[GitHubリポジトリを見る](https://github.com/kizailent/calculator)

---

## Features

- 数字入力
- 小数点入力
- 足し算
- 引き算
- 掛け算
- 割り算
- 入力順に処理する連続計算
- 演算子の変更
- パーセント計算
- 1文字削除
- ACによる初期化
- 0除算のエラー表示
- 計算結果の桁数調整
- 最大入力文字数の制限
- マウス操作
- キーボード操作
- キーボード押下時の視覚表現
- レスポンシブ対応
- PlaywrightによるE2Eテスト
- GitHub Actionsによる自動テスト・自動デプロイ

---

## Calculator Behavior

この電卓は、一般的なシンプル電卓と同様に、入力された順番で計算します。

例えば、次の入力を行った場合、

```text
2 + 3 × 4 =
```

次の順番で計算されます。

```text
2 + 3 = 5
5 × 4 = 20
```

結果は`20`になります。

数学的な演算子の優先順位を適用した`14`にはなりません。

---

## Percent Behavior

パーセントは、選択されている演算子によって処理を変更しています。

### 単独で使用する場合

```text
50 %
→ 0.5
```

### 足し算

```text
200 + 10 % =
→ 220
```

### 引き算

```text
200 - 10 % =
→ 180
```

### 掛け算

```text
200 × 10 % =
→ 20
```

### 割り算

```text
200 ÷ 10 % =
→ 2000
```

---

## Keyboard Controls

| キー | 操作 |
|---|---|
| `0`〜`9` | 数字入力 |
| `.` | 小数点 |
| `+` | 足し算 |
| `-` | 引き算 |
| `*` | 掛け算 |
| `/` | 割り算 |
| `%` | パーセント |
| `Enter` | 計算実行 |
| `=` | 計算実行 |
| `Backspace` | 1文字削除 |
| `Escape` | AC |
| `Delete` | AC |

キーボード操作時は、対応する画面上のボタンにも押下表現が適用されます。

---

## Error Handling

0で割った場合は、JavaScriptの`Infinity`や`NaN`をそのまま表示せず、`Error`を表示します。

```text
8 ÷ 0 =
→ Error
```

エラー表示後に数字を入力すると、新しい計算を開始します。

```text
Error
↓
7
↓
7
```

エラー表示中にACまたはBackspaceを実行すると、初期状態へ戻ります。

```text
Error
↓
AC
↓
0
```

内部では、エラー状態を次の変数で管理しています。

```typescript
let hasError = false;
```

表示文字列だけで判断せず、通常状態とエラー状態を分けて管理しています。

---

## Technologies

- HTML
- CSS
- TypeScript
- Vite
- Playwright
- Git
- GitHub
- GitHub Actions
- GitHub Pages
- ChatGPT

---

## Development Environment

- Windows
- WSL2
- Ubuntu
- Visual Studio Code
- Node.js
- npm

---

# How I Used ChatGPT

本プロジェクトでは、ChatGPTをコードの完成品を一括生成するためではなく、**プログラミング学習を進めるための対話型の支援ツール**として使用しました。

実装そのものは、各工程の目的とコードの意味を確認しながら、自分で入力・修正・実行しています。

## 1. 開発工程の設計

最初に、完成までの作業を小さな工程へ分割しました。

```text
環境構築
↓
HTMLによる画面作成
↓
CSSによるレイアウト
↓
数字入力
↓
状態管理
↓
小数点入力
↓
四則演算
↓
エラー処理
↓
Backspace・パーセント
↓
自動テスト
↓
自動デプロイ
```

ChatGPTには、それぞれの工程について次の内容を整理してもらいました。

- 工程の目的
- 実装する機能
- 使用する変数
- コードの考え方
- 動作確認方法
- エラーが発生した場合の確認点
- Gitのコミット単位
- 工程の完了条件

各工程は`develop_flow`ディレクトリへMarkdown形式で記録しています。

---

## 2. プログラミング概念の理解

実装中に分からなかった構文や概念を、ChatGPTへ質問しました。

例：

- `let`と`const`の違い
- `button.dataset.number`の意味
- `data-*`属性の役割
- テンプレートリテラルとバッククォート
- `string | undefined`の意味
- TypeScriptのユニオン型
- `waitingForNextInput`による状態管理
- `hasError`によるエラー状態管理
- `slice(0, -1)`による文字列削除
- `Number.isFinite`の役割
- `switch`文の使い方
- CSSセレクターの書き方

コードだけを受け取るのではなく、処理の流れや変数の役割を確認してから実装しました。

---

## 3. コードレビュー

自分で記述したコードをChatGPTへ提示し、次の観点から確認してもらいました。

- 条件分岐が正しいか
- 状態変数の更新順序が正しいか
- 不足している`updateDisplay()`がないか
- 型とHTML属性が一致しているか
- スペルミスがないか
- 不正なCSSセレクターがないか
- コードの可読性を改善できるか
- 不要なセミコロンや書式の乱れがないか

例えば、連続計算時に内部状態は更新されているものの、`updateDisplay()`がなく、途中結果が画面へ反映されない問題をコードレビューによって発見しました。

---

## 4. デバッグ

発生したエラーや想定外の動作をChatGPTと確認しました。

主な例：

### 小数点入力の条件が逆だった

誤った処理：

```typescript
if (!currentInput.includes(".")) {
  return;
}
```

この条件では、小数点が含まれていないときに処理が終了していました。

修正後：

```typescript
if (currentInput.includes(".")) {
  return;
}
```

---

### 掛け算と割り算の内部値が統一されていなかった

画面表示には次を使用します。

```text
×
÷
```

プログラム内部とキーボード入力には次を使用します。

```text
*
/
```

HTMLでは、表示文字と内部値を分けました。

```html
<button data-operator="*">×</button>
<button data-operator="/">÷</button>
```

---

### Playwrightのクリックテストだけ失敗した

誤ったセレクター：

```typescript
'button[data-number="${number}"]'
```

シングルクォートでは`${number}`が展開されず、文字列のまま扱われていました。

修正後：

```typescript
`button[data-number="${number}"]`
```

この問題では、キーボード操作のテストはボタン検索を経由しないため成功し、クリック操作だけが失敗していました。

ChatGPTとの対話を通して、操作経路の違いから原因を特定しました。

---

## 5. テスト設計

ChatGPTと相談し、Playwrightを使ってE2Eテストを作成しました。

主なテスト対象は次のとおりです。

- 初期表示
- 数字入力
- 先頭の0の処理
- 最大入力文字数
- 小数点入力
- 四則演算
- 負の計算結果
- 浮動小数点誤差の整形
- 連続計算
- 演算子変更
- 0除算
- エラー状態からの復帰
- AC
- Backspace
- パーセント
- キーボード入力
- キーボード押下表現
- レスポンシブ表示
- JavaScriptエラーの検出

同じ形式の計算テストには、テーブル駆動テストを使用しました。

```typescript
const arithmeticCases = [
  {
    name: "足し算",
    left: "2",
    operator: "+",
    right: "3",
    expected: "5",
  },
  {
    name: "掛け算",
    left: "4",
    operator: "*",
    right: "6",
    expected: "24",
  },
];
```

---

## 6. CI環境のトラブル調査

ローカルではPlaywrightテストが成功していましたが、GitHub Actionsでは次のエラーが発生しました。

```text
Timed out waiting 60000ms from config.webServer
```

ChatGPTとログを確認し、ローカルでは既存のViteサーバーを再利用していた一方、CIではPlaywright自身がViteを起動する必要があることを確認しました。

次の設定を追加し、ホストとポートを明示しました。

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

ローカルでもCIに近い条件を再現するため、次のコマンドを使用しました。

```bash
CI=true npm run test:chromium
```

---

## 7. GitHub Pagesへのデプロイ

ChatGPTには、次の項目について説明とレビューをしてもらいました。

- `Deploy from a branch`とGitHub Actionsの違い
- Viteでビルドが必要な理由
- GitHub Pages用の`base`設定
- `dist`ディレクトリの役割
- GitHub ActionsのYAML構造
- Playwrightテスト後にデプロイする流れ
- Actionsログの確認方法
- Deployments画面の見方

GitHub Actionsでは、次の流れを自動化しています。

```text
push
↓
npm ci
↓
Playwrightテスト
↓
Viteビルド
↓
GitHub Pagesへデプロイ
```

---

## 8. 料金設定の確認

GitHub PagesとGitHub Actionsの利用料金についてもChatGPTへ確認しました。

その後、GitHubの`Budgets and alerts`画面を自分で確認し、次の設定を行いました。

```text
Included usage alerts
→ On

Actions budget
→ $0

Stop usage
→ Yes

Current spending
→ $0
```

ChatGPTの回答だけで判断せず、実際のGitHub設定画面と利用状況も確認しています。

---

## 9. ChatGPTを使用する際に意識したこと

本プロジェクトでは、次の方針でChatGPTを使用しました。

- 完成コードをそのまま採用しない
- 自分でコードを入力する
- 各変数や処理の意味を質問する
- 実行結果を自分で確認する
- エラーのログを確認してから相談する
- 提案されたコードが既存コードと矛盾しないか確認する
- 自動テストで動作を検証する
- GitHub Actions上でも動作を確認する
- 料金や外部サービスの設定は実際の管理画面でも確認する

ChatGPTからの提案に誤りや、現在の実装順序と合わない部分があった場合は、その理由を考え、工程の順番やコードを修正しました。

例えば、小数点入力で使用する`waitingForNextInput`がまだ定義されていない段階で、小数点機能を追加しようとしていたため、開発順序を次のように変更しました。

```text
04 数字入力
↓
05 状態管理
↓
05-1 小数点入力
```

このように、AIの回答をそのまま受け入れるのではなく、現在のコードと照らし合わせながら利用しました。

---

## 10. ChatGPTが担当していないこと

次の作業は自分で行いました。

- 実際のコード入力
- ファイル作成
- コマンド実行
- ブラウザ上での動作確認
- エラーの再現
- Playwrightテストの実行
- Gitのコミット
- GitHubへのpush
- GitHub Pagesの設定
- GitHub Actionsログの確認
- 料金設定画面の確認
- 最終的な実装方針の判断

ChatGPTは、設計や問題解決を補助する役割として利用しています。

---

## Setup

リポジトリをクローンします。

```bash
git clone git@github.com:kizailent/calculator.git
```

プロジェクトへ移動します。

```bash
cd calculator
```

依存パッケージをインストールします。

```bash
npm install
```

開発サーバーを起動します。

```bash
npm run dev
```

ブラウザで次のURLを開きます。

```text
http://localhost:5173/
```

---

## Available Scripts

### 開発サーバー

```bash
npm run dev
```

### 本番ビルド

```bash
npm run build
```

ビルド結果は`dist`ディレクトリへ出力されます。

### 本番ビルドのプレビュー

```bash
npm run preview
```

### Playwrightテスト

```bash
npm test
```

### Chromiumのみでテスト

```bash
npm run test:chromium
```

### ブラウザを表示してテスト

```bash
npm run test:headed
```

### Playwright UIモード

```bash
npm run test:ui
```

### テストレポートを表示

```bash
npm run test:report
```

### ビルドとテストをまとめて実行

```bash
npm run test:all
```

### CI環境に近い条件で実行

```bash
CI=true npm run test:chromium
```

---

## Automated Testing

Playwrightを使用して、実際のブラウザ上でE2Eテストを実行しています。

テストファイルは次に配置しています。

```text
tests/calculator.spec.ts
```

テスト実行時は、PlaywrightがViteの開発サーバーを起動します。

---

## Continuous Deployment

`main`ブランチへpushすると、GitHub Actionsが次の処理を自動実行します。

```text
GitHubへpush
↓
依存パッケージをインストール
↓
Playwright用Chromiumをインストール
↓
自動テスト
↓
Viteで本番ビルド
↓
GitHub Pagesへデプロイ
```

自動テストが失敗した場合は、デプロイを実行しません。

ワークフローは次に配置しています。

```text
.github/workflows/deploy.yml
```

---

## Vite Base Path

GitHub Pagesでは、次のURLで公開しています。

```text
https://kizailent.github.io/calculator/
```

そのため、本番ビルド時は静的ファイルの参照先を次に設定しています。

```text
/calculator/
```

設定ファイル：

```text
vite.config.ts
```

開発サーバーでは`/`、本番ビルドとpreviewでは`/calculator/`を使用します。

---

## Project Structure

```text
calculator/
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

## Development Flow

このプロジェクトでは、実装手順や学んだ内容を`develop_flow`ディレクトリへ記録しています。

```text
環境構築
↓
HTMLによる画面作成
↓
CSSによるレイアウト
↓
数字入力
↓
状態管理
↓
小数点
↓
四則演算
↓
エラー処理
↓
Backspace・パーセント
↓
Playwrightによる自動テスト
↓
GitHub Actionsによる自動デプロイ
```

ChatGPTとの対話内容をそのまま保存するのではなく、実装工程として再構成し、自分が後から確認できる開発記録としてまとめています。

---

## Key Implementation Points

### 入力値を文字列で管理

入力中は、数値ではなく文字列として管理しています。

```typescript
let currentInput = "0";
```

これにより、次のような入力途中の状態を保持できます。

```text
12.
0.
```

計算する直前に、`Number`を使って数値へ変換します。

---

### 状態変数による計算管理

```typescript
let currentInput = "0";
let previousInput: number | null = null;
let selectedOperator: Operator | null = null;
let waitingForNextInput = false;
let hasError = false;
```

表示中の値、左辺、演算子、次の入力待ち、エラー状態をそれぞれ分けて管理しています。

---

### 演算子をユニオン型で制限

```typescript
type Operator = "+" | "-" | "*" | "/";
```

使用可能な演算子をTypeScriptの型で制限しています。

---

### マウスとキーボードで処理を共有

マウス操作とキーボード操作の両方から、同じ関数を呼び出しています。

```text
マウスで7をクリック
↓
inputNumber("7")

キーボードで7を入力
↓
inputNumber("7")
```

処理を共通化することで、入力方法による動作の違いを減らしています。

---

## What I Learned

このプロジェクトを通して、主に次の内容を学びました。

- HTMLの`data-*`属性
- DOM要素の取得
- クリックイベント
- キーボードイベント
- CSS Gridによるレイアウト
- レスポンシブデザイン
- TypeScriptの型定義
- ユニオン型
- `let`と`const`の使い分け
- 状態管理
- 関数への処理分割
- 小数計算の浮動小数点誤差
- エラー状態の管理
- E2Eテスト
- テーブル駆動テスト
- CSSセレクター
- PlaywrightのWebサーバー設定
- ローカル環境とCI環境の違い
- Viteの本番ビルド
- GitHub Actions
- GitHub Pages
- 継続的デプロイ
- AIへ適切に質問する方法
- AIの提案を検証する重要性
- エラーログを根拠に問題を切り分ける方法
- AIを学習支援・レビュー役として活用する方法

---

## Future Improvements

今後追加できる機能として、次のようなものがあります。

- `=`を繰り返した場合の再計算
- 正負切り替えボタン
- 計算履歴
- メモリー機能
- テーマ切り替え
- より大きな数値への対応
- アクセシビリティの改善
- Vitestによる単体テスト
- 計算処理とDOM処理のファイル分割
- GitHub Actions上での複数ブラウザテスト
- スクリーンショット比較テスト

---

## Author

GitHub: [kizailent](https://github.com/kizailent)