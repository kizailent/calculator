# 03 CSSで計算機らしく配置する

## 目的

CSSを使って、HTMLで作成した計算機の表示画面とボタンを整える。

この工程では、次の内容を学ぶ。

- 要素を画面中央に配置する
- CSS Gridでボタンを4列に並べる
- ボタンの大きさや余白を揃える
- 演算子ボタンと数字ボタンの見た目を分ける
- スマートフォンでも操作しやすい大きさにする
- `hover`、`active`、`focus-visible`の状態を設定する

この段階では、ボタンを押したときの計算処理は実装しない。

---

## 今回の完成イメージ

```text
┌─────────────────────┐
│                   0 │
├────┬────┬────┬──────┤
│ AC │ ←  │  % │  ÷   │
├────┼────┼────┼──────┤
│  7 │  8 │  9 │  ×   │
├────┼────┼────┼──────┤
│  4 │  5 │  6 │  −   │
├────┼────┼────┼──────┤
│  1 │  2 │  3 │  ＋  │
├─────────┼────┼──────┤
│    0    │  . │  ＝  │
└─────────┴────┴──────┘
```

完成時には、以下を満たす。

- 計算機が画面中央に表示される
- ボタンが基本的に4列で並ぶ
- `0`ボタンだけ横幅が2列分になる
- 表示画面の数字が右寄せになる
- 数字、演算子、操作ボタンを見分けられる
- スマートフォンでも横幅からはみ出さない

---

## 編集するファイル

```text
src/style.css
```

必要に応じて、以下も確認する。

```text
index.html
```

HTML要素の`class`や`data-*`属性が、CSSの指定と一致している必要がある。

---

## 現在のHTML構造

CSSを書く前に、`index.html`の構造を確認する。

```text
body
└── main.calculator
    ├── output#display
    └── div.buttons
        ├── button
        ├── button
        └── ...
```

CSSでは、主に次の要素を指定する。

```css
body
.calculator
#display
.buttons
button
```

さらに、`data-*`属性を使ってボタンの種類を指定する。

```css
button[data-number]
button[data-operator]
button[data-action]
```

---

# 1. すべての要素のサイズ計算を統一する

最初に、次の設定があることを確認する。

```css
* {
  box-sizing: border-box;
}
```

## `box-sizing: border-box`

通常、CSSでは要素の幅に`padding`や`border`が加算される。

`border-box`を設定すると、指定した幅の中に以下が含まれる。

```text
内容
＋
内側の余白
＋
枠線
```

ボタンや計算機全体の幅を管理しやすくなる。

---

# 2. `body`を画面全体の大きさにする

画面中央に計算機を配置するため、`body`が画面全体の高さを持つようにする。

使用する主なプロパティは以下である。

```css
min-height: 100vh;
```

## `vh`

`vh`は、ブラウザ画面の高さを基準にした単位である。

```text
100vh
→ ブラウザ画面の高さと同じ
```

既に設定している以下も残す。

```css
margin: 0;
```

ブラウザが標準で設定している外側の余白を削除する。

---

# 3. 計算機を画面中央に配置する

`body`にFlexboxを設定する。

使用するプロパティは以下である。

```css
display: flex;
justify-content: center;
align-items: center;
```

それぞれの役割は以下の通り。

```text
display: flex
→ 子要素をFlexboxで配置する

justify-content: center
→ 横方向の中央に配置する

align-items: center
→ 縦方向の中央に配置する
```

`body`には、計算機が画面端に接触しないように余白も設定する。

```css
padding: 16px;
```

---

# 4. ページ全体の背景を設定する

計算機本体と区別できるように、`body`へ背景色を設定する。

例として、次のような落ち着いた色を検討する。

```css
background: #f0f2f5;
```

色は自分で変更してよい。

文字の基本フォントも設定する。

```css
font-family: Arial, sans-serif;
```

よりOSに馴染みやすいフォント指定として、次のような設定も使える。

```css
font-family:
  system-ui,
  -apple-system,
  BlinkMacSystemFont,
  "Segoe UI",
  sans-serif;
```

---

# 5. 計算機本体の大きさを設定する

計算機全体は、`.calculator`で指定する。

