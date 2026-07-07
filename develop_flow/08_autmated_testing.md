# 08 Playwrightで計算機のテストを自動化する

## 目的

これまで実装した計算機の機能を、Playwrightを使って自動テストする。

ブラウザ上で実際にボタンをクリックしたり、キーボードを入力したりして、表示結果が期待どおりになるか確認する。

今回、自動テストする機能は次のとおり。

- 初期表示
- 数字入力
- 先頭の0の処理
- 最大入力文字数
- 小数点入力
- 四則演算
- 浮動小数点誤差の整形
- 計算結果後の新規入力
- 連続計算
- 演算子の変更
- 不完全な状態でのイコール
- 0除算
- エラー状態からの復帰
- AC
- Backspace
- パーセント
- キーボード操作
- キーボードの押下表現
- レスポンシブ表示
- JavaScriptエラーの有無
- 本番ビルド

---

## 自動化できない、または人間の確認が残るもの

次の項目は完全な自動判定が難しい。

- デザインが自然に見えるか
- 色や余白の印象がよいか
- 実際のスマートフォンで押しやすいか
- 文字サイズが感覚的に読みやすいか
- スクリーンリーダー利用時に自然か

ただし、画面の崩れや意図しない見た目の変更は、スクリーンショット比較である程度自動検出できる。

---

## 今回使用するテスト

```text
E2Eテスト
```

E2Eは次の略である。

```text
End to End
```

利用者が実際に行う操作を、最初から最後まで再現して確認する。

例えば、次の操作を自動実行する。

```text
2をクリック
↓
+をクリック
↓
3をクリック
↓
=をクリック
↓
表示が5か確認
```

---

## 使用するツール

```text
Playwright
```

Playwrightは、実際のブラウザを自動操作してWebアプリをテストするためのツールである。

今回の計算機では、以下を自動化できる。

```text
ボタンのクリック
キーボード入力
表示内容の確認
画面サイズの変更
CSSクラスの確認
複数ブラウザでの実行
```

---

# 1. Node.jsのバージョンを確認する

ターミナルで実行する。

```bash
node -v
npm -v
```

Node.jsとnpmのバージョンが表示されることを確認する。

---

# 2. Playwrightを導入する

プロジェクトのルートディレクトリで実行する。

```bash
npm init playwright@latest
```

質問には次のように回答する。

```text
TypeScript or JavaScript?
→ TypeScript

Where to put your end-to-end tests?
→ tests

Add a GitHub Actions workflow?
→ false または No

Install Playwright browsers?
→ true または Yes

? Install Playwright operating system dependencies
→ true
```

今回、GitHub Actionsは09の公開工程で追加するため、ここでは追加しなくてもよい。

導入後、次のようなファイルが作られる。

```text
playwright.config.ts
tests/
  example.spec.ts
```

---

# 3. Playwrightの導入を確認する

バージョンを確認する。

```bash
npx playwright --version
```

ブラウザのインストールが必要な場合は実行する。

```bash
npx playwright install
```

Linux環境で依存関係が不足している場合は、表示された案内に従う。

---

# 4. サンプルテストを削除する

自動生成されたサンプルテストが不要な場合は削除する。

```bash
rm tests/example.spec.ts
```

削除後の構成：

```text
tests/
```

---

# 5. Playwrightの設定を作る

`playwright.config.ts`を次の内容にする。

```typescript
import {
  defineConfig,
  devices,
} from "@playwright/test";

export default defineConfig({
  testDir: "./tests",

  fullyParallel: true,

  forbidOnly: Boolean(process.env.CI),

  retries: process.env.CI ? 2 : 0,

  workers: process.env.CI ? 1 : undefined,

  reporter: "html",

  use: {
    baseURL: "http://127.0.0.1:5173",

    trace: "on-first-retry",
  },

  webServer: {
    command:
      "npm run dev -- --host 127.0.0.1",

    url: "http://127.0.0.1:5173",

    reuseExistingServer:
      !process.env.CI,
  },

  projects: [
    {
      name: "chromium",
      use: {
        ...devices["Desktop Chrome"],
      },
    },
    {
      name: "firefox",
      use: {
        ...devices["Desktop Firefox"],
      },
    },
    {
      name: "webkit",
      use: {
        ...devices["Desktop Safari"],
      },
    },
  ],
});
```

