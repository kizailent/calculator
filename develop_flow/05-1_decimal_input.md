# 05-1 小数点入力を実装する

## 目的

小数点ボタンまたはキーボードの`.`キーを押したときに、小数を入力できるようにする。

次の入力を実現する。

```text
1
↓
.
↓
5
```

表示結果：

```text
1.5
```

同じ数値の中に小数点を2つ以上入力できないようにする。

```text
1.2.3
```

のような不正な入力は防止する。

---

## 今回実装する機能

- 小数点ボタンをクリックできる
- キーボードの`.`キーでも入力できる
- `0`の状態で小数点を押すと`0.`になる
- 数字の後に小数点を追加できる
- 同じ入力値に小数点を2つ以上追加しない
- 演算子を押した直後に小数点を入力すると`0.`から始まる
- マウスとキーボードで同じ関数を使用する

---

## 入力例

### 初期状態で小数点を入力する

```text
初期表示
0
```

`.`を入力する。

```text
0.
```

続けて`5`を入力する。

```text
0.5
```

---

### 整数の後に小数点を入力する

```text
12
```

`.`を入力する。

```text
12.
```

続けて`3`を入力する。

```text
12.3
```

---

### 小数点を複数回入力する

```text
12.3
```

さらに`.`を入力する。

```text
12.3
```

2つ目の小数点は追加されない。

---

## 編集するファイル

```text
src/main.ts
develop_flow/04-1_decimal_input.md
```

基本的に、次のファイルは変更しない。

```text
index.html
src/style.css
```

ただし、小数点ボタンの属性が正しいか確認する。

---

# 1. 小数点ボタンのHTMLを確認する

`index.html`に、次のような小数点ボタンがあることを確認する。

```html
<button type="button" data-action="decimal">.</button>
```

TypeScriptでは、次の属性を使って小数点ボタンを取得する。

```text
data-action="decimal"
```

---

# 2. 小数点入力専用の関数を作る

`src/main.ts`に、小数点を入力する関数を追加する。

```typescript
function inputDecimal(): void {
  if (waitingForNextInput) {
    currentInput = "0.";
    waitingForNextInput = false;
    updateDisplay();
    return;
  }

  if (currentInput.includes(".")) {
    return;
  }

  if (currentInput.length >= MAX_INPUT_LENGTH) {
    return;
  }

  currentInput += ".";
  updateDisplay();
}
```

この関数では、次の順番で状態を確認する。

```text
演算子を押した直後か
↓
すでに小数点が含まれているか
↓
最大文字数に達しているか
↓
小数点を追加する
```

---

# 3. 演算子を押した直後の処理

次の操作を考える。

```text
12
↓
+
↓
.
```

演算子を押した直後は、`waitingForNextInput`が`true`になっている。

```typescript
if (waitingForNextInput) {
  currentInput = "0.";
  waitingForNextInput = false;
  updateDisplay();
  return;
}
```

この場合、小数点だけを表示するのではなく、`0.`から入力を開始する。

表示結果：

```text
0.
```

その後に`5`を入力すると、次の表示になる。

```text
0.5
```

---

## なぜ`.`だけにしないのか

数値として分かりやすい表示にするためである。

```text
.
```

よりも、

```text
0.
```

の方が、小数を入力していることが明確になる。

---

# 4. 小数点が既にあるか確認する

同じ数値に小数点を2つ以上追加しないようにする。

```typescript
if (currentInput.includes(".")) {
  return;
}
```

## `includes`

文字列の中に、指定した文字列が含まれているか確認する。

```typescript
"12.3".includes(".")
```

結果：

```text
true
```

```typescript
"123".includes(".")
```

結果：

```text
false
```

すでに小数点が含まれている場合は、何も追加せず処理を終了する。

---

# 5. 最大入力文字数を確認する

数字入力と同様に、小数点も最大文字数へ含める。

```typescript
if (currentInput.length >= MAX_INPUT_LENGTH) {
  return;
}
```

例えば、最大文字数を15文字としている場合、小数点も1文字として数える。

```text
123.45
```

文字数：

```text
6文字
```

内訳：

```text
1
2
3
.
4
5
```

---

# 6. 小数点を現在の入力値へ追加する

小数点がまだ含まれていない場合は、末尾へ追加する。

```typescript
currentInput += ".";
```

例えば、現在の入力が次の場合、

```text
12
```

小数点を追加すると、

```text
12.
```

になる。

最後に表示を更新する。

```typescript
updateDisplay();
```

---

# 7. 小数点ボタンを取得する

小数点ボタンをTypeScriptから取得する。

```typescript
const decimalButton =
  document.querySelector<HTMLButtonElement>(
    'button[data-action="decimal"]',
  );
```

## セレクターの意味

```text
button要素のうち
data-action属性がdecimalであるもの
```

対象となるHTML：

