# 04 数字入力を実装する

## 目的

数字ボタンを押したとき、計算機の表示画面へ数字が入力されるようにする。

マウス操作とキーボード操作の両方に対応する。

```text
数字ボタンをクリックする
または
キーボードの数字キーを押す
↓
入力された数字を取得する
↓
現在の入力値へ追加する
↓
表示画面を更新する
```

この工程では、まだ四則演算や小数点の処理は実装しない。

---

## 今回実装する機能

- `0`〜`9`の数字ボタンをクリックできる
- キーボードの`0`〜`9`でも入力できる
- 初期表示の`0`を、最初の数字で置き換える
- 2文字目以降は末尾へ追加する
- 不要な先頭の`0`を増やさない
- 入力できる桁数を制限する
- マウスとキーボードで同じ入力処理を使う

---

## 入力例

```text
初期表示
0
```

`7`を入力する。

```text
7
```

続けて`8`を入力する。

```text
78
```

続けて`3`を入力する。

```text
783
```

初期状態で`0`を何度押しても、次の表示を維持する。

```text
0
```

---

## 編集するファイル

```text
src/main.ts
develop_flow/04_number_input.md
```

この工程では、基本的に`index.html`と`src/style.css`は変更しない。

---

# 1. HTMLの表示欄を確認する

`index.html`に、次の表示欄があることを確認する。

```html
<output id="display">0</output>
```

TypeScriptでは、`id="display"`を使ってこの要素を取得する。

---

# 2. 数字ボタンの属性を確認する

各数字ボタンには、`data-number`属性が必要である。

例：

```html
<button type="button" data-number="7">7</button>
```

0から9まで、属性値と表示文字が一致していることを確認する。

```html
<button type="button" data-number="0">0</button>
<button type="button" data-number="1">1</button>
<button type="button" data-number="2">2</button>
```

`data-number`属性は、TypeScriptから押された数字を取得するために使用する。

---

# 3. 表示画面をTypeScriptから取得する

`src/main.ts`の先頭付近で、表示画面を取得する。

```typescript
const display =
  document.querySelector<HTMLOutputElement>("#display");
```

## `document.querySelector`

指定したCSSセレクターに一致する、最初のHTML要素を取得する。

今回のセレクターは次の通り。

```text
#display
```

これは、次のHTML要素を表している。

```html
<output id="display">
```

## `<HTMLOutputElement>`

取得する要素が`output`要素であることを、TypeScriptへ伝える。

## `null`になる可能性

HTML上に`id="display"`が存在しない場合、取得結果は`null`になる。

そのため、処理前に存在確認を行う必要がある。

---

# 4. 現在の入力値を保存する

計算機が現在受け付けている数字を保存する変数を用意する。

```typescript
let currentInput = "0";
```

初期表示が`0`なので、変数の初期値も文字列の`"0"`にする。

---

## なぜ数値ではなく文字列で保存するのか

数字を順番に入力する処理では、文字列として扱う方が分かりやすい。

例えば、`7`の後に`8`を入力する場合を考える。

文字列の場合：

```typescript
"7" + "8"
```

結果：

```text
"78"
```

数値の場合：

```typescript
7 + 8
```

結果：

```text
15
```

計算機への数字入力は、まだ足し算ではない。

入力された文字を末尾へつなげる処理なので、文字列で管理する。

実際に計算するときに、文字列から数値へ変換する。

---

# 5. 表示画面を更新する関数を作る

変数`currentInput`の内容を画面へ反映する関数を作る。

```typescript
function updateDisplay(): void {
  if (!display) {
    return;
  }

  display.textContent = currentInput;
}
```

## 戻り値の`void`

```typescript
function updateDisplay(): void
```

この関数は値を返さず、画面を書き換えるだけである。

そのため、戻り値の型は`void`とする。

## 表示欄の存在確認

```typescript
if (!display) {
  return;
}
```

表示欄を取得できていない場合は、処理を終了する。

## `textContent`

```typescript
display.textContent = currentInput;
```

HTML要素の表示文字を変更する。

例えば、`currentInput`が`"78"`なら、HTML上の表示も次のようになる。

```html
<output id="display">78</output>
```

---

# 6. 数字を入力する関数を作る

マウスとキーボードの両方から利用できる、数字入力専用の関数を作る。

```typescript
function inputNumber(number: string): void {
  if (currentInput === "0") {
    currentInput = number;
  } else {
    currentInput += number;
  }

  updateDisplay();
}
```

