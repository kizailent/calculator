# 05 計算状態を管理する

## 目的

四則演算を実装する前に、計算機が現在どのような状態なのかをTypeScriptで管理できるようにする。

例えば、次の操作を考える。

```text
12 + 5
```

この操作中、計算機は以下の情報を記憶する必要がある。

```text
最初の数字
→ 12

選択された演算子
→ +

現在入力している数字
→ 5

次の数字を待っているか
→ false
```

この工程では、まだ実際の計算結果は求めない。

```text
12 + 5 = 17
```

の`17`を求める処理は、次の四則演算の工程で実装する。

---

## 今回実装する機能

- 現在入力中の数字を管理する
- 最初に入力された数字を保存する
- 選択された演算子を保存する
- 演算子を押した後、新しい数字で表示を置き換える
- マウスで演算子を選択できる
- キーボードで演算子を選択できる
- 数字を入力する前に演算子を変更できる
- Consoleで現在の状態を確認できる

---

## 編集するファイル

```text
src/main.ts
develop_flow/05_state_management.md
```

この工程では、基本的に以下のファイルは変更しない。

```text
index.html
src/style.css
```

---

# 1. 計算機に必要な状態を考える

この計算機では、次の4つの状態を管理する。

```typescript
let currentInput = "0";
let previousInput: number | null = null;
let selectedOperator: Operator | null = null;
let waitingForNextInput = false;
```

それぞれの役割は以下の通り。

| 変数 | 保存する情報 |
|---|---|
| `currentInput` | 現在画面に表示している数字 |
| `previousInput` | 最初に入力された数字 |
| `selectedOperator` | 選択された演算子 |
| `waitingForNextInput` | 次の数字の入力を待っているか |

---

# 2. 状態の変化を確認する

次の操作を例に考える。

```text
12 + 5
```

## 初期状態

```text
currentInput = "0"
previousInput = null
selectedOperator = null
waitingForNextInput = false
```

## `1`を入力

```text
currentInput = "1"
previousInput = null
selectedOperator = null
waitingForNextInput = false
```

## `2`を入力

```text
currentInput = "12"
previousInput = null
selectedOperator = null
waitingForNextInput = false
```

## `+`を入力

```text
currentInput = "12"
previousInput = 12
selectedOperator = "+"
waitingForNextInput = true
```

この時点では、表示画面には引き続き`12`が表示される。

## `5`を入力

```text
currentInput = "5"
previousInput = 12
selectedOperator = "+"
waitingForNextInput = false
```

演算子を押した後の最初の数字なので、`12`の末尾へ追加するのではなく、`5`で置き換える。

---

# 3. 演算子の型を定義する

計算機で使用する演算子は、次の4種類である。

```text
+
-
*
/
```

TypeScriptで演算子専用の型を作る。

```typescript
type Operator = "+" | "-" | "*" | "/";
```

## 型エイリアス

```typescript
type Operator = ...
```

は、新しい型に名前を付ける書き方である。

今回の`Operator`型には、次の4つの文字列だけを代入できる。

```typescript
const operator1: Operator = "+";
const operator2: Operator = "-";
const operator3: Operator = "*";
const operator4: Operator = "/";
```

次のような値は代入できない。

```typescript
const operator: Operator = "%";
```

TypeScriptがエラーを表示する。

演算子として使用できる文字列を制限することで、誤った値が入るのを防げる。

---

# 4. 状態を保存する変数を追加する

`src/main.ts`に、既に次の変数がある。

```typescript
let currentInput = "0";
const MAX_INPUT_LENGTH = 15;
```

この付近に、計算状態を表す変数を追加する。

```typescript
type Operator = "+" | "-" | "*" | "/";

let currentInput = "0";
let previousInput: number | null = null;
let selectedOperator: Operator | null = null;
let waitingForNextInput = false;

const MAX_INPUT_LENGTH = 15;
```

---

## `number | null`

```typescript
let previousInput: number | null = null;
```

`previousInput`には、次のどちらかが入る。

```text
number
→ 最初に入力された数字

null
→ まだ最初の数字が保存されていない
```

初期状態では、最初の数字がまだないため`null`にする。

---

## `Operator | null`

```typescript
let selectedOperator: Operator | null = null;
```

