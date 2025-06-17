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
  import familia from "/images/familia.svg"
  import amigos from "/images/amigos.svg"
  import desconectar from "/images/desconectar.svg"
  import aventura from "/images/aventura.svg"           
  import estudio from "/images/estudio.svg" 
  import negocios from "/images/negocio.svg" 
  import pareja from "/images/pareja.svg" 


  import * as d3 from "d3";

  import viajes from "/src/data/viajes.json";

//filtrar los continentes, ordenarno por mes, investigar con un set de datos mas grandas, agregarle los nombres a las valijas, complementarlo con un analisis de viajes con volumenes de ingreso de extranjeros, etc con graficos
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


//let nivelesY = Array.from({ length: 7 }, (_, i) => calcularYSatisfaccion(i));

// FILTROS
  let filtroRegion = "";
  let filtroEstacion = "";
  let filtroAcompaniantes = "";

  // FUNCION FILTRO GENERAL
  $: viajesCombinados = [...viajes, ...viajesFormulario];

  $: viajesFiltrados = viajesCombinados.filter(v =>
    (filtroRegion === "" || v.Region === filtroRegion) &&
    (filtroEstacion === "" || v.Estacion === filtroEstacion) &&
    (filtroAcompaniantes === "" || v.Acompaniantes === +filtroAcompaniantes)
  );



  // nuevo!!

  import { continentePorPais } from './continentePorPais.js';
  import { db, ref, push, onValue } from './firebase.js';
  import { onMount } from 'svelte';


  // Estado reactivo para los viajes
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

  // Lista de países para el <select>
  let listaPaises = Object.keys(continentePorPais).sort();

  // Cargar viajes desde Firebase al iniciar el componente
  onMount(() => {
    const viajesRef = ref(db, 'viajes');
    onValue(viajesRef, (snapshot) => {
      const datos = snapshot.val();
      viajesFormulario = datos ? Object.values(datos) : [];
    });
  });

  function agregarViaje() {
    const nuevo = { ...nuevoViaje };

    // Validación mínima
    if (!nuevo.Nombre || !nuevo.Pais || !nuevo.Mes || !nuevo.Motivo) return;

    // Subir a Firebase
    const viajesRef = ref(db, 'viajes');
    push(viajesRef, nuevo);

    // Agregar también a localStorage (opcional, podés quitar esto si no lo querés más)
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


</script>


<main>
  
  <div class="headline">
    <h2>Historias dentro de una valija</h2>
    <h3>Cada viaje deja un recuerdo. Estas valijas representan las aventuras recientes de nuestros amigos: <strong>cuántos fueron, a dónde, en qué época del año, cuánto disfrutaron y cuánto gastaron</strong>.
      Las valijas que ves no solo llevan ropa, también llevan historias, momentos compartidos y emociones. </h3>
  </div>
  
  <!-- Sección de Referencias -->
  <div class="section">
    <h4 class="section-title">Referencias</h4>
    <div class="references-container">
      <img src="/images/Referencias2.svg" width="1100" alt="explicacion"/>
    </div>
  </div>

  <!-- Sección de Filtros -->
  <div class="section">
    <h4 class="section-title">Filtros</h4>
    <div class="filtros-container">
      <div class="filtros">
        <div class="filtro-item">
          <div class="filtro-icon region-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/><path d="M2 12h20"/></svg>
          </div>
          <label>Región:</label>
          <div class="custom-select">
          <select class="opciones" bind:value={filtroRegion}>
            <option value="">Todas</option>
            <option value="Europa">Europa</option>
            <option value="Asia">Asia</option>
            <option value="África">África</option>
            <option value="América">América</option>
            <option value="Oceanía">Oceanía</option>
          </select>
          </div>
        </div>

        <div class="filtro-item">
          <div class="filtro-icon season-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/><path d="M8 14h.01"/><path d="M12 14h.01"/><path d="M16 14h.01"/><path d="M8 18h.01"/><path d="M12 18h.01"/><path d="M16 18h.01"/></svg>
          </div>
          <label>Estación:</label>
          <div class="custom-select">
          <select class="opciones" bind:value={filtroEstacion}>
            <option value="">Todas</option>
            <option value="Verano">Verano</option>
            <option value="Invierno">Invierno</option>
            <option value="Otoño">Otoño</option>
            <option value="Primavera">Primavera</option>
          </select>
          </div>
        </div>

        <div class="filtro-item">
          <div class="filtro-icon companions-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
          </div>
          <label>Acompañantes:</label>
          <div class="custom-select">
          <select class="opciones" bind:value={filtroAcompaniantes}>
            <option value="">Todos</option>
            {#each Array(5) as _, i}
              <option value={i}>{i}</option>
            {/each}
          </select>
          </div>
        </div>
      </div>
    </div>
  </div>

  <div class="container">
    {#each viajesFiltrados as viaje}
    <div class="valija" style="display: flex; flex-wrap: wrap; gap: 20px;">
      {#if viaje.Acompaniantes === 0}
          <svg width="{anchoValija(viaje.Monto)}" height="{altoValija(viaje.Monto)}" viewBox="0 0 189 286" fill="none" xmlns="http://www.w3.org/2000/svg">
            <image
              href="{iconosEstacion[viaje.Estacion]}"
              x="120"
              y="210"
              width="40"
              height="40"
            />
            <g filter="url(#filter0_d_13_88)">
            <rect x="73.5" y="2.5" width="46" height="39" rx="7.5" stroke="black" stroke-width="5" shape-rendering="crispEdges"/>
            </g>
            <g filter="url(#filter1_d_13_88)">
            <rect id= "relleno" x="4" y="35" width="181" height="243" rx="25" fill="{colorContinente(viaje.Region)}" fill-opacity="0.30" shape-rendering="crispEdges"/>
            <rect id="borde" x="9" y="40" width="171" height="233" rx="20" stroke="{colorContinente(viaje.Region)}" stroke-width="10" shape-rendering="crispEdges"/>
            </g>
            <path id= "cierre" d="M35.0871 88.8847L34.4472 226.993" stroke="#B7A6A6" stroke-width="2"/>
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
            <g filter="url(#filter2_d_13_88)">
            <rect width="48.3648" height="62.1777" rx="3" transform="matrix(0.974669 -0.223652 0.231685 0.972791 98.2067 47.0853)" fill="#404040"/>
            </g>
            <rect width="14.202" height="16.0479" rx="1" transform="matrix(0.975098 -0.221775 0.229748 0.97325 129 48)" fill="white"/>
            <rect width="14.202" height="16.0479" rx="1" transform="matrix(0.975098 -0.221775 0.229748 0.97325 134 67.1497)" fill="white"/>

            <g filter="url(#filter3_d_13_88)">
            <path d="M138 37.5C138 37.5 132.019 22.3911 126.5 19.5C121.527 16.895 118.486 16.7363 113 18.5C107.486 20.2728 106 22 104 27C101.047 34.383 105.5 45.5 105.5 45.5" stroke="black" stroke-width="2"/>
            </g>
            <ellipse cx="106.08" cy="45.2264" rx="5.00106" ry="0.964926" transform="rotate(-15 106.08 45.2264)" fill="black"/>
            <ellipse cx="138.08" cy="38.2264" rx="5.00106" ry="0.964926" transform="rotate(-15 138.08 38.2264)" fill="black"/>
            <defs>
            <filter id="filter0_d_13_88" x="67" y="0" width="59" height="52" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
            <feFlood flood-opacity="0" result="BackgroundImageFix"/>
            <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
            <feOffset dy="4"/>
            <feGaussianBlur stdDeviation="2"/>
            <feComposite in2="hardAlpha" operator="out"/>
            <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0"/>
            <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_13_88"/>
            <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_13_88" result="shape"/>
            </filter>
            <filter id="filter1_d_13_88" x="0" y="35" width="189" height="251" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
            <feFlood flood-opacity="0" result="BackgroundImageFix"/>
            <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
            <feOffset dy="4"/>
            <feGaussianBlur stdDeviation="2"/>
            <feComposite in2="hardAlpha" operator="out"/>
            <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0"/>
            <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_13_88"/>
            <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_13_88" result="shape"/>
            </filter>
            <filter id="filter2_d_13_88" x="94.8196" y="36.8626" width="68.3195" height="78.1145" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
            <feFlood flood-opacity="0" result="BackgroundImageFix"/>
            <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
            <feOffset dy="4"/>
            <feGaussianBlur stdDeviation="2"/>
            <feComposite in2="hardAlpha" operator="out"/>
            <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0"/>
            <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_13_88"/>
            <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_13_88" result="shape"/>
            </filter>
            <filter id="filter3_d_13_88" x="97.9885" y="16.3328" width="44.9411" height="37.5385" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
            <feFlood flood-opacity="0" result="BackgroundImageFix"/>
            <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
            <feOffset dy="4"/>
            <feGaussianBlur stdDeviation="2"/>
            <feComposite in2="hardAlpha" operator="out"/>
            <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0"/>
            <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_13_88"/>
            <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_13_88" result="shape"/>
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
            {:else if viaje.Acompaniantes === 1}
            <svg width="{anchoValija(viaje.Monto)}" height="{altoValija(viaje.Monto)}" viewBox="0 0 189 294" fill="none" xmlns="http://www.w3.org/2000/svg">
              <image
              href="{iconosEstacion[viaje.Estacion]}"
              x="120"
              y="210"
              width="40"
              height="40"
              />
              <circle cx="94" cy="285" r="9" fill="#404040"/>
              <circle cx="94" cy="285" r="5" fill="white"/>
              <g filter="url(#filter0_d_13_89)">
              <rect x="73.5" y="2.5" width="46" height="39" rx="7.5" stroke="black" stroke-width="5" shape-rendering="crispEdges"/>
              </g>
              <g filter="url(#filter1_d_13_89)">
              <rect x="4" y="35" width="181" height="243" rx="25" fill="{colorContinente(viaje.Region)}" fill-opacity="0.30" shape-rendering="crispEdges"/>
              <rect x="9" y="40" width="171" height="233" rx="20" stroke="{colorContinente(viaje.Region)}" stroke-width="10" shape-rendering="crispEdges"/>
              </g>
              <path id= "cierre" d="M35.0871 88.8847L34.4472 226.993" stroke="#B7A6A6" stroke-width="2"/>
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
              <g filter="url(#filter2_d_13_89)">
              <rect width="48.3648" height="62.1777" rx="3" transform="matrix(0.974669 -0.223652 0.231685 0.972791 98.2067 47.0853)" fill="#404040"/>
              </g>
              <rect width="14.202" height="16.0479" rx="1" transform="matrix(0.975098 -0.221775 0.229748 0.97325 129 48)" fill="white"/>
              <rect width="14.202" height="16.0479" rx="1" transform="matrix(0.975098 -0.221775 0.229748 0.97325 134 67.1497)" fill="white"/>
              
              <g filter="url(#filter3_d_13_89)">
              <path d="M138 37.5C138 37.5 132.019 22.3911 126.5 19.5C121.527 16.895 118.486 16.7363 113 18.5C107.486 20.2728 106 22 104 27C101.047 34.383 105.5 45.5 105.5 45.5" stroke="black" stroke-width="2"/>
              </g>
              <ellipse cx="106.08" cy="45.2264" rx="5.00106" ry="0.964926" transform="rotate(-15 106.08 45.2264)" fill="black"/>
              <ellipse cx="138.08" cy="38.2264" rx="5.00106" ry="0.964926" transform="rotate(-15 138.08 38.2264)" fill="black"/>
              <defs>
              <filter id="filter0_d_13_89" x="67" y="0" width="59" height="52" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
              <feFlood flood-opacity="0" result="BackgroundImageFix"/>
              <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
              <feOffset dy="4"/>
              <feGaussianBlur stdDeviation="2"/>
              <feComposite in2="hardAlpha" operator="out"/>
              <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0"/>
              <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_13_89"/>
              <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_13_89" result="shape"/>
              </filter>
              <filter id="filter1_d_13_89" x="0" y="35" width="189" height="251" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
              <feFlood flood-opacity="0" result="BackgroundImageFix"/>
              <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
              <feOffset dy="4"/>
              <feGaussianBlur stdDeviation="2"/>
              <feComposite in2="hardAlpha" operator="out"/>
              <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0"/>
              <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_13_89"/>
              <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_13_89" result="shape"/>
              </filter>
              <filter id="filter2_d_13_89" x="94.8196" y="36.8626" width="68.3195" height="78.1145" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
              <feFlood flood-opacity="0" result="BackgroundImageFix"/>
              <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
              <feOffset dy="4"/>
              <feGaussianBlur stdDeviation="2"/>
              <feComposite in2="hardAlpha" operator="out"/>
              <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0"/>
              <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_13_89"/>
              <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_13_89" result="shape"/>
              </filter>
              <filter id="filter3_d_13_89" x="97.9885" y="16.3328" width="44.9411" height="37.5385" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
              <feFlood flood-opacity="0" result="BackgroundImageFix"/>
              <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
              <feOffset dy="4"/>
              <feGaussianBlur stdDeviation="2"/>
              <feComposite in2="hardAlpha" operator="out"/>
              <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0"/>
              <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_13_89"/>
              <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_13_89" result="shape"/>
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
            {:else if  viaje.Acompaniantes === 2}
            <svg width="{anchoValija(viaje.Monto)}" height="{altoValija(viaje.Monto)}" viewBox="0 0 189 294" fill="none" xmlns="http://www.w3.org/2000/svg">
              <image
              href="{iconosEstacion[viaje.Estacion]}"
              x="120"
              y="210"
              width="40"
              height="40"
              />
              <circle cx="154" cy="285" r="9" fill="#404040"/>
              <circle cx="154" cy="285" r="5" fill="white"/>
              <circle cx="41" cy="285" r="9" fill="#404040"/>
              <circle cx="41" cy="285" r="5" fill="white"/>
              <g filter="url(#filter0_d_25_2)">
              <rect x="73.5" y="2.5" width="46" height="39" rx="7.5" stroke="black" stroke-width="5" shape-rendering="crispEdges"/>
              </g>
              <g filter="url(#filter1_d_25_2)">
              <rect x="4" y="35" width="181" height="243" rx="25" fill="{colorContinente(viaje.Region)}" fill-opacity="0.30" shape-rendering="crispEdges"/>
              <rect x="9" y="40" width="171" height="233" rx="20" stroke="{colorContinente(viaje.Region)}" stroke-width="10" shape-rendering="crispEdges"/>
              </g>
              <path id = "cierre" d="M35.0871 88.8847L34.4472 226.993" stroke="#B7A6A6" stroke-width="2"/>
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
              <g filter="url(#filter2_d_25_2)">
              <rect width="48.3648" height="62.1777" rx="3" transform="matrix(0.974669 -0.223652 0.231685 0.972791 98.2067 47.0853)" fill="#404040"/>
              </g>
              <rect width="14.202" height="16.0479" rx="1" transform="matrix(0.975098 -0.221775 0.229748 0.97325 129 48)" fill="white"/>
              <rect width="14.202" height="16.0479" rx="1" transform="matrix(0.975098 -0.221775 0.229748 0.97325 134 67.1497)" fill="white"/>
              
              <g filter="url(#filter3_d_25_2)">
              <path d="M138 37.5C138 37.5 132.019 22.3911 126.5 19.5C121.527 16.895 118.486 16.7363 113 18.5C107.486 20.2728 106 22 104 27C101.047 34.383 105.5 45.5 105.5 45.5" stroke="black" stroke-width="2"/>
              </g>
              <ellipse cx="106.08" cy="45.2264" rx="5.00106" ry="0.964926" transform="rotate(-15 106.08 45.2264)" fill="black"/>
              <ellipse cx="138.08" cy="38.2264" rx="5.00106" ry="0.964926" transform="rotate(-15 138.08 38.2264)" fill="black"/>
              <defs>
              <filter id="filter0_d_25_2" x="67" y="0" width="59" height="52" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
              <feFlood flood-opacity="0" result="BackgroundImageFix"/>
              <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
              <feOffset dy="4"/>
              <feGaussianBlur stdDeviation="2"/>
              <feComposite in2="hardAlpha" operator="out"/>
              <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0"/>
              <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_25_2"/>
              <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_25_2" result="shape"/>
              </filter>
              <filter id="filter1_d_25_2" x="0" y="35" width="189" height="251" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
              <feFlood flood-opacity="0" result="BackgroundImageFix"/>
              <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
              <feOffset dy="4"/>
              <feGaussianBlur stdDeviation="2"/>
              <feComposite in2="hardAlpha" operator="out"/>
              <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0"/>
              <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_25_2"/>
              <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_25_2" result="shape"/>
              </filter>
              <filter id="filter2_d_25_2" x="94.8196" y="36.8626" width="68.3195" height="78.1145" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
              <feFlood flood-opacity="0" result="BackgroundImageFix"/>
              <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
              <feOffset dy="4"/>
              <feGaussianBlur stdDeviation="2"/>
              <feComposite in2="hardAlpha" operator="out"/>
              <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0"/>
              <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_25_2"/>
              <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_25_2" result="shape"/>
              </filter>
              <filter id="filter3_d_25_2" x="97.9884" y="16.3328" width="44.9411" height="37.5385" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
              <feFlood flood-opacity="0" result="BackgroundImageFix"/>
              <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
              <feOffset dy="4"/>
              <feGaussianBlur stdDeviation="2"/>
              <feComposite in2="hardAlpha" operator="out"/>
              <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0"/>
              <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_25_2"/>
              <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_25_2" result="shape"/>
              </filter>
              </defs>
              <text
                x="142"
                y="75"
                text-anchor="middle"
                font-size="21"
                fill="black"
                font-family="sans-serif"
                transform="rotate(-15 90 75)"
              >
                {viaje.Mes.toString().padStart(2, '0')[0]}
            </text>

            <text
              x="142"
              y="95"
              text-anchor="middle"
              font-size="21"
              fill="black"
              font-family="sans-serif"
              transform="rotate(-15 90 75)"
            >
              {viaje.Mes.toString().padStart(2, '0')[1]}
            </text>

              </svg>
              {:else if  viaje.Acompaniantes === 3}
              <svg width="{anchoValija(viaje.Monto)}" height="{altoValija(viaje.Monto)}" viewBox="0 0 189 294" fill="none" xmlns="http://www.w3.org/2000/svg">
                <image
                href="{iconosEstacion[viaje.Estacion]}"
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
                <g filter="url(#filter0_d_13_91)">
                <rect x="73.5" y="2.5" width="46" height="39" rx="7.5" stroke="black" stroke-width="5" shape-rendering="crispEdges"/>
                </g>
                <g filter="url(#filter1_d_13_91)">
                <rect x="4" y="35" width="181" height="243" rx="25" fill="{colorContinente(viaje.Region)}" fill-opacity="0.30" shape-rendering="crispEdges"/>
                <rect x="9" y="40" width="171" height="233" rx="20" stroke="{colorContinente(viaje.Region)}" stroke-width="10" shape-rendering="crispEdges"/>
                </g>
                <path id= "cierre" d="M35.0871 88.8847L34.4472 226.993" stroke="#B7A6A6" stroke-width="2"/>
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
                <g filter="url(#filter2_d_13_91)">
                <rect width="48.3648" height="62.1777" rx="3" transform="matrix(0.974669 -0.223652 0.231685 0.972791 98.2067 47.0853)" fill="#404040"/>
                </g>
                <rect width="14.202" height="16.0479" rx="1" transform="matrix(0.975098 -0.221775 0.229748 0.97325 129 48)" fill="white"/>
                <rect width="14.202" height="16.0479" rx="1" transform="matrix(0.975098 -0.221775 0.229748 0.97325 134 67.1497)" fill="white"/>
                
                <g filter="url(#filter3_d_13_91)">
                <path d="M138 37.5C138 37.5 132.019 22.3911 126.5 19.5C121.527 16.895 118.486 16.7363 113 18.5C107.486 20.2728 106 22 104 27C101.047 34.383 105.5 45.5 105.5 45.5" stroke="black" stroke-width="2"/>
                </g>
                <ellipse cx="106.08" cy="45.2264" rx="5.00106" ry="0.964926" transform="rotate(-15 106.08 45.2264)" fill="black"/>
                <ellipse cx="138.08" cy="38.2264" rx="5.00106" ry="0.964926" transform="rotate(-15 138.08 38.2264)" fill="black"/>
                <defs>
                <filter id="filter0_d_13_91" x="67" y="0" width="59" height="52" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
                <feFlood flood-opacity="0" result="BackgroundImageFix"/>
                <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
                <feOffset dy="4"/>
                <feGaussianBlur stdDeviation="2"/>
                <feComposite in2="hardAlpha" operator="out"/>
                <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0"/>
                <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_13_91"/>
                <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_13_91" result="shape"/>
                </filter>
                <filter id="filter1_d_13_91" x="0" y="35" width="189" height="251" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
                <feFlood flood-opacity="0" result="BackgroundImageFix"/>
                <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
                <feOffset dy="4"/>
                <feGaussianBlur stdDeviation="2"/>
                <feComposite in2="hardAlpha" operator="out"/>
                <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0"/>
                <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_13_91"/>
                <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_13_91" result="shape"/>
                </filter>
                <filter id="filter2_d_13_91" x="94.8196" y="36.8626" width="68.3195" height="78.1145" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
                <feFlood flood-opacity="0" result="BackgroundImageFix"/>
                <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
                <feOffset dy="4"/>
                <feGaussianBlur stdDeviation="2"/>
                <feComposite in2="hardAlpha" operator="out"/>
                <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0"/>
                <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_13_91"/>
                <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_13_91" result="shape"/>
                </filter>
                <filter id="filter3_d_13_91" x="97.9884" y="16.3328" width="44.9411" height="37.5385" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
                <feFlood flood-opacity="0" result="BackgroundImageFix"/>
                <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
                <feOffset dy="4"/>
                <feGaussianBlur stdDeviation="2"/>
                <feComposite in2="hardAlpha" operator="out"/>
                <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0"/>
                <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_13_91"/>
                <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_13_91" result="shape"/>
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
              {:else if  viaje.Acompaniantes === 4} 
              <svg width="{anchoValija(viaje.Monto)}" height="{altoValija(viaje.Monto)}" viewBox="0 0 189 294" fill="none" xmlns="http://www.w3.org/2000/svg">
                <image
                href="{iconosEstacion[viaje.Estacion]}"
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
                <g filter="url(#filter1_d_13_92)">
                <rect x="4" y="35" width="181" height="243" rx="25" fill="{colorContinente(viaje.Region)}" fill-opacity="0.30" shape-rendering="crispEdges"/>
                <rect x="9" y="40" width="171" height="233" rx="20" stroke="{colorContinente(viaje.Region)}" stroke-width="10" shape-rendering="crispEdges"/>
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
          {/if}
      </div>
    {/each}
  </div>

<!-- Paso 3: Formulario -->
<section class="formulario-section">
  <div class="formulario-container">
    <h4 class="formulario-title">Compartí tu próximo viaje!</h4>
    <p class="formulario-subtitle">
      Contanos sobre tu aventura asi la agregaremos a nuestra colección de historias
    </p>
<!-- Nombre -->
    <form on:submit|preventDefault={agregarViaje}>
      <div class="form-group">
        <label for="nombre" class="form-label">Nombre</label>
        <input type="text" id="nombre" bind:value={nuevoViaje.Nombre} placeholder="Tu nombre completo" class="form-input" required />
      </div>

<!-- País -->
      <div class="form-group">
        <label for="pais" class="form-label">País próximo a visitar</label>
        <select id="pais" bind:value={nuevoViaje.Pais} class="form-input" required>
          <option value="" disabled hidden>Seleccioná un país</option>
          {#each listaPaises as p}
            <option value={p}>{p}</option>
          {/each}
        </select>
      </div>

<!-- Mes -->
      <div class="form-group">
        <label for="mes" class="form-label">Mes del viaje (1-12)</label>
        <select id="mes" bind:value={nuevoViaje.Mes} class="form-input" required>
          <option value="" disabled hidden> Seleccioná el mes</option>
          {#each Array(12) as _, i}
            <option value={i + 1}>{i + 1}</option>
          {/each}
        </select>
      </div>

<!-- Entusiasmo -->
      <div class="form-group">
      <label for="entusiasmo" class="form-label">Nivel de entusiasmo</label>

      <div class="slider-container">
        <input
          type="range"
          id="entusiasmo"
          min="0"
          max="6"
          bind:value={nuevoViaje.Satisfaccion}
          class="slider"
        />
        <div class="slider-labels">
          {#each Array(7) as _, i}
            <span>{i}</span>
          {/each}
        </div>
      </div>
    </div>

<!-- Acompañantes -->
      <div class="form-group">
        <label for="acompaniante" class="form-label">Acompañantes</label>
        <select id="acompaniante" bind:value={nuevoViaje.Acompaniantes} class="form-input" required>
          <option value="" disabled hidden> Cantidad de compañeros del viaje</option>
          {#each Array(5) as _, i}
            <option value={i}>{i}</option>
          {/each}
        </select>
      </div>

<!-- Motivo de viaje -->
      <div class="form-group">
        <label for="motivo" class="form-label">Motivo del viaje</label>
        <select id="motivo" bind:value={nuevoViaje.Motivo} class="form-input" required>
          <option value="" disabled selected hidden>¿Por qué viajas?</option>
          <option value="Familia">Vacaciones familiares</option>
          <option value="Amigos">Vacaciones con amigo/s y/o amiga/s</option>
          <option value="Desconectar">Viaje para desconectar</option>
          <option value="Pareja">Viaje con pareja</option>
          <option value="Aventura">Viaje de aventura</option>
          <option value="Estudio">Viaje de estudio</option>
          <option value="Negocios">Viaje de negocios</option>
        </select>
      </div>

      <button type="submit" class="submit-button">¡Agregar mi viaje! ✈</button>
    </form>
  </div>
</section>

  <!-- Sección de Referencias -->
  <div class="section">
    <div class="references-container">
      <img src="/images/ReferenciasForms.svg" width="990" alt="explicacion"/>
    </div>
  </div>

<!-- Paso 4: Mostrar las nuevas valijas -->
  <div class="container">
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

</main>

<footer class="footer">
  <div class="footer-container">
    <p><strong>Integrantes:</strong> Mia Mitelman · Ananke Benites Astoul · Sofía Majlis</p>
    <div class="footer-links">
      <a href="https://github.com/sofimajlis/visualizacion-parte2.git" target="_blank">GitHub</a>
      <a href="visualizacion-parte2.vercel.app" target="_blank">Vercel</a>
    </div>
    <p><strong>Materia:</strong> Visualización de Datos · <strong>Carrera:</strong> Tecnología Digital · UTDT</p>
  </div>
</footer>

<style>
  @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;500;700&display=swap'); 

 h2 {
  font-size: 48px;
  font-family: 'Poppins', sans-serif;
  font-weight: 700;
  letter-spacing: -1px;
  text-align: center;
  margin-bottom: 20px;
}

h3 {
  font-size: 20px;
  font-family: 'Poppins', sans-serif;
  font-weight: 300;
  text-align: center;
  max-width: 800px;
  margin: 0 auto;
  margin-top: 20px;
  color: #333;
  line-height: 1.5;
}

  .header {
    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: column;
    margin-top: 80px;
    margin-bottom: 80px;
  }
  .headline {
      font-size: 40px;
      font-weight: 300;
      line-height: 1.2;
      text-align: center;
      margin: 20px;
      margin-top: 50px;
    }
  
  .valija {
    flex: 1 1 200px;    /* Ocupar al menos 200px, expandirse si hay lugar */
    max-width: 220px;   /* Para que no crezcan demasiado */
  }

  .container {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    align-items: flex-end;  
    gap: 40px;         /* Espacio horizontal y vertical entre valijas */
    max-width: 1200px; /* Ancho máximo de la grilla */
    margin: 0 auto;    /* Centra el contenedor dentro de la página */
    padding: 40px 20px;
  }

.footer {
  background-color: #111;
  color: #eee;
  text-align: center;
  padding: 2rem 1.5rem;
  margin-top: 4rem;

  width: 100vw;
  position: relative;
  left: 50%;
  transform: translateX(-50%);

  border-top: 2px solid #444;
  border-radius: 16px 16px 0 0;
}

.footer-container p {
  margin: 0.5rem 0;
  font-size: 0.95rem;
  line-height: 1.5;
}

.footer-links {
  margin: 1rem 0;
  display: flex;
  justify-content: center;
  gap: 2rem;
  flex-wrap: wrap;
}

.footer a {
  color: #ccc;
  font-weight: 600;
  text-decoration: none;
  transition: color 0.3s ease;
}

.footer a:hover {
  color: #fff;
}


  /* Secciones con títulos */
  .section {
    margin: 60px 0;
    position: relative;
    z-index: 1;
  }

  .section-title {
    font-size: 32px;
    font-weight: 600;
    text-align: center;
    margin-bottom: 30px;
    color: #333;
  }

  /* Referencias encuadradas */
  .references-container {
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 30px;
    background: rgba(255, 255, 255, 0.8);
    backdrop-filter: blur(10px);
    border: 1px solid rgba(255, 255, 255, 0.3);
    border-radius: 20px;
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
    max-width: 1200px;
    margin: 0 auto;
  }


  /* Contenedor de filtros centrado */
  .filtros-container {
    display: flex;
    justify-content: center;
    width: 100%;
  }

  /* Filtros alineados horizontalmente */
  .filtros {
    font-family: 'Poppins', sans-serif;
    display: flex;
    flex-direction: row;
    gap: 20px;
    align-items: center;
    justify-content: center;
    font-size: 18px;
    padding: 30px;
    backdrop-filter: blur(20px);
    background: rgba(255, 255, 255, 0.7);
    border: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: 24px;
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
    position: relative;
  }

  .filtro-item {
    display: flex;
    align-items: center;
    gap: 12px;
    background: rgba(255, 255, 255, 0.5);
    backdrop-filter: blur(10px);
    border: 1px solid rgba(255, 255, 255, 0.3);
    border-radius: 16px;
    padding: 16px;

    /* NUEVA sombra con más contraste */
    box-shadow: 0 8px 30px rgba(0, 0, 0, 0.25), 0 4px 12px rgba(0, 0, 0, 0.15);
  }


  .filtro-icon {
    padding: 8px;
    border-radius: 12px;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    color: white;
  }

  .region-icon {
    background: linear-gradient(135deg, #852EFF, #FF49D7);
  }

  .season-icon {
    background: linear-gradient(135deg, #36BCFF, #127E16);
  }

  .companions-icon {
    background: linear-gradient(135deg, #127E16, #FFC71D);
  }

  .filtro-item label {
    font-size: 16px;
    font-weight: 400;
    color: #333;
    white-space: nowrap;
  }

  .opciones {
    font-family: 'Poppins', sans-serif;
    font-weight: 300;
    font-size: 14px;
    padding: 8px 12px;
    /* border: 2px solid #606060; */
    opacity: 100px;
    background: transparent;
    border-radius: 12px;
    min-width: 140px;
    color: #333;
    outline: none;
    box-shadow: 0 0 2px 2px #606060;
    transition: all 0.3s ease;
  
    appearance: none;
    -webkit-appearance: none;
    -moz-appearance: none;
    padding-right: 30px;

}

  .opciones:hover {
    box-shadow: 0 0 0 3px #606060;/* más intenso al seleccionar */
}

.custom-select {
  position: relative;
  display: inline-block;
}

.custom-select::after {
  content: "▼";
  font-size: 12px;
  color: #666;
  position: absolute;
  right: 16px;
  top: 50%;
  transform: translateY(-50%);
  pointer-events: none;
}

/* nuevo!!! */
.formulario-section {
    margin: 80px 0;
    padding: 0 20px;
  }

  .formulario-container {
    max-width: 600px;
    margin: 0 auto;
    background: rgba(255, 255, 255, 0.95);
    backdrop-filter: blur(20px);
    border: 1px solid rgba(255, 255, 255, 0.3);
    border-radius: 24px;
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
    padding: 40px;
  }

  .formulario-title {
    font-family: 'Poppins', sans-serif;
    font-size: 32px;
    font-weight: 700;
    text-align: center;
    margin-bottom: 10px;
    background: linear-gradient(135deg, #852EFF, #FF49D7);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  .formulario-subtitle {
    font-family: 'Poppins', sans-serif;
    font-size: 16px;
    font-weight: 300;
    text-align: center;
    color: #666;
    margin-bottom: 30px;
    line-height: 1.5;
  }

  .form-group {
    margin-bottom: 24px;
  }

  .form-label {
    font-family: 'Poppins', sans-serif;
    font-size: 16px;
    font-weight: 500;
    color: #333;
    display: block;
    margin-bottom: 8px;
  }

  .form-input,
  .form-select {
    font-family: 'Poppins', sans-serif;
    width: 100%;
    padding: 12px 16px;
    font-size: 16px;
    border: 2px solid #e0e0e0;
    border-radius: 12px;
    background: rgba(255, 255, 255, 0.9);
    transition: all 0.3s ease;
    outline: none;
    box-sizing: border-box;
  }

  .form-input:focus,
  .form-select:focus {
    border-color: #852EFF;
    box-shadow: 0 0 0 3px rgba(133, 46, 255, 0.1);
    background: rgba(255, 255, 255, 1);
  }

  .form-input::placeholder {
    color: #999;
    font-weight: 300;
  }

  .form-input option[value=""] {
  color: #999 !important;
  font-weight: 300;
}


  .form-select {
    cursor: pointer;
    appearance: none;
    background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6,9 12,15 18,9'%3e%3c/polyline%3e%3c/svg%3e");
    background-repeat: no-repeat;
    background-position: right 12px center;
    background-size: 20px;
    padding-right: 40px;
  }

  .submit-button {
    font-family: 'Poppins', sans-serif;
    width: 100%;
    padding: 16px;
    font-size: 18px;
    font-weight: 600;
    color: white;
    background: linear-gradient(135deg, #852EFF, #FF49D7);
    border: none;
    border-radius: 12px;
    cursor: pointer;
    transition: all 0.3s ease;
    box-shadow: 0 8px 20px rgba(133, 46, 255, 0.3);
  }

  .submit-button:hover {
    transform: translateY(-2px);
    box-shadow: 0 12px 30px rgba(133, 46, 255, 0.4);
  }

  .submit-button:active {
    transform: translateY(0);
  }

  .slider-labels {
    /* display: flex;
    justify-content: space-between;
    padding: 0 8px;
    font-size: 14px;
    color: #444;
    font-weight: 500;
    margin-top: -12px; */

    position: absolute;
    top: 40px;
    left: 0;
    width: 100%;
    display: flex;
    justify-content: space-between;
    padding: 0px 10px;
    pointer-events: none;
    font-size: 14px;
    font-weight: 500;
    color: #333;
     margin-top: -12px;
  }

select:invalid,
select option[value=""] {
  color: #999;
  font-weight: 300;
}

#entusiasmo {
  margin-bottom: 8px;
}

input:focus,
select:focus {
  border-color: #e0e0e0 !important;
  box-shadow: none !important;
}

.slider-container {
  position: relative;
  width: 100%;
}

.slider {
  width: 100%;
  margin-bottom: 28px; /* espacio para los números abajo */
  appearance: none;
  height: 10px;
  border-radius: 5px;
  background: linear-gradient(to right, #007bff 0%, #ccc 0%);
  outline: none;
}

.slider::-webkit-slider-thumb {
  appearance: none;
  width: 20px;
  height: 20px;
  background: #007bff;
  border-radius: 50%;
  cursor: pointer;
}

.slider::-moz-range-thumb {
  width: 20px;
  height: 20px;
  background: #007bff;
  border: none;
  border-radius: 50%;
  cursor: pointer;
}

</style>
