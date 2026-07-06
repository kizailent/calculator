# 06 四則演算を実装する

## 目的

これまでに作成した以下の状態を使って、実際の計算処理を実装する。

```typescript
let currentInput = "0";
let previousInput: number | null = null;
let selectedOperator: Operator | null = null;
let waitingForNextInput = false;
```

次の操作を実現する。

```text
2
↓
+
↓
3
↓
=
↓
5
```

この工程では、以下の機能を実装する。

- 足し算
- 引き算
- 掛け算
- 割り算
- イコールボタンによる計算
- Enterキーまたは`=`キーによる計算
- 演算子を続けて押した場合の連続計算
- 小数を含む計算
- 計算後に新しい数字を入力できる状態への変更

0で割った場合のエラー表示は、次の工程で実装する。

```text
develop_flow/07_error_handling.md
```

---

## 今回の計算例

### 足し算

```text
2 + 3 = 5
```

### 引き算

```text
8 - 5 = 3
```

### 掛け算

```text
4 × 6 = 24
```

### 割り算

```text
9 ÷ 3 = 3
```

### 小数の計算

```text
1.5 + 2.3 = 3.8
```

### 連続計算

```text
2 + 3 × 4 =
```

今回の計算機では、入力された順番に計算する。

```text
2 + 3
↓
5

5 × 4
↓
20
```

したがって、結果は次のようになる。

```text
20
```

一般的な数式の演算子優先順位を使った`14`ではない。

このような方式を、単純な電卓方式または逐次計算方式として扱う。

---

## 編集するファイル

```text
src/main.ts
develop_flow/06_calculation.md
```

基本的に、次のファイルは変更しない。

```text
index.html
src/style.css
```

ただし、イコールボタンのHTML属性が正しいか確認する。

---

# 1. 現在の状態を確認する

四則演算を実装する前に、以下の状態が定義されていることを確認する。

```typescript
type Operator = "+" | "-" | "*" | "/";

let currentInput = "0";
let previousInput: number | null = null;
let selectedOperator: Operator | null = null;
let waitingForNextInput = false;
```

それぞれの役割は以下の通り。

| 状態 | 内容 |
|---|---|
| `currentInput` | 現在表示している数字 |
| `previousInput` | 最初に入力した数字 |
| `selectedOperator` | 選択された演算子 |
| `waitingForNextInput` | 次の数字入力を待っているか |

---

# 2. 計算専用の関数を作る

2つの数字と演算子を受け取り、計算結果を返す関数を作る。

```typescript
function calculate(
  left: number,
  right: number,
  operator: Operator,
): number {
  switch (operator) {
    case "+":
      return left + right;

    case "-":
      return left - right;

    case "*":
      return left * right;

    case "/":
      return left / right;
  }
}
```

---

## 引数

```typescript
left: number
```

演算子より左側の数字。

```typescript
right: number
```

演算子より右側の数字。

```typescript
operator: Operator
```

実行する演算子。

---

## 例

```typescript
calculate(2, 3, "+");
```

結果：

```text
5
```

```typescript
calculate(8, 5, "-");
```

結果：

```text
3
```

```typescript
calculate(4, 6, "*");
```

結果：

```text
24
```

```typescript
calculate(9, 3, "/");
```

結果：

```text
3
```

---

# 3. `switch`文の意味

`switch`文は、値に応じて実行する処理を分けるために使用する。

```typescript
switch (operator) {
  case "+":
    return left + right;

  case "-":
    return left - right;
}
```

例えば、`operator`が`"+"`の場合は、次が実行される。

```typescript
return left + right;
```

`return`が実行されると、その時点で関数の処理が終了する。

そのため、各`case`に`break`を書く必要はない。

---

# 4. 計算結果を表示用の文字列へ変換する

JavaScriptでは、小数計算によって次のような誤差が表示される場合がある。

```typescript
0.1 + 0.2
```

内部的な結果：

```text
0.30000000000000004
```

表示を読みやすくするため、結果を整形する関数を作る。

```typescript
function formatResult(value: number): string {
  return Number.parseFloat(
    value.toFixed(10),
  ).toString();
}
```

---

## `toFixed(10)`

小数点以下を最大10桁まで持つ文字列へ変換する。

```typescript
(0.30000000000000004).toFixed(10)
```

結果：

```text
"0.3000000000"
```

---

## `Number.parseFloat`

文字列を数値へ変換する。

```typescript
Number.parseFloat("0.3000000000")
```

