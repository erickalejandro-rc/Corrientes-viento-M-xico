let isPlayingViento = false;
let playIntervalViento = null;

function togglePlayViento() {
    const btn = document.getElementById('btn-play-viento');
    isPlayingViento = !isPlayingViento;

    if (isPlayingViento) {
        btn.innerText = "⏸ PAUSAR REPRODUCCIÓN";
        btn.style.background = "#00d4ff";
        btn.style.color = "#000";
        
        playIntervalViento = setInterval(() => {
            // Sumamos solo 1 hora para máxima fluidez
            let nextHour = (parseInt(currentHour) + 6);
            
            if (nextHour > 72) nextHour = 0; // Reiniciar ciclo al llegar a las 72h
            
            // Sincronizamos el slider visual
            document.getElementById('time-slider').value = nextHour;
            
            // Llamamos a la función que ya tienes para actualizar datos
            updateHour(nextHour.toString());
            
        }, 5000); // 5 segundos por cada hora de pronóstico
    } else {
        btn.innerText = "▶ REPRODUCIR VIENTO";
        btn.style.background = "transparent";
        btn.style.color = "#00d4ff";
        clearInterval(playIntervalViento);
    }
}