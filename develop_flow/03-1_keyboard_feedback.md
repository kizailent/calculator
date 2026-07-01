# 03-1 すべてのボタンにキーボードの押下表現を付ける

## 目的

マウスでボタンをクリックしたときだけでなく、キーボードで対応するキーを押したときにも、計算機のボタンが押されたように表示されるようにする。

この工程では、次の仕組みを実装する。

```text
キーボードのキーを押す
↓
対応する計算機ボタンを探す
↓
ボタンにkeyboard-activeクラスを追加する
↓
CSSによって押された見た目になる
↓
キーを離す
↓
keyboard-activeクラスを削除する
↓
元の見た目に戻る
```

この段階では、数字入力や計算処理はまだ実行しない。

キーボード操作に応じて、ボタンの見た目だけを変化させる。

---

## 今回対応するキー

| キーボード | 計算機のボタン |
|---|---|
| `0`〜`9` | 数字ボタン |
| `+` | 足し算 |
| `-` | 引き算 |
| `*` | 掛け算 |
| `/` | 割り算 |
| `.` | 小数点 |
| `%` | パーセント |
| `Enter` | イコール |
| `=` | イコール |
| `Backspace` | 1文字削除 |
| `Escape` | AC |
| `Delete` | AC |

---

## 編集するファイル

```text
src/main.ts
src/style.css
develop_flow/03-1_keyboard_feedback.md
```

---

# 1. HTMLの属性を確認する

キーボードのキーとHTMLのボタンを対応させるため、各ボタンに適切な`data-*`属性が必要である。

## 数字ボタン

```html
<button type="button" data-number="7">7</button>
```

## 演算子ボタン

```html
<button type="button" data-operator="+">＋</button>
```

## 操作ボタン

```html
<button type="button" data-action="clear">AC</button>
<button type="button" data-action="delete">←</button>
<button type="button" data-action="percent">%</button>
<button type="button" data-action="decimal">.</button>
<button type="button" data-action="equals">＝</button>
```

HTML側の属性名と、後でTypeScriptに書くセレクターが一致している必要がある。

---

# 2. CSSにキーボード用の押下状態を追加する

マウスでボタンを押した状態は、CSSの`:active`で表現できる。

```css
button:active {
  transform: scale(0.97);
  filter: brightness(0.9);
}
```

キーボード操作では、TypeScriptから`keyboard-active`というclassを付ける。

マウスとキーボードで同じ見た目になるように、セレクターをまとめる。

```css
button:active,
button.keyboard-active {
  transform: scale(0.97);
  filter: brightness(0.9);
}
```

## セレクターの意味

```css
button:active
```

マウスやタッチで押されているボタンを指定する。

```css
button.keyboard-active
```

`keyboard-active`というclassが付いているボタンを指定する。

カンマで区切ることで、両方に同じCSSを適用できる。

---

# 3. transitionを設定する

通常状態と押下状態の変化を滑らかにする。

```css
button {
  transition:
    transform 0.1s,
    filter 0.1s;
}
```

## `transform 0.1s`

ボタンの大きさが変わるとき、0.1秒かけて変化する。

## `filter 0.1s`

ボタンの明るさが変わるとき、0.1秒かけて変化する。

`transition`だけでは見た目は変化しない。

次のような実際の値の変化と組み合わせる必要がある。

```css
button.keyboard-active {
  transform: scale(0.97);
  filter: brightness(0.9);
}
```

---

# 4. キーとボタンの対応表を作る

`src/main.ts`の先頭では、CSSを読み込んでいる。

```typescript
import "./style.css";
```

その下に、キーボードのキーとHTMLボタンのセレクターを対応させるオブジェクトを書く。

```typescript
const keyToButtonSelector: Record<string, string> = {
  "0": 'button[data-number="0"]',
  "1": 'button[data-number="1"]',
  "2": 'button[data-number="2"]',
  "3": 'button[data-number="3"]',
  "4": 'button[data-number="4"]',
  "5": 'button[data-number="5"]',
  "6": 'button[data-number="6"]',
  "7": 'button[data-number="7"]',
  "8": 'button[data-number="8"]',
  "9": 'button[data-number="9"]',

  "+": 'button[data-operator="+"]',
  "-": 'button[data-operator="-"]',
  "*": 'button[data-operator="*"]',
  "/": 'button[data-operator="/"]',

  ".": 'button[data-action="decimal"]',
  "%": 'button[data-action="percent"]',

  Enter: 'button[data-action="equals"]',
  "=": 'button[data-action="equals"]',

  Backspace: 'button[data-action="delete"]',

  Escape: 'button[data-action="clear"]',
  Delete: 'button[data-action="clear"]',
};
```

