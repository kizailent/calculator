import {test, expect, type Page,} from "@playwright/test";

function display(page:Page){ return page.locator("#display")};

function numberButton(page:Page, number:string,){
  return page.locator(`button[data-number="${number}"]`,);
}

function operatorButton(page:Page,operator:string,){
  return page.locator(`button[data-operator="${operator}"]`);
}

function actionButton(page:Page,action:string,){
  return page.locator(`button[data-action="${action}"]`,);
}


async function inputValue(page:Page, value: string,):Promise<void>{
  for (const character of value){
    if (character==="."){
      await actionButton(page,"decimal",).click();
    } else{
      await numberButton(page,character,).click();
    }
  }
}

async function expectDisplay(page:Page,expected:string,):Promise<void> {
  await expect(display(page)).toHaveText(expected);
}


test.beforeEach(async ({page}) => {
  await page.goto("/");
})

test(
  "初期表示は0になる",
  async ({page}) => {
    await expectDisplay(page, "0");
  }
)

test(
  "複数桁の数字を入力できる",
  async ({ page }) => {
    await inputValue(page, "123");
    await expectDisplay(page, "123");
  },
);

test(
  "先頭の不要な0を追加しない",
  async ({ page }) => {
    await inputValue(page, "0005");
    await expectDisplay(page, "5");
  },
);

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

test(
  "小数を入力できる",
  async ({ page }) => {
    await inputValue(page, "12.5");

    await expectDisplay(page, "12.5");
  },
);

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

