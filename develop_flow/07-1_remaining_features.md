# 07-1 残りの計算機機能を実装する

## 目的

現在の計算機には、次の機能が実装されている。

- 数字入力
- 小数点入力
- 四則演算
- 連続計算
- イコール
- 0除算のエラー処理
- ACによる初期化
- キーボード操作

この工程では、まだ処理が実装されていない次の機能を追加する。

- 1文字削除ボタン
- キーボードのBackspace
- パーセントボタン
- キーボードの`%`

この工程が完了すると、現在HTMLに配置されているすべてのボタンが動作する。

---

## 編集するファイル

```text
src/main.ts
develop_flow/07-1_remaining_features.md
```

HTMLの属性が正しいか確認するため、必要に応じて次も確認する。

```text
index.html
```

---

# 1. 今回実装する削除機能

削除ボタンまたはBackspaceキーを押したとき、現在入力中の最後の1文字を削除する。

例：

```text
123
↓
Backspace
↓
12
```

小数点も1文字として削除する。

```text
12.5
↓
Backspace
↓
12.
```

さらに削除する。

```text
12.
↓
Backspace
↓
12
```

最後の1文字を削除した結果、何もなくなる場合は`0`へ戻す。

```text
7
↓
Backspace
↓
0
```

---

# 2. 削除ボタンのHTMLを確認する

`index.html`に、次のようなボタンがあることを確認する。

```html
<button
  type="button"
  data-action="delete"
>
  ←
</button>
```

重要なのは、次の属性である。

```html
data-action="delete"
```

TypeScriptでは、この属性を使ってボタンを取得する。

---

# 3. 削除ボタンを取得する

他のHTML要素を取得している場所に、次を追加する。

```typescript
const deleteButton =
  document.querySelector<HTMLButtonElement>(
    'button[data-action="delete"]',
  );
```

`deleteButton`の型は、次のどちらかになる。

```text
HTMLButtonElement
null
```

対象のボタンが見つからない場合は`null`になる。

そのため、イベント登録ではオプショナルチェーンを使用する。

```typescript
deleteButton?.addEventListener(
  "click",
  deleteLastCharacter,
);
```

---

# 4. 1文字削除関数を作る

次の関数を追加する。

```typescript
function deleteLastCharacter(): void {
  if (hasError) {
    resetCalculator();
    return;
  }

  if (waitingForNextInput) {
    return;
  }

  const nextInput = currentInput.slice(0, -1);

  if (
    nextInput === "" ||
    nextInput === "-"
  ) {
    currentInput = "0";
  } else {
    currentInput = nextInput;
  }

  updateDisplay();
}
```

---

# 5. エラー表示中の削除処理

```typescript
if (hasError) {
  resetCalculator();
  return;
}
```

画面に`Error`と表示されている状態で削除を押した場合、文字列を1文字ずつ削除するのではなく、計算機を初期状態へ戻す。

```text
Error
↓
Backspace
↓
0
```

状態は次のようになる。

```text
currentInput = "0"
previousInput = null
selectedOperator = null
waitingForNextInput = false
hasError = false
```

---

# 6. 次の入力待ち状態では削除しない

```typescript
if (waitingForNextInput) {
  return;
}
```

例えば、次の操作を考える。

```text
12
↓
+
```

この時点では、

```text
currentInput = "12"
previousInput = 12
selectedOperator = "+"
waitingForNextInput = true
```

となっている。

ここでBackspaceを押しても、保存済みの左辺`12`は削除しない。

```text
12 +
↓
Backspace
↓
表示は12のまま
```

次の数字を入力すると、通常どおり右辺の入力が始まる。

---

# 7. `slice(0, -1)`の意味

```typescript
const nextInput = currentInput.slice(0, -1);
```

`slice`は文字列の一部を取り出すメソッドである。

```typescript
"123".slice(0, -1);
```

結果：

```text
"12"
```

`0`は文字列の先頭を表す。

`-1`は最後の文字の位置を表す。

したがって、

```typescript
slice(0, -1)
```

は、

> 先頭から、最後の1文字を除いた部分まで取得する

という意味になる。

例：

```typescript
"12.5".slice(0, -1);
```

結果：

```text
"12."
```

```typescript
"12.".slice(0, -1);
```

結果：

```text
"12"
```

---

# 8. すべて削除された場合は0へ戻す

```typescript
if (
  nextInput === "" ||
  nextInput === "-"
) {
  currentInput = "0";
}
```

例えば、

