<script>
  import cero from "/images/cero_rueda.svg?raw";
  import una from "/images/una_rueda.svg?raw";
  import dos from "/images/dos_ruedas.svg?raw";
  import tres from "/images/tres_ruedas.svg?raw";
  import cuatro from "/images/cuatro_ruedas.svg?raw";
  import verano from "/images/sol2.svg"
  import invierno from "/images/nieve.svg"
  import otonio from "/images/hoja.svg"
  import primavera from "/images/flor.svg"
  import candado from "/images/candado.svg"

  import familia from "/images/familia.svg"
  import amigos from "/images/amigos.svg"
  import desconectar from "/images/desconectar.svg"
  import aventura from "/images/aventura.svg"           
  import estudio from "/images/estudio.svg" 
  import negocios from "/images/negocio.svg" 
  import pareja from "/images/pareja.svg" 

  import * as d3 from "d3";
  import viajes from "/src/data/viajes.json";
  import './app.css';


  import { continentePorPais } from './continentePorPais.js';
  import { db, ref, push, onValue } from './firebase.js';
  import { onMount } from 'svelte';


  function colorContinente(region) {
    const colores = {
      Europa: "#852EFF",
      Asia: "#FFC71D",
      América: "#127E16",
      Oceanía: "#36BCFF",
      África: "#FF49D7"
    };
    return colores[region] || "#696A70";
  }

  function colorContinentePorPais(pais) {
  const continente = continentePorPais[pais];
  const colores = {
    Europa: "#852EFF",
    Asia: "#FFC71D",
    América: "#127E16",
    Oceanía: "#36BCFF",
    África: "#FF49D7"
  };
  return colores[continente] || "#696A70";
}

 function rutaImagenPorAcompaniantesYContinente(acompaniantes, pais) {
  const continente = continentePorPais[pais] || "default";
  const nombres = ["cero", "una", "dos", "tres", "cuatro"];
  return `/images/${nombres[acompaniantes]}_rueda_${continente.toLowerCase()}.svg`;
}

  function anchoValija(monto) {
    if (monto < 550) return 151.2;
    if (monto <= 900) return 170.1;
    return 189;
  }

  function altoValija(monto) {
    if (monto < 550) return 235.2;
    if (monto <= 900) return 264.6;
    return 294;
  }

  function calcularLineaSatisfaccion(nivel, monto) {
  let total;
  if (monto < 550) {
    total = 110.488;
  } else if (monto <= 900) {
    total = 124.299;
  } else {
    total = 138.11;
  }
  const visible = (nivel / 5) * total;
  return { visible, total };
}

  const iconosEstacion = {
  Verano: verano,
  Invierno: invierno,
  Otoño: otonio,
  Primavera:primavera
};


const iconosMotivo = {
  Familia: familia,
  Amigos: amigos,
  Desconectar: desconectar,
  Aventura:aventura,
  Estudio: estudio,
  Negocios: negocios,
  Pareja: pareja
};

const yInicio = 86;
const yFin = 226.99;
const totalNiveles = 6;

const nivelesY = [204, 180, 155, 132, 111];
// Cálculo dinámico de la altura de la línea "rellenada"
function calcularYSatisfaccion(nivel) {
  return yFin - ((nivel / totalNiveles) * (yFin - yInicio));
}

// FILTROS
  let filtroRegion = "";
  let filtroEstacion = "";
  let filtroAcompaniantes = "";

  // FUNCION FILTRO GENERAL

  $: viajesFiltrados = viajes.filter(v =>
    (filtroRegion === "" || v.Region === filtroRegion) &&
    (filtroEstacion === "" || v.Estacion === filtroEstacion) &&
    (filtroAcompaniantes === "" || v.Acompaniantes === +filtroAcompaniantes)
  );


  // FORMULARIO
  let viajesFormulario = [];

  // Estado del formulario
  let nuevoViaje = {
    Nombre: '',
    Pais: '',
    Mes: '',
    Satisfaccion: 0,
    Motivo: '',
    Acompaniantes: 0
    
  };

  // Lista de países
  let listaPaises = Object.keys(continentePorPais).sort();

  // Cargar viajes desde Firebase al iniciar el componente
  onMount(() => {
    loadFlourishScrolly();
    const viajesRef = ref(db, 'viajes');
    onValue(viajesRef, (snapshot) => {
      const datos = snapshot.val();
      viajesFormulario = datos ? Object.values(datos) : [];
    });
  });

  function agregarViaje() {
    const nuevo = { ...nuevoViaje };

    if (!nuevo.Nombre || !nuevo.Pais || !nuevo.Mes || !nuevo.Motivo) return;

    // Subir a Firebase
    const viajesRef = ref(db, 'viajes');
    push(viajesRef, nuevo);

    // Agregar también a localStorage
    viajesFormulario = [...viajesFormulario, nuevo];

    // Reiniciar el formulario
    nuevoViaje = {
      Nombre: '',
      Pais: '',
      Mes: '',
      Satisfaccion: 0,
      Motivo: '',
      Acompaniantes: 0
    };

  }

  // Array para guardar la data de cada slide. Cambiar cada uno con el epígrafe específico para cada slide.
  const slides = [
    "👥 Aquí vemos a todas las personas que realizaron viajes, cada punto representa a un viajero distinto. Una primera imagen para entender la totalidad de datos con los que vamos a trabajar.",
    "🌍 Ahora nos acercamos a los destinos: cada punto representa un país visitado por los viajeros. Nos permite ver claramente hacia dónde viajan y qué regiones reciben más visitas.",
    "👩👨 Aquí dividimos a los viajeros por género para entender la participación de hombres y mujeres en los viajes registrados. Una manera de visibilizar quiénes viajan más y en qué proporción.",
    "🧳 Ahora clasificamos a todas las personas según el motivo de su viaje: Amigos, Aventura, Estudio, Familiar, Negocios, Ocio o Pareja. Nos permite entender qué motiva a viajar a la mayoría.",
    "⚖️ Aquí comparamos género y motivo de viaje para responder: ¿Existen diferencias entre hombres y mujeres a la hora de viajar? Por ejemplo, vemos que hay más hombres que mujeres viajando por negocios u oficio.",
    "🗺️ Ahora exploramos los destinos alrededor del mapa según el motivo de viaje. Nos muestra hacia qué lugares viajan las personas según si buscan ocio, aventura, negocios, visitas familiares, estudios, y otros.",
    "💰🌞 Por último, relacionamos la estación del año con el gasto de cada viajero. El tamaño de cada punto representa el monto gastado y el color la estación en la que viajaron, destacando que en invierno y verano —la “temporada alta”— los viajes tienden a representar un gasto mayor.",
  ]

  function loadFlourishScrolly() {
    const script = document.createElement('script')
    script.src = "https://cdn.flourish.rocks/flourish-scrolly-v3.1.0.min.js"
    script.type = "text/javascript"
    script.onload = () => initFlourishScrolly()
    document.body.appendChild(script)
  }


  let paso = 1;
  const totalPasos = 6;

  function siguiente() {
    if (paso < totalPasos) paso++;
  }

  function anterior() {
    if (paso > 1) paso--;
  }

    function finalizar() {
    agregarViaje();
    paso = 6; // mostrar la sección de la valija creada
    mostrarValija = true;
    setTimeout(() => {
      const valijasSection = document.getElementById("valija-generada");
      valijasSection?.scrollIntoView({ behavior: "smooth" });
    }, 100); // pequeña espera para asegurar que se renderice
  }


  let pasoActual = 1;

  function siguientePaso() {
    if (pasoActual < totalPasos - 1) pasoActual += 1;
  }

  function pasoAnterior() {
    if (pasoActual > 1) pasoActual -= 1;
  }

  function enviarFormulario() {
    agregarViaje(); // tu función existente
  }

let mostrarValija = false;
  
</script>


<main>
  <section class="pantalla-uno">
    <h1>✈ Armá la valija de viaje</h1>
    <p>Convertí tus emociones y planes de viaje en una valija interactiva</p>
    <button on:click={() => document.getElementById('pantalla-dos').scrollIntoView({ behavior: 'smooth' })}>
    ¡Empezar ahora!
  </button>
</section>
   
  <section id="pantalla-dos" class="pantalla-dos">
  <h2>¿Cómo funciona?</h2>
  <p>Tu valija representa tu viaje. Cada parte refleja una decisión</p>
  <img src="/images/ref.svg" width="990" alt="explicacion"/> 
  <div>
  <button on:click={() => document.getElementById('formulario').scrollIntoView({ behavior: 'smooth' })}>
    Completa el formulario y crea tu propia valija!
  </button>
  </div>
    </section>