---

## `testDir`

```typescript
testDir: "./tests"
```

テストファイルを配置するフォルダを指定する。

---

## `baseURL`

```typescript
baseURL: "http://127.0.0.1:5173"
```

テスト対象のアプリケーションURLを指定する。

テスト内では、次のように短く書ける。

```typescript
await page.goto("/");
```

実際には次のURLへアクセスする。

```text
http://127.0.0.1:5173/
```

---

## `webServer`

```typescript
webServer: {
  command:
    "npm run dev -- --host 127.0.0.1",

  url: "http://127.0.0.1:5173",

  reuseExistingServer:
    !process.env.CI,
},
```

Playwrightのテスト開始時に、Viteの開発サーバーを自動で起動する。

そのため、テスト前に自分で次を実行する必要はない。

```bash
npm run dev
```

既に開発サーバーが動いている場合は、それを再利用する。

---

## `projects`

```typescript
projects: [
  chromium,
  firefox,
  webkit,
]
```

同じテストを、異なるブラウザで実行する。

```text
Chromium
Firefox
WebKit
```

最初はChromiumだけで確認し、完成後に3ブラウザで実行してもよい。

---

# 6. package.jsonへテスト用コマンドを追加する

`package.json`の`scripts`を確認する。

次のコマンドを追加する。

```json
{
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview",
    "test": "playwright test",
    "test:ui": "playwright test --ui",
    "test:headed": "playwright test --headed",
    "test:chromium": "playwright test --project=chromium",
    "test:report": "playwright show-report",
    "test:all": "npm run build && playwright test"
  }
}
```

既存の`scripts`を消さず、必要な項目だけ追加する。

---

## 各コマンドの意味

通常の自動テスト：

```bash
npm test
```

テスト画面を表示する：

```bash
npm run test:ui
```

実際のブラウザを表示しながら実行する：

```bash
npm run test:headed
```

Chromiumだけで実行する：

```bash
npm run test:chromium
```

テストレポートを表示する：

```bash
npm run test:report
```

ビルドと全ブラウザテストを実行する：

```bash
npm run test:all
```

---

# 7. テストファイルを作成する

次のファイルを作る。

```text
tests/calculator.spec.ts
```

---

# 8. テストで使用する補助関数を作る

`tests/calculator.spec.ts`へ次を書く。

```typescript
import {
  test,
  expect,
  type Page,
} from "@playwright/test";

function display(page: Page) {
  return page.locator("#display");
}

function numberButton(
  page: Page,
  number: string,
) {
  return page.locator(
    `button[data-number="${number}"]`,
  );
}

function operatorButton(
  page: Page,
  operator: string,
) {
  return page.locator(
    `button[data-operator="${operator}"]`,
  );
}

function actionButton(
  page: Page,
  action: string,
) {
  return page.locator(
    `button[data-action="${action}"]`,
  );
}

async function inputValue(
  page: Page,
  value: string,
): Promise<void> {
  for (const character of value) {
    if (character === ".") {
      await actionButton(
        page,
        "decimal",
      ).click();
    } else {
      await numberButton(
        page,
        character,
      ).click();
    }
  }
}

async function expectDisplay(
  page: Page,
  expected: string,
): Promise<void> {
  await expect(
    display(page),
  ).toHaveText(expected);
}
```

---

## `Page`

```typescript
type Page
```

ブラウザの1つのタブを表す型である。

---

## `numberButton`

```typescript
numberButton(page, "7")
```

次のHTML要素を取得する。

```html
<button data-number="7">7</button>
```

---

## `operatorButton`

```typescript
operatorButton(page, "*")
```

次のHTML要素を取得する。

```html
<button data-operator="*">×</button>
```

---

## `actionButton`

```typescript
actionButton(page, "equals")
```

次のHTML要素を取得する。

```html
<button data-action="equals">＝</button>
```

---

## `inputValue`

```typescript
await inputValue(page, "12.5");
```

次の操作を自動実行する。

```text
1をクリック
2をクリック
.をクリック
5をクリック
```

---

# 9. 各テストの前にページを開く

補助関数の後に追加する。

```typescript
test.beforeEach(async ({ page }) => {
  await page.goto("/");
});
```

各テストは、ページを開き直した初期状態から開始する。

