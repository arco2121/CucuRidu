const alphabet = "QWERTYUIOPASDFGHJKLZXCVBNM1234567890qwertyuiopasdfghjklzxcvbnm@#!£$%&/";

const generateId = (length, memory) => {
    if(!memory) return;
    let code = "";
    const utilize = length < 7 ? alphabet.slice(0, alphabet.indexOf("0")) : alphabet;
    length = length > utilize.length ? utilize.length : length;
    do {
        code = "";
        for (let i = 0; i < length; i++) {
            let index;
            do {
                index = Math.floor(Math.random() * utilize.length);
            } while (utilize[index] === code[i - 1]);

            code += utilize[index];
        }
    } while (memory.has(code));
    memory.add(code);
    return code;
}

module.exports = { generateId };