結果：

```text
0.3
```

末尾にある不要な0が削除される。

---

## `toString`

最後に、表示画面で使える文字列へ戻す。

```typescript
0.3.toString()
```

結果：

```text
"0.3"
```

---

# 5. イコールボタンを取得する

`index.html`に、次のイコールボタンがあることを確認する。

```html
<button
  type="button"
  data-action="equals"
>
  ＝
</button>
```

TypeScriptから取得する。

```typescript
const equalsButton =
  document.querySelector<HTMLButtonElement>(
    'button[data-action="equals"]',
  );
```

---

# 6. イコール処理を行う関数を作る

イコールが押されたときの処理を関数にまとめる。

```typescript
function performCalculation(): void {
  if (
    previousInput === null ||
    selectedOperator === null ||
    waitingForNextInput
  ) {
    return;
  }

  const rightInput = Number(currentInput);

  const result = calculate(
    previousInput,
    rightInput,
    selectedOperator,
  );

  currentInput = formatResult(result);
  previousInput = null;
  selectedOperator = null;
  waitingForNextInput = true;

  updateDisplay();
}
```

---

# 7. 計算できる状態か確認する

```typescript
if (
  previousInput === null ||
  selectedOperator === null ||
  waitingForNextInput
) {
  return;
}
```

次のいずれかの場合は計算しない。

```text
previousInputがnull
→ 最初の数字が保存されていない

selectedOperatorがnull
→ 演算子が選択されていない

waitingForNextInputがtrue
→ 2つ目の数字がまだ入力されていない
```

例えば、次の状態では計算しない。

```text
初期状態で=
```

```text
2を入力した直後に=
```

```text
2 + の直後に=
```

---

# 8. 右側の数字を取得する

```typescript
const rightInput = Number(currentInput);
```

`currentInput`は文字列として管理しているため、計算前に数値へ変換する。

例：

```typescript
currentInput = "3.5";
```

変換後：

```typescript
rightInput = 3.5;
```

---

# 9. 計算関数を呼び出す

```typescript
const result = calculate(
  previousInput,
  rightInput,
  selectedOperator,
);
```

例えば、次の状態を考える。

```text
previousInput = 2
rightInput = 3
selectedOperator = "+"
```

実行される計算：

```typescript
calculate(2, 3, "+");
```

結果：

```text
5
```

---

# 10. 計算結果を現在の表示値へ保存する

```typescript
currentInput = formatResult(result);
```

計算結果を表示用の文字列に変換し、`currentInput`へ保存する。

例：

```text
result = 5
```

変換後：

```text
currentInput = "5"
```

---

# 11. 計算後の状態を初期化する

計算が完了したら、最初の数字と演算子をリセットする。

```typescript
previousInput = null;
selectedOperator = null;
```

計算結果は`currentInput`に残す。

状態は次のようになる。

```text
currentInput = "5"
previousInput = null
selectedOperator = null
waitingForNextInput = true
```

---

# 12. 次の数字で結果を置き換える

```typescript
waitingForNextInput = true;
```

計算結果を表示した後に数字を入力した場合、新しい計算を開始する。

例：

```text
2 + 3 =
↓
5
↓
7を入力
↓
7
```

次のようにはならない。

```text
57
```

`inputNumber`では、`waitingForNextInput`が`true`の場合に表示を置き換える処理がある。

```typescript
if (waitingForNextInput) {
  currentInput = number;
  waitingForNextInput = false;
  updateDisplay();
  return;
}
```

---

# 13. 表示を更新する

計算結果を`currentInput`へ保存した後、画面を更新する。

```typescript
updateDisplay();
```

これによって、計算結果が表示欄へ反映される。

---

# 14. イコールボタンにクリックイベントを追加する

取得したイコールボタンに、クリックイベントを追加する。

```typescript
equalsButton?.addEventListener(
  "click",
  performCalculation,
);
```

ボタンをクリックすると、`performCalculation`が実行される。

次のように書くこともできる。

```typescript
equalsButton?.addEventListener("click", () => {
  performCalculation();
});
```

今回のように、引数を渡さず関数をそのまま実行するだけなら、次の書き方でよい。

```typescript
equalsButton?.addEventListener(
  "click",
  performCalculation,
);
```

---

# 15. キーボード操作へイコール処理を追加する

既存の`keydown`イベントには、数字、小数点、演算子の処理がある。

