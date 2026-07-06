# 07 エラー処理とACを実装する

## 目的

計算できない操作や、JavaScriptで扱えない大きさの計算結果が発生した場合に、計算機が壊れないようにする。

また、ACボタンを押すことで、計算途中の状態やエラー状態をすべて初期化できるようにする。

今回実装する主な動作は次の通り。

```text
8 ÷ 0 =
↓
Error
```

エラー表示後に数字を入力した場合は、新しい計算を開始する。

```text
Error
↓
7を入力
↓
7
```

ACを押した場合は、どのような状態でも初期状態へ戻す。

```text
AC
↓
0
```

---

## 今回実装する機能

- 0で割った場合に`Error`を表示する
- `Infinity`や`NaN`をそのまま表示しない
- エラー状態を変数で管理する
- エラー後に数字を入力すると、新しい計算を開始する
- エラー後に小数点を入力すると、`0.`から開始する
- ACボタンで状態をすべて初期化する
- `Escape`キーまたは`Delete`キーでもACを実行する
- 連続計算中の0除算にも対応する

---

## 編集するファイル

```text
src/main.ts
develop_flow/07_error_handling.md
```

必要に応じて、以下も確認する。

```text
index.html
```

---

# 1. JavaScriptで0除算するとどうなるか

JavaScriptでは、0で割っても自動的に例外は発生しない。

```typescript
8 / 0
```

結果：

```text
Infinity
```

また、次の計算では、

```typescript
0 / 0
```

結果は次のようになる。

```text
NaN
```

## `Infinity`

数値が無限大になったことを表す特殊な値。

## `NaN`

`Not a Number`の略で、数値として扱えない結果を表す。

計算機の利用者にそのまま表示するより、今回のアプリでは統一して次を表示する。

```text
Error
```

---

# 2. エラー状態を管理する変数を追加する

現在の状態変数の近くに、エラー状態を表す変数を追加する。

```typescript
let hasError = false;
```

状態全体は次のようになる。

```typescript
let currentInput = "0";
let previousInput: number | null = null;
let selectedOperator: Operator | null = null;
let waitingForNextInput = false;
let hasError = false;
```

## `hasError`

```text
false
→ 通常状態

true
→ Errorを表示している状態
```

画面に`Error`と表示されているかどうかを、文字列だけで判断するのではなく、専用の状態として管理する。

---

# 3. 計算関数で0除算を検出する

これまでの`calculate`関数は、計算結果として必ず`number`を返していた。

```typescript
function calculate(
  left: number,
  right: number,
  operator: Operator,
): number {
```

0除算を検出した場合に`null`を返せるよう、戻り値の型を変更する。

```typescript
function calculate(
  left: number,
  right: number,
  operator: Operator,
): number | null {
  switch (operator) {
    case "+":
      return left + right;

    case "-":
      return left - right;

    case "*":
      return left * right;

    case "/":
      if (right === 0) {
        return null;
      }

      return left / right;
  }
}
```

---

## `number | null`

この関数は、次のどちらかを返す。

```text
number
→ 正常に計算できた

null
→ 計算できなかった
```

今回は、0除算の場合に`null`を返す。

---

## 0かどうかを確認する

```typescript
if (right === 0) {
  return null;
}
```

割り算の右側が0の場合は、割り算を実行せずに処理を終了する。

```text
8 ÷ 0
↓
calculateがnullを返す
↓
Errorを表示する
```

---

# 4. エラー表示専用の関数を作る

エラーが発生したときの状態変更を、1つの関数へまとめる。

```typescript
function showError(): void {
  currentInput = "Error";
  previousInput = null;
  selectedOperator = null;
  waitingForNextInput = true;
  hasError = true;

  updateDisplay();
}
```

---

## 表示内容を変更する

```typescript
currentInput = "Error";
```

表示用の値を`Error`へ変更する。

---

## 計算途中の状態を削除する

```typescript
previousInput = null;
selectedOperator = null;
```

エラーが発生した計算は続行できないため、保存していた左側の数字と演算子を削除する。