これにより、前のテストの計算状態が次のテストへ残らない。

---

# 10. 初期表示をテストする

```typescript
test(
  "初期表示は0になる",
  async ({ page }) => {
    await expectDisplay(page, "0");
  },
);
```

---

# 11. 数字入力をテストする

```typescript
test(
  "複数桁の数字を入力できる",
  async ({ page }) => {
    await inputValue(page, "123");

    await expectDisplay(page, "123");
  },
);
```

---

# 12. 先頭の0をテストする

```typescript
test(
  "先頭の不要な0を追加しない",
  async ({ page }) => {
    await inputValue(page, "0005");

    await expectDisplay(page, "5");
  },
);
```

---

# 13. 最大入力文字数をテストする

```typescript
test(
  "16文字目は入力されない",
  async ({ page }) => {
    await inputValue(
      page,
      "1234567890123456",
    );

    await expectDisplay(
      page,
      "123456789012345",
    );
  },
);
```

---

# 14. 小数点をテストする

```typescript
test(
  "小数を入力できる",
  async ({ page }) => {
    await inputValue(page, "12.5");

    await expectDisplay(page, "12.5");
  },
);
```

---

## 最初に小数点を入力する

```typescript
test(
  "小数点から入力すると0から始まる",
  async ({ page }) => {
    await actionButton(
      page,
      "decimal",
    ).click();

    await numberButton(
      page,
      "5",
    ).click();

    await expectDisplay(page, "0.5");
  },
);
```

---

## 小数点を複数追加しない

```typescript
test(
  "小数点を複数追加しない",
  async ({ page }) => {
    await inputValue(page, "1.2");

    await actionButton(
      page,
      "decimal",
    ).click();

    await numberButton(
      page,
      "3",
    ).click();

    await expectDisplay(page, "1.23");
  },
);
```

---

# 15. 四則演算をまとめてテストする

次のテストケースを作る。

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
    name: "引き算",
    left: "8",
    operator: "-",
    right: "5",
    expected: "3",
  },
  {
    name: "掛け算",
    left: "4",
    operator: "*",
    right: "6",
    expected: "24",
  },
  {
    name: "割り算",
    left: "9",
    operator: "/",
    right: "3",
    expected: "3",
  },
  {
    name: "負の計算結果",
    left: "3",
    operator: "-",
    right: "8",
    expected: "-5",
  },
  {
    name: "小数の足し算",
    left: "1.5",
    operator: "+",
    right: "2.3",
    expected: "3.8",
  },
];

