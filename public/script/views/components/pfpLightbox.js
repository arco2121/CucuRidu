/*
 * Foto profilo a schermo intero, tipo social: qualsiasi <img> con la classe
 * "pfp_viewable" (chat, liste giocatori, vincitore...) la apre qui.
 * Ascolto su document invece che sui singoli elementi perche' quelle
 * immagini vengono rigenerate di continuo dai fragment: un listener diretto
 * andrebbe perso ad ogni render.
 */
const pfpLightbox = document.getElementById("pfpLightbox");
const pfpLightboxImg = document.getElementById("pfpLightboxImg");
const pfpLightboxBackdrop = document.getElementById("pfpLightboxBackdrop");

document.addEventListener("click", (e) => {
    const img = e.target.closest(".pfp_viewable");
    if (!img || !img.getAttribute("src")) return;
    pfpLightboxImg.src = img.src;
    pfpLightbox.dispatchEvent(showPanel);
});

pfpLightboxBackdrop?.addEventListener("click", () => pfpLightbox.dispatchEvent(hidePanel));