```typescript
"7".slice(0, -1);
```

結果は空文字列になる。

```text
""
```

画面を空欄にはせず、`0`を表示する。

負の計算結果も考える。

```text
-5
↓
Backspace
↓
-
```

`"-"`だけでは数値として成立しないため、この場合も`0`へ戻す。

---

# 9. 削除ボタンへイベントを追加する

```typescript
deleteButton?.addEventListener(
  "click",
  deleteLastCharacter,
);
```

削除ボタンをクリックすると、`deleteLastCharacter`が実行される。

---

# 10. キーボードのBackspaceへ処理を追加する

キーとボタンの対応表には、既に次がある。

```typescript
"Backspace": 'button[data-action="delete"]',
```

そのため、`keydown`イベントの条件分岐に処理を追加する。

```typescript
} else if (event.key === "Backspace") {
  deleteLastCharacter();
}
```

現在のコードでは、対応するボタンが見つかった後に次を実行している。

```typescript
event.preventDefault();
```

そのため、計算機を操作中にBackspaceによるページ移動が発生するのを防げる。

---

# 11. パーセント機能の動作を決める

パーセントの計算方法は、演算子によって変える。

## 単独でパーセントを押した場合

```text
50
↓
%
↓
0.5
```

現在の値を100で割る。

```text
50 ÷ 100 = 0.5
```

---

## 掛け算の場合

```text
200 × 10 %
```

`10%`を`0.1`へ変換する。

その後、イコールを押す。

```text
200 × 0.1
↓
20
```

---

## 割り算の場合

```text
200 ÷ 10 %
```

`10%`を`0.1`へ変換する。

```text
200 ÷ 0.1
↓
2000
```

---

## 足し算の場合

足し算と引き算では、左辺に対する割合として扱う。

```text
200 + 10 %
```

`200の10%`を求める。

```text
200 × 10 ÷ 100
↓
20
```

その後、イコールを押す。

```text
200 + 20
↓
220
```

---

## 引き算の場合

```text
200 - 10 %
```

右辺を`200の10%`である`20`へ変換する。

```text
200 - 20
↓
180
```

---

# 12. パーセントボタンを確認する

`index.html`に次のボタンがあることを確認する。

```html
<button
  type="button"
  data-action="percent"
>
  %
</button>
```

---

# 13. パーセントボタンを取得する

```typescript
const percentButton =
  document.querySelector<HTMLButtonElement>(
    'button[data-action="percent"]',
  );
```

---

# 14. パーセント入力関数を作る

```typescript
function inputPercent(): void {
  if (hasError) {
    return;
  }

  if (waitingForNextInput) {
    return;
  }

  const inputValue = Number(currentInput);

  let percentValue: number;

  if (
    previousInput !== null &&
    selectedOperator !== null &&
    (
      selectedOperator === "+" ||
      selectedOperator === "-"
    )
  ) {
    percentValue =
      previousInput * inputValue / 100;
  } else {
    percentValue = inputValue / 100;
  }

  if (!Number.isFinite(percentValue)) {
    showError();
    return;
  }

  currentInput = formatResult(percentValue);
  updateDisplay();
}
```

---

# 15. エラー状態ではパーセントを無視する

```typescript
if (hasError) {
  return;
}
```

```text
Error
↓
%
↓
Error
```

エラー状態から新しい計算を始める場合は、数字、小数点またはACを使用する。

---

# 16. 右辺を入力していない場合は無視する

```typescript
if (waitingForNextInput) {
  return;
}
```

例えば、

```text
200
↓
+
↓
%
```

では、まだ右辺の割合を入力していない。

そのため、パーセント処理は実行しない。

```text
200 + %
↓
表示は200のまま
```

---

# 17. 現在の値を数値へ変換する

```typescript
const inputValue = Number(currentInput);
```

`currentInput`は文字列として管理している。

例：

```text
currentInput = "10"
```

数値へ変換すると、

```text
inputValue = 10
```

になる。

---

# 18. `let`を使用する理由

```typescript
let percentValue: number;
```

`percentValue`には、演算子によって異なる計算結果が代入される。

足し算または引き算の場合：

```typescript
percentValue =
  previousInput * inputValue / 100;
```

それ以外の場合：

```typescript
percentValue = inputValue / 100;
```

条件によって後から値を代入するため、`let`を使用する。

---

# 19. 足し算と引き算のパーセント

```typescript
if (
  previousInput !== null &&
  selectedOperator !== null &&
  (
    selectedOperator === "+" ||
    selectedOperator === "-"
  )
) {
  percentValue =
    previousInput * inputValue / 100;
}
```