for (const testCase of arithmeticCases) {
  test(
    testCase.name,
    async ({ page }) => {
      await inputValue(
        page,
        testCase.left,
      );

      await operatorButton(
        page,
        testCase.operator,
      ).click();

      await inputValue(
        page,
        testCase.right,
      );

      await actionButton(
        page,
        "equals",
      ).click();

      await expectDisplay(
        page,
        testCase.expected,
      );
    },
  );
}
```

---

## テーブル駆動テスト

複数の入力と期待結果を配列へまとめ、同じテスト処理を繰り返している。

```text
入力データ
↓
共通の操作
↓
期待結果を確認
```

この形式をテーブル駆動テストという。

同じようなテストコードを何度も書かずに済む。

---

# 16. 浮動小数点誤差をテストする

```typescript
test(
  "0.1 + 0.2は0.3と表示する",
  async ({ page }) => {
    await inputValue(page, "0.1");

    await operatorButton(
      page,
      "+",
    ).click();

    await inputValue(page, "0.2");

    await actionButton(
      page,
      "equals",
    ).click();

    await expectDisplay(page, "0.3");
  },
);
```

---

# 17. 計算後の数字入力をテストする

```typescript
test(
  "計算後の数字入力は結果を置き換える",
  async ({ page }) => {
    await inputValue(page, "2");

    await operatorButton(
      page,
      "+",
    ).click();

    await inputValue(page, "3");

    await actionButton(
      page,
      "equals",
    ).click();

    await numberButton(
      page,
      "7",
    ).click();

    await expectDisplay(page, "7");
  },
);
```

---

# 18. 計算結果を次の計算に使う

```typescript
test(
  "計算結果を次の左辺に使える",
  async ({ page }) => {
    await inputValue(page, "2");

    await operatorButton(
      page,
      "+",
    ).click();

    await inputValue(page, "3");

    await actionButton(
      page,
      "equals",
    ).click();

    await operatorButton(
      page,
      "*",
    ).click();

    await inputValue(page, "4");

    await actionButton(
      page,
      "equals",
    ).click();

    await expectDisplay(page, "20");
  },
);
```

---

# 19. 連続計算をテストする

```typescript
test(
  "入力順に連続計算する",
  async ({ page }) => {
    await inputValue(page, "2");

    await operatorButton(
      page,
      "+",
    ).click();

    await inputValue(page, "3");

    await operatorButton(
      page,
      "*",
    ).click();

    await expectDisplay(page, "5");

    await inputValue(page, "4");

    await actionButton(
      page,
      "equals",
    ).click();

    await expectDisplay(page, "20");
  },
);
```

今回の計算機は、一般的な演算子の優先順位ではなく、入力順に計算する。

```text
2 + 3 = 5
5 × 4 = 20
```

---

# 20. 演算子の変更をテストする

```typescript
test(
  "右辺入力前なら演算子を変更できる",
  async ({ page }) => {
    await inputValue(page, "9");

    await operatorButton(
      page,
      "+",
    ).click();

    await operatorButton(
      page,
      "*",
    ).click();

    await inputValue(page, "2");

    await actionButton(
      page,
      "equals",
    ).click();

    await expectDisplay(page, "18");
  },
);
```

---

# 21. 不完全な状態のイコールをテストする

```typescript
test(
  "初期状態でイコールを押しても0のまま",
  async ({ page }) => {
    await actionButton(
      page,
      "equals",
    ).click();

    await expectDisplay(page, "0");
  },
);
```

```typescript
test(
  "演算子直後のイコールは無視する",
  async ({ page }) => {
    await inputValue(page, "5");

    await operatorButton(
      page,
      "+",
    ).click();

    await actionButton(
      page,
      "equals",
    ).click();

    await expectDisplay(page, "5");
  },
);
```

---

# 22. 0除算をテストする

```typescript
test(
  "0除算ではErrorを表示する",
  async ({ page }) => {
    await inputValue(page, "8");

    await operatorButton(
      page,
      "/",
    ).click();

    await inputValue(page, "0");

    await actionButton(
      page,
      "equals",
    ).click();

    await expectDisplay(page, "Error");
  },
);
```

---

# 23. エラー後の数字入力をテストする

```typescript
test(
  "Error後の数字入力は新しい計算になる",
  async ({ page }) => {
    await inputValue(page, "8");

    await operatorButton(
      page,
      "/",
    ).click();

    await inputValue(page, "0");

    await actionButton(
      page,
      "equals",
    ).click();

    await numberButton(
      page,
      "7",
    ).click();

    await expectDisplay(page, "7");
  },
);
```

---

# 24. ACをテストする

```typescript
test(
  "ACで初期状態へ戻る",
  async ({ page }) => {
    await inputValue(page, "123");

    await actionButton(
      page,
      "clear",
    ).click();

    await expectDisplay(page, "0");
  },
);
```

---

## 計算途中のAC

```typescript
test(
  "計算途中のACで状態を初期化する",
  async ({ page }) => {
    await inputValue(page, "12");

    await operatorButton(
      page,
      "+",
    ).click();

    await inputValue(page, "5");

    await actionButton(
      page,
      "clear",
    ).click();

    await inputValue(page, "7");

    await operatorButton(
      page,
      "+",
    ).click();

    await inputValue(page, "2");

    await actionButton(
      page,
      "equals",
    ).click();

    await expectDisplay(page, "9");
  },
);
```

---

# 25. Backspaceをテストする

```typescript
test(
  "削除ボタンで最後の1文字を削除する",
  async ({ page }) => {
    await inputValue(page, "123");

    await actionButton(
      page,
      "delete",
    ).click();

    await expectDisplay(page, "12");
  },
);
```

---

## 最後の文字を削除したら0へ戻す

```typescript
test(
  "最後の1文字を削除すると0になる",
  async ({ page }) => {
    await inputValue(page, "7");

    await actionButton(
      page,
      "delete",
    ).click();

    await expectDisplay(page, "0");
  },
);
```

---

## Error中の削除

```typescript
test(
  "Error中の削除で初期状態へ戻る",
  async ({ page }) => {
    await inputValue(page, "8");

    await operatorButton(
      page,
      "/",
    ).click();

    await inputValue(page, "0");

    await actionButton(
      page,
      "equals",
    ).click();

    await actionButton(
      page,
      "delete",
    ).click();

    await expectDisplay(page, "0");
  },
);
```

---

# 26. パーセントをまとめてテストする

```typescript
const percentCases = [
  {
    name: "単独のパーセント",
    left: null,
    operator: null,
    right: "50",
    expected: "0.5",
  },
  {
    name: "足し算のパーセント",
    left: "200",
    operator: "+",
    right: "10",
    expected: "220",
  },
  {
    name: "引き算のパーセント",
    left: "200",
    operator: "-",
    right: "10",
    expected: "180",
  },
  {
    name: "掛け算のパーセント",
    left: "200",
    operator: "*",
    right: "10",
    expected: "20",
  },
  {
    name: "割り算のパーセント",
    left: "200",
    operator: "/",
    right: "10",
    expected: "2000",
  },
];