```typescript
if (/^[0-9]$/.test(event.key)) {
  inputNumber(event.key);
} else if (event.key === ".") {
  inputDecimal();
} else if (isOperator(event.key)) {
  selectOperator(event.key);
}
```

イコール処理を追加する。

```typescript
if (/^[0-9]$/.test(event.key)) {
  inputNumber(event.key);
} else if (event.key === ".") {
  inputDecimal();
} else if (isOperator(event.key)) {
  selectOperator(event.key);
} else if (
  event.key === "Enter" ||
  event.key === "="
) {
  performCalculation();
}
```

これにより、次の両方で計算できる。

```text
Enter
=
```

---

# 16. 演算子を続けて入力した場合の処理を追加する

05では、2つ目の数字を入力した後に演算子を押した場合、連続計算を行わず処理を終了していた。

例：

```text
2 + 3 ×
```

これを、次のように計算できるように変更する。

```text
2 + 3
↓
5

次の演算子として×を保存する
```

---

# 17. `selectOperator`を修正する

05で作成した`selectOperator`を、次のように変更する。

```typescript
function selectOperator(
  nextOperator: Operator,
): void {
  const inputValue = Number(currentInput);

  if (
    selectedOperator !== null &&
    waitingForNextInput
  ) {
    selectedOperator = nextOperator;
    return;
  }

  if (previousInput === null) {
    previousInput = inputValue;
  } else if (selectedOperator !== null) {
    const result = calculate(
      previousInput,
      inputValue,
      selectedOperator,
    );

    const formattedResult =
      formatResult(result);

    currentInput = formattedResult;
    previousInput = Number(formattedResult);

    updateDisplay();
  }

  selectedOperator = nextOperator;
  waitingForNextInput = true;
}
```

---

# 18. 現在の入力値を数値へ変換する

```typescript
const inputValue = Number(currentInput);
```

演算子が押された時点の表示値を数値として取得する。

---

# 19. 演算子だけを変更する場合

```typescript
if (
  selectedOperator !== null &&
  waitingForNextInput
) {
  selectedOperator = nextOperator;
  return;
}
```

次の操作を考える。

```text
9
↓
+
↓
*
```

まだ2つ目の数字を入力していないため、計算は行わない。

演算子だけを変更する。

```text
previousInput = 9
selectedOperator = "*"
waitingForNextInput = true
```

---

# 20. 最初の演算子の場合

```typescript
if (previousInput === null) {
  previousInput = inputValue;
}
```

まだ最初の数字が保存されていない場合は、現在の入力値を保存する。

例：

```text
12 +
```

状態：

```text
previousInput = 12
selectedOperator = "+"
waitingForNextInput = true
```

---

# 21. 連続計算を実行する

```typescript
else if (selectedOperator !== null) {
```

既に最初の数字と演算子があり、2つ目の数字も入力されている場合は、途中結果を計算する。

```typescript
const result = calculate(
  previousInput,
  inputValue,
  selectedOperator,
);
```

例：

```text
previousInput = 2
inputValue = 3
selectedOperator = "+"
```

結果：

```text
5
```

---

# 22. 途中結果を表示する

```typescript
const formattedResult =
  formatResult(result);

currentInput = formattedResult;
previousInput = Number(formattedResult);

updateDisplay();
```

途中結果を表示すると同時に、次の計算の左側の数字として保存する。

例：

```text
2 + 3 ×
```

`×`を押した時点の状態：

```text
currentInput = "5"
previousInput = 5
selectedOperator = "*"
waitingForNextInput = true
```

その後に`4`を入力すると、

```text
currentInput = "4"
previousInput = 5
selectedOperator = "*"
waitingForNextInput = false
```

`=`を押した結果：

```text
20
```

---

# 23. 次の演算子を保存する

```typescript
selectedOperator = nextOperator;
waitingForNextInput = true;
```

途中計算の後、今回押された演算子を次の演算子として保存する。

---

# 24. `main.ts`内の配置

コードは次の順番で整理する。

```text
1. CSSの読み込み

2. 型定義
   - Operator

3. HTML要素の取得
   - display
   - numberButtons
   - operatorButtons
   - decimalButton
   - equalsButton

4. 状態
   - currentInput
   - previousInput
   - selectedOperator
   - waitingForNextInput
   - MAX_INPUT_LENGTH

5. 表示・計算関数
   - updateDisplay
   - formatResult
   - calculate

6. 入力処理
   - inputNumber
   - inputDecimal
   - selectOperator
   - performCalculation

7. 判定・補助関数
   - isOperator
   - getButtonFromKey

8. マウスイベント
   - 数字ボタン
   - 小数点ボタン
   - 演算子ボタン
   - イコールボタン

9. キーボードイベント
   - keydown
   - keyup
   - blur
```