`selectedOperator`には、次のいずれかが入る。

```text
+
-
*
/
null
```

初期状態では、演算子がまだ選択されていないため`null`にする。

---

## `boolean`

```typescript
let waitingForNextInput = false;
```

`boolean`は、次のどちらかを表す型である。

```text
true
false
```

今回の意味は以下の通り。

```text
true
→ 演算子が押され、次の数字を待っている

false
→ 現在の数字へ入力を追加する
```

---

# 5. 数字入力処理を変更する

前の工程で、数字入力関数を作成した。

```typescript
function inputNumber(number: string): void {
  if (currentInput.length >= MAX_INPUT_LENGTH) {
    return;
  }

  if (currentInput === "0") {
    currentInput = number;
  } else {
    currentInput += number;
  }

  updateDisplay();
}
```

演算子を押した後は、現在の表示を新しい数字で置き換える必要がある。

そのため、`waitingForNextInput`を使った処理を追加する。

```typescript
function inputNumber(number: string): void {
  if (waitingForNextInput) {
    currentInput = number;
    waitingForNextInput = false;
    updateDisplay();
    return;
  }

  if (currentInput.length >= MAX_INPUT_LENGTH) {
    return;
  }

  if (currentInput === "0") {
    currentInput = number;
  } else {
    currentInput += number;
  }

  updateDisplay();
}
```

---

## 演算子を押した直後の場合

```typescript
if (waitingForNextInput) {
```

`waitingForNextInput`が`true`の場合、演算子を押した直後である。

例えば、表示が`12`の状態で`+`を押すと、次の状態になる。

```text
currentInput = "12"
waitingForNextInput = true
```

ここで`5`を入力した場合、次のように置き換える。

```typescript
currentInput = number;
```

結果：

```text
currentInput = "5"
```

次のようにならないようにする。

```text
125
```

---

## 次の数字を待つ状態を終了する

```typescript
waitingForNextInput = false;
```

最初の数字が入力されたため、次から入力される数字は末尾へ追加する。

例：

```text
+を押す
↓
waitingForNextInput = true

5を入力
↓
currentInput = "5"
waitingForNextInput = false

6を入力
↓
currentInput = "56"
```

---

## 早期return

```typescript
updateDisplay();
return;
```

新しい数字で置き換えた後、通常の数字追加処理まで実行しないようにする。

`return`がない場合、同じ数字が再度追加される可能性がある。

---

# 6. 演算子かどうかを判定する関数を作る

HTMLの`dataset`やキーボードの`event.key`から取得した値は、通常の`string`として扱われる。

その値が四則演算の演算子であるか確認する関数を作る。

```typescript
function isOperator(
  value: string | undefined,
): value is Operator {
  return (
    value === "+" ||
    value === "-" ||
    value === "*" ||
    value === "/"
  );
}
```

---

## 引数

```typescript
value: string | undefined
```

値として次のどちらかを受け取る。

```text
string
→ 演算子などの文字列

undefined
→ data-operator属性が存在しない
```

---

## 戻り値

```typescript
value is Operator
```

これはTypeScriptの型ガードと呼ばれる。

この関数が`true`を返した場合、TypeScriptは`value`を`Operator`型として扱う。

つまり、次のいずれかであることが保証される。

```text
+
-
*
/
```

---

# 7. 演算子を選択する関数を作る

演算子を押したときの処理を、関数としてまとめる。

```typescript
function selectOperator(
  nextOperator: Operator,
): void {
  if (
    waitingForNextInput &&
    selectedOperator !== null
  ) {
    selectedOperator = nextOperator;
    logState();
    return;
  }

  if (
    previousInput !== null &&
    !waitingForNextInput
  ) {
    console.info(
      "連続計算は次の工程で実装します",
    );
    return;
  }

  previousInput = Number(currentInput);
  selectedOperator = nextOperator;
  waitingForNextInput = true;

  logState();
}
```

---

# 8. 最初の数字を保存する

```typescript
previousInput = Number(currentInput);
```

`currentInput`は文字列なので、数値へ変換して保存する。

例：

```typescript
currentInput = "12";
previousInput = Number(currentInput);
```

結果：

```text
previousInput = 12
```

## `Number()`

文字列を数値へ変換する。

```typescript
Number("12")
```

結果：