```css
.calculator {
}
```

使用を検討するプロパティは以下である。

```text
width
max-width
padding
background
border-radius
box-shadow
```

## 横幅

スマートフォンでも画面からはみ出さないようにする。

```css
width: 100%;
max-width: 360px;
```

意味は以下の通り。

```text
width: 100%
→ 親要素の幅に合わせる

max-width: 360px
→ ただし、360pxより大きくしない
```

## 内側の余白

```css
padding: 16px;
```

## 背景色

例：

```css
background: #222;
```

## 角を丸くする

```css
border-radius: 16px;
```

## 影を付ける

```css
box-shadow: 0 12px 30px rgb(0 0 0 / 20%);
```

影の値は以下の順番である。

```text
横方向の位置
縦方向の位置
ぼかしの大きさ
色
```

---

# 6. 数字の表示画面を整える

表示部分は、`id="display"`を使って指定する。

```css
#display {
}
```

表示画面に必要な主な設定は以下である。

```text
display
width
min-height
padding
margin-bottom
background
color
font-size
text-align
border-radius
overflow
```

## 横幅

`output`要素は初期状態ではインライン要素として扱われることがある。

幅を指定できるようにする。

```css
display: block;
width: 100%;
```

## 数字を右寄せにする

```css
text-align: right;
```

## 文字を大きくする

例：

```css
font-size: 2.5rem;
```

`rem`は、Webページの基準文字サイズをもとにした単位である。

## 表示画面の高さを確保する

```css
min-height: 80px;
```

## 数字が長くなった場合への対応

表示内容が横幅を超えたときに崩れにくくする。

```css
overflow-x: auto;
white-space: nowrap;
```

## 視認性を高める

背景色、文字色、内側の余白を設定する。

例：

```css
background: #111;
color: #fff;
padding: 16px;
border-radius: 10px;
margin-bottom: 12px;
```

色や数値は自分で調整する。

---

# 7. ボタンをCSS Gridで並べる

ボタン全体を囲んでいる`.buttons`へCSS Gridを設定する。

```css
.buttons {
}
```

## Gridを有効にする

```css
display: grid;
```

## 4列に分ける

```css
grid-template-columns: repeat(4, 1fr);
```

意味は以下の通り。

```text
repeat(4, 1fr)
→ 同じ幅の列を4つ作る
```

`1fr`は、利用できる幅を均等に分ける単位である。

## ボタン間の余白

```css
gap: 8px;
```

この設定により、縦方向と横方向の両方に余白が入る。

---

# 8. すべてのボタンの基本デザインを設定する

すべての`button`に共通するスタイルを書く。

```css
button {
}
```

使用を検討するプロパティは以下である。

```text
min-height
border
border-radius
font-size
font-weight
cursor
background
color
transition
```

## ボタンの高さ

スマートフォンで押しやすい大きさにする。

例：

```css
min-height: 64px;
```

## 枠線

```css
border: none;
```

## 角を丸くする

```css
border-radius: 10px;
```

## 文字の大きさ

```css
font-size: 1.25rem;
```

## マウスポインター

```css
cursor: pointer;
```

## 色の変化を滑らかにする

```css
transition:
  background-color 0.15s,
  transform 0.05s;
```

---

# 9. 数字ボタンの見た目を設定する

HTMLで付けた`data-number`属性をCSSから指定できる。

```css
button[data-number] {
}
```

例として、数字ボタンに明るめの背景色を設定する。

```css
button[data-number] {
  background: #e5e7eb;
  color: #111;
}
```

`data-*`属性を使うことで、HTMLへ新しいclassを追加しなくてもボタンの種類を区別できる。

---

# 10. 演算子ボタンの見た目を設定する

演算子ボタンは`data-operator`属性を使って指定する。

```css
button[data-operator] {
}
```

数字ボタンと区別できる色を設定する。

例：

```css
button[data-operator] {
  background: #f59e0b;
  color: #fff;
}
```

対象となるボタンは以下である。

```text
＋
−
×
÷
```

---

# 11. 操作ボタンの見た目を設定する

操作ボタンは`data-action`属性を使って指定する。

```css
button[data-action] {
}
```