---

## 次の入力を待つ状態にする

```typescript
waitingForNextInput = true;
```

エラー表示後に新しい数字を入力したとき、`Error7`などと末尾へ追加されないようにする。

---

## エラー状態を記録する

```typescript
hasError = true;
```

現在がエラー状態であることを記録する。

---

# 5. AC用のリセット関数を作る

計算機を初期状態へ戻す関数を作る。

```typescript
function resetCalculator(): void {
  currentInput = "0";
  previousInput = null;
  selectedOperator = null;
  waitingForNextInput = false;
  hasError = false;

  updateDisplay();
}
```

初期状態は次の通り。

```text
currentInput = "0"
previousInput = null
selectedOperator = null
waitingForNextInput = false
hasError = false
```

---

# 6. イコール処理にエラー判定を追加する

これまでの`performCalculation`では、`calculate`の結果をそのまま整形していた。

計算結果が`null`または有限の数値でない場合は、`showError`を呼び出す。

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

  if (
    result === null ||
    !Number.isFinite(result)
  ) {
    showError();
    return;
  }

  currentInput = formatResult(result);
  previousInput = null;
  selectedOperator = null;
  waitingForNextInput = true;
  hasError = false;

  updateDisplay();
}
```

---

## `result === null`

0除算など、`calculate`が計算不能と判断した場合である。

---

## `Number.isFinite`

```typescript
Number.isFinite(result)
```

値が通常の有限な数値か確認する。

次の場合は`false`になる。

```text
Infinity
-Infinity
NaN
```

今回は`!`を付けているため、

```typescript
!Number.isFinite(result)
```

は、有限な数値ではない場合に`true`になる。

---

# 7. 連続計算にもエラー判定を追加する

`selectOperator`内でも途中計算を行っている。

例えば、次の操作を考える。

```text
8 ÷ 0 +
```

`+`を押した時点で、`8 ÷ 0`の途中計算が行われる。

そのため、`selectOperator`にも同じエラー判定が必要である。

```typescript
function selectOperator(
  nextOperator: Operator,
): void {
  if (hasError) {
    return;
  }

  const inputValue = Number(currentInput);

  if (
    waitingForNextInput &&
    selectedOperator !== null
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

    if (
      result === null ||
      !Number.isFinite(result)
    ) {
      showError();
      return;
    }

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

## エラー状態では演算子を無視する

```typescript
if (hasError) {
  return;
}
```

画面に`Error`と表示されている状態で演算子を押しても、計算は開始しない。

数字またはACを入力して、新しい状態へ移行する。

---

# 8. エラー後の数字入力を処理する

`inputNumber`の先頭に、エラー状態の確認を追加する。

```typescript
function inputNumber(number: string): void {
  if (hasError) {
    resetCalculator();
  }

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

## 処理の流れ

```text
Errorを表示中
↓
7を入力
↓
resetCalculatorを実行
↓
初期状態の0へ戻る
↓
7を入力
↓
表示は7
```

`resetCalculator()`を呼び出した後も、関数の処理は続く。

そのため、押した数字がそのまま新しい入力になる。

---

# 9. エラー後の小数点入力を処理する

`inputDecimal`にもエラー状態の確認を追加する。

```typescript
function inputDecimal(): void {
  if (hasError) {
    resetCalculator();
  }

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

エラー状態で`.`を入力すると、次の表示になる。

```text
0.
```

---

# 10. ACボタンを取得する

`index.html`に、次のACボタンがあることを確認する。

```html
<button
  type="button"
  data-action="clear"
>
  AC
</button>
```

TypeScriptから取得する。

```typescript
const clearButton =
  document.querySelector<HTMLButtonElement>(
    'button[data-action="clear"]',
  );
```

---

# 11. ACボタンにクリックイベントを追加する

```typescript
clearButton?.addEventListener(
  "click",
  resetCalculator,
);
```

ACボタンをクリックすると、`resetCalculator`が実行される。

次のように書いても同じ意味になる。

```typescript
clearButton?.addEventListener("click", () => {
  resetCalculator();
});
```

引数を渡す必要がないため、関数をそのまま渡せる。

---

# 12. キーボード操作にAC処理を追加する

以前作成したキーとボタンの対応表では、次のキーをACへ対応させている。

```typescript
Escape: 'button[data-action="clear"]',
Delete: 'button[data-action="clear"]',
```

既存の`keydown`処理へ、ACの処理を追加する。

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
} else if (
  event.key === "Escape" ||
  event.key === "Delete"
) {
  resetCalculator();
}
```

---

# 13. `main.ts`の構造

この工程が完了した時点では、次の順番で整理する。

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
   - clearButton

4. 状態
   - currentInput
   - previousInput
   - selectedOperator
   - waitingForNextInput
   - hasError
   - MAX_INPUT_LENGTH

5. 表示・状態関数
   - updateDisplay
   - showError
   - resetCalculator

6. 計算関数
   - calculate
   - formatResult
   - performCalculation

7. 入力処理
   - inputNumber
   - inputDecimal
   - selectOperator

8. 補助関数
   - isOperator
   - getButtonFromKey

9. マウスイベント

10. キーボードイベント
```

---

# 今回追加する主要コード

## エラー状態

```typescript
let hasError = false;
```

## エラー表示

```typescript
function showError(): void {
  currentInput = "Error";
  previousInput = null;
  selectedOperator = null;
  waitingForNextInput = true;
  hasError = true;

  updateDisplay();
}
```

## リセット

```typescript
function resetCalculator(): void {
  currentInput = "0";
  previousInput = null;
  selectedOperator = null;
  waitingForNextInput = false;
  hasError = false;

  updateDisplay();
}
```

## 0除算の検出

```typescript
case "/":
  if (right === 0) {
    return null;
  }

  return left / right;
```

## 計算結果の確認

```typescript
if (
  result === null ||
  !Number.isFinite(result)
) {
  showError();
  return;
}
```

---

# 自分で実装すること

- [ ] `hasError`を追加する
- [ ] `calculate`の戻り値を`number | null`に変更する
- [ ] 0除算の場合に`null`を返す
- [ ] `showError`関数を作る
- [ ] `resetCalculator`関数を作る
- [ ] イコール計算にエラー判定を追加する
- [ ] 連続計算にエラー判定を追加する
- [ ] エラー後の数字入力に対応する
- [ ] エラー後の小数点入力に対応する
- [ ] ACボタンを取得する
- [ ] ACボタンへクリックイベントを追加する
- [ ] Escapeキーでリセットできるようにする
- [ ] Deleteキーでリセットできるようにする

---

# 動作確認

開発サーバーを起動する。

```bash
npm run dev
```

ブラウザで次を開く。

```text
http://localhost:5173/
```

---

## テスト1：0除算

操作：

```text
8 ÷ 0 =
```

期待結果：

```text
Error
```

---

## テスト2：0割る0

操作：

```text
0 ÷ 0 =
```

期待結果：

```text
Error
```

---

## テスト3：エラー後に数字を入力する

操作：

```text
8 ÷ 0 =
```

表示：

```text
Error
```

続けて、

```text
7
```

期待結果：

```text
7
```

次のようにならないことを確認する。

```text
Error7
```

---

## テスト4：エラー後に小数点を入力する

操作：

```text
8 ÷ 0 =
```

続けて、

```text
.
5
```

期待結果：

```text
0.5
```

---

## テスト5：ACボタン

操作：

```text
123
```

ACを押す。

期待結果：

```text
0
```

内部状態：

```text
previousInput = null
selectedOperator = null
waitingForNextInput = false
hasError = false
```

---

## テスト6：計算途中でAC

操作：

```text
12 + 5
```

ACを押す。

期待結果：

```text
0
```

続けて数字を入力すると、新しい計算を開始できる。

---

## テスト7：エラー表示中にAC

操作：

```text
8 ÷ 0 =
```

表示：

```text
Error
```

ACを押す。

期待結果：

```text
0
```

---

## テスト8：連続計算中の0除算

操作：

```text
8 ÷ 0 +
```

期待結果：

```text
Error
```

`+`を押した時点で途中計算が行われるため、その時点でエラーを表示する。

---

## テスト9：キーボードのEscape

操作：

```text
123
```

`Escape`キーを押す。

期待結果：

```text
0
```

ACボタンの押下表現も動作することを確認する。

---

## テスト10：キーボードのDelete

操作：

```text
456
```

`Delete`キーを押す。

期待結果：

```text
0
```

---

## テスト11：通常の割り算

操作：

```text
8 ÷ 2 =
```

期待結果：

```text
4
```

エラー処理追加後も、正常な割り算が動作することを確認する。

---

# うまく動かない場合

## `Infinity`と表示される

`calculate`の割り算処理を確認する。

```typescript
case "/":
  if (right === 0) {
    return null;
  }

  return left / right;
```

---

## TypeScriptでresultに関するエラーが出る

`calculate`が`number | null`を返すようになったため、計算結果を使う前に`null`確認が必要である。

```typescript
if (result === null) {
  showError();
  return;
}
```

確認後でなければ、`formatResult(result)`へ渡せない。

---

## ACを押しても表示だけしか戻らない

`resetCalculator`で、表示以外の状態も初期化しているか確認する。

```typescript
previousInput = null;
selectedOperator = null;
waitingForNextInput = false;
hasError = false;
```

---

## エラー後に数字が入力できない

`inputNumber`の先頭を確認する。

```typescript
if (hasError) {
  resetCalculator();
}
```

この後に`return`を書かないことに注意する。

```typescript
if (hasError) {
  resetCalculator();
  return;
}
```

としてしまうと、最初に押した数字が入力されない。

---

## エラー後に演算子を押すと動いてしまう

`selectOperator`の先頭を確認する。

```typescript
if (hasError) {
  return;
}
```

---

# 発生したエラー

## エラー内容

```text
ここにエラーメッセージを記録する
```

## 発生した現象

```text
例：
0で割るとInfinityが表示された
Error後に数字を押しても変化しなかった
AC後も前回の演算子が残っていた
```

## 原因

ここに原因を記録する。

## 解決方法

ここに実施した解決方法を記録する。

---

# 今回学んだこと

作業後、自分が理解した内容を追記する。

例：

- JavaScriptでは0除算で例外ではなく`Infinity`が返る
- 計算不能な場合は`null`を返す設計にできる
- `Number.isFinite`で有限な数値か確認できる
- エラー表示と内部状態の初期化を関数へまとめられる
- エラー状態をbooleanで管理できる
- ACでは表示だけでなく、計算途中の状態も初期化する必要がある
- 同じエラー判定を、イコール計算と連続計算の両方へ入れる必要がある

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
git add src/main.ts develop_flow/07_error_handling.md
```

コミットする。

```bash
git commit -m "Add calculator error handling"
```

GitHubへpushする。

```bash
git push
```

---

# 完了条件

以下をすべて満たしたら、この工程は完了とする。

- 0で割ると`Error`が表示される
- `Infinity`や`NaN`が画面に表示されない
- エラー後に数字を入力すると新しい計算を開始できる
- エラー後に小数点を入力できる
- ACで計算機全体を初期化できる
- 計算途中でもACが動作する
- エラー表示中でもACが動作する
- EscapeキーでACを実行できる
- DeleteキーでACを実行できる
- 連続計算中の0除算も処理できる
- 通常の計算は引き続き正常に動作する
- Consoleとターミナルにエラーがない
- 開発フローへ結果を記録した
- Gitへコミットした
- GitHubへpushした

---

# 次の工程

次は、1文字削除ボタンを実装する。

```text
develop_flow/07-1_backspace.md
```

その後、パーセント処理を実装する。

```text
develop_flow/07-2_percent.md
```

補助機能が完成した後、全体のテストへ進む。

```text
develop_flow/08_testing.md
```