例：

```text
previousInput = 200
inputValue = 10
selectedOperator = "+"
```

計算：

```typescript
200 * 10 / 100;
```

結果：

```text
20
```

`currentInput`は`"20"`へ変更される。

その後、イコールを押すと、

```typescript
calculate(200, 20, "+");
```

が実行される。

結果：

```text
220
```

---

# 20. 掛け算・割り算・単独入力のパーセント

```typescript
else {
  percentValue = inputValue / 100;
}
```

例：

```text
10%
```

計算：

```typescript
10 / 100;
```

結果：

```text
0.1
```

掛け算の場合：

```text
200 × 10 %
```

右辺が`0.1`へ変換される。

その後、イコールを押すと、

```typescript
calculate(200, 0.1, "*");
```

結果：

```text
20
```

---

# 21. パーセント結果を確認する

```typescript
if (!Number.isFinite(percentValue)) {
  showError();
  return;
}
```

非常に大きな数値などによって、結果が有限の数値でなくなった場合は`Error`を表示する。

---

# 22. パーセント結果を表示する

```typescript
currentInput = formatResult(percentValue);
updateDisplay();
```

例えば、

```text
currentInput = "10"
```

に対してパーセントを実行すると、

```text
currentInput = "0.1"
```

になる。

`waitingForNextInput`は変更しない。

右辺の数字をパーセントへ変換した後も、イコールによる計算を続けられる。

---

# 23. パーセントボタンへイベントを追加する

```typescript
percentButton?.addEventListener(
  "click",
  inputPercent,
);
```

---

# 24. キーボードのパーセント処理を追加する

キーとボタンの対応表には、既に次がある。

```typescript
"%": 'button[data-action="percent"]',
```

`keydown`イベントの条件分岐に処理を追加する。

```typescript
} else if (event.key === "%") {
  inputPercent();
}
```

---

# 25. `keydown`イベント全体を整理する

最終的な入力処理は次のようになる。

```typescript
document.addEventListener("keydown", (event) => {
  if (event.repeat) {
    return;
  }

  const button = getButtonFromKey(event.key);

  if (!button) {
    return;
  }

  event.preventDefault();
  button.classList.add("keyboard-active");

  if (/^[0-9]$/.test(event.key)) {
    inputNumber(event.key);
  } else if (event.key === ".") {
    inputDecimal();
  } else if (isOperator(event.key)) {
    selectOperator(event.key);
  } else if (
    event.key === "=" ||
    event.key === "Enter"
  ) {
    performCalculation();
  } else if (
    event.key === "Escape" ||
    event.key === "Delete"
  ) {
    resetCalculator();
  } else if (event.key === "Backspace") {
    deleteLastCharacter();
  } else if (event.key === "%") {
    inputPercent();
  }
});
```

---

# 26. イベントの条件順序

今回のキーは、それぞれ異なる値を持つ。

```text
数字       → "0"から"9"
小数点     → "."
演算子     → "+", "-", "*", "/"
計算       → "=", "Enter"
AC         → "Escape", "Delete"
1文字削除  → "Backspace"
割合       → "%"
```

そのため、1つの`keydown`イベント内で`else if`を使って処理を分けられる。

---

# 27. 追加する主要コード

## 削除ボタンの取得

```typescript
const deleteButton =
  document.querySelector<HTMLButtonElement>(
    'button[data-action="delete"]',
  );
```

## 1文字削除

```typescript
function deleteLastCharacter(): void {
  if (hasError) {
    resetCalculator();
    return;
  }

  if (waitingForNextInput) {
    return;
  }

  const nextInput = currentInput.slice(0, -1);

  if (
    nextInput === "" ||
    nextInput === "-"
  ) {
    currentInput = "0";
  } else {
    currentInput = nextInput;
  }

  updateDisplay();
}
```

## 削除イベント

```typescript
deleteButton?.addEventListener(
  "click",
  deleteLastCharacter,
);
```

## パーセントボタンの取得

```typescript
const percentButton =
  document.querySelector<HTMLButtonElement>(
    'button[data-action="percent"]',
  );
```

## パーセント処理