---

## 引数

```typescript
number: string
```

入力された数字を文字列として受け取る。

例：

```text
"0"
"5"
"9"
```

---

## 初期表示が`0`の場合

```typescript
if (currentInput === "0") {
  currentInput = number;
}
```

初期値の`0`へ数字を追加すると、次のようになってしまう。

```text
07
```

そのため、現在の表示が`0`なら、新しく入力された数字で置き換える。

```text
0
↓ 7を入力
7
```

---

## 2文字目以降の場合

```typescript
currentInput += number;
```

`+=`は、現在の文字列の末尾へ新しい文字列を追加する。

```typescript
currentInput = "7";
currentInput += "8";
```

結果：

```text
"78"
```

---

## 最後に表示を更新する

```typescript
updateDisplay();
```

変数を変更しただけでは、ブラウザ上の表示は自動で変わらない。

変数を変更した後に、表示画面を更新する。

---

# 7. 先頭の0を増やさないようにする

先ほどの処理では、現在の入力が`"0"`の場合、新しい数字で置き換える。

そのため、`0`を何度押しても表示は次のままになる。

```text
0
```

処理の流れ：

```text
currentInputが"0"
↓
0を入力
↓
currentInputを"0"に置き換える
↓
表示は"0"
```

次のような不要な表示を防げる。

```text
000000
```

---

# 8. 入力できる桁数を制限する

非常に長い数字を入力すると、表示画面から大きくはみ出す可能性がある。

入力処理の先頭で、現在の桁数を確認する。

例として、最大15桁に制限する。

```typescript
const MAX_INPUT_LENGTH = 15;
```

定数は、`currentInput`の近くに書く。

```typescript
let currentInput = "0";
const MAX_INPUT_LENGTH = 15;
```

`inputNumber`の最初に条件を追加する。

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

## `length`

文字列の文字数を取得する。

```typescript
"12345".length
```

結果：

```text
5
```

15文字以上なら、それ以上数字を追加せずに処理を終了する。

---

# 9. 数字ボタンをすべて取得する

数字ボタンには、共通して`data-number`属性が付いている。

次のセレクターを使用する。

```text
button[data-number]
```

TypeScriptで数字ボタンをすべて取得する。

```typescript
const numberButtons =
  document.querySelectorAll<HTMLButtonElement>(
    "button[data-number]",
  );
```

## `querySelectorAll`

条件に一致する要素をすべて取得する。

`querySelector`との違い：

```text
querySelector
→ 最初の1つを取得する

querySelectorAll
→ 一致するすべての要素を取得する
```

今回は0〜9まで複数の数字ボタンがあるため、`querySelectorAll`を使う。

---

# 10. 各数字ボタンへクリック処理を追加する

取得した数字ボタンを、1つずつ処理する。

```typescript
numberButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const number = button.dataset.number;

    if (number === undefined) {
      return;
    }

    inputNumber(number);
  });
});
```

---

## `forEach`

取得したすべての数字ボタンに対して、同じ処理を実行する。

```text
0ボタンにclickイベントを付ける
1ボタンにclickイベントを付ける
2ボタンにclickイベントを付ける
...
9ボタンにclickイベントを付ける
```

---

## `click`イベント

```typescript
button.addEventListener("click", ...)
```

ボタンがクリックされたときに、指定した処理を実行する。

---

## `dataset`

HTMLの`data-*`属性をTypeScriptから取得する。

HTML：

```html
<button data-number="7">7</button>
```

TypeScript：

```typescript
button.dataset.number
```

取得結果：

```text
"7"
```

HTMLでは`data-number`とハイフンで書くが、TypeScriptでは`dataset.number`と書く。

---

## `undefined`の確認

```typescript
if (number === undefined) {
  return;
}
```

`data-number`属性が存在しなかった場合は、`undefined`になる。

その場合は入力処理を実行しない。

---

# 11. マウス操作を確認する

ここまで実装したら、一度ブラウザで確認する。

例：

```text
7をクリック
↓
7

8をクリック
↓
78

3をクリック
↓
783
```

この段階でキーボード入力はまだ追加しなくてもよい。

まずマウス操作だけで数字入力が動くことを確認する。

---

# 12. キーボード入力を追加する

前の工程では、`keydown`イベントを使ってボタンの見た目を変更した。

新しい`keydown`イベントを別に追加するのではなく、既存の処理へ数字入力を追加する。