```text
12
```

```typescript
Number("3.5")
```

結果：

```text
3.5
```

---

# 9. 演算子を保存する

```typescript
selectedOperator = nextOperator;
```

押された演算子を状態として保存する。

例：

```text
+を押した
↓
selectedOperator = "+"
```

---

# 10. 次の数字を待つ状態にする

```typescript
waitingForNextInput = true;
```

演算子を押した後、次に入力される数字は、現在の表示へ追加せず置き換える。

```text
12
↓
+を押す
↓
waitingForNextInput = true
↓
5を入力
↓
表示を5に置き換える
```

---

# 11. 数字入力前なら演算子を変更できるようにする

次の操作を考える。

```text
12
↓
+
↓
間違えていたので*
```

まだ2つ目の数字を入力していないため、演算子だけを変更する。

```typescript
if (
  waitingForNextInput &&
  selectedOperator !== null
) {
  selectedOperator = nextOperator;
  logState();
  return;
}
```

状態は次のように変化する。

```text
変更前
previousInput = 12
selectedOperator = "+"
waitingForNextInput = true
```

```text
変更後
previousInput = 12
selectedOperator = "*"
waitingForNextInput = true
```

最初の数字は変更しない。

---

# 12. 連続計算はこの工程では実行しない

次の操作を考える。

```text
2 + 3 *
```

本格的な計算機では、`2 + 3`を計算してから次の演算へ進むことがある。

しかし、この工程ではまだ計算処理を作っていない。

そのため、2つ目の数字を入力した後に演算子を押した場合は、一度処理を停止する。

```typescript
if (
  previousInput !== null &&
  !waitingForNextInput
) {
  console.info(
    "連続計算は次の工程で実装します",
  );
  return;
}
```

連続計算は、四則演算を実装するときに追加する。

---

# 13. 状態確認用の関数を作る

画面には`currentInput`しか表示されないため、他の状態はConsoleで確認する。

```typescript
function logState(): void {
  console.log({
    currentInput,
    previousInput,
    selectedOperator,
    waitingForNextInput,
  });
}
```

Consoleには次のような情報が表示される。

```text
{
  currentInput: "12",
  previousInput: 12,
  selectedOperator: "+",
  waitingForNextInput: true
}
```

この関数は、開発中の確認用である。

完成後に不要であれば削除できる。

---

# 14. 演算子ボタンをすべて取得する

HTMLの演算子ボタンには、`data-operator`属性が付いている。

```html
<button type="button" data-operator="+">＋</button>
```

演算子ボタンをすべて取得する。

```typescript
const operatorButtons =
  document.querySelectorAll<HTMLButtonElement>(
    "button[data-operator]",
  );
```

対象となるボタンは以下である。

```text
＋
−
×
÷
```

---

# 15. 演算子ボタンにクリック処理を追加する

取得したすべての演算子ボタンへ、クリックイベントを設定する。

```typescript
operatorButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const operatorValue =
      button.dataset.operator;

    if (!isOperator(operatorValue)) {
      return;
    }

    selectOperator(operatorValue);
  });
});
```

---

## `dataset.operator`

HTML：

```html
<button data-operator="+">＋</button>
```

TypeScript：

```typescript
button.dataset.operator
```

取得結果：

```text
"+"
```

---

## 演算子か確認する

```typescript
if (!isOperator(operatorValue)) {
  return;
}
```

取得した値が次のどれかでなければ、処理を終了する。

```text
+
-
*
/
```

---

## 共通関数を呼び出す

```typescript
selectOperator(operatorValue);
```

マウス操作でも、演算子選択専用の関数を使用する。

---

# 16. キーボードで演算子を選択する

前の工程で作成した`keydown`処理には、数字入力が追加されている。

```typescript
if (/^[0-9]$/.test(event.key)) {
  inputNumber(event.key);
}
```

演算子の場合は、`selectOperator`を呼び出す。

```typescript
if (/^[0-9]$/.test(event.key)) {
  inputNumber(event.key);
} else if (isOperator(event.key)) {
  selectOperator(event.key);
}
```

---

## 処理の流れ

```text
数字キーの場合
→ inputNumber

演算子キーの場合
→ selectOperator
```

マウスとキーボードで同じ関数を使用する。

