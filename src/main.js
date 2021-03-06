import { FileReaderError } from './modules/error-handler.js';
import { Parser } from './modules/parser/parser.js';
import { Executor } from './modules/executor/executor.js';
import { stdLib } from './modules/std-lib/std-lib.js';

const startBtnEl = document.getElementById('start');
const inputEl = document.getElementById('input');
const contentEl = document.getElementById('content');
const tokensDiv = document.getElementById('content');
const stateEL = document.getElementById('state-of-content');

let code = '';

inputEl.addEventListener('change', getFile);
startBtnEl.addEventListener('click', interpret);

function getFile(e) {
    const input = e.target;
    if ('files' in input && input.files.length > 0) {
        const reader = new FileReader();
        new Promise((resolve, reject) => {
            reader.onload = (event) => resolve(event.target.result);
            reader.onerror = (error) => reject(error);
            reader.readAsText(input.files[0]);
        })
            .then((content) => {
                if (!content) throw new FileReaderError('Empty file!');
                stateEL.textContent = 'Code to interpret: ';
                code = content;
                contentEl.innerHTML = content;
            })
            .catch((error) => {
                stateEL.textContent = 'Empty!';
                throw new FileReaderError(
                    'File reading error: ' + error.message
                );
            });
    }
}

function interpret() {
    if (code === '') return;
    let parser = new Parser(code, 50);
    let program = parser.parse();
    program.setLibFunMap(stdLib);
    console.log(program);
    let executor = new Executor(program);
    console.log(executor.executeProgram());
}
