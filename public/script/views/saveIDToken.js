(() => {
    const url = fromBackEnd['redirect'];
    const code = fromBackEnd['IDtoken'];

    if(code) localStorage.setItem('cucuriduCode', code);

    location.replace(url)
})();