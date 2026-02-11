const loadScreen = (root) => {
    const raw = `
        <div class="row">
            <img class="loadimg" src="/assets/loading.gif" alt="loadingScreen">
            <h5 id="textLoading">Caricando</h5>
        </div>
    `;
    const listener = new Event("loadScreenEnd");
    const element = document.createElement("div")
    element.classList.add("loadscreen");
    element.innerHTML = raw;
    root.appendChild(element);
    const update = setInterval(() => {
        if(document.getElementById("textLoading").textContent === "Caricando...")
            document.getElementById("textLoading").textContent = "Caricando";
        else
            document.getElementById("textLoading").textContent += '.';
    }, 333)
    document.addEventListener("loadScreenEnd", () => {
        clearInterval(update);
        element.style.animation = "disappear 0.2s ease-out forwards";
        setTimeout(() => root.removeChild(element), 200);
    });
    return listener;
}

//Behaviour
const unloadCall = loadScreen(document.body);