例：

```css
button[data-action] {
  background: #9ca3af;
  color: #111;
}
```

対象となるボタンは以下である。

```text
AC
←
%
.
＝
```

ただし、小数点やイコールを別の色にしたい場合は、属性値まで指定できる。

例：

```css
button[data-action="equals"] {
}
```

```css
button[data-action="clear"] {
}
```

この形式を属性セレクターという。

---

# 12. `0`ボタンを2列分に広げる

`0`ボタンには、HTMLで以下の属性が付いている。

```html
data-number="0"
```

CSSでは属性値まで指定する。

```css
button[data-number="0"] {
  grid-column: span 2;
}
```

## `grid-column: span 2`

現在の列から、横方向に2列分を使用する。

これにより、最後の行が以下の配置になる。

```text
0      .   ＝
```

---

# 13. ボタンにマウスを重ねた状態を設定する

マウスを重ねた状態は`:hover`で指定する。

```css
button:hover {
}
```

例：

```css
button:hover {
  filter: brightness(1.05);
}
```

`filter: brightness()`は、要素の明るさを変更する。

```text
1
→ 元の明るさ

1.05
→ 少し明るくする

0.9
→ 少し暗くする
```

---

# 14. ボタンを押した状態を設定する

ボタンを押している間は`:active`で指定する。

```css
button:active {
  transform: scale(0.97);
}
```

`scale(0.97)`によって、ボタンが少し小さくなり、押した感覚を表現できる。

---

# 15. キーボード操作時の枠線を設定する

キーボードのTabキーで選択された要素は、`:focus-visible`で指定する。

```css
button:focus-visible {
}
```

例：

```css
button:focus-visible {
  outline: 3px solid #60a5fa;
  outline-offset: 2px;
}
```

`outline`を完全に消すと、キーボード操作時に現在選択している場所が分からなくなる。

そのため、見やすい枠線を設定する。

---

# 16. スマートフォン表示を確認する

今回の基本設計では、以下の設定によって横幅が調整される。

```css
.calculator {
  width: 100%;
  max-width: 360px;
}
```

さらに小さい画面向けに、メディアクエリを使うこともできる。

```css
@media (max-width: 400px) {
}
```

メディアクエリ内では、次のような調整を検討する。

```text
計算機全体のpaddingを小さくする
ボタン間のgapを小さくする
表示画面の文字を少し小さくする
```

最初はメディアクエリを使わず、ブラウザの幅を狭くして問題がないか確認する。

必要な場合だけ追加する。

---

# 自分で実装すること

以下を一つずつ実装する。

- [ ] `body`を画面全体の高さにする
- [ ] 計算機を画面の中央に配置する
- [ ] ページ全体の背景色を設定する
- [ ] `.calculator`の横幅を設定する
- [ ] 計算機本体に背景色と余白を付ける
- [ ] 表示画面を右寄せにする
- [ ] 表示画面の文字を大きくする
- [ ] `.buttons`をCSS Gridにする
- [ ] ボタンを4列に並べる
- [ ] ボタン間に余白を付ける
- [ ] ボタンの高さを揃える
- [ ] 数字ボタンの色を設定する
- [ ] 演算子ボタンの色を設定する
- [ ] 操作ボタンの色を設定する
- [ ] `0`ボタンを2列分に広げる
- [ ] `hover`時の見た目を設定する
- [ ] `active`時の見た目を設定する
- [ ] `focus-visible`時の枠線を設定する

---

# 実装する順番

一度にすべて書かず、以下の順番で動作を確認する。

## 段階1：画面中央への配置

最初に、以下だけを設定する。

```text
bodyの高さ
Flexbox
中央配置
```

ブラウザで計算機が中央に移動することを確認する。

## 段階2：計算機本体

以下を設定する。

```text
横幅
最大幅
背景色
padding
角丸
影
```

計算機の外枠が表示されることを確認する。

## 段階3：表示画面

以下を設定する。

```text
横幅
高さ
数字の右寄せ
文字サイズ
背景色
```

## 段階4：ボタンのGrid配置

以下を設定する。

```text
display: grid
4列
gap
```

ボタンが4列に並ぶことを確認する。