既存の処理の中で、押されたキーが数字か確認する。

```typescript
if (/^[0-9]$/.test(event.key)) {
  inputNumber(event.key);
}
```

---

## 正規表現

```typescript
/^[0-9]$/
```

これは、文字列が0〜9の数字1文字だけかを確認する。

意味：

```text
^
→ 文字列の先頭

[0-9]
→ 0から9までの数字

$
→ 文字列の末尾
```

一致する例：

```text
"0"
"5"
"9"
```

一致しない例：

```text
"Enter"
"12"
"a"
"+"
```

---

## `.test()`

```typescript
/^[0-9]$/.test(event.key)
```

指定した文字列が正規表現の条件に一致するか確認する。

結果は真偽値になる。

```text
true
または
false
```

---

# 13. 既存の`keydown`処理へ追加する

前の工程で、次のような処理を作成している。

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
});
```

ボタンを取得できた後に、数字入力処理を追加する。

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
  }
});
```

---

## なぜ新しい`keydown`を追加しないのか

同じキー入力に対して複数のイベント処理を追加すると、処理の流れが分かりにくくなる。

```text
既存のkeydown
→ ボタンの見た目を変更

新しいkeydown
→ 数字を入力
```

これでも動作するが、後で演算処理を追加すると、キーボード処理が複数箇所へ分散する。

今回は、1つの`keydown`の中で次をまとめて処理する。

```text
対応するボタンを取得
↓
押下表現を付ける
↓
数字なら入力処理を実行
```

---

# 14. マウスとキーボードで同じ関数を使う

マウス操作：

```typescript
inputNumber(number);
```

キーボード操作：

```typescript
inputNumber(event.key);
```

どちらも同じ`inputNumber`関数を使う。

これにより、先頭の0や桁数制限などのルールを1か所で管理できる。

悪い例：

```text
マウス用の数字入力処理
キーボード用の数字入力処理
```

このように別々に書くと、片方だけ修正を忘れる可能性がある。

良い構造：

```text
マウス
  └─ inputNumber

キーボード
  └─ inputNumber
```

---

# 15. 現時点でのコード構造

`src/main.ts`は、次の順番で整理する。

```text
1. CSSの読み込み

2. HTML要素の取得
   - display
   - numberButtons

3. 状態を保存する変数
   - currentInput
   - MAX_INPUT_LENGTH

4. 関数
   - updateDisplay
   - inputNumber
   - getButtonFromKey

5. マウス操作
   - 数字ボタンのclickイベント

6. キーボード操作
   - keydown
   - keyup
   - blur
```

コードは、処理の役割ごとにまとまりを作る。

---

# 自分で実装すること

- [ ] `#display`をTypeScriptから取得する
- [ ] `currentInput`を文字列で定義する
- [ ] 最大桁数の定数を作る
- [ ] 表示を更新する関数を作る
- [ ] 数字を入力する関数を作る
- [ ] 初期値の`0`を新しい数字で置き換える
- [ ] 2文字目以降を末尾へ追加する
- [ ] 最大桁数を超えた入力を無視する
- [ ] 数字ボタンをすべて取得する
- [ ] 各数字ボタンへクリックイベントを追加する
- [ ] `dataset.number`から数字を取得する
- [ ] 既存の`keydown`処理へ数字入力を追加する
- [ ] マウスとキーボードで同じ関数を使用する

---

# 動作確認

開発サーバーが起動していない場合は、プロジェクトのルートで実行する。

```bash
npm run dev
```

ブラウザで次を開く。

```text
http://localhost:5173/
```

---

## マウス入力のテスト

### テスト1

操作：

```text
7をクリック
```

期待結果：

```text
7
```

### テスト2

操作：

```text
7
8
3
```

期待結果：

```text
783
```

### テスト3

ページを再読み込みし、`0`を何度もクリックする。

期待結果：

```text
0
```

### テスト4

ページを再読み込みし、次を入力する。

```text
0
5
```

期待結果：

```text
5
```

---

## キーボード入力のテスト

キーボードで次を入力する。

```text
123456
```

期待結果：

```text
123456
```

確認事項：

- [ ] 入力した数字に対応するボタンが押されたように表示される
- [ ] 表示画面へ数字が追加される
- [ ] キーを離すとボタンが元の見た目へ戻る
- [ ] アルファベットを押しても数字は入力されない

---

## 桁数制限のテスト

最大桁数を15桁とした場合、16文字以上入力する。

例：