---

# 5. `Record<string, string>`の意味

```typescript
Record<string, string>
```

は、TypeScriptでオブジェクトの型を表している。

今回のオブジェクトでは、キーも値も文字列である。

例：

```typescript
"7": 'button[data-number="7"]'
```

左側はキーボードから受け取るキーである。

```text
"7"
```

右側は、そのキーに対応するHTMLボタンを探すためのCSSセレクターである。

```text
button[data-number="7"]
```

対応表を用意することで、長い条件分岐を何度も書く必要がなくなる。

---

# 6. 対応するボタンを取得する関数を作る

対応表を使って、押されたキーに対応するボタンを取得する関数を作る。

```typescript
function getButtonFromKey(
  key: string,
): HTMLButtonElement | null {
  const selector = keyToButtonSelector[key];

  if (!selector) {
    return null;
  }

  return document.querySelector<HTMLButtonElement>(selector);
}
```

---

## 関数の引数

```typescript
key: string
```

キーボードから受け取ったキーを文字列として受け取る。

例：

```text
"7"
"+"
"Enter"
"Backspace"
```

---

## 関数の戻り値

```typescript
HTMLButtonElement | null
```

対応するボタンが見つかった場合は、HTMLのボタン要素を返す。

対応していないキーの場合や、HTML上にボタンが存在しない場合は、`null`を返す。

---

## 対応するセレクターを取得する

```typescript
const selector = keyToButtonSelector[key];
```

押されたキーを使って、対応表からCSSセレクターを取得する。

例えば、`7`キーが押された場合は、次の文字列が取得される。

```text
button[data-number="7"]
```

---

## 対応していないキーの場合

```typescript
if (!selector) {
  return null;
}
```

アルファベットなど、計算機で使用しないキーには対応するセレクターがない。

その場合は、処理を行わず`null`を返す。

---

## HTMLからボタンを取得する

```typescript
return document.querySelector<HTMLButtonElement>(selector);
```

取得したCSSセレクターを使って、HTMLからボタンを探す。

---

# 7. キーを押したときの処理を書く

キーボードのキーを押した瞬間は、`keydown`イベントで取得する。

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

---

## `keydown`

```typescript
document.addEventListener("keydown", ...)
```

ページ内でキーボードのキーが押されたことを監視する。

---

## 長押しを無視する

```typescript
if (event.repeat) {
  return;
}
```

キーボードのキーを押し続けると、`keydown`イベントが何度も発生する。

`event.repeat`が`true`の場合は、長押しによる繰り返しイベントである。

今回は最初に押した1回だけ処理する。

---

## 対応するボタンを取得する

```typescript
const button = getButtonFromKey(event.key);
```

`event.key`には、押されたキーの名前が入る。

例えば、数字の7を押した場合は次のようになる。

```typescript
event.key === "7"
```

Enterキーの場合は次のようになる。

```typescript
event.key === "Enter"
```

---

## 対応するボタンがない場合

```typescript
if (!button) {
  return;
}
```

計算機で使用しないキーの場合は、処理を終了する。

---

## ブラウザ標準の動作を防ぐ

```typescript
event.preventDefault();
```

キーによっては、ブラウザに標準の動作が設定されている。

例：

```text
Backspace
→ 入力欄の文字を削除する

/
→ ブラウザの検索機能が反応する場合がある
```

計算機の操作として使用するキーについては、ブラウザの標準動作を停止する。

---

## classを追加する

```typescript
button.classList.add("keyboard-active");
```

対応するボタンに`keyboard-active`というclassを追加する。

例えば、7キーを押している間は、HTMLが一時的に次のような状態になる。

```html
<button
  type="button"
  data-number="7"
  class="keyboard-active"
>
  7
</button>
```

CSSの次の指定が適用される。

```css
button.keyboard-active {
  transform: scale(0.97);
  filter: brightness(0.9);
}
```

---

# 8. キーを離したときの処理を書く

キーボードのキーを離した瞬間は、`keyup`イベントで取得する。

```typescript
document.addEventListener("keyup", (event) => {
  const button = getButtonFromKey(event.key);

  if (!button) {
    return;
  }

  event.preventDefault();
  button.classList.remove("keyboard-active");
});
```

---

## `keyup`

```typescript
document.addEventListener("keyup", ...)
```

キーボードのキーを離したときに発生するイベントを監視する。

---

## classを削除する

```typescript
button.classList.remove("keyboard-active");
```

対応するボタンから`keyboard-active`を削除する。

これによって、ボタンが通常の大きさと明るさへ戻る。

---

# 9. ウィンドウを切り替えた場合の処理を書く