---

# 今回追加する主要コード

## 計算関数

```typescript
function calculate(
  left: number,
  right: number,
  operator: Operator,
): number {
  switch (operator) {
    case "+":
      return left + right;

    case "-":
      return left - right;

    case "*":
      return left * right;

    case "/":
      return left / right;
  }
}
```

## 結果の整形

```typescript
function formatResult(value: number): string {
  return Number.parseFloat(
    value.toFixed(10),
  ).toString();
}
```

## イコール処理

```typescript
function performCalculation(): void {
  if (
    previousInput === null ||
    selectedOperator === null ||
    waitingForNextInput
  ) {
    return;
  }

  const rightInput = Number(currentInput);

  const result = calculate(
    previousInput,
    rightInput,
    selectedOperator,
  );

  currentInput = formatResult(result);
  previousInput = null;
  selectedOperator = null;
  waitingForNextInput = true;

  updateDisplay();
}
```

## イコールボタンのイベント

```typescript
equalsButton?.addEventListener(
  "click",
  performCalculation,
);
```

## キーボード操作

```typescript
if (/^[0-9]$/.test(event.key)) {
  inputNumber(event.key);
} else if (event.key === ".") {
  inputDecimal();
} else if (isOperator(event.key)) {
  selectOperator(event.key);
} else if (
  event.key === "Enter" ||
  event.key === "="
) {
  performCalculation();
}
```

---

# 自分で実装すること

- [ ] `calculate`関数を作る
- [ ] 足し算を実装する
- [ ] 引き算を実装する
- [ ] 掛け算を実装する
- [ ] 割り算を実装する
- [ ] `formatResult`関数を作る
- [ ] イコールボタンを取得する
- [ ] `performCalculation`関数を作る
- [ ] 計算可能な状態か確認する
- [ ] 右側の数字を数値へ変換する
- [ ] 計算結果を`currentInput`へ保存する
- [ ] 計算後の状態を初期化する
- [ ] イコールボタンへクリックイベントを追加する
- [ ] Enterキーで計算できるようにする
- [ ] `=`キーで計算できるようにする
- [ ] `selectOperator`へ連続計算を追加する
- [ ] 途中結果を画面へ表示する
- [ ] 途中結果を次の左側の数字として保存する

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

## テスト1：足し算

操作：

```text
2 + 3 =
```

期待結果：

```text
5
```

---

## テスト2：引き算

操作：

```text
8 - 5 =
```

期待結果：

```text
3
```

---

## テスト3：掛け算

操作：

```text
4 × 6 =
```

期待結果：

```text
24
```

---

## テスト4：割り算

操作：

```text
9 ÷ 3 =
```

期待結果：

```text
3
```

---

## テスト5：小数の足し算

操作：

```text
1.5 + 2.3 =
```

期待結果：

```text
3.8
```

---

## テスト6：小数計算の誤差

操作：

```text
0.1 + 0.2 =
```

期待結果：

```text
0.3
```

次のように表示されないことを確認する。

```text
0.30000000000000004
```

---

## テスト7：計算後に新しい数字を入力する

操作：

```text
2 + 3 =
```

表示：

```text
5
```

続けて次を入力する。

```text
7
```

期待結果：

```text
7
```

次の表示にならないことを確認する。

```text
57
```

---

## テスト8：計算結果を次の計算に使う

操作：

```text
2 + 3 =
```

表示：

```text
5
```

続けて入力する。

```text
× 4 =
```

期待結果：

```text
20
```

---

## テスト9：連続計算

操作：

```text
2 + 3 × 4 =
```

期待される途中表示：

```text
×を押した時点
5
```

最終結果：

```text
20
```

---

## テスト10：演算子の変更

操作：

```text
9 + × 2 =
```

期待結果：

```text
18
```

`+`の後に2つ目の数字を入力していないため、演算子が`×`へ変更される。

---

## テスト11：キーボード操作

キーボードで入力する。

```text
12.5 + 7.5 Enter
```

期待結果：

```text
20
```

確認事項：