## 段階5：ボタンの装飾

以下を設定する。

```text
高さ
背景色
文字色
角丸
hover
active
focus-visible
```

---

# 動作確認

開発サーバーが起動していない場合は、プロジェクトのルートで実行する。

```bash
npm run dev
```

ブラウザで以下を開く。

```text
http://localhost:5173/
```

以下を確認する。

- [ ] 計算機が画面中央に表示される
- [ ] 計算機の横幅が大きくなりすぎない
- [ ] 表示画面の数字が右寄せになっている
- [ ] ボタンが4列で並んでいる
- [ ] `0`ボタンが2列分の横幅になっている
- [ ] ボタンの高さが揃っている
- [ ] 数字ボタンと演算子ボタンを見分けられる
- [ ] ボタンへマウスを重ねると見た目が変わる
- [ ] ボタンを押すと少し小さくなる
- [ ] Tabキーでボタンを選択できる
- [ ] 画面幅を狭くしても横にはみ出さない
- [ ] ボタンを押してもページが再読み込みされない
- [ ] ターミナルにエラーが表示されていない
- [ ] Consoleに赤色のエラーが表示されていない

ボタンを押しても数字が変わらないのは正常である。

ボタンの処理は次の工程で実装する。

---

# スマートフォン表示の確認方法

Chromeの開発者ツールを開く。

```text
F12
```

画面上部にあるスマートフォンとタブレットの形をしたボタンを押す。

ショートカットは以下である。

```text
Ctrl + Shift + M
```

以下のような画面幅で確認する。

```text
320px
375px
390px
```

計算機が画面外にはみ出さず、各ボタンを押しやすいことを確認する。

---

# CSSが反映されない場合

以下を確認する。

## `main.ts`からCSSを読み込んでいるか

```typescript
import "./style.css";
```

## ファイル名が一致しているか

```text
src/style.css
```

## `class`名が一致しているか

HTML：

```html
<main class="calculator">
```

CSS：

```css
.calculator {
}
```

## ファイルを保存したか

VS Codeで保存する。

```text
Ctrl + S
```

## 開発サーバーが起動しているか

```bash
npm run dev
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
ボタンが1列に並んでしまった
0ボタンが2列分にならなかった
計算機が画面中央に配置されなかった
```

## 原因

ここに原因を記録する。

## 解決方法

ここに実施した解決方法を記録する。

---

# 今回学んだこと

作業後、自分が理解した内容を追記する。

例：

- Flexboxを使うと、要素を縦横の中央に配置できる
- CSS Gridを使うと、ボタンを規則的な列に並べられる
- `repeat(4, 1fr)`で同じ幅の列を4つ作れる
- `grid-column: span 2`で要素を2列分に広げられる
- `data-*`属性はCSSのセレクターとしても利用できる
- `max-width`を使うと、画面が大きくても要素の最大幅を制限できる
- `:hover`はマウスを重ねた状態を表す
- `:active`はボタンを押している状態を表す
- `:focus-visible`はキーボード操作時の選択状態を表す

---

# Git差分の確認

変更したファイルを確認する。

```bash
git status
```

CSSの変更内容を確認する。

```bash
git diff src/style.css
```

開発フローを含むすべての差分を確認する。

```bash
git diff
```

---

# Gitコミット

CSSと開発フローをステージングする。

```bash
git add src/style.css develop_flow/03_css_layout.md
```

コミットする。

```bash
git commit -m "Style calculator layout"
```

GitHubへpushする。

```bash
git push
```

---

# 完了条件

以下をすべて満たしたら、この工程は完了とする。

- 計算機が画面中央に配置されている
- 表示画面が計算機らしく整っている
- ボタンが4列で配置されている
- `0`ボタンが2列分の横幅になっている
- 数字、演算子、操作ボタンの見た目が区別されている
- スマートフォンの画面幅でも崩れない
- ブラウザとターミナルにエラーがない
- `03_css_layout.md`に作業結果を記録した
- Gitへコミットした
- GitHubへpushした

---

# 次の工程

次はTypeScriptを使って、数字ボタンを押したときに表示画面へ数字を追加する。

```text
develop_flow/04_number_input.md
```