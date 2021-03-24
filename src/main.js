import { FileReaderError } from './modules/error-handler.js';
import { Scanner } from './modules/scanner.js'

const startBtnEl = document.getElementById('start');
const inputEl = document.getElementById('input');
const contentEl = document.getElementById('content');

let code = '';

inputEl.addEventListener('change', getFile);
startBtnEl.addEventListener('click', interpret);

function getFile(e) {
    const input = e.target;
    if('files' in input && input.files.length > 0) {
        const reader = new FileReader();
        new Promise((resolve, reject) => {
            reader.onload = event => resolve(event.target.result);
            reader.onerror = error => reject(error);
            reader.readAsText(input.files[0]);
        }).then(content => {
            if (!code.length) throw new FileReaderError('Empty file!');
            code = content;
            contentEl.innerHTML = content;
        }).catch(error => {
            throw new FileReaderError('File reading error: ' + error.message);
        })
    }
}

function interpret() {
    if (code != '') {
        let scanner = new Scanner(code);
        scanner.getToken();
    }
}