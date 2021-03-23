import { FileReaderError } from "./modules/error-handler.js";

const startBtnEl = document.getElementById('start');
const inputEl = document.getElementById('input');
const contentEl = document.getElementById('content');

let code = '';
inputEl.addEventListener('change', getFile);


// throws FileReaderError
function getFile(e) {
    const input = e.target;
    if('files' in input && input.files.length > 0) {
        const reader = new FileReader();
        new Promise((resolve, reject) => {
            reader.onload = event => resolve(event.target.result);
            reader.onerror = error => reject(error);
            reader.readAsText(input.files[0]);
        }).then(content => {
            code = content;
            contentEl.innerHTML = content;
        }).catch(error => {
            throw new FileReaderError('File reading error: ' + error);
        })
    }
}