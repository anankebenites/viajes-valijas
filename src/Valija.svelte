<script>
  export let viaje;
  import cero from "/images/cero_rueda.svg?raw";
  import una from "/images/una_rueda.svg?raw";
  import dos from "/images/dos_ruedas.svg?raw";
  import tres from "/images/tres_ruedas.svg?raw";
  import cuatro from "/images/cuatro_ruedas.svg?raw";

  import verano from "/images/sol2.svg";
  import invierno from "/images/nieve.svg";
  import otonio from "/images/hoja.svg";
  import primavera from "/images/flor.svg";

  const iconosEstacion = {
    Verano: verano,
    Invierno: invierno,
    Otoño: otonio,
    Primavera: primavera
  };

  const totalNiveles = 6;
  const yInicio = 86;
  const yFin = 226.99;

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

  function calcularYSatisfaccion(nivel) {
    return yFin - ((nivel / totalNiveles) * (yFin - yInicio));
  }

  function valijaSVG() {
    const iconos = [cero, una, dos, tres, cuatro];
    return iconos[viaje.Acompaniantes] || cero;
  }

  const ySatisfaccion = calcularYSatisfaccion(viaje.Satisfaccion);
  const color = colorContinente(viaje.Region);
  const ancho = anchoValija(viaje.Monto);
  const alto = altoValija(viaje.Monto);
</script>

<div class="valija" style="width:{ancho}px; height:{alto}px; position: relative;">
  {@html valijaSVG()}

  <!-- Línea de satisfacción -->
  <svg class="overlay" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; pointer-events: none;">
    <line
      x1="0" x2="100%"
      y1={ySatisfaccion} y2={ySatisfaccion}
      stroke="#F25444"
      stroke-width="3"
    />
  </svg>

  <!-- Texto con nombre de destino -->
  <div class="destino" style="position: absolute; bottom: 4px; width: 100%; text-align: center; font-weight: bold; font-size: 14px;">
    {viaje.Destino}
  </div>

  <!-- Icono de estación -->
  {#if iconosEstacion[viaje.Estacion]}
    <img
      src={iconosEstacion[viaje.Estacion]}
      alt={viaje.Estacion}
      style="position: absolute; top: 5px; right: 5px; width: 28px; height: 28px;"
    />
  {/if}
</div>

<style>
  .valija {
    display: inline-block;
    margin: 12px;
  }
  .overlay line {
    vector-effect: non-scaling-stroke;
  }
</style>