<section id="formulario" class="formulario-section">
  <div class="formulario-container">
    <h4 class="formulario-title">Compartí tu próximo viaje!</h4>
    <p class="formulario-subtitle">Contanos sobre tu aventura</p>


    {#if paso === 1}
      <div class="form-group">
        <label for="nombre">Nombre</label>
        <input type="text" id="nombre" bind:value={nuevoViaje.Nombre} placeholder="Tu nombre completo" required />
      </div>
      <div class="paso-indicador">{paso}/{totalPasos}</div>
    {/if}

    {#if paso === 2}
      <div class="form-group">
        <label for="pais">País próximo a visitar</label>
        <select id="pais" bind:value={nuevoViaje.Pais} required>
          <option value="" disabled hidden>Seleccioná un país</option>
          {#each listaPaises as p}
            <option value={p}>{p}</option>
          {/each}
        </select>
      </div>
      <div class="paso-indicador">{paso}/{totalPasos}</div>
    {/if}

    {#if paso === 3}
      <div class="form-group">
        <label for="mes">Mes del viaje</label>
        <select id="mes" bind:value={nuevoViaje.Mes} required>
          <option value="" disabled hidden>Seleccioná el mes</option>
          {#each Array(12) as _, i}
            <option value={i + 1}>{i + 1}</option>
          {/each}
        </select>
      </div>
      <div class="paso-indicador">{paso}/{totalPasos}</div>
    {/if}

    {#if paso === 4}
      <div class="form-group">
        <label for="entusiasmo">Nivel de entusiasmo</label>
        <input type="range" id="entusiasmo" min="0" max="6" bind:value={nuevoViaje.Satisfaccion} />
        <div class="slider-labels">
          {#each Array(7) as _, i}
            <span>{i}</span>
          {/each}
        </div>
      </div>
      <div class="paso-indicador">{paso}/{totalPasos}</div>
    {/if}

    {#if paso === 5}
      <div class="form-group">
        <label for="acompaniante">Acompañantes</label>
        <select id="acompaniante" bind:value={nuevoViaje.Acompaniantes} required>
          <option value="" disabled hidden>Cantidad de compañeros</option>
          {#each Array(5) as _, i}
            <option value={i}>{i}</option>
          {/each}
        </select>
      </div>
      <div class="paso-indicador">{paso}/{totalPasos}</div>
    {/if}

    {#if paso === 6}
      <div class="form-group">
        <label for="motivo">Motivo del viaje</label>
        <select id="motivo" bind:value={nuevoViaje.Motivo} required>
          <option value="" disabled selected hidden>¿Por qué viajas?</option>
          <option value="Familia">Vacaciones familiares</option>
          <option value="Amigos">Vacaciones con amigo/s</option>
          <option value="Desconectar">Para desconectar</option>
          <option value="Pareja">Con pareja</option>
          <option value="Aventura">Aventura</option>
          <option value="Estudio">Estudio</option>
          <option value="Negocios">Negocios</option>
        </select>
      </div>
      <div class="paso-indicador">{paso}/{totalPasos}</div>
    {/if}

    <!-- Botones de navegación -->

    <div class="botones-navegacion">
    {#if paso === 1}
      <button on:click={siguiente}>Siguiente</button>
    {:else if paso > 1 && paso < 6}
      <button class="btn-anterior" on:click={anterior}>Anterior</button>
      <button on:click={siguiente}>Siguiente</button>
    {:else if paso === 6}
      <button class="btn-anterior" on:click={anterior}>Anterior</button>
      <button class="btn-finalizar" on:click={finalizar}>Finalizar</button>
    {/if}
  </div>

  {#if paso === 6}
    <p class="mensaje-final">¡Formulario completo!</p>
  {/if}


</section>

{#if mostrarValija}
<section id="valija-generada" class="pantalla-inicio">
    <div class="container">
      {#each viajesFormulario.slice(-1) as viaje}
      <h2 class="formulario-title">Esta es tu valija de tu próximo viaje!</h2>
        <div class="valija" style="position: relative; display: flex; flex-wrap: wrap; gap: 20px;">
      {#if  viaje.Acompaniantes === 0} 
              <svg width="189" height="294" viewBox="0 0 189 294" fill="none" xmlns="http://www.w3.org/2000/svg">
                <image
                href="{iconosMotivo[viaje.Motivo]}"
                x="120"
                y="210"
                width="40"
                height="40"
                />

                <g filter="url(#filter0_d_13_92)">
                <rect x="73.5" y="2.5" width="46" height="39" rx="7.5" stroke="black" stroke-width="5" shape-rendering="crispEdges"/>
                </g>
                   <g>
                    <rect x="4" y="35" width="181" height="243" rx="25" fill="{colorContinentePorPais(viaje.Pais)}" fill-opacity="0.3" />
                    <rect x="9" y="40" width="171" height="233" rx="20" stroke="{colorContinentePorPais(viaje.Pais)}" stroke-width="10" fill="none" />
                  </g>
                <path  id= "cierre" d="M35.0871 88.8847L34.4472 226.993" stroke="#B7A6A6" stroke-width="2"/>
                  <line
                    x1="34.5" y1="{calcularYSatisfaccion(viaje.Satisfaccion)}"
                    x2="34.5" y2="226.993"
                    stroke="#000000"
                    stroke-width="2"
                  />

                {#each nivelesY as y, i}
                  <line
                    x1="30" y1={y}
                    x2="40" y2={y}
                    stroke={i < viaje.Satisfaccion ? "#000000" : "#B7A6A6"}
                    stroke-width="2"
                  />
                {/each}
                <g filter="url(#filter2_d_13_92)">
                <rect width="48.3648" height="62.1777" rx="3" transform="matrix(0.974669 -0.223652 0.231685 0.972791 98.2067 47.0853)" fill="#404040"/>
                </g>
                <rect width="14.202" height="16.0479" rx="1" transform="matrix(0.975098 -0.221775 0.229748 0.97325 129 48)" fill="white"/>
                <rect width="14.202" height="16.0479" rx="1" transform="matrix(0.975098 -0.221775 0.229748 0.97325 134 67.1497)" fill="white"/>
          
                <g filter="url(#filter3_d_13_92)">
                <path d="M138 37.5C138 37.5 132.019 22.3911 126.5 19.5C121.527 16.895 118.486 16.7363 113 18.5C107.486 20.2728 106 22 104 27C101.047 34.383 105.5 45.5 105.5 45.5" stroke="black" stroke-width="2"/>
                </g>
                <ellipse cx="106.08" cy="45.2264" rx="5.00106" ry="0.964926" transform="rotate(-15 106.08 45.2264)" fill="black"/>
                <ellipse cx="138.08" cy="38.2264" rx="5.00106" ry="0.964926" transform="rotate(-15 138.08 38.2264)" fill="black"/>
                <defs>
                <filter id="filter0_d_13_92" x="67" y="0" width="59" height="52" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
                <feFlood flood-opacity="0" result="BackgroundImageFix"/>
                <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
                <feOffset dy="4"/>
                <feGaussianBlur stdDeviation="2"/>
                <feComposite in2="hardAlpha" operator="out"/>
                <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0"/>
                <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_13_92"/>
                <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_13_92" result="shape"/>
                </filter>
                <filter id="filter1_d_13_92" x="0" y="35" width="189" height="251" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
                <feFlood flood-opacity="0" result="BackgroundImageFix"/>
                <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
                <feOffset dy="4"/>
                <feGaussianBlur stdDeviation="2"/>
                <feComposite in2="hardAlpha" operator="out"/>
                <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0"/>
                <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_13_92"/>
                <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_13_92" result="shape"/>
                </filter>
                <filter id="filter2_d_13_92" x="94.8196" y="36.8626" width="68.3195" height="78.1145" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
                <feFlood flood-opacity="0" result="BackgroundImageFix"/>
                <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
                <feOffset dy="4"/>
                <feGaussianBlur stdDeviation="2"/>
                <feComposite in2="hardAlpha" operator="out"/>
                <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0"/>
                <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_13_92"/>
                <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_13_92" result="shape"/>
                </filter>
                <filter id="filter3_d_13_92" x="97.9884" y="16.3328" width="44.9411" height="37.5385" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
                <feFlood flood-opacity="0" result="BackgroundImageFix"/>
                <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
                <feOffset dy="4"/>
                <feGaussianBlur stdDeviation="2"/>
                <feComposite in2="hardAlpha" operator="out"/>
                <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0"/>
                <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_13_92"/>
                <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_13_92" result="shape"/>
                </filter>
                </defs>
                <text
                  x="142"
                  y="74"
                  text-anchor="middle"
                  font-size="20"
                  fill="black"
                  font-family="sans-serif"
                  transform="rotate(-15 90 75)"
                >
                  {viaje.Mes.toString().padStart(2, '0')[0]}
                </text>

                <text
                  x="142"
                  y="94.5"
                  text-anchor="middle"
                  font-size="20"
                  fill="black"
                  font-family="sans-serif"
                  transform="rotate(-15 90 75)"
                >
                  {viaje.Mes.toString().padStart(2, '0')[1]}
                </text>


                </svg> 
                <div style="text-align: center; width: 100%; margin-top: 8px; font-family: 'Poppins', sans-serif;">
                  <p style="margin: 0; font-weight: bold;">{viaje.Nombre}</p>
                  <p style="margin: 0;">{viaje.Pais}</p>
                </div>
         

      {:else if  viaje.Acompaniantes === 1} 
              <svg width="189" height="294" viewBox="0 0 189 294" fill="none" xmlns="http://www.w3.org/2000/svg">
                <image
                href="{iconosMotivo[viaje.Motivo]}"
                x="120"
                y="210"
                width="40"
                height="40"
                />
                <circle cx="94" cy="285" r="9" fill="#404040"/>
                <circle cx="94" cy="285" r="5" fill="white"/>
                <g filter="url(#filter0_d_13_92)">
                <rect x="73.5" y="2.5" width="46" height="39" rx="7.5" stroke="black" stroke-width="5" shape-rendering="crispEdges"/>
                </g>
                   <g>
                    <rect x="4" y="35" width="181" height="243" rx="25" fill="{colorContinentePorPais(viaje.Pais)}" fill-opacity="0.3" />
                    <rect x="9" y="40" width="171" height="233" rx="20" stroke="{colorContinentePorPais(viaje.Pais)}" stroke-width="10" fill="none" />
                  </g>
                <path  id= "cierre" d="M35.0871 88.8847L34.4472 226.993" stroke="#B7A6A6" stroke-width="2"/>
                  <line
                    x1="34.5" y1="{calcularYSatisfaccion(viaje.Satisfaccion)}"
                    x2="34.5" y2="226.993"
                    stroke="#000000"
                    stroke-width="2"
                  />

                {#each nivelesY as y, i}
                  <line
                    x1="30" y1={y}
                    x2="40" y2={y}
                    stroke={i < viaje.Satisfaccion ? "#000000" : "#B7A6A6"}
                    stroke-width="2"
                  />
                {/each}
                <g filter="url(#filter2_d_13_92)">
                <rect width="48.3648" height="62.1777" rx="3" transform="matrix(0.974669 -0.223652 0.231685 0.972791 98.2067 47.0853)" fill="#404040"/>
                </g>
                <rect width="14.202" height="16.0479" rx="1" transform="matrix(0.975098 -0.221775 0.229748 0.97325 129 48)" fill="white"/>
                <rect width="14.202" height="16.0479" rx="1" transform="matrix(0.975098 -0.221775 0.229748 0.97325 134 67.1497)" fill="white"/>
          
                <g filter="url(#filter3_d_13_92)">
                <path d="M138 37.5C138 37.5 132.019 22.3911 126.5 19.5C121.527 16.895 118.486 16.7363 113 18.5C107.486 20.2728 106 22 104 27C101.047 34.383 105.5 45.5 105.5 45.5" stroke="black" stroke-width="2"/>
                </g>
                <ellipse cx="106.08" cy="45.2264" rx="5.00106" ry="0.964926" transform="rotate(-15 106.08 45.2264)" fill="black"/>
                <ellipse cx="138.08" cy="38.2264" rx="5.00106" ry="0.964926" transform="rotate(-15 138.08 38.2264)" fill="black"/>
                <defs>
                <filter id="filter0_d_13_92" x="67" y="0" width="59" height="52" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
                <feFlood flood-opacity="0" result="BackgroundImageFix"/>
                <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
                <feOffset dy="4"/>
                <feGaussianBlur stdDeviation="2"/>
                <feComposite in2="hardAlpha" operator="out"/>
                <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0"/>
                <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_13_92"/>
                <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_13_92" result="shape"/>
                </filter>
                <filter id="filter1_d_13_92" x="0" y="35" width="189" height="251" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
                <feFlood flood-opacity="0" result="BackgroundImageFix"/>
                <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
                <feOffset dy="4"/>
                <feGaussianBlur stdDeviation="2"/>
                <feComposite in2="hardAlpha" operator="out"/>
                <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0"/>
                <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_13_92"/>
                <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_13_92" result="shape"/>
                </filter>
                <filter id="filter2_d_13_92" x="94.8196" y="36.8626" width="68.3195" height="78.1145" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
                <feFlood flood-opacity="0" result="BackgroundImageFix"/>
                <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
                <feOffset dy="4"/>
                <feGaussianBlur stdDeviation="2"/>
                <feComposite in2="hardAlpha" operator="out"/>
                <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0"/>
                <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_13_92"/>
                <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_13_92" result="shape"/>
                </filter>
                <filter id="filter3_d_13_92" x="97.9884" y="16.3328" width="44.9411" height="37.5385" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
                <feFlood flood-opacity="0" result="BackgroundImageFix"/>
                <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
                <feOffset dy="4"/>
                <feGaussianBlur stdDeviation="2"/>
                <feComposite in2="hardAlpha" operator="out"/>
                <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0"/>
                <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_13_92"/>
                <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_13_92" result="shape"/>
                </filter>
                </defs>
                <text
                  x="142"
                  y="74"
                  text-anchor="middle"
                  font-size="20"
                  fill="black"
                  font-family="sans-serif"
                  transform="rotate(-15 90 75)"
                >
                  {viaje.Mes.toString().padStart(2, '0')[0]}
                </text>

                <text
                  x="142"
                  y="94.5"
                  text-anchor="middle"
                  font-size="20"
                  fill="black"
                  font-family="sans-serif"
                  transform="rotate(-15 90 75)"
                >
                  {viaje.Mes.toString().padStart(2, '0')[1]}
                </text>


                </svg> 
                <div style="text-align: center; width: 100%; margin-top: 8px; font-family: 'Poppins', sans-serif;">
                  <p style="margin: 0; font-weight: bold;">{viaje.Nombre}</p>
                  <p style="margin: 0;">{viaje.Pais}</p>
                </div>
         

      {:else if  viaje.Acompaniantes === 2} 
              <svg width="189" height="294" viewBox="0 0 189 294" fill="none" xmlns="http://www.w3.org/2000/svg">
                <image
                href="{iconosMotivo[viaje.Motivo]}"
                x="120"
                y="210"
                width="40"
                height="40"
                />
                <circle cx="154" cy="285" r="9" fill="#404040"/>
                <circle cx="154" cy="285" r="5" fill="white"/>
                <circle cx="41" cy="285" r="9" fill="#404040"/>
                <circle cx="41" cy="285" r="5" fill="white"/>
                <g filter="url(#filter0_d_13_92)">
                <rect x="73.5" y="2.5" width="46" height="39" rx="7.5" stroke="black" stroke-width="5" shape-rendering="crispEdges"/>
                </g>
                   <g>
                    <rect x="4" y="35" width="181" height="243" rx="25" fill="{colorContinentePorPais(viaje.Pais)}" fill-opacity="0.3" />
                    <rect x="9" y="40" width="171" height="233" rx="20" stroke="{colorContinentePorPais(viaje.Pais)}" stroke-width="10" fill="none" />
                  </g>
                <path  id= "cierre" d="M35.0871 88.8847L34.4472 226.993" stroke="#B7A6A6" stroke-width="2"/>
                  <line
                    x1="34.5" y1="{calcularYSatisfaccion(viaje.Satisfaccion)}"
                    x2="34.5" y2="226.993"
                    stroke="#000000"
                    stroke-width="2"
                  />

                {#each nivelesY as y, i}
                  <line
                    x1="30" y1={y}
                    x2="40" y2={y}
                    stroke={i < viaje.Satisfaccion ? "#000000" : "#B7A6A6"}
                    stroke-width="2"
                  />
                {/each}
                <g filter="url(#filter2_d_13_92)">
                <rect width="48.3648" height="62.1777" rx="3" transform="matrix(0.974669 -0.223652 0.231685 0.972791 98.2067 47.0853)" fill="#404040"/>
                </g>
                <rect width="14.202" height="16.0479" rx="1" transform="matrix(0.975098 -0.221775 0.229748 0.97325 129 48)" fill="white"/>
                <rect width="14.202" height="16.0479" rx="1" transform="matrix(0.975098 -0.221775 0.229748 0.97325 134 67.1497)" fill="white"/>
          
                <g filter="url(#filter3_d_13_92)">
                <path d="M138 37.5C138 37.5 132.019 22.3911 126.5 19.5C121.527 16.895 118.486 16.7363 113 18.5C107.486 20.2728 106 22 104 27C101.047 34.383 105.5 45.5 105.5 45.5" stroke="black" stroke-width="2"/>
                </g>
                <ellipse cx="106.08" cy="45.2264" rx="5.00106" ry="0.964926" transform="rotate(-15 106.08 45.2264)" fill="black"/>
                <ellipse cx="138.08" cy="38.2264" rx="5.00106" ry="0.964926" transform="rotate(-15 138.08 38.2264)" fill="black"/>
                <defs>
                <filter id="filter0_d_13_92" x="67" y="0" width="59" height="52" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
                <feFlood flood-opacity="0" result="BackgroundImageFix"/>
                <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
                <feOffset dy="4"/>
                <feGaussianBlur stdDeviation="2"/>
                <feComposite in2="hardAlpha" operator="out"/>
                <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0"/>
                <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_13_92"/>
                <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_13_92" result="shape"/>
                </filter>
                <filter id="filter1_d_13_92" x="0" y="35" width="189" height="251" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
                <feFlood flood-opacity="0" result="BackgroundImageFix"/>
                <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
                <feOffset dy="4"/>
                <feGaussianBlur stdDeviation="2"/>
                <feComposite in2="hardAlpha" operator="out"/>
                <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0"/>
                <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_13_92"/>
                <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_13_92" result="shape"/>
                </filter>
                <filter id="filter2_d_13_92" x="94.8196" y="36.8626" width="68.3195" height="78.1145" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
                <feFlood flood-opacity="0" result="BackgroundImageFix"/>
                <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
                <feOffset dy="4"/>
                <feGaussianBlur stdDeviation="2"/>
                <feComposite in2="hardAlpha" operator="out"/>
                <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0"/>
                <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_13_92"/>
                <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_13_92" result="shape"/>
                </filter>
                <filter id="filter3_d_13_92" x="97.9884" y="16.3328" width="44.9411" height="37.5385" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
                <feFlood flood-opacity="0" result="BackgroundImageFix"/>
                <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
                <feOffset dy="4"/>
                <feGaussianBlur stdDeviation="2"/>
                <feComposite in2="hardAlpha" operator="out"/>
                <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0"/>
                <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_13_92"/>
                <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_13_92" result="shape"/>
                </filter>
                </defs>
                <text
                  x="142"
                  y="74"
                  text-anchor="middle"
                  font-size="20"
                  fill="black"
                  font-family="sans-serif"
                  transform="rotate(-15 90 75)"
                >
                  {viaje.Mes.toString().padStart(2, '0')[0]}
                </text>

                <text
                  x="142"
                  y="94.5"
                  text-anchor="middle"
                  font-size="20"
                  fill="black"
                  font-family="sans-serif"
                  transform="rotate(-15 90 75)"
                >
                  {viaje.Mes.toString().padStart(2, '0')[1]}
                </text>


                </svg> 
                <div style="text-align: center; width: 100%; margin-top: 8px; font-family: 'Poppins', sans-serif;">
                  <p style="margin: 0; font-weight: bold;">{viaje.Nombre}</p>
                  <p style="margin: 0;">{viaje.Pais}</p>
                </div>
         

      {:else if  viaje.Acompaniantes === 3} 
              <svg width="189" height="294" viewBox="0 0 189 294" fill="none" xmlns="http://www.w3.org/2000/svg">
                <image
                href="{iconosMotivo[viaje.Motivo]}"
                x="120"
                y="210"
                width="40"
                height="40"
                />
                <circle cx="153" cy="285" r="9" fill="#404040"/>
                <circle cx="153" cy="285" r="5" fill="white"/>
                <circle cx="95" cy="285" r="9" fill="#404040"/>
                <circle cx="95" cy="285" r="5" fill="white"/>
                <circle cx="37" cy="285" r="9" fill="#404040"/>
                <circle cx="37" cy="285" r="5" fill="white"/>
                <circle cx="95" cy="285" r="5" fill="white"/>
                <g filter="url(#filter0_d_13_92)">
                <rect x="73.5" y="2.5" width="46" height="39" rx="7.5" stroke="black" stroke-width="5" shape-rendering="crispEdges"/>
                </g>
                   <g>
                    <rect x="4" y="35" width="181" height="243" rx="25" fill="{colorContinentePorPais(viaje.Pais)}" fill-opacity="0.3" />
                    <rect x="9" y="40" width="171" height="233" rx="20" stroke="{colorContinentePorPais(viaje.Pais)}" stroke-width="10" fill="none" />
                  </g>
                <path  id= "cierre" d="M35.0871 88.8847L34.4472 226.993" stroke="#B7A6A6" stroke-width="2"/>
                  <line
                    x1="34.5" y1="{calcularYSatisfaccion(viaje.Satisfaccion)}"
                    x2="34.5" y2="226.993"
                    stroke="#000000"
                    stroke-width="2"
                  />

                {#each nivelesY as y, i}
                  <line
                    x1="30" y1={y}
                    x2="40" y2={y}
                    stroke={i < viaje.Satisfaccion ? "#000000" : "#B7A6A6"}
                    stroke-width="2"
                  />
                {/each}
                <g filter="url(#filter2_d_13_92)">
                <rect width="48.3648" height="62.1777" rx="3" transform="matrix(0.974669 -0.223652 0.231685 0.972791 98.2067 47.0853)" fill="#404040"/>
                </g>
                <rect width="14.202" height="16.0479" rx="1" transform="matrix(0.975098 -0.221775 0.229748 0.97325 129 48)" fill="white"/>
                <rect width="14.202" height="16.0479" rx="1" transform="matrix(0.975098 -0.221775 0.229748 0.97325 134 67.1497)" fill="white"/>
          
                <g filter="url(#filter3_d_13_92)">
                <path d="M138 37.5C138 37.5 132.019 22.3911 126.5 19.5C121.527 16.895 118.486 16.7363 113 18.5C107.486 20.2728 106 22 104 27C101.047 34.383 105.5 45.5 105.5 45.5" stroke="black" stroke-width="2"/>
                </g>
                <ellipse cx="106.08" cy="45.2264" rx="5.00106" ry="0.964926" transform="rotate(-15 106.08 45.2264)" fill="black"/>
                <ellipse cx="138.08" cy="38.2264" rx="5.00106" ry="0.964926" transform="rotate(-15 138.08 38.2264)" fill="black"/>
                <defs>
                <filter id="filter0_d_13_92" x="67" y="0" width="59" height="52" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
                <feFlood flood-opacity="0" result="BackgroundImageFix"/>
                <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
                <feOffset dy="4"/>
                <feGaussianBlur stdDeviation="2"/>
                <feComposite in2="hardAlpha" operator="out"/>
                <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0"/>
                <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_13_92"/>
                <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_13_92" result="shape"/>
                </filter>
                <filter id="filter1_d_13_92" x="0" y="35" width="189" height="251" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
                <feFlood flood-opacity="0" result="BackgroundImageFix"/>
                <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
                <feOffset dy="4"/>
                <feGaussianBlur stdDeviation="2"/>
                <feComposite in2="hardAlpha" operator="out"/>
                <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0"/>
                <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_13_92"/>
                <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_13_92" result="shape"/>
                </filter>
                <filter id="filter2_d_13_92" x="94.8196" y="36.8626" width="68.3195" height="78.1145" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
                <feFlood flood-opacity="0" result="BackgroundImageFix"/>
                <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
                <feOffset dy="4"/>
                <feGaussianBlur stdDeviation="2"/>
                <feComposite in2="hardAlpha" operator="out"/>
                <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0"/>
                <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_13_92"/>
                <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_13_92" result="shape"/>
                </filter>
                <filter id="filter3_d_13_92" x="97.9884" y="16.3328" width="44.9411" height="37.5385" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
                <feFlood flood-opacity="0" result="BackgroundImageFix"/>
                <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
                <feOffset dy="4"/>
                <feGaussianBlur stdDeviation="2"/>
                <feComposite in2="hardAlpha" operator="out"/>
                <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0"/>
                <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_13_92"/>
                <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_13_92" result="shape"/>
                </filter>
                </defs>
                <text
                  x="142"
                  y="74"
                  text-anchor="middle"
                  font-size="20"
                  fill="black"
                  font-family="sans-serif"
                  transform="rotate(-15 90 75)"
                >
                  {viaje.Mes.toString().padStart(2, '0')[0]}
                </text>

                <text
                  x="142"
                  y="94.5"
                  text-anchor="middle"
                  font-size="20"
                  fill="black"
                  font-family="sans-serif"
                  transform="rotate(-15 90 75)"
                >
                  {viaje.Mes.toString().padStart(2, '0')[1]}
                </text>


                </svg> 
                <div style="text-align: center; width: 100%; margin-top: 8px; font-family: 'Poppins', sans-serif;">
                  <p style="margin: 0; font-weight: bold;">{viaje.Nombre}</p>
                  <p style="margin: 0;">{viaje.Pais}</p>
                </div>
          

      {:else if  viaje.Acompaniantes === 4} 
              <svg width="189" height="294" viewBox="0 0 189 294" fill="none" xmlns="http://www.w3.org/2000/svg">
                <image
                href="{iconosMotivo[viaje.Motivo]}"
                x="120"
                y="210"
                width="40"
                height="40"
                />
                <circle cx="34" cy="285" r="9" fill="#404040"/>
                <circle cx="155" cy="285" r="9" fill="#404040"/>
                <circle cx="132" cy="285" r="9" fill="#404040"/>
                <circle cx="57" cy="285" r="9" fill="#404040"/>
                <circle cx="34" cy="285" r="5" fill="white"/>
                <circle cx="57" cy="285" r="5" fill="white"/>
                <circle cx="132" cy="285" r="5" fill="white"/>
                <circle cx="155" cy="285" r="5" fill="white"/>
                <g filter="url(#filter0_d_13_92)">
                <rect x="73.5" y="2.5" width="46" height="39" rx="7.5" stroke="black" stroke-width="5" shape-rendering="crispEdges"/>
                </g>
                   <g>
                    <rect x="4" y="35" width="181" height="243" rx="25" fill="{colorContinentePorPais(viaje.Pais)}" fill-opacity="0.3" />
                    <rect x="9" y="40" width="171" height="233" rx="20" stroke="{colorContinentePorPais(viaje.Pais)}" stroke-width="10" fill="none" />
                  </g>
                <path  id= "cierre" d="M35.0871 88.8847L34.4472 226.993" stroke="#B7A6A6" stroke-width="2"/>
                  <line
                    x1="34.5" y1="{calcularYSatisfaccion(viaje.Satisfaccion)}"
                    x2="34.5" y2="226.993"
                    stroke="#000000"
                    stroke-width="2"
                  />

                {#each nivelesY as y, i}
                  <line
                    x1="30" y1={y}
                    x2="40" y2={y}
                    stroke={i < viaje.Satisfaccion ? "#000000" : "#B7A6A6"}
                    stroke-width="2"
                  />
                {/each}
                <g filter="url(#filter2_d_13_92)">
                <rect width="48.3648" height="62.1777" rx="3" transform="matrix(0.974669 -0.223652 0.231685 0.972791 98.2067 47.0853)" fill="#404040"/>
                </g>
                <rect width="14.202" height="16.0479" rx="1" transform="matrix(0.975098 -0.221775 0.229748 0.97325 129 48)" fill="white"/>
                <rect width="14.202" height="16.0479" rx="1" transform="matrix(0.975098 -0.221775 0.229748 0.97325 134 67.1497)" fill="white"/>
          
                <g filter="url(#filter3_d_13_92)">
                <path d="M138 37.5C138 37.5 132.019 22.3911 126.5 19.5C121.527 16.895 118.486 16.7363 113 18.5C107.486 20.2728 106 22 104 27C101.047 34.383 105.5 45.5 105.5 45.5" stroke="black" stroke-width="2"/>
                </g>
                <ellipse cx="106.08" cy="45.2264" rx="5.00106" ry="0.964926" transform="rotate(-15 106.08 45.2264)" fill="black"/>
                <ellipse cx="138.08" cy="38.2264" rx="5.00106" ry="0.964926" transform="rotate(-15 138.08 38.2264)" fill="black"/>
                <defs>
                <filter id="filter0_d_13_92" x="67" y="0" width="59" height="52" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
                <feFlood flood-opacity="0" result="BackgroundImageFix"/>
                <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
                <feOffset dy="4"/>
                <feGaussianBlur stdDeviation="2"/>
                <feComposite in2="hardAlpha" operator="out"/>
                <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0"/>
                <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_13_92"/>
                <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_13_92" result="shape"/>
                </filter>
                <filter id="filter1_d_13_92" x="0" y="35" width="189" height="251" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
                <feFlood flood-opacity="0" result="BackgroundImageFix"/>
                <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
                <feOffset dy="4"/>
                <feGaussianBlur stdDeviation="2"/>
                <feComposite in2="hardAlpha" operator="out"/>
                <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0"/>
                <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_13_92"/>
                <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_13_92" result="shape"/>
                </filter>
                <filter id="filter2_d_13_92" x="94.8196" y="36.8626" width="68.3195" height="78.1145" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
                <feFlood flood-opacity="0" result="BackgroundImageFix"/>
                <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
                <feOffset dy="4"/>
                <feGaussianBlur stdDeviation="2"/>
                <feComposite in2="hardAlpha" operator="out"/>
                <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0"/>
                <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_13_92"/>
                <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_13_92" result="shape"/>
                </filter>
                <filter id="filter3_d_13_92" x="97.9884" y="16.3328" width="44.9411" height="37.5385" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
                <feFlood flood-opacity="0" result="BackgroundImageFix"/>
                <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
                <feOffset dy="4"/>
                <feGaussianBlur stdDeviation="2"/>
                <feComposite in2="hardAlpha" operator="out"/>
                <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0"/>
                <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_13_92"/>
                <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_13_92" result="shape"/>
                </filter>
                </defs>
                <text
                  x="142"
                  y="74"
                  text-anchor="middle"
                  font-size="20"
                  fill="black"
                  font-family="sans-serif"
                  transform="rotate(-15 90 75)"
                >
                  {viaje.Mes.toString().padStart(2, '0')[0]}
                </text>

                <text
                  x="142"
                  y="94.5"
                  text-anchor="middle"
                  font-size="20"
                  fill="black"
                  font-family="sans-serif"
                  transform="rotate(-15 90 75)"
                >
                  {viaje.Mes.toString().padStart(2, '0')[1]}
                </text>


                </svg> 
                <div style="text-align: center; width: 100%; margin-top: 8px; font-family: 'Poppins', sans-serif;">
                  <p style="margin: 0; font-weight: bold;">{viaje.Nombre}</p>
                  <p style="margin: 0;">{viaje.Pais}</p>
                </div>
          {/if}
    </div>
      {/each}
    </div>
  </section>
{/if}

<p class="intro-valijas">
  ¡Listo! Ya creaste tu valija.  Ahora te invitamos a ver los viajes que compartieron otras personas. 
  ¿A dónde fueron? ¿Con quiénes viajaron? ¿Qué los motivó?  
  Cada valija tiene su propia historia... exploralas y descubrí qué tan parecidos (o distintos) fueron esos viajes al tuyo.
</p>

<div class="valijas-anteriores">
  {#each viajesFormulario as viaje}
    <div class="valija" style="position: relative; display: flex; flex-wrap: wrap; gap: 20px;">
      {#if  viaje.Acompaniantes === 0} 
              <svg width="189" height="294" viewBox="0 0 189 294" fill="none" xmlns="http://www.w3.org/2000/svg">
                <image
                href="{iconosMotivo[viaje.Motivo]}"
                x="120"
                y="210"
                width="40"
                height="40"
                />

                <g filter="url(#filter0_d_13_92)">
                <rect x="73.5" y="2.5" width="46" height="39" rx="7.5" stroke="black" stroke-width="5" shape-rendering="crispEdges"/>
                </g>
                   <g>
                    <rect x="4" y="35" width="181" height="243" rx="25" fill="{colorContinentePorPais(viaje.Pais)}" fill-opacity="0.3" />
                    <rect x="9" y="40" width="171" height="233" rx="20" stroke="{colorContinentePorPais(viaje.Pais)}" stroke-width="10" fill="none" />
                  </g>
                <path  id= "cierre" d="M35.0871 88.8847L34.4472 226.993" stroke="#B7A6A6" stroke-width="2"/>
                  <line
                    x1="34.5" y1="{calcularYSatisfaccion(viaje.Satisfaccion)}"
                    x2="34.5" y2="226.993"
                    stroke="#000000"
                    stroke-width="2"
                  />

                {#each nivelesY as y, i}
                  <line
                    x1="30" y1={y}
                    x2="40" y2={y}
                    stroke={i < viaje.Satisfaccion ? "#000000" : "#B7A6A6"}
                    stroke-width="2"
                  />
                {/each}
                <g filter="url(#filter2_d_13_92)">
                <rect width="48.3648" height="62.1777" rx="3" transform="matrix(0.974669 -0.223652 0.231685 0.972791 98.2067 47.0853)" fill="#404040"/>
                </g>
                <rect width="14.202" height="16.0479" rx="1" transform="matrix(0.975098 -0.221775 0.229748 0.97325 129 48)" fill="white"/>
                <rect width="14.202" height="16.0479" rx="1" transform="matrix(0.975098 -0.221775 0.229748 0.97325 134 67.1497)" fill="white"/>
          
                <g filter="url(#filter3_d_13_92)">
                <path d="M138 37.5C138 37.5 132.019 22.3911 126.5 19.5C121.527 16.895 118.486 16.7363 113 18.5C107.486 20.2728 106 22 104 27C101.047 34.383 105.5 45.5 105.5 45.5" stroke="black" stroke-width="2"/>
                </g>
                <ellipse cx="106.08" cy="45.2264" rx="5.00106" ry="0.964926" transform="rotate(-15 106.08 45.2264)" fill="black"/>
                <ellipse cx="138.08" cy="38.2264" rx="5.00106" ry="0.964926" transform="rotate(-15 138.08 38.2264)" fill="black"/>
                <defs>
                <filter id="filter0_d_13_92" x="67" y="0" width="59" height="52" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
                <feFlood flood-opacity="0" result="BackgroundImageFix"/>
                <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
                <feOffset dy="4"/>
                <feGaussianBlur stdDeviation="2"/>
                <feComposite in2="hardAlpha" operator="out"/>
                <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0"/>
                <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_13_92"/>
                <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_13_92" result="shape"/>
                </filter>
                <filter id="filter1_d_13_92" x="0" y="35" width="189" height="251" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
                <feFlood flood-opacity="0" result="BackgroundImageFix"/>
                <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
                <feOffset dy="4"/>
                <feGaussianBlur stdDeviation="2"/>
                <feComposite in2="hardAlpha" operator="out"/>
                <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0"/>
                <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_13_92"/>
                <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_13_92" result="shape"/>
                </filter>
                <filter id="filter2_d_13_92" x="94.8196" y="36.8626" width="68.3195" height="78.1145" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
                <feFlood flood-opacity="0" result="BackgroundImageFix"/>
                <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
                <feOffset dy="4"/>
                <feGaussianBlur stdDeviation="2"/>
                <feComposite in2="hardAlpha" operator="out"/>
                <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0"/>
                <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_13_92"/>
                <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_13_92" result="shape"/>
                </filter>
                <filter id="filter3_d_13_92" x="97.9884" y="16.3328" width="44.9411" height="37.5385" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
                <feFlood flood-opacity="0" result="BackgroundImageFix"/>
                <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
                <feOffset dy="4"/>
                <feGaussianBlur stdDeviation="2"/>
                <feComposite in2="hardAlpha" operator="out"/>
                <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0"/>
                <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_13_92"/>
                <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_13_92" result="shape"/>
                </filter>
                </defs>
                <text
                  x="142"
                  y="74"
                  text-anchor="middle"
                  font-size="20"
                  fill="black"
                  font-family="sans-serif"
                  transform="rotate(-15 90 75)"
                >
                  {viaje.Mes.toString().padStart(2, '0')[0]}
                </text>

                <text
                  x="142"
                  y="94.5"
                  text-anchor="middle"
                  font-size="20"
                  fill="black"
                  font-family="sans-serif"
                  transform="rotate(-15 90 75)"
                >
                  {viaje.Mes.toString().padStart(2, '0')[1]}
                </text>


                </svg> 
                <div style="text-align: center; width: 100%; margin-top: 8px; font-family: 'Poppins', sans-serif;">
                  <p style="margin: 0; font-weight: bold;">{viaje.Nombre}</p>
                  <p style="margin: 0;">{viaje.Pais}</p>
                </div>
         

      {:else if  viaje.Acompaniantes === 1} 
              <svg width="189" height="294" viewBox="0 0 189 294" fill="none" xmlns="http://www.w3.org/2000/svg">
                <image
                href="{iconosMotivo[viaje.Motivo]}"
                x="120"
                y="210"
                width="40"
                height="40"
                />
                <circle cx="94" cy="285" r="9" fill="#404040"/>
                <circle cx="94" cy="285" r="5" fill="white"/>
                <g filter="url(#filter0_d_13_92)">
                <rect x="73.5" y="2.5" width="46" height="39" rx="7.5" stroke="black" stroke-width="5" shape-rendering="crispEdges"/>
                </g>
                   <g>
                    <rect x="4" y="35" width="181" height="243" rx="25" fill="{colorContinentePorPais(viaje.Pais)}" fill-opacity="0.3" />
                    <rect x="9" y="40" width="171" height="233" rx="20" stroke="{colorContinentePorPais(viaje.Pais)}" stroke-width="10" fill="none" />
                  </g>
                <path  id= "cierre" d="M35.0871 88.8847L34.4472 226.993" stroke="#B7A6A6" stroke-width="2"/>
                  <line
                    x1="34.5" y1="{calcularYSatisfaccion(viaje.Satisfaccion)}"
                    x2="34.5" y2="226.993"
                    stroke="#000000"
                    stroke-width="2"
                  />

                {#each nivelesY as y, i}
                  <line
                    x1="30" y1={y}
                    x2="40" y2={y}
                    stroke={i < viaje.Satisfaccion ? "#000000" : "#B7A6A6"}
                    stroke-width="2"
                  />
                {/each}
                <g filter="url(#filter2_d_13_92)">
                <rect width="48.3648" height="62.1777" rx="3" transform="matrix(0.974669 -0.223652 0.231685 0.972791 98.2067 47.0853)" fill="#404040"/>
                </g>
                <rect width="14.202" height="16.0479" rx="1" transform="matrix(0.975098 -0.221775 0.229748 0.97325 129 48)" fill="white"/>
                <rect width="14.202" height="16.0479" rx="1" transform="matrix(0.975098 -0.221775 0.229748 0.97325 134 67.1497)" fill="white"/>
          
                <g filter="url(#filter3_d_13_92)">
                <path d="M138 37.5C138 37.5 132.019 22.3911 126.5 19.5C121.527 16.895 118.486 16.7363 113 18.5C107.486 20.2728 106 22 104 27C101.047 34.383 105.5 45.5 105.5 45.5" stroke="black" stroke-width="2"/>
                </g>
                <ellipse cx="106.08" cy="45.2264" rx="5.00106" ry="0.964926" transform="rotate(-15 106.08 45.2264)" fill="black"/>
                <ellipse cx="138.08" cy="38.2264" rx="5.00106" ry="0.964926" transform="rotate(-15 138.08 38.2264)" fill="black"/>
                <defs>
                <filter id="filter0_d_13_92" x="67" y="0" width="59" height="52" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
                <feFlood flood-opacity="0" result="BackgroundImageFix"/>
                <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
                <feOffset dy="4"/>
                <feGaussianBlur stdDeviation="2"/>
                <feComposite in2="hardAlpha" operator="out"/>
                <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0"/>
                <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_13_92"/>
                <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_13_92" result="shape"/>
                </filter>
                <filter id="filter1_d_13_92" x="0" y="35" width="189" height="251" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
                <feFlood flood-opacity="0" result="BackgroundImageFix"/>
                <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
                <feOffset dy="4"/>
                <feGaussianBlur stdDeviation="2"/>
                <feComposite in2="hardAlpha" operator="out"/>
                <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0"/>
                <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_13_92"/>
                <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_13_92" result="shape"/>
                </filter>
                <filter id="filter2_d_13_92" x="94.8196" y="36.8626" width="68.3195" height="78.1145" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
                <feFlood flood-opacity="0" result="BackgroundImageFix"/>
                <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
                <feOffset dy="4"/>
                <feGaussianBlur stdDeviation="2"/>
                <feComposite in2="hardAlpha" operator="out"/>
                <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0"/>
                <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_13_92"/>
                <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_13_92" result="shape"/>
                </filter>
                <filter id="filter3_d_13_92" x="97.9884" y="16.3328" width="44.9411" height="37.5385" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
                <feFlood flood-opacity="0" result="BackgroundImageFix"/>
                <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
                <feOffset dy="4"/>
                <feGaussianBlur stdDeviation="2"/>
                <feComposite in2="hardAlpha" operator="out"/>
                <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0"/>
                <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_13_92"/>
                <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_13_92" result="shape"/>
                </filter>
                </defs>
                <text
                  x="142"
                  y="74"
                  text-anchor="middle"
                  font-size="20"
                  fill="black"
                  font-family="sans-serif"
                  transform="rotate(-15 90 75)"
                >
                  {viaje.Mes.toString().padStart(2, '0')[0]}
                </text>

                <text
                  x="142"
                  y="94.5"
                  text-anchor="middle"
                  font-size="20"
                  fill="black"
                  font-family="sans-serif"
                  transform="rotate(-15 90 75)"
                >
                  {viaje.Mes.toString().padStart(2, '0')[1]}
                </text>


                </svg> 
                <div style="text-align: center; width: 100%; margin-top: 8px; font-family: 'Poppins', sans-serif;">
                  <p style="margin: 0; font-weight: bold;">{viaje.Nombre}</p>
                  <p style="margin: 0;">{viaje.Pais}</p>
                </div>
         

      {:else if  viaje.Acompaniantes === 2} 
              <svg width="189" height="294" viewBox="0 0 189 294" fill="none" xmlns="http://www.w3.org/2000/svg">
                <image
                href="{iconosMotivo[viaje.Motivo]}"
                x="120"
                y="210"
                width="40"
                height="40"
                />
                <circle cx="154" cy="285" r="9" fill="#404040"/>
                <circle cx="154" cy="285" r="5" fill="white"/>
                <circle cx="41" cy="285" r="9" fill="#404040"/>
                <circle cx="41" cy="285" r="5" fill="white"/>
                <g filter="url(#filter0_d_13_92)">
                <rect x="73.5" y="2.5" width="46" height="39" rx="7.5" stroke="black" stroke-width="5" shape-rendering="crispEdges"/>
                </g>
                   <g>
                    <rect x="4" y="35" width="181" height="243" rx="25" fill="{colorContinentePorPais(viaje.Pais)}" fill-opacity="0.3" />
                    <rect x="9" y="40" width="171" height="233" rx="20" stroke="{colorContinentePorPais(viaje.Pais)}" stroke-width="10" fill="none" />
                  </g>
                <path  id= "cierre" d="M35.0871 88.8847L34.4472 226.993" stroke="#B7A6A6" stroke-width="2"/>
                  <line
                    x1="34.5" y1="{calcularYSatisfaccion(viaje.Satisfaccion)}"
                    x2="34.5" y2="226.993"
                    stroke="#000000"
                    stroke-width="2"
                  />

                {#each nivelesY as y, i}
                  <line
                    x1="30" y1={y}
                    x2="40" y2={y}
                    stroke={i < viaje.Satisfaccion ? "#000000" : "#B7A6A6"}
                    stroke-width="2"
                  />
                {/each}
                <g filter="url(#filter2_d_13_92)">
                <rect width="48.3648" height="62.1777" rx="3" transform="matrix(0.974669 -0.223652 0.231685 0.972791 98.2067 47.0853)" fill="#404040"/>
                </g>
                <rect width="14.202" height="16.0479" rx="1" transform="matrix(0.975098 -0.221775 0.229748 0.97325 129 48)" fill="white"/>
                <rect width="14.202" height="16.0479" rx="1" transform="matrix(0.975098 -0.221775 0.229748 0.97325 134 67.1497)" fill="white"/>
          
                <g filter="url(#filter3_d_13_92)">
                <path d="M138 37.5C138 37.5 132.019 22.3911 126.5 19.5C121.527 16.895 118.486 16.7363 113 18.5C107.486 20.2728 106 22 104 27C101.047 34.383 105.5 45.5 105.5 45.5" stroke="black" stroke-width="2"/>
                </g>
                <ellipse cx="106.08" cy="45.2264" rx="5.00106" ry="0.964926" transform="rotate(-15 106.08 45.2264)" fill="black"/>
                <ellipse cx="138.08" cy="38.2264" rx="5.00106" ry="0.964926" transform="rotate(-15 138.08 38.2264)" fill="black"/>
                <defs>
                <filter id="filter0_d_13_92" x="67" y="0" width="59" height="52" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
                <feFlood flood-opacity="0" result="BackgroundImageFix"/>
                <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
                <feOffset dy="4"/>
                <feGaussianBlur stdDeviation="2"/>
                <feComposite in2="hardAlpha" operator="out"/>
                <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0"/>
                <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_13_92"/>
                <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_13_92" result="shape"/>
                </filter>
                <filter id="filter1_d_13_92" x="0" y="35" width="189" height="251" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
                <feFlood flood-opacity="0" result="BackgroundImageFix"/>
                <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
                <feOffset dy="4"/>
                <feGaussianBlur stdDeviation="2"/>
                <feComposite in2="hardAlpha" operator="out"/>
                <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0"/>
                <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_13_92"/>
                <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_13_92" result="shape"/>
                </filter>
                <filter id="filter2_d_13_92" x="94.8196" y="36.8626" width="68.3195" height="78.1145" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
                <feFlood flood-opacity="0" result="BackgroundImageFix"/>
                <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
                <feOffset dy="4"/>
                <feGaussianBlur stdDeviation="2"/>
                <feComposite in2="hardAlpha" operator="out"/>
                <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0"/>
                <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_13_92"/>
                <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_13_92" result="shape"/>
                </filter>
                <filter id="filter3_d_13_92" x="97.9884" y="16.3328" width="44.9411" height="37.5385" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
                <feFlood flood-opacity="0" result="BackgroundImageFix"/>
                <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
                <feOffset dy="4"/>
                <feGaussianBlur stdDeviation="2"/>
                <feComposite in2="hardAlpha" operator="out"/>
                <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0"/>
                <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_13_92"/>
                <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_13_92" result="shape"/>
                </filter>
                </defs>
                <text
                  x="142"
                  y="74"
                  text-anchor="middle"
                  font-size="20"
                  fill="black"
                  font-family="sans-serif"
                  transform="rotate(-15 90 75)"
                >
                  {viaje.Mes.toString().padStart(2, '0')[0]}
                </text>

                <text
                  x="142"
                  y="94.5"
                  text-anchor="middle"
                  font-size="20"
                  fill="black"
                  font-family="sans-serif"
                  transform="rotate(-15 90 75)"
                >
                  {viaje.Mes.toString().padStart(2, '0')[1]}
                </text>


                </svg> 
                <div style="text-align: center; width: 100%; margin-top: 8px; font-family: 'Poppins', sans-serif;">
                  <p style="margin: 0; font-weight: bold;">{viaje.Nombre}</p>
                  <p style="margin: 0;">{viaje.Pais}</p>
                </div>
         

      {:else if  viaje.Acompaniantes === 3} 
              <svg width="189" height="294" viewBox="0 0 189 294" fill="none" xmlns="http://www.w3.org/2000/svg">
                <image
                href="{iconosMotivo[viaje.Motivo]}"
                x="120"
                y="210"
                width="40"
                height="40"
                />
                <circle cx="153" cy="285" r="9" fill="#404040"/>
                <circle cx="153" cy="285" r="5" fill="white"/>
                <circle cx="95" cy="285" r="9" fill="#404040"/>
                <circle cx="95" cy="285" r="5" fill="white"/>
                <circle cx="37" cy="285" r="9" fill="#404040"/>
                <circle cx="37" cy="285" r="5" fill="white"/>
                <circle cx="95" cy="285" r="5" fill="white"/>
                <g filter="url(#filter0_d_13_92)">
                <rect x="73.5" y="2.5" width="46" height="39" rx="7.5" stroke="black" stroke-width="5" shape-rendering="crispEdges"/>
                </g>
                   <g>
                    <rect x="4" y="35" width="181" height="243" rx="25" fill="{colorContinentePorPais(viaje.Pais)}" fill-opacity="0.3" />
                    <rect x="9" y="40" width="171" height="233" rx="20" stroke="{colorContinentePorPais(viaje.Pais)}" stroke-width="10" fill="none" />
                  </g>
                <path  id= "cierre" d="M35.0871 88.8847L34.4472 226.993" stroke="#B7A6A6" stroke-width="2"/>
                  <line
                    x1="34.5" y1="{calcularYSatisfaccion(viaje.Satisfaccion)}"
                    x2="34.5" y2="226.993"
                    stroke="#000000"
                    stroke-width="2"
                  />

                {#each nivelesY as y, i}
                  <line
                    x1="30" y1={y}
                    x2="40" y2={y}
                    stroke={i < viaje.Satisfaccion ? "#000000" : "#B7A6A6"}
                    stroke-width="2"
                  />
                {/each}
                <g filter="url(#filter2_d_13_92)">
                <rect width="48.3648" height="62.1777" rx="3" transform="matrix(0.974669 -0.223652 0.231685 0.972791 98.2067 47.0853)" fill="#404040"/>
                </g>
                <rect width="14.202" height="16.0479" rx="1" transform="matrix(0.975098 -0.221775 0.229748 0.97325 129 48)" fill="white"/>
                <rect width="14.202" height="16.0479" rx="1" transform="matrix(0.975098 -0.221775 0.229748 0.97325 134 67.1497)" fill="white"/>
          
                <g filter="url(#filter3_d_13_92)">
                <path d="M138 37.5C138 37.5 132.019 22.3911 126.5 19.5C121.527 16.895 118.486 16.7363 113 18.5C107.486 20.2728 106 22 104 27C101.047 34.383 105.5 45.5 105.5 45.5" stroke="black" stroke-width="2"/>
                </g>
                <ellipse cx="106.08" cy="45.2264" rx="5.00106" ry="0.964926" transform="rotate(-15 106.08 45.2264)" fill="black"/>
                <ellipse cx="138.08" cy="38.2264" rx="5.00106" ry="0.964926" transform="rotate(-15 138.08 38.2264)" fill="black"/>
                <defs>
                <filter id="filter0_d_13_92" x="67" y="0" width="59" height="52" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
                <feFlood flood-opacity="0" result="BackgroundImageFix"/>
                <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
                <feOffset dy="4"/>
                <feGaussianBlur stdDeviation="2"/>
                <feComposite in2="hardAlpha" operator="out"/>
                <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0"/>
                <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_13_92"/>
                <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_13_92" result="shape"/>
                </filter>
                <filter id="filter1_d_13_92" x="0" y="35" width="189" height="251" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
                <feFlood flood-opacity="0" result="BackgroundImageFix"/>
                <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
                <feOffset dy="4"/>
                <feGaussianBlur stdDeviation="2"/>
                <feComposite in2="hardAlpha" operator="out"/>
                <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0"/>
                <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_13_92"/>
                <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_13_92" result="shape"/>
                </filter>
                <filter id="filter2_d_13_92" x="94.8196" y="36.8626" width="68.3195" height="78.1145" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
                <feFlood flood-opacity="0" result="BackgroundImageFix"/>
                <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
                <feOffset dy="4"/>
                <feGaussianBlur stdDeviation="2"/>
                <feComposite in2="hardAlpha" operator="out"/>
                <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0"/>
                <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_13_92"/>
                <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_13_92" result="shape"/>
                </filter>
                <filter id="filter3_d_13_92" x="97.9884" y="16.3328" width="44.9411" height="37.5385" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
                <feFlood flood-opacity="0" result="BackgroundImageFix"/>
                <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
                <feOffset dy="4"/>
                <feGaussianBlur stdDeviation="2"/>
                <feComposite in2="hardAlpha" operator="out"/>
                <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0"/>
                <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_13_92"/>
                <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_13_92" result="shape"/>
                </filter>
                </defs>
                <text
                  x="142"
                  y="74"
                  text-anchor="middle"
                  font-size="20"
                  fill="black"
                  font-family="sans-serif"
                  transform="rotate(-15 90 75)"
                >
                  {viaje.Mes.toString().padStart(2, '0')[0]}
                </text>

                <text
                  x="142"
                  y="94.5"
                  text-anchor="middle"
                  font-size="20"
                  fill="black"
                  font-family="sans-serif"
                  transform="rotate(-15 90 75)"
                >
                  {viaje.Mes.toString().padStart(2, '0')[1]}
                </text>


                </svg> 
                <div style="text-align: center; width: 100%; margin-top: 8px; font-family: 'Poppins', sans-serif;">
                  <p style="margin: 0; font-weight: bold;">{viaje.Nombre}</p>
                  <p style="margin: 0;">{viaje.Pais}</p>
                </div>
          

      {:else if  viaje.Acompaniantes === 4} 
              <svg width="189" height="294" viewBox="0 0 189 294" fill="none" xmlns="http://www.w3.org/2000/svg">
                <image
                href="{iconosMotivo[viaje.Motivo]}"
                x="120"
                y="210"
                width="40"
                height="40"
                />
                <circle cx="34" cy="285" r="9" fill="#404040"/>
                <circle cx="155" cy="285" r="9" fill="#404040"/>
                <circle cx="132" cy="285" r="9" fill="#404040"/>
                <circle cx="57" cy="285" r="9" fill="#404040"/>
                <circle cx="34" cy="285" r="5" fill="white"/>
                <circle cx="57" cy="285" r="5" fill="white"/>
                <circle cx="132" cy="285" r="5" fill="white"/>
                <circle cx="155" cy="285" r="5" fill="white"/>
                <g filter="url(#filter0_d_13_92)">
                <rect x="73.5" y="2.5" width="46" height="39" rx="7.5" stroke="black" stroke-width="5" shape-rendering="crispEdges"/>
                </g>
                   <g>
                    <rect x="4" y="35" width="181" height="243" rx="25" fill="{colorContinentePorPais(viaje.Pais)}" fill-opacity="0.3" />
                    <rect x="9" y="40" width="171" height="233" rx="20" stroke="{colorContinentePorPais(viaje.Pais)}" stroke-width="10" fill="none" />
                  </g>
                <path  id= "cierre" d="M35.0871 88.8847L34.4472 226.993" stroke="#B7A6A6" stroke-width="2"/>
                  <line
                    x1="34.5" y1="{calcularYSatisfaccion(viaje.Satisfaccion)}"
                    x2="34.5" y2="226.993"
                    stroke="#000000"
                    stroke-width="2"
                  />

                {#each nivelesY as y, i}
                  <line
                    x1="30" y1={y}
                    x2="40" y2={y}
                    stroke={i < viaje.Satisfaccion ? "#000000" : "#B7A6A6"}
                    stroke-width="2"
                  />
                {/each}
                <g filter="url(#filter2_d_13_92)">
                <rect width="48.3648" height="62.1777" rx="3" transform="matrix(0.974669 -0.223652 0.231685 0.972791 98.2067 47.0853)" fill="#404040"/>
                </g>
                <rect width="14.202" height="16.0479" rx="1" transform="matrix(0.975098 -0.221775 0.229748 0.97325 129 48)" fill="white"/>
                <rect width="14.202" height="16.0479" rx="1" transform="matrix(0.975098 -0.221775 0.229748 0.97325 134 67.1497)" fill="white"/>
          
                <g filter="url(#filter3_d_13_92)">
                <path d="M138 37.5C138 37.5 132.019 22.3911 126.5 19.5C121.527 16.895 118.486 16.7363 113 18.5C107.486 20.2728 106 22 104 27C101.047 34.383 105.5 45.5 105.5 45.5" stroke="black" stroke-width="2"/>
                </g>
                <ellipse cx="106.08" cy="45.2264" rx="5.00106" ry="0.964926" transform="rotate(-15 106.08 45.2264)" fill="black"/>
                <ellipse cx="138.08" cy="38.2264" rx="5.00106" ry="0.964926" transform="rotate(-15 138.08 38.2264)" fill="black"/>
                <defs>
                <filter id="filter0_d_13_92" x="67" y="0" width="59" height="52" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
                <feFlood flood-opacity="0" result="BackgroundImageFix"/>
                <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
                <feOffset dy="4"/>
                <feGaussianBlur stdDeviation="2"/>
                <feComposite in2="hardAlpha" operator="out"/>
                <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0"/>
                <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_13_92"/>
                <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_13_92" result="shape"/>
                </filter>
                <filter id="filter1_d_13_92" x="0" y="35" width="189" height="251" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
                <feFlood flood-opacity="0" result="BackgroundImageFix"/>
                <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
                <feOffset dy="4"/>
                <feGaussianBlur stdDeviation="2"/>
                <feComposite in2="hardAlpha" operator="out"/>
                <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0"/>
                <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_13_92"/>
                <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_13_92" result="shape"/>
                </filter>
                <filter id="filter2_d_13_92" x="94.8196" y="36.8626" width="68.3195" height="78.1145" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
                <feFlood flood-opacity="0" result="BackgroundImageFix"/>
                <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
                <feOffset dy="4"/>
                <feGaussianBlur stdDeviation="2"/>
                <feComposite in2="hardAlpha" operator="out"/>
                <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0"/>
                <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_13_92"/>
                <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_13_92" result="shape"/>
                </filter>
                <filter id="filter3_d_13_92" x="97.9884" y="16.3328" width="44.9411" height="37.5385" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
                <feFlood flood-opacity="0" result="BackgroundImageFix"/>
                <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
                <feOffset dy="4"/>
                <feGaussianBlur stdDeviation="2"/>
                <feComposite in2="hardAlpha" operator="out"/>
                <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0"/>
                <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_13_92"/>
                <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_13_92" result="shape"/>
                </filter>
                </defs>
                <text
                  x="142"
                  y="74"
                  text-anchor="middle"
                  font-size="20"
                  fill="black"
                  font-family="sans-serif"
                  transform="rotate(-15 90 75)"
                >
                  {viaje.Mes.toString().padStart(2, '0')[0]}
                </text>

                <text
                  x="142"
                  y="94.5"
                  text-anchor="middle"
                  font-size="20"
                  fill="black"
                  font-family="sans-serif"
                  transform="rotate(-15 90 75)"
                >
                  {viaje.Mes.toString().padStart(2, '0')[1]}
                </text>


                </svg> 
                <div style="text-align: center; width: 100%; margin-top: 8px; font-family: 'Poppins', sans-serif;">
                  <p style="margin: 0; font-weight: bold;">{viaje.Nombre}</p>
                  <p style="margin: 0;">{viaje.Pais}</p>
                </div>
          {/if}
    
    </div>
  {/each}
</div>

<!-- Contenedor de la story de flourish (scrolly)-->
<div id="my-wrapper">
  <!-- Reemplazar el ID de jeemplo por el de la story propia -->
  <div class="flourish-embed" data-src="story/3178326" data-url="https://flo.uri.sh/story/3178326/embed" data-height="100vh">
    
    <!-- <script src="https://public.flourish.studio/resources/embed.js"></script> -->
  </div>

  <!-- Iteramos sobre las distintas slides del componente de Flourish -->
  {#each slides as slide, index}
    <p>
      {@html slide}
      <!-- svelte-ignore a11y-missing-content -->
      <a href={"#story/3178326/slide-" + (index + 1)}></a>
    </p>
  {/each}




<footer class="footer">
  <div class="footer-container">
    <p class="footer-credits">
      <strong>Integrantes:</strong> Mia Mitelman · Ananke Benites Astoul · Sofía Majlis
    </p>
    <div class="footer-links">
      <a href="https://github.com/sofimajlis/visualizacion-parte2.git" target="_blank">GitHub</a>
      <a href="https://visualizacion-parte2.vercel.app" target="_blank">Vercel</a>
    </div>
    <p class="footer-sub">
      <strong>Materia:</strong> Visualización de Datos · <strong>Carrera:</strong> Tecnología Digital UTDT
    </p>
  </div>
</footer>

</main>