```text
演算子ボタンのクリック
  └─ selectOperator

キーボードの演算子
  └─ selectOperator
```

---

# 17. `main.ts`の構造を整理する

この工程が完了した時点で、`src/main.ts`は次の順番に整理する。

```text
1. CSSの読み込み

2. 型定義
   - Operator

3. HTML要素の取得
   - display
   - numberButtons
   - operatorButtons

4. 状態
   - currentInput
   - previousInput
   - selectedOperator
   - waitingForNextInput
   - MAX_INPUT_LENGTH

5. 状態・表示に関する関数
   - updateDisplay
   - logState

6. 入力処理
   - inputNumber
   - isOperator
   - selectOperator

7. キーボード用関数
   - getButtonFromKey

8. マウスイベント
   - 数字ボタン
   - 演算子ボタン

9. キーボードイベント
   - keydown
   - keyup
   - blur
```

役割ごとにコードをまとめることで、後から処理を探しやすくする。

---

# 今回追加する主要なコード

## 型と状態

```typescript
type Operator = "+" | "-" | "*" | "/";

let currentInput = "0";
let previousInput: number | null = null;
let selectedOperator: Operator | null = null;
let waitingForNextInput = false;

const MAX_INPUT_LENGTH = 15;
```

## 演算子判定

```typescript
function isOperator(
  value: string | undefined,
): value is Operator {
  return (
    value === "+" ||
    value === "-" ||
    value === "*" ||
    value === "/"
  );
}
```

## 演算子選択

```typescript
function selectOperator(
  nextOperator: Operator,
): void {
  if (
    waitingForNextInput &&
    selectedOperator !== null
  ) {
    selectedOperator = nextOperator;
    logState();
    return;
  }

  if (
    previousInput !== null &&
    !waitingForNextInput
  ) {
    console.info(
      "連続計算は次の工程で実装します",
    );
    return;
  }

  previousInput = Number(currentInput);
  selectedOperator = nextOperator;
  waitingForNextInput = true;

  logState();
}
```

---

# 自分で実装すること

- [ ] `Operator`型を定義する
- [ ] `previousInput`を追加する
- [ ] `selectedOperator`を追加する
- [ ] `waitingForNextInput`を追加する
- [ ] `inputNumber`に置き換え処理を追加する
- [ ] 演算子判定関数を作る
- [ ] 演算子選択関数を作る
- [ ] 最初の数字を数値として保存する
- [ ] 選択された演算子を保存する
- [ ] 次の数字を待つ状態へ変更する
- [ ] 演算子を押し直した場合に変更できるようにする
- [ ] 状態確認用の関数を作る
- [ ] 演算子ボタンをすべて取得する
- [ ] 演算子ボタンへクリックイベントを追加する
- [ ] キーボード操作から演算子選択関数を呼び出す

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

開発者ツールのConsoleも開く。

```text
F12
→ Console
```

---

## テスト1：最初の数字を保存する

操作：

```text
1
2
+
```

期待される状態：

```text
currentInput = "12"
previousInput = 12
selectedOperator = "+"
waitingForNextInput = true
```

表示画面：

```text
12
```

---

## テスト2：次の数字で表示を置き換える

操作：

```text
1
2
+
5
```

期待される状態：

```text
currentInput = "5"
previousInput = 12
selectedOperator = "+"
waitingForNextInput = false
```

表示画面：

```text
5
```

次のようになっていないことを確認する。

```text
125
```

---

## テスト3：2つ目の数字を続けて入力する

操作：

```text
1
2
+
5
6
```

期待される状態：

```text
currentInput = "56"
previousInput = 12
selectedOperator = "+"
waitingForNextInput = false
```

表示画面：

```text
56
```

---

## テスト4：数字入力前に演算子を変更する

操作：

```text
9
+
*
```

期待される状態：

```text
currentInput = "9"
previousInput = 9
selectedOperator = "*"
waitingForNextInput = true
```

最初の数字は変わらず、演算子だけが変更される。

---

## テスト5：キーボード操作

キーボードで入力する。

```text
8
/
2
```

期待される状態：

```text
currentInput = "2"
previousInput = 8
selectedOperator = "/"
waitingForNextInput = false
```

対応するボタンの押下表現も動作することを確認する。

---

