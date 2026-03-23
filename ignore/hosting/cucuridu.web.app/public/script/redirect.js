const path = window.location.pathname;
const HOSTS = [
    'https://cucuridu.onrender.com/',
    'https://arco2120-cucuridu.hf.space/'
];
const echo = (str) => document.body.innerText += str;

(async () => {
    for(const link of HOSTS) {
        const responce = await (await fetch(link + "ping"), {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            }
        }).json();
        if(responce["available"] === true) {
            window.location.replace(link + path);
            return;
        }
    }
    echo("Nessun sito è disponibile...");
})();