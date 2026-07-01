# 03-1 キーボード操作にもボタンの押下表現を付ける

## 目的

マウスでボタンをクリックしたときだけでなく、キーボードのEnterキーを押したときにも、イコールボタンが押されたように表示されるようにする。

この工程では、CSSの疑似クラスだけでは表現しにくいキーボード操作を、TypeScriptからclassを付け外しすることで実現する。

この段階では、Enterキーによる計算処理はまだ実装しない。

```text
Enterキーを押す
↓
＝ボタンが少し縮む

Enterキーを離す
↓
＝ボタンが元の大きさに戻る
```

---

## 前提

`index.html`のイコールボタンに、次の属性が付いていることを確認する。

```html
<button type="button" data-action="equals">＝</button>
```

TypeScriptでは、`data-action="equals"`を利用してイコールボタンを取得する。

---

## 編集するファイル

```text
src/style.css
src/main.ts
develop_flow/03-1_keyboard_feedback.md
```

---

# 1. マウス操作とキーボード操作の違い

CSSの`:active`は、主にマウスやタッチで要素を押している間に適用される。

```css
button:active {
  transform: scale(0.97);
}
```

しかし、ページ全体でEnterキーを押しただけでは、イコールボタンに`:active`が適用されるとは限らない。

そこで、TypeScriptから一時的にclassを追加する。

```text
マウス操作
→ :active

キーボード操作
→ .keyboard-active
```

両方に同じCSSを適用することで、操作方法が異なっても同じ見た目を表示できる。

---

# 2. CSSにキーボード用の押下状態を追加する

`src/style.css`で、既存の`:active`の指定を確認する。

マウス操作とキーボード操作に同じ見た目を適用する。

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

`keyboard-active`というclassが付いたボタンを指定する。

カンマで区切ることで、両方に同じCSSを適用できる。

---

# 3. transitionを確認する

押した状態と通常状態の変化を滑らかにするため、`button`に`transition`を設定する。

```css
button {
  transition:
    transform 0.1s,
    filter 0.1s;
}
```

## `transform 0.1s`

ボタンの大きさが変わるときに、0.1秒かけて変化させる。

## `filter 0.1s`

ボタンの明るさが変わるときに、0.1秒かけて変化させる。

`transition`だけでは見た目は変化しない。

次のように、実際に値が変わるCSSと組み合わせる必要がある。

```css
button.keyboard-active {
  transform: scale(0.97);
  filter: brightness(0.9);
}
```

---

# 4. TypeScriptからイコールボタンを取得する

`src/main.ts`には、CSSを読み込む処理がある。

```typescript
import "./style.css";
```

その下で、イコールボタンを取得する。

```typescript
const equalsButton =
  document.querySelector<HTMLButtonElement>(
    'button[data-action="equals"]'
  );
```

## `document.querySelector`

指定したCSSセレクターに一致する、最初のHTML要素を取得する。

今回指定しているセレクターは次の通り。

```text
button[data-action="equals"]
```

意味は次の通り。

```text
button要素のうち
data-action属性の値がequalsであるもの
```

## `<HTMLButtonElement>`

取得する要素がボタンであることをTypeScriptに伝える。

これにより、ボタンが持つプロパティやメソッドを安全に利用できる。

## 要素が見つからない場合

`querySelector`の結果は、要素が見つからなければ`null`になる。

そのため、後の処理では`equalsButton`が存在するか確認する。

---

# 5. Enterキーを押したときにclassを追加する

キーを押した瞬間は、`keydown`イベントで取得する。

```typescript
document.addEventListener("keydown", (event) => {
  if (
    event.key !== "Enter" ||
    event.repeat ||
    !equalsButton
  ) {
    return;
  }

  equalsButton.classList.add("keyboard-active");
});
```

## `document.addEventListener`

ページ全体で発生するイベントを監視する。

## `"keydown"`

キーボードのキーを押した瞬間に発生するイベント。

## `event.key`

押されたキーの名前を取得する。

```typescript
event.key === "Enter"
```

の場合、Enterキーが押されたことを表す。

## `event.repeat`

キーを押したままにすると、`keydown`イベントが繰り返し発生する。

```typescript
event.repeat
```

が`true`の場合は、長押しによる繰り返しイベントである。

今回は最初の1回だけ処理するため、繰り返しイベントは無視する。

## `!equalsButton`

イコールボタンを取得できなかった場合は、処理を終了する。

## `classList.add`

HTML要素にclassを追加する。

```typescript
equalsButton.classList.add("keyboard-active");
```

実行中は、HTMLが一時的に次のような状態になる。

```html
<button
  type="button"
  data-action="equals"
  class="keyboard-active"
>
  ＝
</button>
```

---

# 6. Enterキーを離したときにclassを削除する

キーを離した瞬間は、`keyup`イベントで取得する。

```typescript
document.addEventListener("keyup", (event) => {
  if (
    event.key !== "Enter" ||
    !equalsButton
  ) {
    return;
  }

  equalsButton.classList.remove("keyboard-active");
});
```

## `"keyup"`

キーボードのキーを離した瞬間に発生するイベント。

## `classList.remove`

HTML要素から指定したclassを削除する。

```typescript
equalsButton.classList.remove("keyboard-active");
```

これにより、イコールボタンが通常の大きさへ戻る。

---