キーを押したまま別のウィンドウへ移動すると、ブラウザが`keyup`を受け取れない場合がある。

その場合、ボタンに`keyboard-active`が残り、押された見た目のままになる可能性がある。

そこで、ブラウザからフォーカスが外れたときに、すべての`keyboard-active`を削除する。

```typescript
window.addEventListener("blur", () => {
  const activeButtons =
    document.querySelectorAll<HTMLButtonElement>(
      "button.keyboard-active",
    );

  activeButtons.forEach((button) => {
    button.classList.remove("keyboard-active");
  });
});
```

---

## `blur`

```typescript
window.addEventListener("blur", ...)
```

ブラウザのウィンドウからフォーカスが外れたときに発生するイベント。

例：

```text
別のアプリへ移動した
別のブラウザタブへ移動した
別のウィンドウをクリックした
```

---

## 押下状態のボタンをすべて取得する

```typescript
document.querySelectorAll<HTMLButtonElement>(
  "button.keyboard-active",
);
```

`keyboard-active`が付いているすべてのボタンを取得する。

`querySelectorAll`は、条件に一致する要素を複数取得する。

---

## すべてのclassを削除する

```typescript
activeButtons.forEach((button) => {
  button.classList.remove("keyboard-active");
});
```

取得したボタンを1つずつ処理し、`keyboard-active`を削除する。

---

# 10. `main.ts`全体の構造

この工程が完了した時点で、`src/main.ts`は次の構造になる。

```typescript
import "./style.css";

const keyToButtonSelector: Record<string, string> = {
  "0": 'button[data-number="0"]',
  "1": 'button[data-number="1"]',
  "2": 'button[data-number="2"]',
  "3": 'button[data-number="3"]',
  "4": 'button[data-number="4"]',
  "5": 'button[data-number="5"]',
  "6": 'button[data-number="6"]',
  "7": 'button[data-number="7"]',
  "8": 'button[data-number="8"]',
  "9": 'button[data-number="9"]',

  "+": 'button[data-operator="+"]',
  "-": 'button[data-operator="-"]',
  "*": 'button[data-operator="*"]',
  "/": 'button[data-operator="/"]',

  ".": 'button[data-action="decimal"]',
  "%": 'button[data-action="percent"]',

  Enter: 'button[data-action="equals"]',
  "=": 'button[data-action="equals"]',

  Backspace: 'button[data-action="delete"]',

  Escape: 'button[data-action="clear"]',
  Delete: 'button[data-action="clear"]',
};

function getButtonFromKey(
  key: string,
): HTMLButtonElement | null {
  const selector = keyToButtonSelector[key];

  if (!selector) {
    return null;
  }

  return document.querySelector<HTMLButtonElement>(selector);
}

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

document.addEventListener("keyup", (event) => {
  const button = getButtonFromKey(event.key);

  if (!button) {
    return;
  }

  event.preventDefault();
  button.classList.remove("keyboard-active");
});

window.addEventListener("blur", () => {
  const activeButtons =
    document.querySelectorAll<HTMLButtonElement>(
      "button.keyboard-active",
    );

  activeButtons.forEach((button) => {
    button.classList.remove("keyboard-active");
  });
});
```

コードをそのまま写すだけでなく、次の対応関係を確認する。

```text
キーとボタンの対応表
→ keyToButtonSelector

対応するボタンを探す
→ getButtonFromKey

キーを押したとき
→ keydown
→ classList.add

キーを離したとき
→ keyup
→ classList.remove

ウィンドウを切り替えたとき
→ blur
→ すべてのclassを削除
```

---

# 自分で実装すること

- [ ] HTMLの各ボタンに適切な`data-*`属性があることを確認する
- [ ] CSSに`.keyboard-active`の指定を追加する
- [ ] `transition`に`transform`と`filter`を設定する
- [ ] キーとボタンの対応表を作る
- [ ] 対応するボタンを取得する関数を作る
- [ ] `keydown`イベントを追加する
- [ ] `keyup`イベントを追加する
- [ ] `blur`イベントを追加する
- [ ] 0〜9のキーで対応するボタンが反応することを確認する
- [ ] 四則演算キーで対応するボタンが反応することを確認する
- [ ] 操作キーで対応するボタンが反応することを確認する

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

## 数字キーの確認

以下のキーを順番に押す。

```text
0 1 2 3 4 5 6 7 8 9
```

確認事項：

- [ ] 押した数字に対応するボタンだけが縮む
- [ ] キーを離すと元の大きさに戻る
- [ ] 他の数字ボタンは変化しない

---

## 演算子キーの確認

以下のキーを押す。

```text
+
-
*
/
```

確認事項：