## テスト6：0を2つ目の数字として入力する

操作：

```text
8
/
0
```

期待される状態：

```text
currentInput = "0"
previousInput = 8
selectedOperator = "/"
waitingForNextInput = false
```

この工程では、まだ0除算のエラーは表示しない。

エラー処理は四則演算の工程で追加する。

---

# Consoleの見方

次の操作を行う。

```text
12 +
```

Consoleに、次のようなオブジェクトが表示されることを確認する。

```text
{
  currentInput: "12",
  previousInput: 12,
  selectedOperator: "+",
  waitingForNextInput: true
}
```

次に`5`を入力した場合、必要に応じて`inputNumber`内でも`logState()`を呼び出して確認する。

確認が終わったら、不要なログは削除してもよい。

---

# うまく動かない場合

## 演算子を押しても状態が変わらない

HTMLの`data-operator`属性を確認する。

```html
<button type="button" data-operator="+">＋</button>
```

TypeScript側のセレクターを確認する。

```typescript
"button[data-operator]"
```

---

## `data-operator`の値が全角になっている

次のようにすると、TypeScriptの演算子型と一致しない。

```html
data-operator="＋"
```

内部値には半角記号を使用する。

```html
data-operator="+"
```

表示部分は全角でもよい。

```html
<button data-operator="+">＋</button>
```

---

## 演算子の後に入力すると数字が追加される

次の処理が`inputNumber`の先頭にあるか確認する。

```typescript
if (waitingForNextInput) {
  currentInput = number;
  waitingForNextInput = false;
  updateDisplay();
  return;
}
```

---

## キーボードでは動かない

既存の`keydown`処理に、次があるか確認する。

```typescript
else if (isOperator(event.key)) {
  selectOperator(event.key);
}
```

---

## マウスでは2回処理される

演算子ボタンに複数回`click`イベントを設定していないか確認する。

```text
operatorButtons.forEachが複数存在していないか
```

同じ処理は1か所にまとめる。

---

# 発生したエラー

## エラー内容

```text
ここにエラーメッセージを記録する
```

## 発生した現象

```text
例：
演算子を押しても次の数字で表示が置き換わらない
previousInputに数字が保存されない
キーボード操作だけ反応しない
```

## 原因

ここに原因を記録する。

## 解決方法

ここに実施した解決方法を記録する。

---

# 今回学んだこと

作業後、自分が理解した内容を追記する。

例：

- 計算機は画面の表示以外にも内部状態を持っている
- `null`を使って、値がまだ設定されていない状態を表せる
- `boolean`を使って、次の入力を待っているか管理できる
- 型エイリアスで使用できる演算子を制限できる
- 演算子を押した後は、次の数字で表示を置き換える必要がある
- マウスとキーボードで同じ関数を利用できる
- 型ガードを使うと、文字列を特定の型として絞り込める
- 状態と画面表示は別のものである
- Consoleを使って画面に見えない状態を確認できる

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

開発フローを含む変更を確認する。

```bash
git diff
```

---

# Gitコミット

変更したファイルをステージングする。

```bash
git add src/main.ts develop_flow/05_state_management.md
```

コミットする。

```bash
git commit -m "Add calculator state management"
```

GitHubへpushする。

```bash
git push
```

---

# 完了条件

以下をすべて満たしたら、この工程は完了とする。

- 最初の数字を`previousInput`へ保存できる
- 選択した演算子を`selectedOperator`へ保存できる
- 演算子を押すと次の数字待ちになる
- 次の数字で表示内容が置き換わる
- 2文字目以降は末尾へ追加される
- 数字入力前なら演算子を変更できる
- マウスとキーボードの両方で演算子を選択できる
- Consoleで計算機の状態を確認できる
- 数字ボタンの押下表現が引き続き動作する
- 演算子ボタンの押下表現が引き続き動作する
- Consoleとターミナルにエラーがない
- 開発フローへ結果を記録した
- Gitへコミットした
- GitHubへpushした

---

# 次の工程

次は、保存した2つの数字と演算子を使って、実際に四則演算を行う。

```text
develop_flow/06_calculation.md
```

次の機能を実装する。

```text
+
-
*
/
=
```

0で割った場合のエラー処理は、その後の工程で追加する。

```text
develop_flow/07_error_handling.md
```