```typescript
function inputPercent(): void {
  if (hasError) {
    return;
  }

  if (waitingForNextInput) {
    return;
  }

  const inputValue = Number(currentInput);

  let percentValue: number;

  if (
    previousInput !== null &&
    selectedOperator !== null &&
    (
      selectedOperator === "+" ||
      selectedOperator === "-"
    )
  ) {
    percentValue =
      previousInput * inputValue / 100;
  } else {
    percentValue = inputValue / 100;
  }

  if (!Number.isFinite(percentValue)) {
    showError();
    return;
  }

  currentInput = formatResult(percentValue);
  updateDisplay();
}
```

## パーセントイベント

```typescript
percentButton?.addEventListener(
  "click",
  inputPercent,
);
```

---

# 28. `main.ts`内の配置

コードを次の順番に整理する。

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
   - deleteButton
   - percentButton

4. 状態変数
   - currentInput
   - previousInput
   - selectedOperator
   - waitingForNextInput
   - hasError

5. 表示・状態管理
   - updateDisplay
   - showError
   - resetCalculator
   - logState

6. 計算処理
   - calculate
   - formatResult
   - performCalculation

7. 入力処理
   - inputNumber
   - inputDecimal
   - selectOperator
   - deleteLastCharacter
   - inputPercent

8. 判定関数
   - isOperator
   - getButtonFromKey

9. マウスイベント

10. キーボードイベント
```

---

# 自分で実装すること

- [ ] 削除ボタンを取得する
- [ ] `deleteLastCharacter`を作る
- [ ] 最後の1文字を削除する
- [ ] すべて削除された場合に`0`へ戻す
- [ ] 負号だけになった場合に`0`へ戻す
- [ ] エラー表示中の削除で初期化する
- [ ] 次の入力待ち状態では削除しない
- [ ] 削除ボタンへクリックイベントを追加する
- [ ] Backspaceキーへ削除処理を追加する
- [ ] パーセントボタンを取得する
- [ ] `inputPercent`を作る
- [ ] 単独のパーセント計算を実装する
- [ ] 足し算のパーセント計算を実装する
- [ ] 引き算のパーセント計算を実装する
- [ ] 掛け算のパーセント計算を実装する
- [ ] 割り算のパーセント計算を実装する
- [ ] パーセントボタンへクリックイベントを追加する
- [ ] `%`キーへパーセント処理を追加する

---

# 29. 削除機能のテスト

開発サーバーを起動する。

```bash
npm run dev
```

## テスト1：通常の数字を削除する

操作：

```text
123
↓
Backspace
```

期待結果：

```text
12
```

---

## テスト2：最後の数字を削除する

操作：

```text
7
↓
Backspace
```

期待結果：

```text
0
```

---

## テスト3：小数部分を削除する

操作：

```text
12.5
↓
Backspace
```

期待結果：

```text
12.
```

もう一度Backspaceを押す。

期待結果：

```text
12
```

---

## テスト4：0でBackspaceを押す

操作：

```text
0
↓
Backspace
```

期待結果：

```text
0
```

---

## テスト5：演算子の直後にBackspace

操作：

```text
12 +
↓
Backspace
```

期待結果：

```text
12
```

保存された左辺と演算子は変更されない。

---

## テスト6：エラー状態でBackspace

操作：

```text
8 ÷ 0 =
↓
Backspace
```

期待結果：

```text
0
```

---

## テスト7：画面上の削除ボタン

マウスで次を入力する。

```text
456
```

削除ボタンをクリックする。

期待結果：

```text
45
```

---

# 30. パーセント機能のテスト

## テスト8：単独のパーセント

操作：

```text
50 %
```

期待結果：

```text
0.5
```

---

## テスト9：小数のパーセント

操作：

```text
12.5 %
```

期待結果：

```text
0.125
```

---

## テスト10：足し算のパーセント

操作：

```text
200 + 10 % =
```

途中表示：

```text
20
```

最終結果：

```text
220
```

---

## テスト11：引き算のパーセント

操作：

```text
200 - 10 % =
```

途中表示：

```text
20
```

最終結果：

```text
180
```

---

## テスト12：掛け算のパーセント

操作：

```text
200 × 10 % =
```

途中表示：

```text
0.1
```

最終結果：

```text
20
```

---

## テスト13：割り算のパーセント

操作：

```text
200 ÷ 10 % =
```

途中表示：

```text
0.1
```

最終結果：

```text
2000
```

---

## テスト14：0%

操作：

```text
0 %
```

期待結果：

```text
0
```

---

## テスト15：演算子直後のパーセント

操作：

```text
200 + %
```

期待結果：

```text
200
```

まだ右辺が入力されていないため、何も起こらない。

---

## テスト16：エラー状態でパーセント

操作：

```text
8 ÷ 0 =
↓
%
```

期待結果：

```text
Error
```

---

## テスト17：キーボードによるパーセント

キーボードで入力する。

```text
200
+
10
%
Enter
```

期待結果：

```text
220
```

パーセントボタンの押下表現も動作することを確認する。

---

# 31. 複合操作を確認する

## テスト18：削除後に計算する

操作：

```text
123
Backspace
+
3
=
```

計算：

```text
12 + 3
```

期待結果：

```text
15
```

---

## テスト19：小数点を削除してから入力し直す

操作：

```text
1.2
Backspace
Backspace
5
```

表示の流れ：

```text
1.2
↓
1.
↓
1
↓
15
```

期待結果：

```text
15
```

---

## テスト20：パーセント後に数字を修正する

操作：

```text
50 %
```

表示：

```text
0.5
```

Backspaceを押す。

期待結果：

```text
0.
```

続けて`2`を入力する。

期待結果：

```text
0.2
```

---

# うまく動かない場合

## Backspaceを押すとページが戻る

`keydown`内で次が実行されているか確認する。

```typescript
event.preventDefault();
```

対応表に次があるか確認する。

```typescript
"Backspace": 'button[data-action="delete"]',
```

---

## 削除ボタンを押しても反応しない

HTML：

```html
<button data-action="delete">←</button>
```

TypeScript：

```typescript
document.querySelector<HTMLButtonElement>(
  'button[data-action="delete"]',
);
```

属性名が一致しているか確認する。

---

## 1文字削除すると画面が空になる

次の処理があるか確認する。

```typescript
if (
  nextInput === "" ||
  nextInput === "-"
) {
  currentInput = "0";
}
```

---

## `200 + 10%`が`200.1`になる

足し算と引き算では、単純に100で割るのではなく、左辺に対する割合を計算する。

```typescript
percentValue =
  previousInput * inputValue / 100;
