const audioPeers = {};
let audioStream = null;
let microfonoMutato = false;
let socketId;
on('socketId', id => socketId = id);
on("listaGiocatoriAggiornamento", async (data) => {
    const { giocatori } = data;
    await startVoice(giocatori);
});

const startVoice = async (listaGiocatori) => {
    try {
        if (!audioStream) audioStream = await navigator.mediaDevices.getUserMedia({ audio: true });

        listaGiocatori.forEach(player => {
            if (player.socketId !== socketId && player.online)
                if (!audioPeers[player.socketId]) creaChiamata(player.socketId);
        });
    } catch (err) {
        console.error("Permesso microfono negato o errore:", err);
        alert("Se vuoi sbraitare a qualcuno teso devi attivare l'accesso al microfono.");
    }
}

const creaChiamata = (targetSocketId) => {
    const peer = new SimplePeer({
        initiator: true,
        trickle: false,
        stream: audioStream,
        config: { iceServers: [{ urls: 'stun:stun.l.google.com:19302' }] }
    });

    peer.on('signal', data => emit("webrtcOfferta", { idGiocatore: targetSocketId, signal: data }));
    peer.on('stream', stream => gestisciAudioInEntrata(stream, targetSocketId));

    peer.on('error', err => console.error("Errore Peer:", err));

    audioPeers[targetSocketId] = peer;
}

on("webrtcRiceviOfferta", data => {
    if (audioPeers[data.callerId]) audioPeers[data.callerId].destroy();

    const peer = new SimplePeer({
        initiator: false,
        trickle: false,
        stream: audioStream
    });

    peer.on('signal', signal => emit("webrtcRisposta", { callerSocketId: data.callerId, signal: signal }));

    peer.on('stream', stream => gestisciAudioInEntrata(stream, data.callerId));

    peer.signal(data.signal);
    audioPeers[data.callerId] = peer;
});

on("webrtcRiceviRisposta", data => {
    const peer = audioPeers[data['responderSocketId']];
    if (peer) peer.signal(data.signal);
});


const gestisciAudioInEntrata = (stream, socketId) => {
    let audioEl = document.getElementById(`audio-${socketId}`);
    if (!audioEl) {
        audioEl = document.createElement('audio');
        audioEl.id = `audio-${socketId}`;
        audioEl.autoplay = true;
        audioEl.style.display = "none";
        document.body.appendChild(audioEl);
    }
    audioEl.srcObject = stream;
}

const toggleMute = () => {
    microfonoMutato = !microfonoMutato;
    if (audioStream) {
        audioStream.getAudioTracks()[0].enabled = !microfonoMutato;
    }
    return microfonoMutato;
}

const rimuoviGiocatoreAudio = (socketId) => {
    if (audioPeers[socketId]) {
        audioPeers[socketId].destroy();
        delete audioPeers[socketId];

        const el = document.getElementById(`audio-${socketId}`);
        if (el) el.remove();
        console.log(`Audio rimosso per ${socketId}`);
    }
}

const hardResetVoice = (listaGiocatoriAttuali) => {
    Object.keys(audioPeers).forEach(id => rimuoviGiocatoreAudio(id));
    startVoice(listaGiocatoriAttuali);
}