# 7. ウィンドウを切り替えた場合への対策

Enterキーを押したまま別のウィンドウへ移動すると、ブラウザが`keyup`を受け取れない場合がある。

その場合、`keyboard-active`が残り、ボタンが縮んだままになる可能性がある。

ブラウザからフォーカスが外れたときにもclassを削除する。

```typescript
window.addEventListener("blur", () => {
  equalsButton?.classList.remove("keyboard-active");
});
```

## `"blur"`

ブラウザのウィンドウからフォーカスが外れたときに発生するイベント。

## `?.`

オプショナルチェーンと呼ばれる書き方。

```typescript
equalsButton?.classList.remove(...)
```

は、`equalsButton`が存在するときだけ処理を実行する。

`equalsButton`が`null`でもエラーにならない。

---

# 8. 今回追加するTypeScriptの全体構造

`src/main.ts`は、次の構造になる。

```typescript
import "./style.css";

const equalsButton =
  document.querySelector<HTMLButtonElement>(
    'button[data-action="equals"]'
  );

document.addEventListener("keydown", (event) => {
  if (
    event.key !== "Enter" ||
    event.repeat ||
    !equalsButton
  ) {
    return;
  }

  equalsButton.classList.add("keyboard-active");
});

document.addEventListener("keyup", (event) => {
  if (
    event.key !== "Enter" ||
    !equalsButton
  ) {
    return;
  }

  equalsButton.classList.remove("keyboard-active");
});

window.addEventListener("blur", () => {
  equalsButton?.classList.remove("keyboard-active");
});
```

コードを書き写すだけでなく、次の対応を確認する。

```text
keydown
→ classを追加する

keyup
→ classを削除する

blur
→ classが残らないように削除する
```

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

以下を確認する。

- [ ] マウスでボタンを押すと、ボタンが少し縮む
- [ ] Enterキーを押すと、イコールボタンが少し縮む
- [ ] Enterキーを離すと、イコールボタンが元に戻る
- [ ] Enterキーを長押ししても表示が不自然に繰り返されない
- [ ] Enterキーを押したまま別ウィンドウへ移動しても、ボタンが縮んだまま残らない
- [ ] 他のキーを押しても、イコールボタンは変化しない
- [ ] ブラウザのConsoleにエラーが表示されていない
- [ ] ターミナルにエラーが表示されていない

この段階では、Enterキーを押しても計算結果は変化しなくてよい。

実際の計算処理は、四則演算を実装する工程で追加する。

---

# Consoleを使った確認

開発者ツールを開く。

```text
F12
```

`Elements`タブでイコールボタンを確認する。

Enterキーを押している間、次のclassが追加されることを確認する。

```html
class="keyboard-active"
```

Enterキーを離すと、classが削除されることを確認する。

---

# 反応しない場合の確認事項

## HTMLの属性が正しいか

```html
<button type="button" data-action="equals">＝</button>
```

次のように属性値が異なると取得できない。

```html
data-action="equal"
```

TypeScript側とHTML側の名前を一致させる。

## CSSのclass名が一致しているか

TypeScript：

```typescript
classList.add("keyboard-active");
```

CSS：

```css
button.keyboard-active {
}
```

文字列が完全に一致している必要がある。

## TypeScriptが読み込まれているか

`index.html`の最後に、次があることを確認する。

```html
<script type="module" src="/src/main.ts"></script>
```

## `main.ts`でCSSを読み込んでいるか

```typescript
import "./style.css";
```

## ファイルを保存したか

```text
Ctrl + S
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
Enterキーを押してもボタンが変化しない
Enterキーを離してもボタンが元に戻らない
```

## 原因

ここに原因を記録する。

## 解決方法

ここに実施した解決方法を記録する。

---

# 今回学んだこと

作業後、自分が理解した内容を追記する。

例：

- CSSの`:active`だけでは、ページ全体のキーボード入力を表現できない場合がある
- TypeScriptからHTML要素へclassを追加・削除できる
- `keydown`はキーを押したときに発生する
- `keyup`はキーを離したときに発生する
- `event.key`で押されたキーを判定できる
- `event.repeat`でキーの長押しを判定できる
- `classList.add`でclassを追加できる
- `classList.remove`でclassを削除できる
- CSSとTypeScriptをclass名で連携できる

---

# Git差分の確認

変更状況を確認する。

```bash
git status
```

CSSの変更を確認する。

```bash
git diff src/style.css
```

TypeScriptの変更を確認する。

```bash
git diff src/main.ts
```

---

# Gitコミット

変更したファイルをステージングする。

```bash
git add src/style.css src/main.ts develop_flow/03-1_keyboard_feedback.md
```

コミットする。

```bash
git commit -m "Add keyboard press feedback"
```

GitHubへpushする。

```bash
git push
```

---

# 完了条件

以下をすべて満たしたら、この工程は完了とする。

- Enterキーを押すとイコールボタンが押されたように表示される
- Enterキーを離すと通常表示へ戻る
- マウス操作の押下表現も引き続き動作する
- 他のキーではイコールボタンが変化しない
- Consoleとターミナルにエラーがない
- 開発フローへ結果を記録した
- Gitへコミットした
- GitHubへpushした

---

# 次の工程

次はTypeScriptを使い、数字ボタンを押したときに数字を表示画面へ追加する。

```text
develop_flow/04_number_input.md
```