let isPlaying = false;
let playInterval = null;

function togglePlay() {
    const btn = document.getElementById('btn-play');
    isPlaying = !isPlaying;

    if (isPlaying) {
        btn.innerText = "⏸ PAUSAR";
        btn.style.background = "#ffcc00";
        btn.style.color = "#000";
        
        playInterval = setInterval(() => {
            let nextHour = (parseInt(currentHour) + 6);
            if (nextHour > 72) nextHour = 0; // Reiniciar al llegar a 72h
            
            // Actualizamos el slider y la variable
            document.getElementById('time-slider').value = nextHour;
            updateHour(nextHour.toString());
        }, 3000); // Velocidad de reproducción (3 segundos)
    } else {
        btn.innerText = "▶ REPRODUCIR CICLO SOLAR";
        btn.style.background = "#444";
        btn.style.color = "#ffcc00";
        clearInterval(playInterval);
    }
}

function loadData() {
    if (scalarLayer) map.removeLayer(scalarLayer);
    const hStr = currentHour.toString().padStart(2, '0');
    const t = Date.now();

    d3.text(`${dataPath}${currentVar}_${hStr}h.asc?${t}`, (err, data) => {
        if (err) return;
        let field = L.ScalarField.fromASCIIGrid(data);
        
        // --- LÓGICA DE SALTO DE NOCHE ---
        // Calculamos el valor máximo en la malla actual
        let maxVal = 0;
        field.grid.forEach(row => {
            row.forEach(val => { if(val > maxVal) maxVal = val; });
        });

        // Si el valor máximo es 0 (es de noche) y estamos en modo PLAY
        if (maxVal <= 0 && isPlaying) {
            console.log(`Hora ${currentHour}h sin luz, saltando...`);
            let nextHour = (parseInt(currentHour) + 6);
            if (nextHour > 72) nextHour = 0;
            updateHour(nextHour.toString());
            document.getElementById('time-slider').value = nextHour;
            return; // No dibujamos esta capa y pasamos a la siguiente
        }
        // --------------------------------

        scalarLayer = L.canvasLayer.scalarField(field, {
            color: chroma.scale(solarColors).domain([0, 1100]),
            opacity: 0.8,
            interpolate: true
        }).addTo(map);

        // Hover
        scalarLayer.on('mousemove', (e) => {
            if (e.value !== null) {
                document.getElementById('hover-info').style.display = 'block';
                document.getElementById('hover-value').innerText = `${e.value.toFixed(1)} W/m²`;
            }
        });
        scalarLayer.on('mouseout', () => { document.getElementById('hover-info').style.display = 'none'; });
    });
    updateMetadata();
}