```html
<button type="button" data-action="decimal">.</button>
```

---

# 8. 小数点ボタンにクリック処理を追加する

取得した小数点ボタンへ、クリックイベントを追加する。

```typescript
decimalButton?.addEventListener("click", () => {
  inputDecimal();
});
```

## `?.`

オプショナルチェーンと呼ばれる。

```typescript
decimalButton?.addEventListener(...)
```

は、`decimalButton`が存在するときだけ処理を実行する。

小数点ボタンが見つからず`null`になった場合でも、エラーにならない。

---

# 9. キーボード入力へ小数点処理を追加する

既存の`keydown`イベントには、数字入力処理がある。

```typescript
if (/^[0-9]$/.test(event.key)) {
  inputNumber(event.key);
}
```

その後に、小数点の処理を追加する。

```typescript
if (/^[0-9]$/.test(event.key)) {
  inputNumber(event.key);
} else if (event.key === ".") {
  inputDecimal();
}
```

演算子の状態管理まで実装済みの場合は、次のような構造になる。

```typescript
if (/^[0-9]$/.test(event.key)) {
  inputNumber(event.key);
} else if (event.key === ".") {
  inputDecimal();
} else if (isOperator(event.key)) {
  selectOperator(event.key);
}
```

---

# 10. キーボードの押下表現との連携

以前作成したキーとボタンの対応表に、次が含まれていることを確認する。

```typescript
".": 'button[data-action="decimal"]',
```

これにより、`.`キーを押したときに小数点ボタンへ`keyboard-active`が付く。

処理の流れは次の通り。

```text
.キーを押す
↓
小数点ボタンにkeyboard-activeを追加
↓
inputDecimalを実行
↓
表示画面に小数点を追加
```

---

# 11. マウスとキーボードで同じ関数を使う

マウス操作：

```typescript
decimalButton?.addEventListener("click", () => {
  inputDecimal();
});
```

キーボード操作：

```typescript
if (event.key === ".") {
  inputDecimal();
}
```

どちらも同じ`inputDecimal`関数を使用する。

```text
小数点ボタン
  └─ inputDecimal

キーボードの.
  └─ inputDecimal
```

同じ処理を共通化することで、マウスとキーボードで異なる動作になることを防ぐ。

---

# 12. `main.ts`内の配置

コードは、次の順番で整理する。

```text
1. CSSの読み込み

2. 型定義

3. HTML要素の取得
   - display
   - numberButtons
   - decimalButton

4. 状態
   - currentInput
   - waitingForNextInput
   - MAX_INPUT_LENGTH

5. 表示関数
   - updateDisplay

6. 入力関数
   - inputNumber
   - inputDecimal

7. マウスイベント
   - 数字ボタン
   - 小数点ボタン

8. キーボードイベント
   - keydown
   - keyup
   - blur
```

`inputDecimal`は、`inputNumber`の近くに配置すると入力処理を探しやすい。

---

# 今回追加する主要なコード

## 小数点ボタンの取得

```typescript
const decimalButton =
  document.querySelector<HTMLButtonElement>(
    'button[data-action="decimal"]',
  );
```

## 小数点入力関数

```typescript
function inputDecimal(): void {
  if (waitingForNextInput) {
    currentInput = "0.";
    waitingForNextInput = false;
    updateDisplay();
    return;
  }

  if (currentInput.includes(".")) {
    return;
  }

  if (currentInput.length >= MAX_INPUT_LENGTH) {
    return;
  }

  currentInput += ".";
  updateDisplay();
}
```

## クリックイベント

```typescript
decimalButton?.addEventListener("click", () => {
  inputDecimal();
});
```

## キーボード処理

```typescript
if (/^[0-9]$/.test(event.key)) {
  inputNumber(event.key);
} else if (event.key === ".") {
  inputDecimal();
}
```

---

# 自分で実装すること

- [ ] 小数点ボタンの`data-action`を確認する
- [ ] 小数点ボタンをTypeScriptから取得する
- [ ] `inputDecimal`関数を作る
- [ ] 初期状態で`.`を押したら`0.`になるようにする
- [ ] 既に小数点が含まれていたら入力を無視する
- [ ] 最大文字数を超えないようにする
- [ ] 小数点ボタンへクリックイベントを追加する
- [ ] キーボードの`.`キーから`inputDecimal`を呼び出す
- [ ] マウスとキーボードで同じ関数を使う
- [ ] 演算子の直後に`.`を入力したら`0.`になることを確認する

---

# 動作確認

開発サーバーが起動していない場合は実行する。

```bash
npm run dev
```

ブラウザで次を開く。

```text
http://localhost:5173/
```

---

## テスト1：初期状態で小数点を入力する

操作：

```text
.
5
```

期待結果：

```text
0.5
```

---

## テスト2：整数の後に小数点を入力する

操作：

```text
1
2
.
3
```

期待結果：