```

---

## `200 × 10%`が`2000`になる

掛け算の場合は、右辺だけを100で割る。

```typescript
percentValue = inputValue / 100;
```

その後、

```text
200 × 0.1
```

を計算する。

---

## `%`キーで反応しない

対応表を確認する。

```typescript
"%": 'button[data-action="percent"]',
```

`keydown`の条件も確認する。

```typescript
} else if (event.key === "%") {
  inputPercent();
}
```

---

# 発生したエラー

## エラー内容

```text
ここにエラーメッセージを記録する
```

## 発生した操作

```text
ここに再現手順を記録する
```

## 期待結果

```text
ここに期待していた表示を記録する
```

## 実際の結果

```text
ここに実際の表示を記録する
```

## 原因

ここに原因を記録する。

## 修正内容

ここに修正内容を記録する。

---

# 今回学んだこと

作業後、自分が理解した内容を追記する。

例：

- `slice(0, -1)`で文字列の最後の1文字を削除できる
- 空文字列を表示せず、`0`へ戻す処理が必要である
- エラー状態では、削除をリセットとして扱える
- 同じパーセント記号でも、演算子によって意味が変わる
- 足し算と引き算では、左辺に対する割合を計算する
- 掛け算と割り算では、現在値を100で割る
- `let`は条件によって異なる値を代入する場合に使える
- マウス操作とキーボード操作から同じ関数を呼び出せる
- 画面表示だけでなく、内部状態を考えて入力処理を設計する必要がある

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
git add src/main.ts develop_flow/07-1_remaining_features.md
```

コミットする。

```bash
git commit -m "Add delete and percent functions"
```

GitHubへpushする。

```bash
git push
```

---

# 完了条件

以下をすべて満たしたら、この工程は完了とする。

- 削除ボタンで最後の1文字を削除できる
- Backspaceキーで最後の1文字を削除できる
- 最後の1文字を削除すると`0`へ戻る
- 小数点を削除できる
- エラー表示中の削除で初期状態へ戻る
- 演算子の直後では削除されない
- 単独のパーセント計算ができる
- 足し算で割合を加算できる
- 引き算で割合を減算できる
- 掛け算でパーセントを使用できる
- 割り算でパーセントを使用できる
- `%`キーでパーセント処理を実行できる
- キーボードの押下表現が動作する
- すべての画面上のボタンが機能する
- Consoleにエラーがない
- `npm run build`が成功する
- Gitへコミットした
- GitHubへpushした

---

# 次の工程

すべての機能が実装されたため、次は計算機全体をテストする。

```text
develop_flow/08_testing.md
```