for (const testCase of percentCases) {
  test(
    testCase.name,
    async ({ page }) => {
      if (
        testCase.left !== null &&
        testCase.operator !== null
      ) {
        await inputValue(
          page,
          testCase.left,
        );

        await operatorButton(
          page,
          testCase.operator,
        ).click();
      }

      await inputValue(
        page,
        testCase.right,
      );

      await actionButton(
        page,
        "percent",
      ).click();

      if (testCase.operator !== null) {
        await actionButton(
          page,
          "equals",
        ).click();
      }

      await expectDisplay(
        page,
        testCase.expected,
      );
    },
  );
}
```

---

# 27. キーボード入力をテストする

```typescript
test(
  "キーボードだけで計算できる",
  async ({ page }) => {
    await page.keyboard.type(
      "12.5+7.5",
    );

    await page.keyboard.press(
      "Enter",
    );

    await expectDisplay(page, "20");
  },
);
```

---

## キーボードによる掛け算

```typescript
test(
  "キーボードのアスタリスクで掛け算できる",
  async ({ page }) => {
    await page.keyboard.type("4*5");

    await page.keyboard.press(
      "Enter",
    );

    await expectDisplay(page, "20");
  },
);
```

---

## キーボードによる割り算

```typescript
test(
  "キーボードのスラッシュで割り算できる",
  async ({ page }) => {
    await page.keyboard.type("8/2");

    await page.keyboard.press(
      "Enter",
    );

    await expectDisplay(page, "4");
  },
);
```

---

## Escapeによるリセット

```typescript
test(
  "Escapeキーで初期状態へ戻る",
  async ({ page }) => {
    await page.keyboard.type("123");

    await page.keyboard.press(
      "Escape",
    );

    await expectDisplay(page, "0");
  },
);
```

---

## Backspaceキー

```typescript
test(
  "Backspaceキーで1文字削除できる",
  async ({ page }) => {
    await page.keyboard.type("123");

    await page.keyboard.press(
      "Backspace",
    );

    await expectDisplay(page, "12");
  },
);
```

---

# 28. キーボード押下表現をテストする

```typescript
test(
  "キーを押している間だけkeyboard-activeが付く",
  async ({ page }) => {
    const button =
      numberButton(page, "5");

    await page.keyboard.down("5");

    await expect(button).toHaveClass(
      /keyboard-active/,
    );

    await page.keyboard.up("5");

    await expect(button).not.toHaveClass(
      /keyboard-active/,
    );
  },
);
```

---

# 29. レスポンシブ表示をテストする

```typescript
const viewportCases = [
  {
    width: 320,
    height: 700,
  },
  {
    width: 375,
    height: 800,
  },
  {
    width: 768,
    height: 900,
  },
  {
    width: 1024,
    height: 800,
  },
];