```text
12.3
```

---

## テスト3：小数点を複数回入力する

操作：

```text
1
.
2
.
3
```

期待結果：

```text
1.23
```

2回目の小数点は無視される。

次の表示にならないことを確認する。

```text
1.2.3
```

---

## テスト4：小数点ボタンを何度も押す

操作：

```text
.
.
.
```

期待結果：

```text
0.
```

---

## テスト5：小数点の後に0を入力する

操作：

```text
.
0
5
```

期待結果：

```text
0.05
```

小数点以下の先頭の0は削除しない。

---

## テスト6：演算子の直後に小数点を入力する

状態管理まで実装済みの場合、次を操作する。

```text
1
2
+
.
5
```

期待される2つ目の入力：

```text
0.5
```

内部状態：

```text
previousInput = 12
currentInput = "0.5"
selectedOperator = "+"
waitingForNextInput = false
```

---

## テスト7：キーボード入力

キーボードで次を入力する。

```text
3.14
```

期待結果：

```text
3.14
```

確認事項：

- [ ] `.`キーで小数点ボタンが押されたように表示される
- [ ] 表示画面に小数点が追加される
- [ ] キーを離すとボタンが元に戻る

---

## テスト8：最大文字数

最大文字数まで数字を入力した後、`.`を押す。

期待結果：

```text
小数点は追加されない
```

表示画面が設定した最大文字数を超えないことを確認する。

---

# うまく動かない場合

## 小数点ボタンを押しても反応しない

HTMLを確認する。

```html
<button type="button" data-action="decimal">.</button>
```

TypeScriptのセレクターを確認する。

```typescript
'button[data-action="decimal"]'
```

属性名と値が一致している必要がある。

---

## 小数点を何度も入力できてしまう

次の処理があるか確認する。

```typescript
if (currentInput.includes(".")) {
  return;
}
```

---

## 初期状態で`.`だけ表示される

次のように書いていないか確認する。

```typescript
currentInput += ".";
```

初期状態では`currentInput`が`"0"`なので、本来は`"0."`になる。

`currentInput`を空文字列で初期化している場合は、初期値を確認する。

```typescript
let currentInput = "0";
```

---

## 演算子の後に前の数字へ小数点が追加される

次の処理が`inputDecimal`の先頭にあるか確認する。

```typescript
if (waitingForNextInput) {
  currentInput = "0.";
  waitingForNextInput = false;
  updateDisplay();
  return;
}
```

---

## キーボードで2回入力される

複数の`keydown`イベント内で`inputDecimal()`を呼び出していないか確認する。

小数点入力処理は、1つの`keydown`へまとめる。

---

# 発生したエラー

## エラー内容

```text
ここにエラーメッセージを記録する
```

## 発生した現象

```text
例：
小数点を複数入力できてしまう
キーボードでは動くがクリックでは動かない
演算子の後に小数点を押すと前の数字へ追加される
```

## 原因

ここに原因を記録する。

## 解決方法

ここに実施した解決方法を記録する。

---

# 今回学んだこと

作業後、自分が理解した内容を追記する。

例：

- `includes`で文字列に特定の文字が含まれているか確認できる
- 小数点は同じ数値に1つだけ入力できるように制御する必要がある
- 演算子を押した直後の小数は`0.`から始める
- 小数点も入力文字数の1文字として数える
- マウスとキーボードから同じ関数を呼び出せる
- `?.`を使うと、要素が存在するときだけ処理を実行できる
- 表示中の値を文字列で管理すると、入力途中の`12.`も保持できる

---

# Git差分の確認

変更状況を確認する。

```bash
git status
```

TypeScriptの変更を確認する。

```bash
git diff src/main.ts
```

すべての変更を確認する。

```bash
git diff
```

---

# Gitコミット

変更したファイルをステージングする。

```bash
git add src/main.ts develop_flow/04-1_decimal_input.md
```

コミットする。

```bash
git commit -m "Add decimal input"
```

GitHubへpushする。

```bash
git push
```

---

# 完了条件

以下をすべて満たしたら、この工程は完了とする。

- 小数点ボタンをクリックして小数を入力できる
- キーボードの`.`でも小数を入力できる
- 初期状態から`0.`を入力できる
- 整数の後へ小数点を追加できる
- 同じ数値に小数点を2つ以上追加できない
- 小数点以下の0を入力できる
- 演算子の直後は`0.`から入力を開始できる
- 最大文字数を超えない
- キーボードの押下表現が引き続き動作する
- Consoleとターミナルにエラーがない
- 開発フローへ結果を記録した
- Gitへコミットした
- GitHubへpushした

---

# 次の工程

次は、最初の数字、演算子、次の数字を保存する状態管理を実装する。

```text
develop_flow/05_state_management.md
```

その後、実際の四則演算へ進む。

```text
develop_flow/06_calculation.md
```