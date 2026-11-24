
// Elementos HTML
const tiempo = document.getElementById("tiempo");
const tipoSesion = document.getElementById("tipoSesion");
const boton = document.getElementById("iniciarPausar");
const reiniciar = document.getElementById("reiniciar");
const contador = document.getElementById("sesiones");
const estado = document.getElementById("estado");
const opciones = document.querySelectorAll(".opcion");
const formulario = document.getElementById("formularioConfiguracion");

const inputs = {
    trabajo: document.getElementById("tiempoTrabajo"),
    descansoCorto: document.getElementById("tiempoDescansoCorto"),
    descansoLargo: document.getElementById("tiempoDescansoLargo")
};

// Duraciones en minutos
const duraciones = {
    trabajo: 25,
    descansoCorto: 5,
    descansoLargo: 15
};

const nombres = {
    trabajo: "Trabajo",
    descansoCorto: "Descanso corto",
    descansoLargo: "Descanso largo"
};

// Variables
let modo = "trabajo";
let restante = 1500;
let sesiones = 0;
let intervalo = null;
let activo = false;
let iniciado = false;
let audio;


// Mostrar información
function mostrar() {
    let minutos = Math.floor(restante / 60);
    let segundos = restante % 60;

    tiempo.textContent =
        String(minutos).padStart(2, "0") + ":" +
        String(segundos).padStart(2, "0");

    tipoSesion.textContent = nombres[modo];
    contador.textContent = sesiones;

    boton.textContent = activo ? "Pausar" : iniciado ? "Reanudar" : "Iniciar";

    opciones.forEach(opcion => {
        let activa = opcion.dataset.modo === modo;
        opcion.classList.toggle("activa", activa);
        opcion.setAttribute("aria-pressed", activa);
    });
}


// Sonido de finalización
function sonido() {
    if (!audio) return;

    let tono = audio.createOscillator();
    let volumen = audio.createGain();

    tono.frequency.value = 800;
    volumen.gain.value = 0.2;

    tono.connect(volumen);
    volumen.connect(audio.destination);

    tono.start();
    tono.stop(audio.currentTime + 0.5);
}


// Iniciar o pausar
boton.addEventListener("click", () => {

    if (activo) {
        clearInterval(intervalo);
        activo = false;
        estado.textContent = "Temporizador pausado.";
    } else {
        const AudioContext = window.AudioContext || window.webkitAudioContext;

        if (!audio && AudioContext) audio = new AudioContext();
        if (audio?.state === "suspended") audio.resume();

        activo = true;
        iniciado = true;

        intervalo = setInterval(() => {
            restante--;

            if (restante <= 0) finalizar();

            mostrar();
        }, 1000);

        estado.textContent = "Temporizador en marcha.";
    }

    mostrar();
});


// Finalizar sesión y cambiar de modo
function finalizar() {
    clearInterval(intervalo);
    activo = false;
    iniciado = false;
    sonido();

    if (modo === "trabajo") {
        sesiones++;
        modo = sesiones % 4 === 0 ? "descansoLargo" : "descansoCorto";
    } else {
        modo = "trabajo";
    }

    restante = duraciones[modo] * 60;

    estado.textContent = "¡Sesión terminada! Siguiente: " + nombres[modo];
}


// Reiniciar
reiniciar.addEventListener("click", () => {
    clearInterval(intervalo);
    activo = false;
    iniciado = false;
    restante = duraciones[modo] * 60;
    estado.textContent = "Temporizador reiniciado.";
    mostrar();
});


// Cambiar tipo de sesión
opciones.forEach(opcion => {
    opcion.addEventListener("click", () => {
        clearInterval(intervalo);
        activo = false;
        iniciado = false;
        modo = opcion.dataset.modo;
        restante = duraciones[modo] * 60;
        estado.textContent = "Sesión seleccionada: " + nombres[modo];
        mostrar();
    });
});


// Guardar configuración
formulario.addEventListener("submit", event => {
    event.preventDefault();

    for (let tipo in inputs) {
        let valor = Number(inputs[tipo].value);

        if (!Number.isInteger(valor) || valor < 1 || valor > 180) {
            document.getElementById("mensajeConfiguracion").textContent =
                "Ingresa valores entre 1 y 180 minutos.";
            return;
        }

        duraciones[tipo] = valor;
    }

    clearInterval(intervalo);
    activo = false;
    iniciado = false;
    restante = duraciones[modo] * 60;

    document.getElementById("mensajeConfiguracion").textContent =
        "¡Configuración guardada!";

    mostrar();
});


// Mostrar temporizador inicial
mostrar();