for (const viewport of viewportCases) {
  test(
    `${viewport.width}pxで横方向にはみ出さない`,
    async ({ page }) => {
      await page.setViewportSize(
        viewport,
      );

      await page.goto("/");

      const hasNoHorizontalOverflow =
        await page.evaluate(() => {
          return (
            document.documentElement
              .scrollWidth <=
            document.documentElement
              .clientWidth
          );
        });

      expect(
        hasNoHorizontalOverflow,
      ).toBe(true);

      await expect(
        page.locator(".calculator"),
      ).toBeInViewport();
    },
  );
}
```

このテストでは、次を確認する。

```text
横スクロールが発生しない
計算機が画面内に存在する
```

デザインの美しさまでは判定しない。

---

# 30. JavaScriptエラーをテストする

```typescript
test(
  "主要操作でJavaScriptエラーが発生しない",
  async ({ page }) => {
    const errors: string[] = [];

    page.on(
      "pageerror",
      (error) => {
        errors.push(error.message);
      },
    );

    page.on(
      "console",
      (message) => {
        if (message.type() === "error") {
          errors.push(message.text());
        }
      },
    );

    await page.reload();

    await inputValue(page, "2");

    await operatorButton(
      page,
      "+",
    ).click();

    await inputValue(page, "3");

    await actionButton(
      page,
      "equals",
    ).click();

    await actionButton(
      page,
      "clear",
    ).click();

    await inputValue(page, "8");

    await operatorButton(
      page,
      "/",
    ).click();

    await inputValue(page, "0");

    await actionButton(
      page,
      "equals",
    ).click();

    expect(errors).toEqual([]);
  },
);
```

---

# 31. 全テストファイルの形

`tests/calculator.spec.ts`は、次の順番で構成する。

```text
1. Playwrightのimport

2. 補助関数
   - display
   - numberButton
   - operatorButton
   - actionButton
   - inputValue
   - expectDisplay

3. beforeEach

4. 数字入力のテスト

5. 小数点のテスト

6. 四則演算のテスト

7. 連続計算のテスト

8. エラー処理のテスト

9. ACのテスト

10. Backspaceのテスト

11. パーセントのテスト

12. キーボードのテスト

13. レスポンシブのテスト

14. JavaScriptエラーのテスト
```

---

# 32. Chromiumだけで最初のテストを実行する

```bash
npm run test:chromium
```

成功した場合の例：

```text
passed
```

失敗した場合は、次の情報が表示される。

```text
失敗したテスト名
期待した値
実際の値
失敗した行番号
スクリーンショット
トレース
```

---

# 33. ブラウザを表示して確認する

```bash
npm run test:headed
```

実際にブラウザが開き、自動でボタンが押される様子を確認できる。

---

# 34. UIモードで確認する

```bash
npm run test:ui
```

UIモードでは、テストを1件ずつ選んで実行できる。

確認できるもの：

```text
実行した操作
各時点の画面
テスト結果
エラー箇所
DOMの状態
```

---

# 35. 全ブラウザでテストする

Chromiumのテストが通ったら、全ブラウザで実行する。

```bash
npm test
```

対象：

```text
Chromium
Firefox
WebKit
```

---

# 36. ビルドとテストをまとめて実行する

```bash
npm run test:all
```

実行順序：

```text
TypeScriptの確認
↓
Viteの本番ビルド
↓
Playwrightの全テスト
```

ビルドまたはテストのどちらかが失敗すると、コマンド全体が失敗する。

---

# 37. テストレポートを確認する

```bash
npm run test:report
```

ブラウザでHTML形式のレポートが開く。

確認できるもの：

```text
成功したテスト
失敗したテスト
実行時間
ブラウザごとの結果
エラー内容
```

---

# 38. スクリーンショット比較を追加する

見た目が意図せず変化していないか確認する場合は、次のテストを追加する。

```typescript
test(
  "計算機の見た目が変化していない",
  async ({ page }) => {
    await page.setViewportSize({
      width: 375,
      height: 800,
    });

    await page.goto("/");

    await expect(
      page.locator(".calculator"),
    ).toHaveScreenshot(
      "calculator-375.png",
    );
  },
);
```

最初の実行では、比較基準となる画像を作る。

```bash
npx playwright test \
  --project=chromium \
  --update-snapshots
```

その後のテストでは、現在の画面と基準画像を比較する。

CSSを意図的に変更した場合は、画像を確認してから基準画像を更新する。

---

# 39. スクリーンショットテストの注意点

スクリーンショットの一致は自動判定できる。

ただし、最初の基準画像が正しいかどうかは人間が確認する必要がある。

```text
基準画像が正しい
↓
その後の意図しない変更を自動検出できる
```

CSSを改善した場合は、差分が出ること自体は正常である。

---

# 40. 自動テストで発見した不具合を記録する

```markdown
## 不具合1