- [ ] 数字キーで数字を入力できる
- [ ] `.`で小数点を入力できる
- [ ] `+`で足し算を選択できる
- [ ] Enterで計算できる
- [ ] 対応するボタンの押下表現も動作する

---

## テスト12：不完全な状態でイコールを押す

初期状態で次を押す。

```text
=
```

期待結果：

```text
0
```

次の操作も確認する。

```text
2 +
=
```

期待結果：

```text
2
```

エラーにならず、計算も行わない。

---

# うまく動かない場合

## イコールを押しても計算されない

イコールボタンを取得できているか確認する。

HTML：

```html
<button
  type="button"
  data-action="equals"
>
  ＝
</button>
```

TypeScript：

```typescript
document.querySelector<HTMLButtonElement>(
  'button[data-action="equals"]',
);
```

---

## `previousInput`が`null`のままになる

演算子を押したときに、次が実行されているか確認する。

```typescript
previousInput = Number(currentInput);
```

または、修正後の`selectOperator`に次があるか確認する。

```typescript
if (previousInput === null) {
  previousInput = inputValue;
}
```

---

## Enterキーで計算されない

`keydown`の条件を確認する。

```typescript
event.key === "Enter"
```

先頭文字は大文字である。

---

## 掛け算や割り算が動かない

HTMLの内部値を確認する。

掛け算：

```html
<button data-operator="*">×</button>
```

割り算：

```html
<button data-operator="/">÷</button>
```

画面表示には`×`や`÷`を使えるが、`data-operator`には次を使用する。

```text
*
/
```

---

## 計算結果の後に数字が追加される

`performCalculation`内で、次が設定されているか確認する。

```typescript
waitingForNextInput = true;
```

---

## 連続計算されない

05で使用していた、次の処理が残っていないか確認する。

```typescript
console.info(
  "連続計算は次の工程で実装します",
);
return;
```

この部分は削除し、計算処理へ置き換える。

---

## 数字が2回入力される

キーボードイベントが複数登録されていないか確認する。

```text
keydownイベントが複数存在していないか
```

数字、演算子、小数点、イコールの処理は、基本的に1つの`keydown`へまとめる。

---

# 現段階では未対応の機能

この工程では、以下はまだ実装しない。

```text
0で割った場合のError表示
ACボタン
1文字削除
パーセント計算
正負の切り替え
=を繰り返した場合の再計算
```

これらは後の工程で追加する。

---

# 発生したエラー

## エラー内容

```text
ここにエラーメッセージを記録する
```

## 発生した現象

```text
例：
イコールを押しても表示が変わらない
連続計算で途中結果が表示されない
計算後に数字を入力すると末尾へ追加される
```

## 原因

ここに原因を記録する。

## 解決方法

ここに実施した解決方法を記録する。

---

# 今回学んだこと

作業後、自分が理解した内容を追記する。

例：

- 計算処理を専用の関数へ分離できる
- `switch`文で演算子ごとの処理を分けられる
- 入力中の文字列は、計算前に数値へ変換する必要がある
- 計算結果は表示用の文字列へ戻す必要がある
- イコールを押した後は状態をリセットする必要がある
- 途中計算の結果を次の左側の数字として使える
- 単純な計算機では入力された順番に計算できる
- マウスとキーボードから同じ計算関数を呼び出せる
- 小数計算には浮動小数点誤差が発生する場合がある

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
git add src/main.ts develop_flow/06_calculation.md
```

コミットする。

```bash
git commit -m "Add calculator operations"
```

GitHubへpushする。

```bash
git push
```

---

# 完了条件

以下をすべて満たしたら、この工程は完了とする。

- 足し算ができる
- 引き算ができる
- 掛け算ができる
- 割り算ができる
- 小数を含む計算ができる
- イコールボタンで計算できる
- Enterキーで計算できる
- `=`キーで計算できる
- 計算後に新しい数字を入力できる
- 計算結果を次の計算に利用できる
- 演算子を続けて入力した場合に途中計算される
- 数字入力前なら演算子を変更できる
- 不完全な状態でイコールを押してもエラーにならない
- キーボードの押下表現が引き続き動作する
- Consoleとターミナルにエラーがない
- 開発フローへ結果を記録した
- Gitへコミットした
- GitHubへpushした

---

# 次の工程

次は、0で割った場合や異常な数値になった場合のエラー処理を追加する。

```text
develop_flow/07_error_handling.md
```

追加予定の機能：

```text
8 ÷ 0
↓
Error

ACを押す
↓
0へ戻る
```