```text
12345678901234567890
```

期待結果：

```text
123456789012345
```

15桁を超えた部分は入力されない。

---

# 確認用のログ

処理の流れを確認したい場合は、一時的に`console.log`を使用できる。

```typescript
function inputNumber(number: string): void {
  console.log("入力された数字:", number);
  console.log("変更前:", currentInput);

  if (currentInput.length >= MAX_INPUT_LENGTH) {
    return;
  }

  if (currentInput === "0") {
    currentInput = number;
  } else {
    currentInput += number;
  }

  console.log("変更後:", currentInput);

  updateDisplay();
}
```

ブラウザの開発者ツールを開く。

```text
F12
→ Console
```

動作確認が終わったら、不要な`console.log`は削除する。

---

# うまく動かない場合

## ボタンを押しても表示が変わらない

`display`を正しく取得できているか確認する。

HTML：

```html
<output id="display">0</output>
```

TypeScript：

```typescript
document.querySelector<HTMLOutputElement>("#display");
```

---

## 数字ボタンを取得できない

HTMLに`data-number`属性があることを確認する。

```html
<button type="button" data-number="7">7</button>
```

TypeScriptのセレクターを確認する。

```typescript
"button[data-number]"
```

---

## `dataset.number`が`undefined`になる

HTML側の属性名を確認する。

正しい例：

```html
data-number="7"
```

異なる例：

```html
data-value="7"
```

`data-value`を使っている場合、TypeScriptでは次のようになる。

```typescript
button.dataset.value
```

HTMLとTypeScriptの属性名を一致させる。

---

## 数字が足し算されてしまう

次のように数値型で管理すると、計算として処理される。

```typescript
let currentInput = 7;
currentInput += 8;
```

結果：

```text
15
```

文字列として管理する。

```typescript
let currentInput = "7";
currentInput += "8";
```

結果：

```text
"78"
```

---

## キーボード入力が2回ずつ追加される

同じ数字入力処理を、複数の`keydown`イベントで実行していないか確認する。

```text
keydownイベントA
→ inputNumber

keydownイベントB
→ inputNumber
```

この場合、1回のキー入力で数字が2回追加される可能性がある。

数字入力は、既存の`keydown`処理へまとめる。

---

# 発生したエラー

## エラー内容

```text
ここにエラーメッセージを記録する
```

## 発生した現象

```text
例：
数字ボタンを押しても表示が変わらない
キーボード入力が2回追加される
先頭に0が残ってしまう
```

## 原因

ここに原因を記録する。

## 解決方法

ここに実施した解決方法を記録する。

---

# 今回学んだこと

作業後、自分が理解した内容を追記する。

例：

- 計算機の入力途中の値は文字列として管理すると扱いやすい
- `textContent`を使ってHTMLの表示文字を変更できる
- `querySelectorAll`で条件に一致する要素をすべて取得できる
- `forEach`で複数のボタンへ同じ処理を設定できる
- `dataset`から`data-*`属性の値を取得できる
- マウスとキーボードから同じ関数を呼び出せる
- 入力処理を関数へまとめると、処理の重複を防げる
- 正規表現を使って数字1文字かどうかを確認できる
- 状態を変更した後は、表示を更新する必要がある

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

開発フローを含むすべての差分を確認する。

```bash
git diff
```

---

# Gitコミット

変更したファイルをステージングする。

```bash
git add src/main.ts develop_flow/04_number_input.md
```

コミットする。

```bash
git commit -m "Add calculator number input"
```

GitHubへpushする。

```bash
git push
```

---

# 完了条件

以下をすべて満たしたら、この工程は完了とする。

- 数字ボタンをクリックすると表示画面が更新される
- キーボードの数字キーでも表示画面が更新される
- 初期値の`0`が最初の入力数字に置き換わる
- 2文字目以降は末尾へ追加される
- 不要な先頭の0が増えない
- 最大桁数を超えた数字は入力されない
- マウスとキーボードで同じ入力関数を使用している
- キーボードの押下表現も引き続き動作する
- Consoleとターミナルにエラーがない
- 開発フローへ結果を記録した
- Gitへコミットした
- GitHubへpushした

---

# 次の工程

次は、小数点を入力できるようにする。

また、同じ数値内に小数点が2つ以上入らないように制御する。

```text
develop_flow/04-1_decimal_input.md
```

その後、演算子を押したときの状態管理へ進む。

```text
develop_flow/05_state_management.md
```