### 失敗したテスト

```text
200 + 10 % = 220
```

### 期待結果

```text
220
```

### 実際の結果

```text
200.1
```

### 原因

```text
加算時にも右辺を単純に100で割っていた
```

### 修正内容

```typescript
percentValue =
  previousInput * inputValue / 100;
```

### 再テスト

```bash
npm run test:chromium
```

### 結果

- [x] 成功
```

---

# 41. 手動で確認する項目

自動テスト完了後、次だけは目視で確認する。

- [ ] ボタンの文字が中央に見える
- [ ] ボタンの大きさが押しやすい
- [ ] 表示欄の数字が読みやすい
- [ ] hover時の変化が自然である
- [ ] active時の変化が自然である
- [ ] 320px幅でも操作しやすい
- [ ] PC画面で計算機が自然な位置にある
- [ ] 実際のスマートフォンでも表示できる

---

# 42. 自動化できる範囲のまとめ

| テスト対象 | 自動化 |
|---|---|
| 四則演算 | 可能 |
| 小数計算 | 可能 |
| 0除算 | 可能 |
| AC | 可能 |
| Backspace | 可能 |
| パーセント | 可能 |
| キーボード | 可能 |
| 最大文字数 | 可能 |
| レスポンシブのはみ出し | 可能 |
| JavaScriptエラー | 可能 |
| 複数ブラウザ | 可能 |
| ビルド | 可能 |
| 見た目の変化 | スクリーンショット比較で可能 |
| デザインの良し悪し | 手動確認 |
| 実機での押しやすさ | 手動確認 |

---

# Git管理対象を確認する

```bash
git status
```

Playwright導入後、主に次のファイルが追加される。

```text
playwright.config.ts
tests/calculator.spec.ts
package.json
package-lock.json
```

スクリーンショットテストを追加した場合は、基準画像も管理対象になる。

```text
tests/calculator.spec.ts-snapshots/
```

テスト実行結果の一時ファイルは、通常Git管理しない。

```text
playwright-report/
test-results/
```

`.gitignore`に含まれているか確認する。

---

# Git差分を確認する

```bash
git diff
```

```bash
git diff package.json
```

```bash
git diff playwright.config.ts
```

---

# Gitコミット

```bash
git add \
  package.json \
  package-lock.json \
  playwright.config.ts \
  tests/calculator.spec.ts \
  develop_flow/08_automated_testing.md
```

スクリーンショット基準画像を追加した場合：

```bash
git add \
  tests/calculator.spec.ts-snapshots
```

コミットする。

```bash
git commit -m \
  "Add automated calculator tests"
```

GitHubへpushする。

```bash
git push
```

---

# 完了条件

以下をすべて満たしたら、この工程は完了とする。

- Playwrightを導入した
- Playwright用ブラウザをインストールした
- `playwright.config.ts`を設定した
- テスト時にViteが自動起動する
- 初期表示を自動テストできる
- 数字入力を自動テストできる
- 最大文字数を自動テストできる
- 小数点を自動テストできる
- 四則演算を自動テストできる
- 浮動小数点誤差を自動テストできる
- 連続計算を自動テストできる
- 演算子変更を自動テストできる
- 0除算を自動テストできる
- ACを自動テストできる
- Backspaceを自動テストできる
- パーセントを自動テストできる
- キーボード操作を自動テストできる
- キーボードの押下表現をテストできる
- レスポンシブ時の横方向のはみ出しを確認できる
- JavaScriptエラーを検出できる
- Chromiumで全テストが成功する
- Firefoxで全テストが成功する
- WebKitで全テストが成功する
- `npm run build`が成功する
- `npm run test:all`が成功する
- 手動確認項目も確認した
- Gitへコミットした
- GitHubへpushした

---

# 次の工程

次は、自動テストに成功したコードをGitHub Pagesへ公開する。

```text
develop_flow/09_deploy.md
```

09では、次の処理を自動化する。

```text
GitHubへpush
↓
自動テスト
↓
本番ビルド
↓
GitHub Pagesへ公開
```