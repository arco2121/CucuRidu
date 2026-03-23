const path = window.location.pathname;
const HOSTS = [
    'https://cucuridu.onrender.com/',
    'https://arco2120-cucuridu.hf.space/'
];

for(const link of HOSTS) {
    if(await (await fetch(link)).json()["available"] === true) {
        window.location.replace(link + path);
        break;
    } else continue;
}