- [ ] `+`で足し算ボタンが反応する
- [ ] `-`で引き算ボタンが反応する
- [ ] `*`で掛け算ボタンが反応する
- [ ] `/`で割り算ボタンが反応する

---

## 操作キーの確認

以下を確認する。

- [ ] `.`で小数点ボタンが反応する
- [ ] `%`でパーセントボタンが反応する
- [ ] `Enter`でイコールボタンが反応する
- [ ] `=`でイコールボタンが反応する
- [ ] `Backspace`で削除ボタンが反応する
- [ ] `Escape`でACボタンが反応する
- [ ] `Delete`でACボタンが反応する

---

## その他の確認

- [ ] アルファベットを押しても計算機のボタンは反応しない
- [ ] キーを長押ししても不自然な点滅をしない
- [ ] キーを押したまま別のウィンドウへ移動しても、ボタンが押されたまま残らない
- [ ] マウスでボタンを押したときの表現も引き続き動作する
- [ ] ブラウザのConsoleにエラーが表示されていない
- [ ] ターミナルにエラーが表示されていない

この段階では、キーを押しても表示画面の数字は変化しなくてよい。

実際の入力処理は次の工程で実装する。

---

# Elementsタブを使った確認

Chromeの開発者ツールを開く。

```text
F12
```

`Elements`タブで、対応するボタンを確認する。

例えば、7キーを押している間は次のclassが追加される。

```html
class="keyboard-active"
```

キーを離すと、classが削除されることを確認する。

---

# 反応しない場合の確認事項

## キーとセレクターが対応しているか

TypeScript：

```typescript
"7": 'button[data-number="7"]'
```

HTML：

```html
<button type="button" data-number="7">7</button>
```

属性名と属性値が一致している必要がある。

---

## 演算子の内部値を確認する

表示文字と`data-operator`の値は異なってもよい。

```html
<button type="button" data-operator="*">×</button>
```

画面上には`×`を表示するが、TypeScriptでは`*`キーと対応させる。

---

## CSSのclass名を確認する

TypeScript：

```typescript
button.classList.add("keyboard-active");
```

CSS：

```css
button.keyboard-active {
}
```

名前が完全に一致している必要がある。

---

## TypeScriptが読み込まれているか

`index.html`に次の記述があることを確認する。

```html
<script type="module" src="/src/main.ts"></script>
```

---

## CSSが読み込まれているか

`src/main.ts`の先頭に次があることを確認する。

```typescript
import "./style.css";
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
数字キーは反応するが演算子キーが反応しない
キーを離してもボタンが元に戻らない
Backspaceを押すとブラウザが別のページへ移動する
```

## 原因

ここに原因を記録する。

## 解決方法

ここに実施した解決方法を記録する。

---

# 今回学んだこと

作業後、自分が理解した内容を追記する。

例：

- オブジェクトを使ってキーとボタンの対応関係を管理できる
- `Record<string, string>`で文字列同士の対応表を表現できる
- `event.key`で押されたキーを取得できる
- `querySelector`でCSSセレクターに対応する要素を取得できる
- `keydown`はキーを押したときに発生する
- `keyup`はキーを離したときに発生する
- `classList.add`でclassを追加できる
- `classList.remove`でclassを削除できる
- `event.preventDefault()`でブラウザの標準動作を停止できる
- `blur`を使うと、ウィンドウからフォーカスが外れたことを検知できる
- CSSとTypeScriptをclass名で連携できる

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

CSSの変更を確認する。

```bash
git diff src/style.css
```

すべての変更を確認する。

```bash
git diff
```

---

# Gitコミット

変更したファイルをステージングする。

```bash
git add src/main.ts src/style.css develop_flow/03-1_keyboard_feedback.md
```

コミットする。

```bash
git commit -m "Add keyboard feedback for calculator buttons"
```

GitHubへpushする。

```bash
git push
```

---

# 完了条件

以下をすべて満たしたら、この工程は完了とする。

- 数字キーに対応するボタンが押されたように表示される
- 四則演算キーに対応するボタンが押されたように表示される
- Enterキーとイコールキーでイコールボタンが反応する
- Backspaceで削除ボタンが反応する
- EscapeとDeleteでACボタンが反応する
- キーを離すとボタンが元の表示へ戻る
- 対応していないキーでは何も起こらない
- マウス操作の押下表現も動作する
- ウィンドウを切り替えても押下状態が残らない
- Consoleとターミナルにエラーがない
- 開発フローへ結果を記録した
- Gitへコミットした
- GitHubへpushした

---

# 次の工程

次はTypeScriptを使って、数字ボタンを押したときに表示画面へ数字を追加する。

```text
develop_flow/04_number_input.md
```