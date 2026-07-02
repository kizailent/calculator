import './style.css'


// outputに表示する機能追加
const display = document.querySelector<HTMLDivElement>("#display");
const MAX_INPUT_LENFTH = 15;
const numberButtons = document.querySelectorAll<HTMLButtonElement>('button[data-number]');

type Operator = "+" | "-" | "×" | "÷";

let currentInput = "0";
let previousInput: number | null = null;
let selectedOperator: Operator | null = null;
let waitingForNextInput = false;

function updateDisplay(): void {
  if (!display) {
    return;
  }
  display.textContent = currentInput;
}

function inputNumber(number: string): void {
  if (waitingForNextInput){
    currentInput = number;
    waitingForNextInput = false;
    updateDisplay();
    return;
  }

  if (currentInput.length >= MAX_INPUT_LENFTH) {
    return;
  }

  if (currentInput === "0") {
    currentInput = number;
  } else {
    currentInput += number;
  }
  updateDisplay();
}

function isOperator(value: string | undefined,):
  value is Operator {
    return (
      value === "+" || value === "-" || value === "×" || value === "÷"
    );
}

function selectOperator(nextOperator: Operator): void {
  // 演算子が選択されている状態で、次の演算子が選択された場合は、演算子を更新するだけにする。
  if (waitingForNextInput && selectedOperator!==null){
    selectedOperator = nextOperator;
    logState();
    return;
  };
  // 連続計算を行う場合は、前回の入力値がnullでないことと、次の入力を待っていない状態であることを確認する。
  if (previousInput !== null && !waitingForNextInput) {
    console.info("連続計算はまだ実行しない。");
    return;
  }

  previousInput = Number(currentInput);
  selectedOperator = nextOperator;
  waitingForNextInput = true;
  logState();
};

function logState(): void {
  console.log({
    currentInput,
    previousInput,
    selectedOperator,
    waitingForNextInput,
  });
}

numberButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const number = button.dataset.number;
    if (number=== undefined) {
      return;
    }
    inputNumber(number);
  });
});

const operatorButtons = document.querySelectorAll<HTMLButtonElement>('button[data-operator]');

operatorButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const operatorValue = button.dataset.operator;
    if (!isOperator(operatorValue)) {
      return;
    }
    selectOperator(operatorValue);
  });
});






// キーボード操作対応
const KeyToButtonSelector: Record<string, string> = {
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
  "*": 'button[data-operator="×"]',
  "/": 'button[data-operator="÷"]',

  ".": 'button[data-action="decimal"]',
  "%": 'button[data-action="percent"]',

  "=": 'button[data-action="equals"]',
  "Enter": 'button[data-action="equals"]',
  "Backspace": 'button[data-action="delete"]',
  "Escape": 'button[data-action="clear"]',
  "Delete": 'button[data-action="clear"]',
}

function getButtonFromKey(key: string,): HTMLButtonElement | null {
  const selector = KeyToButtonSelector[key];

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

  if (/^[0-9]$/.test(event.key)) {
    inputNumber(event.key);
  }
});

document.addEventListener("keyup", (enent) => {
  const button = getButtonFromKey(enent.key);

  if (!button) {
    return;
  }

  button.classList.remove("keyboard-active");
});



window.addEventListener("blur", () => {
  const activeButtons = 
    document.querySelectorAll<HTMLButtonElement>("button.keyboard-active");

  activeButtons.forEach((button) => {
    button.classList.remove("keyboard-active");
  });
});


