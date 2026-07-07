import './style.css'


// outputに表示する機能追加
const display = document.querySelector<HTMLDivElement>("#display");
const MAX_INPUT_LENGTH = 15;
const numberButtons = document.querySelectorAll<HTMLButtonElement>('button[data-number]');

type Operator = "+" | "-" | "*" | "/";

let currentInput = "0";
let previousInput: number | null = null;
let selectedOperator: Operator | null = null;
let waitingForNextInput = false;
let hasError = false;

function updateDisplay(): void {
  if (!display) {
    return;
  }
  display.textContent = currentInput;
}

function inputNumber(number: string): void {
  if(hasError){resetCalculator()};

  if (waitingForNextInput){
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

function isOperator(value: string | undefined,):
  value is Operator {
    return (
      value === "+" || value === "-" || value === "*" || value === "/"
    );
}

function selectOperator(nextOperator: Operator): void {
  const inputValue = Number(currentInput);
  // 演算子が選択されている状態で、次の演算子が選択された場合は、演算子を更新するだけにする。

  if (hasError){return;};

  if (waitingForNextInput && selectedOperator!==null){
    selectedOperator = nextOperator;
    logState();
    return;
  };
  // 連続計算を行う場合は、前回の入力値がnullでないことと、次の入力を待っていない状態であることを確認する。
  if (previousInput === null) {
    previousInput = inputValue;
  } else if (selectedOperator !== null) {
    const result = calculate(
      previousInput,
      inputValue,
      selectedOperator,
    );

    if (result === null || !Number.isFinite(result)){
      showError();
      return;
    }

    const formattedResult = formatResult(result);
    currentInput=formattedResult;
    previousInput = Number(formattedResult);
    updateDisplay();
  }

  selectedOperator = nextOperator;
  waitingForNextInput = true;
  logState();
};

function inputDecimal(): void {
  if (hasError){resetCalculator();}

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

function logState(): void {
  console.log({
    currentInput,
    previousInput,
    selectedOperator,
    waitingForNextInput,
  });
}

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
      if (right === 0){ return null;};
      return left / right;
    default:
      throw new Error(`Unsupported operator: ${operator}`);
  }
}

function formatResult(value: number):string {
  return Number.parseFloat(value.toFixed(10)).toString();
}

function performCalculation(): void {
  if (
    previousInput === null ||
    selectedOperator === null ||
    waitingForNextInput
  ) {
    return;
  }

  const rightInput = Number(currentInput);

  const result = calculate(previousInput, rightInput, selectedOperator);

  if (result === null || !Number.isFinite(result)){
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

function showError(): void {
  currentInput = "Error";
  previousInput = null;
  selectedOperator = null;
  waitingForNextInput = true;
  hasError = true;

  updateDisplay();
}

function resetCalculator(): void {
  currentInput = "0";
  previousInput = null;
  selectedOperator = null;
  waitingForNextInput = false;
  hasError = false;
  updateDisplay();
}

function deleteLastCharacter(): void{
  if (hasError){
    resetCalculator();
    return;
  }
  if (waitingForNextInput) {
    return;
  }
  const nextInput = currentInput.slice(0,-1);
  
  if (nextInput === "" || nextInput==="-"){
    currentInput = "0"
  }else{
    currentInput = nextInput;
  }

  updateDisplay();
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

const decimalButton = document.querySelector<HTMLButtonElement>('button[data-action="decimal"]');
if (decimalButton) {
  decimalButton.addEventListener("click", () => {
    inputDecimal();
  });
}

const equalsButton = document.querySelector<HTMLButtonElement>('button[data-action="equals"]');
equalsButton?.addEventListener("click", () => {
  performCalculation();
});

const clearButton = document.querySelector<HTMLButtonElement>(
  'button[data-action="clear"]',
)
clearButton?.addEventListener("click",() => {resetCalculator();});

const deleteButton = document.querySelector<HTMLButtonElement>('button[data-action="delete"]');
deleteButton?.addEventListener("click", deleteLastCharacter,);






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
  "*": 'button[data-operator="*"]',
  "/": 'button[data-operator="/"]',

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
  }else if (event.key === ".") {
    inputDecimal();
  }else if (isOperator(event.key)) {
    selectOperator(event.key);
  }else if (event.key === "=" || event.key === "Enter") {
    performCalculation();
  }else if (event.key==="Escape"|| event.key ==="Delete"){
    resetCalculator();
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


