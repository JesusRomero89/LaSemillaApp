import type { StoryData } from '../types/story';

// Nota de normalización, única diferencia con el guion recibido:
// en r_17c_compuerta la rama intermedia lleva "mora_vio_caja == false".
// El motor acumula todas las ramas que cumplen (hay nodos que suman
// varios detalles sueltos), y sin ese añadido las dos primeras ramas de
// la compuerta se solapaban y se habrían pintado las dos.

export const storyData: StoryData = {
  meta: {
    id: 'malaga_2049',
    titulo: 'La semilla',
    version: '0.1',
    idioma: 'es',
    ambientacion: 'Ciberpunk noir. Málaga, 2049.',
    notas:
      'Dos rutas sobre la misma noche. El jugador elige ruta al empezar. Los cuatro finales son comunes a ambas.',
    reloj: {
      modelo: 'La batería se descuenta por nodo, no por elección.',
      aplicacion:
        'Al entrar en un nodo: bateria -= nodo.minutos; si nodo.recarga, bateria += nodo.recarga. Después se aplican los efectos de la opción elegida.',
      inicio: 'Empieza a contar en r_03_laboratorio, cuando coge la caja.',
      diseño:
        'El recorrido obligatorio cuesta 180 minutos y la caja trae 170. Sin parar a recargar al menos una vez no se llega, y hay dos recorridos más que tampoco llegan.',
    },
    tokens: {
      '{nombre}': 'Nombre del replicante según la variable genero: Lomac o Astri.',
    },
    persistencia: {
      que_es: 'Marcas que sobreviven al final de una partida y se leen en la siguiente.',
      donde: 'Se guardan aparte de las variables normales. En la app, AsyncStorage.',
      para_que: 'Que jugar una ruta deje huella visible en la otra. Nunca cambian el final: solo el texto.',
    },
  },

  mundo: {
    ciudad:
      'Málaga, 2049. Tras la subida del mar, la ciudad creció hacia arriba. El antiguo puerto es un laberinto vertical de torres, mercados y pasarelas bajo lluvia constante.',
    corporacion: {
      nombre: 'Solaris Biotech',
      fachada: 'Fabricante de replicantes vendidos como mano de obra amable.',
      sede: 'Torre sobre el puerto.',
    },
    macguffin: {
      nombre: 'la semilla',
      que_es: 'Semilla biológica capaz de dar descendencia a los replicantes.',
      por_que_importa:
        'Un replicante que se reproduce deja de comprarse: se hereda. Fin del negocio.',
      restriccion_fisica: 'Necesita frío constante. Fuera de la caja térmica se degrada.',
    },
  },

  personajes: {
    replicante: {
      id: 'pj_replicante',
      nombre_m: 'Lomac',
      nombre_f: 'Astri',
      rol: 'Mantenimiento en un laboratorio de Solaris. Invisible por definición.',
      motivacion:
        'Descubrió qué hacía la semilla y que la corporación iba a incinerarla por aberrante. La robó para ponerla a salvo.',
    },
    mora: {
      id: 'pj_mora',
      nombre: 'Mora',
      rol: 'Blade runner veterano. Sin nombre de pila: todos le llaman Mora.',
      estado: 'Quemado. Le asignan avisos de poca monta como humillación administrativa.',
    },
    eida: {
      id: 'pj_eida',
      nombre: 'Eida Lunaris',
      rol: 'Directora científica de Solaris Biotech.',
      notas:
        'Villana clara en la ruta de Mora. Casi humana en la ruta del replicante. No mata por crueldad: firma decisiones.',
    },
    teo: {
      id: 'pj_teo',
      nombre: 'Teo',
      rol: 'Replicante de seguridad. Controla puertas y cámaras.',
      notas: 'Personaje funcional. No tiene arco propio: solo bifurca hacia un final u otro.',
    },
  },

  variables: {
    genero: { tipo: 'string', inicial: 'm', valores: ['m', 'f'] },
    bateria: {
      tipo: 'int',
      inicial: 170,
      unidad: 'minutos',
      nota: "Autonomía de la caja térmica. Cada nodo descuenta su campo 'minutos'. Las paradas suman 'recarga'. A 0 salta r_19_frio.",
    },
    teo_ayuda: { tipo: 'bool', inicial: false },
    teo_delata: { tipo: 'bool', inicial: false },
    sabe_verdad: { tipo: 'bool', inicial: false, nota: 'Sabe qué es realmente la semilla.' },
    vio_restos: { tipo: 'bool', inicial: false, nota: 'Vio los restos del intento anterior en los túneles.' },
    mora_declaro: { tipo: 'bool', inicial: false },
    mora_sabe_precedente: { tipo: 'bool', inicial: false },
    confianza: { tipo: 'int', inicial: 0, rango: [-3, 5], nota: 'Vínculo entre Mora y el replicante.' },
    ayudo_escape: { tipo: 'bool', inicial: false, nota: 'Mora ayudó activamente en el puente.' },
    rastro: { tipo: 'bool', inicial: false, nota: 'Su código de agente quedó registrado.' },
    sabe_rastreo_caja: { tipo: 'bool', inicial: false, nota: 'Sabe que rastrean la caja, no al replicante.' },
    mora_sospecha: { tipo: 'int', inicial: 0 },
    ruta: { tipo: 'string', inicial: '', valores: ['mora', 'replicante'] },
    mora_vio_caja: { tipo: 'bool', inicial: false },
    sabe_cierre_pasarela: { tipo: 'bool', inicial: false },
    sobrio: { tipo: 'bool', inicial: true, nota: 'Si bebe en el bar, se desactiva y abre las ramas de riesgo.' },
    identificado: { tipo: 'bool', inicial: false, nota: 'Un control le ha leído la placa del cuello.' },
    eida_llamadas: { tipo: 'int', inicial: 0, nota: 'Sube en cada llamada. La tercera es m_10_eida.' },
    decidido: { tipo: 'bool', inicial: false, nota: 'Ha abierto la caja y ha mirado lo que lleva.' },
  },

  inicio: 'n_prologo',

  nodos: {
    n_prologo: {
      texto:
        'Llueve sobre el puerto desde hace once días. En algún punto de la vertical de esta ciudad, esta noche, alguien va a decidir qué cosas merecen existir.',
      opciones: [
        { texto: 'Jugar como el replicante', destino: 'n_genero' },
        { texto: 'Jugar como el agente Mora', destino: 'm_01_aviso' },
      ],
    },

    n_genero: {
      texto: 'Solaris numera antes de nombrar. El nombre vino después, en una etiqueta cosida al mono de trabajo.',
      opciones: [
        { texto: 'Lomac', efectos: { genero: 'm' }, destino: 'r_01_pasillo' },
        { texto: 'Astri', efectos: { genero: 'f' }, destino: 'r_01_pasillo' },
      ],
    },

    r_01_pasillo: {
      ruta: 'replicante',
      hora: '03:00',
      texto:
        'Tres de la madrugada. La fregona deja una curva húmeda en el suelo del pasillo B. En la sala de control nadie ha apagado la pantalla, y en la pantalla hay una orden de incineración con fecha de esta misma mañana. Debajo, el código de la semilla. Llevas seis meses limpiando alrededor de ella sin saber qué era. Ahora lo sabes, y le quedan cinco horas. En la etiqueta cosida a tu mono pone {nombre}.',
      opciones: [
        { texto: 'Cogerla ahora, tú solo', destino: 'r_02a_robo_solo' },
        { texto: 'Buscar a Teo, el de seguridad', destino: 'r_02b_teo' },
        { texto: 'Volver a tu turno y no haber visto nada', destino: 'r_02c_turno' },
      ],
    },

    r_02c_turno: {
      ruta: 'replicante',
      hora: '04:40',
      texto:
        'Terminas el pasillo B. Empiezas el C. La fregona hace el mismo ruido de siempre y el reloj de la pared no perdona. A las cuatro y cuarenta sueltas el palo en mitad del pasillo y echas a andar hacia el laboratorio. Has perdido casi dos horas. La caja que coges lleva ya un rato encendida en el estante.',
      efectos: { bateria: -40 },
      opciones: [{ texto: 'Ir directo al laboratorio', destino: 'r_03_laboratorio' }],
    },

    r_02b_teo: {
      ruta: 'replicante',
      hora: '03:20',
      texto:
        'Teo vigila las puertas del ala norte desde una garita con dos monitores y un termo. No sois amigos: sois dos turnos de noche que coinciden. Le cuentas lo justo. Te mira mucho rato antes de contestar.',
      opciones: [
        { texto: 'Pedirle que te abra y te borre de las cámaras', efectos: { teo_ayuda: true }, destino: 'r_02b_teo_acepta' },
        { texto: 'Arrepentirte a mitad de frase y marcharte', destino: 'r_03_laboratorio' },
      ],
    },

    r_02b_teo_acepta: {
      ruta: 'replicante',
      hora: '03:30',
      texto:
        'Teo apaga un monitor con el pulgar, como quien apaga una luz de su casa. «Diez minutos de cámaras. Ni uno más. Y no me has hablado nunca.» No te desea suerte.',
      opciones: [{ texto: 'Bajar al laboratorio', destino: 'r_03_laboratorio' }],
    },

    r_02a_robo_solo: {
      ruta: 'replicante',
      hora: '03:10',
      texto: 'No avisas a nadie. Es más limpio así: nadie puede contar lo que no sabe.',
      opciones: [{ texto: 'Bajar al laboratorio', destino: 'r_03_laboratorio' }],
    },

    r_03_laboratorio: {
      ruta: 'replicante',
      hora: 'variable',
      texto:
        'El laboratorio está a cuatro grados y huele a metal limpio. La semilla no impresiona: es más pequeña que un puño y está suspendida en un gel pálido. Junto a la cámara hay cajas térmicas de transporte. Coges una. La batería marca seis horas.',
      opciones: [{ texto: 'Salir por el muelle de carga', destino: 'r_04_muelle' }],
      minutos: 10,
    },

    r_04_muelle: {
      ruta: 'replicante',
      hora: '05:00',
      texto: 'El muelle huele a sal y a gasoil. Empujas la puerta con el hombro y la lluvia te recibe como si te estuviera esperando.',
      ramas: [
        {
          condicion: 'teo_ayuda == true',
          texto: 'No suena nada. Ni sirena, ni voz, ni luz. Tienes diez minutos que no existen y los gastas corriendo.',
          efectos: { bateria: -10 },
        },
        {
          condicion: 'teo_ayuda == false',
          texto: 'La alarma se enciende antes de que llegues a la esquina. Media ciudad sabe ya que algo ha salido de Solaris esta noche.',
          efectos: { bateria: -30 },
        },
      ],
      opciones: [{ texto: 'Meterte en la ciudad', destino: 'r_10_callejon' }],
      minutos: 20,
    },

    r_hub: {
      ruta: 'replicante',
      tipo: 'hub',
      texto:
        'El hombre de la gabardina se ha quedado atrás y la ciudad empieza a moverse. La caja pesa y avisa: cada media hora suelta un pitido corto que recuerda que el frío se acaba. Necesitas corriente, o necesitas frío, y los dos están en sitios malos.',
      reglas: {
        max_visitas: 2,
        destino_salida: 'r_18_control',
        salida_forzada_si: 'bateria <= 60',
        bateria_agotada: { si: 'bateria <= 0', destino: 'r_19_frio' },
      },
      opciones: [
        { texto: 'El mercado del puerto', destino: 'r_05_mercado', visitable_una_vez: true },
        { texto: 'La clínica clandestina del subsuelo', destino: 'r_06_clinica', visitable_una_vez: true },
        { texto: 'Los túneles de refrigeración', destino: 'r_07_tuneles', visitable_una_vez: true },
        { texto: 'No parar en ningún sitio. Seguir andando con lo que te queda.', destino: 'r_18_control' },
      ],
      minutos: 20,
    },

    r_05_mercado: {
      ruta: 'replicante',
      titulo: 'El mercado del puerto',
      texto:
        'Doscientos puestos bajo una lona y una cámara cada seis metros. Aquí hay corriente en cada mostrador y ojos en cada pasillo. Enchufas la caja detrás de un puesto de pescado mientras el hombre hace como que no te ve. Por la radio de un tenderete oyes el aviso: Solaris paga por una caja térmica. No dicen qué lleva dentro. Eso es lo que más miedo da.',
      opciones: [
        { texto: 'Salir antes de que alguien sume dos y dos', destino: 'r_hub' },
        { texto: 'Preguntar quién paga y cuánto', destino: 'r_05b_precio' },
      ],
      minutos: 40,
      recarga: 75,
    },

    r_05b_precio: {
      ruta: 'replicante',
      texto:
        'El del puesto te contesta sin mirarte: lo suficiente para que cualquiera de los que están aquí te venda antes del amanecer. Y añade que ya han preguntado por ti dos veces esta noche.',
      ramas: [
        {
          condicion: 'teo_ayuda == true',
          efectos: { teo_delata: true },
          texto: 'Y una de las dos veces fue alguien de seguridad de la propia planta.',
        },
      ],
      opciones: [{ texto: 'Irse rápido', destino: 'r_hub' }],
      minutos: 10,
    },

    r_06_clinica: {
      ruta: 'replicante',
      titulo: 'La clínica del subsuelo',
      texto:
        'Dos plantas bajo el nivel de la calle, detrás de una puerta de chapa, hay un sitio donde a los replicantes les arreglan lo que Solaris no arregla. Una mujer con guantes sucios mira la caja, luego te mira a ti, y por primera vez en toda la noche alguien se sienta a explicarte lo que llevas encima: no es una muestra, no es un prototipo. Es descendencia. Es que los tuyos dejen de fabricarse.',
      efectos: { sabe_verdad: true },
      opciones: [
        { texto: 'Aceptar lo que te piden a cambio', destino: 'r_06b_precio_clinica' },
        { texto: 'Negarte y salir con lo puesto', destino: 'r_hub' },
      ],
      minutos: 45,
      recarga: 85,
    },

    r_06b_precio_clinica: {
      ruta: 'replicante',
      texto:
        'Te piden una hora de tu tiempo y un poco de tu sangre: dicen que quieren tener registro de alguien que ha estado tan cerca de aquello. Te tumbas. Cargan la caja hasta arriba mientras tanto. Cuando sales, la lluvia ha bajado de intensidad y eso te parece mala señal.',
      opciones: [{ texto: 'Volver a la calle', destino: 'r_hub' }],
      minutos: 35,
      recarga: 80,
    },

    r_07_tuneles: {
      ruta: 'replicante',
      titulo: 'Los túneles de refrigeración',
      texto:
        'Bajo la ciudad corre el frío que mantiene los servidores y los mercados. Aquí la caja no gasta nada: el aire hace el trabajo. También es un sitio sin segunda salida. A cuarenta metros, junto a un conducto, hay un mono de trabajo idéntico al tuyo, vacío, y una caja térmica abierta con la batería agotada hace mucho tiempo. Alguien intentó esto antes que tú. Nadie lo contó nunca.',
      efectos: { vio_restos: true },
      opciones: [
        { texto: 'Quedarte todo lo que puedas', destino: 'r_07b_riesgo' },
        { texto: 'Salir ya, antes de que cierren la boca del túnel', destino: 'r_hub' },
      ],
      minutos: 35,
      recarga: 95,
    },

    r_07b_riesgo: {
      ruta: 'replicante',
      texto: 'Oyes voces arriba, en la rejilla. No bajan. Todavía. Sales por un conducto lateral con la ropa empapada y la caja llena.',
      opciones: [{ texto: 'Subir a la calle', destino: 'r_hub' }],
      minutos: 30,
      recarga: 55,
    },

    r_10_callejon: {
      ruta: 'replicante',
      hora: '05:10',
      titulo: 'El callejón',
      texto:
        'Contenedores, vapor, una escalera de incendios goteando. Llevas dos horas sin parar y la caja pita cada media hora. Te encoges contra la pared mojada. Entonces oyes pasos: unos zapatos malos, de alguien que no quiere estar aquí. Un hombre con gabardina entra en el callejón y te ve. Tarda un segundo de más en llevarse la mano al arma, y en ese segundo entiendes que te ha visto a ti antes que a lo que eres.',
      opciones: [
        { texto: 'Hablarle', efectos: { confianza: 1 }, destino: 'r_11_hablar' },
        { texto: 'Correr', destino: 'r_12_correr' },
        { texto: 'Enseñarle lo que llevas en la caja', efectos: { confianza: 2, mora_vio_caja: true }, destino: 'r_13_mostrar' },
      ],
      minutos: 15,
    },

    r_11_hablar: {
      ruta: 'replicante',
      texto:
        'Le dices que no has matado a nadie. Él contesta que eso no es lo que le han mandado averiguar. Pero no dispara, y no llama por radio, y los dos os quedáis ahí mirándoos mientras la caja pita.',
      opciones: [
        { texto: 'Contarle lo de la orden de incineración', efectos: { confianza: 1 }, destino: 'r_14b_marquesina' },
        { texto: 'Aprovechar y echar a correr', efectos: { confianza: -1 }, destino: 'r_12_correr' },
      ],
      minutos: 10,
    },

    r_12_correr: {
      ruta: 'replicante',
      efectos: { confianza: -1 },
      texto: 'Corres. Él no dispara, pero tampoco se queda quieto. Sales del callejón hacia el paseo y la ciudad empieza a despertarse a tu alrededor, que es lo peor que podía pasar.',
      opciones: [{ texto: 'Perderte en el puerto', destino: 'r_14b_marquesina' }],
      minutos: 15,
    },

    r_13_mostrar: {
      ruta: 'replicante',
      texto:
        'Abres la caja lo justo. El vaho sale y se queda un momento entre los dos. No sabes explicarle del todo qué es, solo que lo queman esta mañana. Ves cómo un hombre que lleva media vida cerrando expedientes se queda sin saber en qué casilla poner esto.',
      opciones: [{ texto: 'Irte mientras él sigue mirando la caja', efectos: { confianza: 1 }, destino: 'r_14b_marquesina' }],
      minutos: 10,
    },

    r_14b_marquesina: {
      ruta: 'replicante',
      hora: '05:25',
      titulo: 'Una marquesina',
      minutos: 10,
      texto:
        'Cuatro calles más allá hay una marquesina rota con un banco debajo y ningún autobús que venga a esta hora. Te sientas porque las piernas te lo piden, y por primera vez desde las tres de la madrugada no hay nadie delante de ti: ni Teo, ni el hombre de la gabardina, ni una pantalla. Solo la caja en las rodillas, pitando cada media hora como si tuviera prisa por ti.\n\nLlevas seis meses fregando el suelo de alrededor de esto y nunca lo has mirado de cerca.',
      opciones: [
        { texto: 'Abrir la caja y mirar lo que llevas', efectos: { decidido: true }, destino: 'r_14c_mirar' },
        { texto: 'No abrirla. Levantarte y seguir.', efectos: { bateria: 10 }, destino: 'r_hub' },
      ],
    },

    r_14c_mirar: {
      ruta: 'replicante',
      minutos: 15,
      texto:
        'Sale el vaho y tarda en irse. Dentro no hay nada que impresione: algo pequeño, pálido, suspendido en un gel que se mueve muy despacio cuando inclinas la caja. No sabes ponerle nombre a lo que es. Lo que sí sabes, mirándolo bajo una marquesina rota a las cinco y media de la mañana, es que ninguno de los tuyos ha tenido nunca nada que venga de otro de los tuyos, y que eso es exactamente lo que van a quemar a las nueve.\n\nCierras la caja. A partir de aquí ya no es que la lleves: es que la llevas a algún sitio.',
      opciones: [{ texto: 'Levantarte', destino: 'r_hub' }],
    },

    r_18_control: {
      ruta: 'replicante',
      hora: '06:20',
      titulo: 'Control de identidad',
      texto:
        'En la boca del mercado han montado un control: dos agentes, un lector de nuca y una cola de treinta personas esperando bajo la lluvia. Todos los que están en esa cola son de los tuyos. Es a lo que llaman verificación rutinaria y siempre es rutinaria a las seis de la mañana, nunca a las seis de la tarde.',
      opciones: [
        { texto: 'Ponerte en la cola como si nada', efectos: { identificado: true }, destino: 'r_18a_cola' },
        { texto: 'Meterte por el canal de desagüe', destino: 'r_18b_canal' },
        { texto: 'Dar media vuelta y rodear por el paseo', efectos: { bateria: -30 }, destino: 'r_15_teo' },
      ],
      minutos: 20,
    },

    r_18a_cola: {
      ruta: 'replicante',
      texto:
        'Funciona, que es lo peor. El agente te pasa el lector por la nuca, mira la pantalla, ve mantenimiento nocturno de Solaris y te devuelve la caja sin abrirla porque lleva el anagrama de la empresa impreso en la tapa. Pasas. Y a los veinte metros entiendes que tu número acaba de quedar registrado a las seis y veintidós en la boca del mercado.',
      opciones: [{ texto: 'Seguir andando deprisa', destino: 'r_15_teo' }],
      minutos: 15,
    },

    r_18b_canal: {
      ruta: 'replicante',
      texto:
        'El canal de desagüe baja del mercado al agua y tiene el ancho de un hombre agachado. Hueles todo lo que la ciudad no quiere y sales por una rejilla al otro lado con la caja por encima de la cabeza, como quien cruza un río con un niño.',
      opciones: [{ texto: 'Subir al mirador', destino: 'r_15_teo' }],
      minutos: 10,
    },

    r_19_frio: {
      ruta: 'replicante',
      titulo: 'Cuando el piloto se pone rojo',
      texto:
        'El piloto de la caja pasa de ámbar a rojo y el pitido deja de ser cada media hora para ser continuo. No hay drama, no hay aviso, no hay nadie persiguiéndote en este momento concreto: simplemente el gel empieza a cambiar de color en tus manos, en mitad de una calle cualquiera, mientras amanece.\n\nTe sientas en el bordillo con la caja abierta en las rodillas y te quedas ahí hasta que la recogen. No te resistes. Nunca hubo una pelea: había seis horas de batería y una ciudad demasiado grande.',
      resolucion: 'final:f_semilla_fria',
    },

    r_15_teo: {
      ruta: 'replicante',
      hora: '06:40',
      titulo: 'Teo',
      texto: 'Un mirador sobre el puerto, con la ciudad alta encendiéndose al otro lado del agua.',
      ramas: [
        {
          condicion: 'teo_delata == true',
          texto:
            'Teo está esperándote y te llama {nombre} antes que nada, que es lo que hace la gente cuando va a pedirte que no te enfades y no se molesta en disimularlo. Dice que le preguntaron y que contestó, y que lleva nueve años conservando ese puesto a base de contestar. No se disculpa. Te dice que te queda poco y que él no puede hacer nada más.',
        },
        {
          condicion: 'teo_ayuda == true && teo_delata == false',
          texto:
            'Teo te localiza por la radio de servicio, con la voz baja de quien habla desde una garita. No pregunta cómo estás. Te dice que van a cerrar la pasarela del puerto a las siete y que después de esa hora no hay manera de subir a la ciudad alta.',
          efectos: { sabe_cierre_pasarela: true },
        },
        {
          condicion: 'teo_ayuda == false',
          texto:
            'En una pantalla del mirador, entre anuncios, sale un plano de la planta: dos unidades sacando a un replicante de seguridad por el ala norte. Es Teo. No te ayudó, no te delató, no hizo nada, y aun así se lo llevan. Así funciona esto.',
          efectos: { 'persistente.teo_detenido': true },
        },
      ],
      opciones: [{ texto: 'Seguir hacia la pasarela', destino: 'r_16_eida' }],
      minutos: 15,
    },

    r_16_eida: {
      ruta: 'replicante',
      hora: '06:55',
      titulo: 'La llamada',
      texto:
        'La caja tiene un terminal de servicio que nunca has usado. Se enciende solo. Al otro lado hay una mujer que dice llamarse Eida Lunaris y que no te habla como se le habla a un producto: te llama {nombre}, que es el nombre de la etiqueta de tu mono, y espera a que contestes. Te explica que lo que llevas ahí no es un robo, es un problema, y que ella lleva once años administrando problemas que no eligió.',
      opciones: [
        { texto: 'Escucharla hasta el final', destino: 'r_16b_oferta' },
        { texto: 'Preguntarle qué le pasó al del túnel', condicion: 'vio_restos == true', destino: 'r_16c_anterior' },
        { texto: 'Apagar el terminal', destino: 'r_17_pasarela' },
      ],
      minutos: 10,
    },

    r_16b_oferta: {
      ruta: 'replicante',
      texto:
        'La oferta es buena y por eso da miedo. Devuelves la caja, ella cierra el incidente, y tú amaneces mañana en otro turno, en otra planta, sin expediente y sin memoria de esta noche. Lo dice sin amenazar ni una vez. Y justo antes de colgar añade que ella tampoco firmó la orden con gusto, y no sabes si eso es verdad o es la parte mejor ensayada.',
      opciones: [
        { texto: 'Decirle que no, y decírselo entero', condicion: 'decidido == true', efectos: { confianza: 1 }, destino: 'r_16d_negativa' },
        { texto: 'Colgar', destino: 'r_17_pasarela' },
      ],
      minutos: 10,
    },

    r_16c_anterior: {
      ruta: 'replicante',
      texto:
        'Se queda callada más tiempo del que necesita una mentira. Luego dice que aquello se gestionó mal y que por eso esta vez ha querido hablar contigo antes. No dice qué pasó, ni cómo se llamaba, ni si alguien preguntó por él. Dice «se gestionó».',
      efectos: { sabe_verdad: true },
      opciones: [{ texto: 'Colgar', destino: 'r_17_pasarela' }],
      minutos: 10,
    },

    r_16d_negativa: {
      ruta: 'replicante',
      minutos: 5,
      texto:
        'Le dices que la has abierto y que la has visto. Que sabes lo que es aunque no sepas cómo se llama. Y que no vas a devolverla, no por heroísmo, sino porque ya no se puede devolver algo que has mirado.\n\nEida Lunaris tarda en contestar y cuando contesta ha cambiado de voz: ya no es amable. Dice que entonces lo siente mucho, y lo dice como quien archiva una carpeta.',
      opciones: [{ texto: 'Colgar', destino: 'r_17_pasarela' }],
    },

    r_17_pasarela: {
      ruta: 'replicante',
      hora: '07:10',
      titulo: 'El pasillo de servicio',
      texto:
        'La pasarela que sube a la ciudad alta tiene por debajo un pasillo de servicio de metro y medio de ancho. Arriba, a través de la rejilla, se ven botas y una mesa plegable: un control de Solaris. Y en algún sitio hay un escáner, porque cada treinta segundos, cuando la caja pita, las botas de arriba se quedan quietas un momento.\n\nAl fondo del pasillo hay una compuerta de servicio cerrada. Detrás de ti, dos unidades bajando la escalera sin ninguna prisa.',
      ramas: [
        { condicion: 'sabe_cierre_pasarela == true', texto: 'Y son las siete y diez. La pasarela se cierra en nada.' },
        {
          condicion: 'identificado == true',
          texto:
            'Y no buscan una caja: buscan una cara. Uno de los de arriba lleva un terminal con tu número de servicio y tu ficha abierta desde las seis y veintidós, cortesía del control del mercado. En cuanto bajen, no van a tener que comprobar nada.',
          efectos: { bateria: -20 },
        },
      ],
      opciones: [
        { texto: 'Apagar la caja para que deje de pitar', efectos: { bateria: -60 }, destino: 'r_17a_apagar' },
        { texto: 'Meterte en el hueco de los conductos y esperar', condicion: 'identificado == false', destino: 'r_17b_esconderse' },
        {
          texto: 'Meterte en el hueco de los conductos, aunque sepan tu cara',
          condicion: 'identificado == true',
          efectos: { bateria: -40 },
          destino: 'r_17d_encontrado',
        },
        { texto: 'Ir a la compuerta del fondo', destino: 'r_17c_compuerta' },
      ],
      reglas: { bateria_agotada: { si: 'bateria <= 0', destino: 'r_19_frio' } },
      minutos: 20,
    },

    r_17a_apagar: {
      ruta: 'replicante',
      texto:
        'El interruptor está bajo una pestaña de plástico que hay que romper con la uña. El pitido para. El frío también. Cuentas los segundos con la caja contra el pecho mientras las botas de arriba se mueven hacia el otro extremo, y no vuelves a encenderla hasta que no oyes nada, y para entonces el gel ha perdido el color pálido y tiene un tono que no te gusta.',
      opciones: [{ texto: 'Seguir hacia la compuerta', destino: 'r_17c_compuerta' }],
      minutos: 15,
    },

    r_17b_esconderse: {
      ruta: 'replicante',
      texto:
        'El hueco entre dos conductos tiene el ancho justo de alguien que ha dejado de importarle lo que es cómodo. Las unidades pasan a metro y medio. Uno de ellos se para exactamente donde estás y se queda ahí treinta segundos, los treinta más largos de la noche, hasta que la caja pita y él mira hacia el otro lado, porque el aparato le dice que el objetivo está dos niveles más abajo.',
      opciones: [{ texto: 'Salir hacia la compuerta', destino: 'r_17c_compuerta' }],
      minutos: 20,
    },

    r_17d_encontrado: {
      ruta: 'replicante',
      minutos: 15,
      texto:
        'El hueco entre conductos tiene el ancho justo. Las unidades pasan a metro y medio. Y una de ellas se para, mira el terminal, mira el hueco, y vuelve sobre sus pasos, porque no está buscando un pitido: está buscando a alguien de quien tiene la cara desde hace una hora. Sales corriendo por donde has venido con la caja golpeándote la pierna en cada zancada.',
      opciones: [{ texto: 'Hacia la compuerta, sin esconderte ya', efectos: { bateria: -20 }, destino: 'r_17c_compuerta' }],
    },

    r_17c_compuerta: {
      ruta: 'replicante',
      titulo: 'La compuerta',
      texto: 'Metal ciego, sin manilla por dentro, con un lector de código al otro lado. No es una puerta que se abra desde aquí.',
      ramas: [
        {
          condicion: 'confianza >= 2 && mora_vio_caja == true',
          texto:
            'Y se abre. Al otro lado, de espaldas, hay un hombre con una gabardina mojada y la mano todavía en el teclado. No se gira cuando pasas. Pero baja la vista a la caja un segundo, y en ese segundo sabes que se acuerda perfectamente de lo que le enseñaste a las cinco de la mañana en un callejón, y que lleva desde entonces sin poder pensar en otra cosa.',
          efectos: { confianza: 1 },
        },
        {
          condicion: 'confianza >= 2 && mora_vio_caja == false',
          texto:
            'Y se abre. Chirrido, golpe de aire frío, luz gris. Al otro lado, de espaldas, hay un hombre con una gabardina mojada que no se gira ni cuando pasas por su lado. Tiene la mano todavía en el teclado. Tarda en soltarla, como si le costara asumir que su número se ha quedado ahí grabado.',
          efectos: { confianza: 1 },
        },
        {
          condicion: 'confianza < 2',
          texto:
            'Y no se abre. La golpeas dos veces con la palma abierta, sin fuerza, más por decirte que lo has intentado. Al final das media vuelta y subes por donde no debes, a la vista de todos, porque ya no queda otra.',
          efectos: { bateria: -40 },
        },
      ],
      opciones: [{ texto: 'Salir a la ciudad alta', destino: 'r_14_cruce' }],
      minutos: 10,
    },

    r_20_apagado: {
      ruta: 'replicante',
      texto:
        'No es una ejecución, es una retirada de material. Te lo dicen así, con esas palabras, mientras uno de ellos te sujeta la muñeca y busca el punto de la nuca. Lo último que ves es a la mujer del coche, que no se ha acercado, firmando algo en una tablet bajo un paraguas que le sostiene otro. Y lo último que piensas es que la caja sigue pitando en el suelo y que a nadie le ha parecido urgente recogerla.',
      resolucion: 'final:f_retirada',
    },

    r_14_cruce: {
      ruta: 'replicante',
      tipo: 'convergencia',
      hora: '07:40',
      texto: 'Amanece mal, con esa luz gris que no llega a ser día. Un coche de Solaris entra por el fondo de la calle sin prisa ninguna, porque la gente con poder no tiene prisa. Eida Lunaris baja sin paraguas.',
      resolucion: 'evaluar_finales',
      ramas: [
        {
          condicion: 'persistente.mora_cayo == true',
          texto:
            'Al salir a la ciudad alta hay un cordón en el acceso del mercado y cuatro personas mirando hacia abajo, hacia las lonas. Bajo una de ellas hay un bulto tapado con una manta térmica que brilla más de lo que debería con esta luz. Nadie te mira a ti: todo el mundo mira eso. No sabes quién es ni vas a saberlo nunca, y aun así aflojas el paso.',
        },
        {
          condicion: 'identificado == true && confianza < 2',
          texto: 'Y no hace falta que nadie te señale: tu número lleva una hora en sus terminales.',
          destino: 'r_20_apagado',
        },
      ],
    },

    m_01_aviso: {
      ruta: 'mora',
      hora: '04:50',
      titulo: 'Planta 42',
      texto:
        'Una denuncia por ruidos. Cuarenta y dos plantas de torre residencial en lo que fue el Perchel, y a ti, con veintidós años de servicio, te mandan a apagar un zumbido. Eso también es un mensaje. La vecina lleva tres noches sin dormir y te lo cuenta en el rellano, a gritos. Dentro del piso no contesta nadie: solo se oye un zumbido eléctrico, constante, de equipo grande.',
      opciones: [
        { texto: 'Forzar la puerta', destino: 'm_02a_puerta' },
        { texto: 'Hablar con la vecina', destino: 'm_02b_vecina' },
        { texto: 'Bajar por la escalera de incendios: algo se ha movido', destino: 'm_02c_escalera' },
      ],
      ramas: [
        {
          condicion: 'persistente.semilla_sembrada == true',
          texto:
            'En la radio del coche, de camino, dan la noticia de las cinco: Solaris Biotech ha emitido un comunicado negando que se haya sustraído nada de sus instalaciones. Nadie había preguntado.',
        },
      ],
    },

    m_02a_puerta: {
      ruta: 'mora',
      texto:
        'La puerta cede a la tercera. El piso está vacío de muebles y lleno de equipo: una estación de carga de replicantes, de las industriales, conectada al contador del edificio. Alguien ha estado alojando aquí a alguien que no duerme. Y se ha ido con prisa: el gel de la placa todavía está tibio.',
      efectos: { mora_sospecha: 1 },
      opciones: [{ texto: 'Bajar al callejón', destino: 'm_03_callejon' }],
    },

    m_02b_vecina: {
      ruta: 'mora',
      texto:
        'La vecina habla mucho y dice una sola cosa útil: el inquilino nunca salía de día. Nunca. Entraba de noche, salía de noche, y bajaba siempre por la escalera de incendios en vez de por el ascensor.',
      efectos: { mora_sospecha: 1 },
      opciones: [{ texto: 'Bajar al callejón', destino: 'm_03_callejon' }],
    },

    m_02c_escalera: {
      ruta: 'mora',
      texto:
        'Bajas los cuarenta y dos pisos por fuera, con la lluvia dándote en la cara, porque algo se ha movido ahí abajo y porque así tardas más en volver a la comisaría. Las dos razones te valen.',
      opciones: [{ texto: 'Llegar al callejón', destino: 'm_03_callejon' }],
    },

    m_03_callejon: {
      ruta: 'mora',
      titulo: 'El callejón',
      texto:
        'Contenedores y vapor. Contra la pared hay una figura encogida, empapada, apretando una caja contra el pecho. Es un replicante. Lo sabes por la placa del cuello, lo sabes a los dos segundos. Pero durante el primero solo ves a alguien muerto de miedo, y ese primer segundo te va a durar toda la noche.',
      opciones: [
        { texto: 'Desenfundar', efectos: { confianza: -2 }, destino: 'm_04a_arma' },
        { texto: 'Hablarle', efectos: { confianza: 1 }, destino: 'm_04b_hablar' },
        { texto: 'Dar media vuelta y no haber visto nada', efectos: { confianza: 2 }, destino: 'm_04c_dejar' },
      ],
    },

    m_04a_arma: {
      ruta: 'mora',
      texto:
        'El arma sale sola, como veintidós años de costumbre. Y la cosa no se mueve. No suplica, no corre: sujeta la caja como quien sujeta a alguien. Tú has disparado antes a alguien que no debías. Eso también pesa como veintidós años.',
      opciones: [
        { texto: 'Bajar el arma', efectos: { confianza: 1 }, destino: 'm_03b_bar' },
        { texto: 'Ordenarle que suelte la caja', destino: 'm_03b_bar' },
      ],
    },

    m_04b_hablar: {
      ruta: 'mora',
      texto:
        'Le preguntas qué lleva ahí. Te contesta que algo que van a quemar esta mañana. No es la respuesta que esperabas y no encaja en ningún formulario que tú sepas rellenar.',
      opciones: [
        { texto: 'Dejarle marchar y seguirle de lejos', destino: 'm_03b_bar' },
        { texto: 'Detenerle', efectos: { confianza: -1 }, destino: 'm_03b_bar' },
      ],
    },

    m_04c_dejar: {
      ruta: 'mora',
      texto:
        'Te das la vuelta. Das seis pasos. En el séptimo te paras, porque sabes perfectamente que mañana alguien te preguntará dónde estabas a esta hora y tú tendrás que decidir qué contestar.',
      opciones: [{ texto: 'Seguir adelante igualmente', destino: 'm_03b_bar' }],
    },

    m_03b_bar: {
      ruta: 'mora',
      hora: '05:20',
      titulo: 'El Cristal',
      texto:
        'De vuelta al coche pasas por delante del Cristal, que a esta hora no abre para nadie salvo para los que salen de turno. Llevas cuatro meses y medio sin entrar. Los has contado, que es la manera fina de decir que no llevas cuatro meses y medio sin pensar en entrar.',
      opciones: [
        { texto: 'Pasar de largo', efectos: { confianza: 1 }, destino: 'm_05_parte' },
        { texto: 'Una sola, de pie, en la barra', efectos: { sobrio: false }, destino: 'm_03c_recuerdo' },
      ],
    },

    m_03c_recuerdo: {
      ruta: 'mora',
      texto:
        'El camarero te la pone sin preguntar y ese es el problema de los sitios donde te conocen. A la mitad del vaso te vuelve lo de siempre: un portal, una linterna, una figura que se movió cuando no debía. Aquello lo cerró el departamento en catorce días y desde entonces hay un expediente con tu número que nadie ha vuelto a abrir. Te lo taparon. Eso es lo que peor llevas: que te lo taparon y que lo aceptaste.',
      opciones: [{ texto: 'Volver al coche', destino: 'm_05_parte' }],
    },

    m_05_parte: {
      ruta: 'mora',
      tipo: 'decision_clave',
      texto: 'La radio del coche espera. Un parte de incidencia son cuarenta segundos. No darlo son cuarenta segundos que mañana no podrás justificar.',
      opciones: [
        { texto: 'Declarar el encuentro', efectos: { mora_declaro: true }, destino: 'm_05b_comisaria' },
        { texto: 'Callártelo', efectos: { mora_declaro: false }, destino: 'm_05b_comisaria' },
      ],
    },

    m_05b_comisaria: {
      ruta: 'mora',
      hora: '05:40',
      titulo: 'Comisaría',
      texto:
        'Subes a devolver las llaves del coche y el caso ya no es tuyo. Solaris ha pedido el expediente a las cinco y cuarto y alguien de arriba se lo ha dado sin preguntar para qué. En el pasillo te cruzas con Sanabria, de tu misma promoción, que ahora tiene despacho con ventana. Te pone la mano en el hombro, que es lo que hace la gente antes de decirte algo desagradable, y te dice en voz baja que te apartes, que este marrón no es de los tuyos.',
      opciones: [
        { texto: 'Preguntarle quién firmó la cesión', efectos: { mora_sospecha: 1 }, destino: 'm_05c_sanabria' },
        { texto: 'Darle las gracias y callarte', destino: 'm_05e_eida_1' },
      ],
      ramas: [
        {
          condicion: 'persistente.teo_detenido == true',
          texto:
            'En el banco del pasillo hay un replicante de seguridad esposado por la muñeca a la barra, con el uniforme de Solaris todavía puesto. Levanta la cabeza cuando pasas. Le has visto antes, en otra vida que no es esta, en una garita con dos monitores y un termo: se llama Teo, y no ha hecho absolutamente nada.',
        },
        {
          condicion: 'persistente.teo_detenido == false',
          texto:
            'En el banco del pasillo hay un replicante de seguridad esposado por la muñeca a la barra, con el uniforme de Solaris todavía puesto. Nadie le ha tomado declaración y nadie va a tomársela. Está ahí porque trabajaba de noche en el sitio donde ha pasado algo.',
        },
      ],
    },

    m_05c_sanabria: {
      ruta: 'mora',
      texto:
        'Sanabria mira el pasillo antes de contestar, y eso ya es una respuesta. Dice que la cesión venía firmada de fábrica, sin nombre, con un sello de convenio. Y añade algo que no te esperabas: que no es la primera vez este año.',
      efectos: { mora_sabe_precedente: true },
      opciones: [{ texto: 'Salir de allí', destino: 'm_05e_eida_1' }],
    },

    m_05e_eida_1: {
      ruta: 'mora',
      hora: '05:50',
      titulo: 'Primera llamada',
      texto:
        'El canal privado del terminal se enciende en el aparcamiento, y en el canal privado de un agente de tu rango no entra cualquiera. Es una mujer que se presenta como Eida Lunaris, de Solaris Biotech, y que va directa: material sensible, incidente menor, colaboración entre instituciones. Habla como se habla a un proveedor. Te pide que le informes directamente a ella y no por el cauce del departamento.',
      efectos: { eida_llamadas: 1 },
      opciones: [
        { texto: 'Decirle que informarás por donde toca', efectos: { confianza: 1 }, destino: 'm_05d_salida' },
        { texto: 'Aceptar sin discutir', efectos: { confianza: -1 }, destino: 'm_05d_salida' },
        { texto: 'Preguntarle qué hay en la caja', destino: 'm_05f_pregunta' },
      ],
    },

    m_05f_pregunta: {
      ruta: 'mora',
      texto:
        'Te contesta que material biológico en investigación, y lo dice tan rápido que se nota que la frase venía preparada de casa. Luego añade que no es relevante para tu trabajo, que tu trabajo es localizar una unidad sustraída. Es la primera vez en la noche que alguien te dice qué no es relevante para ti.',
      efectos: { mora_sospecha: 1 },
      opciones: [{ texto: 'Colgar', destino: 'm_05d_salida' }],
    },

    m_05d_salida: {
      ruta: 'mora',
      texto: 'Bajas al aparcamiento con las llaves todavía en la mano. No has devuelto el coche. Nadie te lo va a reclamar hasta las nueve.',
      tipo: 'bifurcacion_automatica',
      nota: 'Sin opciones: el motor resuelve por ramas y salta al destino de la rama que cumpla.',
      ramas: [
        {
          condicion: 'mora_declaro == true',
          texto: 'La radio te avisa: tienes equipo de apoyo asignado en doce minutos.',
          destino: 'm_06_refuerzo',
        },
        {
          condicion: 'mora_declaro == false',
          texto: 'Nadie sabe dónde estás y así vas a seguir un rato.',
          destino: 'm_hub',
        },
      ],
    },

    m_06_refuerzo: {
      ruta: 'mora',
      texto:
        'En doce minutos tienes un equipo de apoyo de Solaris: dos unidades, equipo bueno, muy educados. Tardas media hora en darte cuenta de que no han venido a ayudarte a buscar. Han venido a mirarte a ti.',
      opciones: [
        { texto: 'Trabajar con ellos', destino: 'm_hub' },
        { texto: 'Despistarlos en el primer cruce', efectos: { confianza: 1 }, destino: 'm_hub' },
      ],
    },

    m_hub: {
      ruta: 'mora',
      tipo: 'hub',
      texto:
        'Tres sitios donde un replicante con una caja que necesita frío podría parar. Llegas a todos con horas de retraso: esta noche vas siempre por detrás de alguien que ya ha pasado por aquí.',
      reglas: {
        max_visitas: 2,
        destino_salida: 'm_11b_azotea',
        tras_primera_visita: { destino: 'm_10b_eida_2', una_vez: true },
      },
      opciones: [
        { texto: 'El mercado del puerto', destino: 'm_07_mercado', visitable_una_vez: true },
        { texto: 'La clínica del subsuelo', destino: 'm_08_clinica', visitable_una_vez: true },
        { texto: 'Los túneles de refrigeración', destino: 'm_09_tuneles', visitable_una_vez: true },
      ],
    },

    m_07_mercado: {
      ruta: 'mora',
      texto:
        'En el mercado todo el mundo ha visto algo y nadie lo ha visto gratis. Encuentras al que cobró por dar el aviso: un tipo con delantal que te enseña el número que le pagaron y que no sabe qué había en la caja. Le pagaron por la caja, no por lo de dentro. Eso te da que pensar más de lo que te gustaría. Lo que sí sabe es cómo la buscan: la caja pita cada media hora, y ese pitido se oye desde tres calles.',
      efectos: { sabe_rastreo_caja: true },
      opciones: [{ texto: 'Seguir', destino: 'm_hub' }],
    },

    m_08_clinica: {
      ruta: 'mora',
      texto:
        'Puerta de chapa, dos plantas bajo la calle. Sabes lo que hay detrás y sabes que ahí dentro tu placa no vale nada. Te la cierran en la cara sin decir palabra.',
      opciones: [
        { texto: 'Forzarla', efectos: { confianza: -1, sabe_verdad: true }, destino: 'm_08b_dentro' },
        { texto: 'Dejarlo estar', destino: 'm_hub' },
      ],
    },

    m_08b_dentro: {
      ruta: 'mora',
      texto:
        'Dentro hay cuatro replicantes y una mujer con guantes sucios que no te tiene ningún miedo. Te dice lo que llevaba la caja. Te lo dice despacio, para que no te quede la salida de no haberlo entendido: descendencia. Eso es lo que Solaris quiere quemar esta mañana.',
      efectos: { sabe_verdad: true },
      opciones: [{ texto: 'Salir sin detener a nadie', efectos: { confianza: 1 }, destino: 'm_hub' }],
    },

    m_09_tuneles: {
      ruta: 'mora',
      texto:
        'Bajas al frío. A cuarenta metros hay un mono de mantenimiento vacío y una caja térmica abierta, con la batería muerta hace meses. Buscas el expediente en el terminal de mano. No hay expediente. Y no hay expediente porque alguien lo cerró antes de abrirlo.',
      efectos: { mora_sabe_precedente: true },
      opciones: [{ texto: 'Subir', destino: 'm_hub' }],
    },

    m_10b_eida_2: {
      ruta: 'mora',
      hora: '06:25',
      titulo: 'Segunda llamada',
      texto:
        'Vuelve a llamar y esta vez no empieza por el asunto: empieza por ti. Ha leído tu hoja de servicio mientras tanto, y te lo dice, y hasta te felicita por los años que llevas. Pregunta si necesitas medios. Pregunta si necesitas personal. Entre pregunta y pregunta deja caer que el departamento tiene un convenio con Solaris desde hace seis años y que los convenios se renuevan.',
      efectos: { eida_llamadas: 1 },
      ramas: [
        {
          condicion: 'mora_sabe_precedente == true',
          texto: 'Y tú, que has visto un mono vacío en un túnel sin expediente, entiendes de golpe para qué sirve un convenio.',
        },
      ],
      opciones: [
        { texto: 'Pedirle los medios y usarlos a tu manera', efectos: { confianza: 1 }, destino: 'm_hub' },
        { texto: 'Decirle que no necesitas nada', destino: 'm_hub' },
        {
          texto: 'Preguntarle por el expediente que no existe',
          condicion: 'mora_sabe_precedente == true',
          efectos: { mora_sospecha: 1, confianza: 1 },
          destino: 'm_10c_silencio',
        },
      ],
    },

    m_10c_silencio: {
      ruta: 'mora',
      texto:
        'Se calla. Cuatro segundos, que por teléfono son muchísimos. Cuando vuelve, la voz es exactamente igual de amable que antes y por eso se te queda el frío en la nuca. Dice que no le consta ningún expediente con ese número y te da las gracias por tu diligencia.',
      opciones: [{ texto: 'Volver al trabajo', destino: 'm_hub' }],
    },

    m_11b_azotea: {
      ruta: 'mora',
      hora: '06:50',
      titulo: 'Sobre el mercado',
      texto:
        'Le ves cruzar el tejado de lonas del mercado con la caja por delante, saltando de estructura en estructura sobre doscientos puestos. Detrás van dos unidades de Solaris que se mueven mejor que tú y mucho mejor que él. Hay un salto de metro y medio entre la última lona y la pasarela de mantenimiento.',
      opciones: [
        { texto: 'Saltar detrás de ellos', condicion: 'sobrio == true', destino: 'm_11c_salto_bien' },
        { texto: 'Saltar detrás de ellos', condicion: 'sobrio == false', destino: 'm_11d_salto_mal' },
        { texto: 'Rodear por dentro del mercado y perder tres minutos', efectos: { mora_sospecha: 1 }, destino: 'm_12_puente' },
      ],
    },

    m_11c_salto_bien: {
      ruta: 'mora',
      texto:
        'Caes mal, con la rodilla, y te levantas peor, pero te levantas. Desde ahí ves lo que no habrías visto desde la calle: las dos unidades no van detrás de él. Van por delante, cerrándole la única salida que tiene. Alguien les ha dicho por dónde va a pasar antes de que pase.',
      efectos: { mora_sabe_precedente: true, confianza: 1 },
      opciones: [{ texto: 'Bajar a la pasarela', destino: 'm_12_puente' }],
    },

    m_11d_salto_mal: {
      ruta: 'mora',
      texto:
        'Metro y medio no es nada. Lo has saltado mil veces. Lo que pasa es que esta vez el pie sale una décima tarde, y una décima es exactamente la diferencia entre una rodilla rota y doscientos puestos de mercado vistos desde arriba mientras caes.',
      resolucion: 'final:f_muerte_mora',
    },

    m_12_puente: {
      ruta: 'mora',
      hora: '07:10',
      titulo: 'La pasarela',
      texto:
        'El control de Solaris está montado en la pasarela que une el puerto con la ciudad alta: dos vehículos, una mesa plegable y un escáner que barre el pasillo de servicio de abajo. En la pantalla hay un punto que pita cada treinta segundos, y ese punto es una caja térmica. Dos unidades ya han bajado a por él. No corren. Nadie corre cuando va a recoger un paquete.\n\nDesde donde estás, por la escalera de servicio, llegas antes que ellos. Doce, quince segundos antes. Y llevas toda la noche diciéndote que solo estabas haciendo tu trabajo.',
      opciones: [
        {
          texto: 'Falsear la lectura del escáner y mandarlos al nivel equivocado',
          condicion: 'sabe_rastreo_caja == true',
          efectos: { ayudo_escape: true, confianza: 3 },
          destino: 'm_12a_escaner',
        },
        {
          texto: 'Abrir la compuerta de servicio con tu código de agente',
          efectos: { ayudo_escape: true, rastro: true, confianza: 3 },
          destino: 'm_12b_compuerta',
        },
        {
          texto: 'Plantarte delante y decirles que la detención es competencia policial',
          efectos: { ayudo_escape: true, confianza: 2 },
          destino: 'm_12c_plantarse',
        },
        { texto: 'Quedarte donde estás y dejar que hagan su trabajo', efectos: { confianza: -2 }, destino: 'm_13_factura' },
      ],
    },

    m_12a_escaner: {
      ruta: 'mora',
      texto:
        'El técnico del control tiene veintitrés años y una placa de prácticas. Le pides el terminal con la voz de quien lleva veintidós años pidiendo cosas y te lo da. Mueves el punto dos niveles hacia abajo, hacia el aparcamiento inundado, y le devuelves el aparato. Las dos unidades cambian de rumbo sin preguntar. Nadie va a revisar ese registro hasta dentro de una semana, y para entonces esto habrá acabado de una manera o de otra.',
      opciones: [{ texto: 'Bajar al pasillo de servicio', destino: 'm_13_factura' }],
    },

    m_12b_compuerta: {
      ruta: 'mora',
      texto:
        'La compuerta de servicio se abre con código de agente y el código de agente lleva tu número. Lo tecleas igual. Hay un chirrido, un golpe de aire frío, y una figura empapada con una caja que sale por ahí y desaparece pasarela abajo sin mirarte. Tardas tres segundos en darte cuenta de que acabas de firmar lo que has hecho.',
      opciones: [{ texto: 'Cerrar y volver arriba', destino: 'm_13_factura' }],
    },

    m_12c_plantarse: {
      ruta: 'mora',
      texto:
        'Te pones en mitad del pasillo con la placa en alto y les recitas el artículo. Las dos unidades se paran. No discuten: consultan. Uno de ellos habla por el pinganillo mirándote a la cara todo el rato, y eso es peor que si te apuntara. Ganas cuatro minutos y los ganas con tu nombre por delante, delante de testigos y de cámaras.',
      ramas: [
        {
          condicion: 'mora_declaro == true',
          texto: 'Tu propio equipo de apoyo está a diez metros, oyéndolo todo. Mañana habrá tres versiones de esto y ninguna será la tuya.',
        },
      ],
      opciones: [{ texto: 'Dejarles pasar cuando ya no sirva de nada', destino: 'm_13_factura' }],
    },

    m_13_factura: {
      ruta: 'mora',
      hora: '07:30',
      titulo: 'La factura',
      texto:
        'Treinta y cinco minutos después, tu terminal deja de abrir expedientes. No es un error: es una pantalla azul muy educada que te agradece tus años de servicio y te invita a contactar con administración en horario de oficina.\n\nEl teléfono suena casi a la vez. Es Eida Lunaris y quiere saber si te encuentras bien.',
      opciones: [
        { texto: 'Cogerlo', destino: 'm_10_eida' },
        { texto: 'Dejarlo sonar', efectos: { confianza: 1 }, destino: 'm_13b_sanabria' },
      ],
    },

    m_10_eida: {
      ruta: 'mora',
      hora: '07:35',
      titulo: 'Tercera llamada',
      texto:
        'Es la tercera vez esta noche y cada vez ha estado más amable. Ya no pregunta por la caja: pregunta por tu espalda, por tus veintidós años, por lo cansado que debe de ser todo esto a tu edad. Te dice que no hay ninguna prisa y que descanses. Con la gente como ella, la amabilidad es el último aviso.',
      efectos: { eida_llamadas: 1 },
      opciones: [
        { texto: 'Decirle dónde está la caja', efectos: { confianza: -2 }, destino: 'm_11_cruce' },
        { texto: 'Mentirle', efectos: { confianza: 1 }, destino: 'm_11_cruce' },
        { texto: 'Colgarle', efectos: { confianza: 1 }, destino: 'm_11_cruce' },
      ],
    },

    m_13b_sanabria: {
      ruta: 'mora',
      hora: '07:35',
      titulo: 'La salida limpia',
      texto:
        'El que llama después no es Solaris: es Sanabria, y habla como alguien a quien le han pedido que llame. Te ofrece la salida limpia. Vete a casa ahora, duerme, preséntate el lunes y esto no ha pasado. Hasta te lo dice con cariño, que es lo que más rabia da, porque sabes que él se lo cree.',
      opciones: [
        { texto: 'Irte a casa', efectos: { confianza: -3 }, destino: 'm_11_cruce' },
        { texto: 'Colgar y seguir', efectos: { confianza: 1 }, destino: 'm_11_cruce' },
      ],
    },

    m_11e_disparo: {
      ruta: 'mora',
      texto:
        'No hay aviso. Tampoco hay maldad: hay un procedimiento, y en el procedimiento tú ya no eres un agente sino un obstáculo no identificado en una zona bajo control corporativo. Lo último que piensas, tirado en el bordillo con la lluvia entrándote en un ojo, es que al menos esta vez el que se ha equivocado has sido tú.',
      resolucion: 'final:f_muerte_mora',
    },

    m_11_cruce: {
      ruta: 'mora',
      tipo: 'convergencia',
      hora: '07:40',
      texto: 'Amanece gris. Los encuentras a la vez: al replicante contra una persiana bajada, con la caja pitando, y al coche de Solaris entrando por el fondo de la calle sin ninguna prisa.',
      resolucion: 'evaluar_finales',
      ramas: [
        {
          condicion: 'sobrio == false && ayudo_escape == true',
          texto:
            'Y te plantas otra vez en medio, como en la pasarela, solo que ahora llevas doce horas de pie y media copa de hace dos horas y el brazo no te sube igual de rápido que a ellos.',
          destino: 'm_11e_disparo',
        },
      ],
    },
  },

  finales: {
    orden_evaluacion: ['f_siembra', 'f_culpa', 'f_incinerada', 'f_perdida'],

    f_siembra: {
      titulo: 'Fuera de la ciudad',
      condicion: 'sabe_verdad == true && (confianza >= 4 || ayudo_escape == true)',
      texto_mora:
        'Subes al replicante al coche y conduces hacia el norte hasta que la lluvia se acaba, que es más lejos de lo que creías. Nunca has visto tierra que no fuera de nadie. La semilla entra en ella sin ceremonia, en un minuto y medio. Vuelves solo. En el informe escribes que le perdiste el rastro en el puerto, y por primera vez en muchos años mientes sin que te pese.',
      texto_replicante:
        'Un hombre al que no conoces de nada conduce durante dos horas sin hablar. Cuando paráis, hay tierra hasta donde llega la vista y no hay una sola cámara. Abres la caja por última vez. Él no mira: te da la espalda y enciende un cigarro, y entiendes que te está dando el único regalo que sabe hacer, que es no mirar.',
      efectos: { 'persistente.semilla_sembrada': true },
    },

    f_culpa: {
      titulo: 'El que carga con ello',
      condicion: 'confianza >= 2 || ayudo_escape == true',
      texto_mora:
        'Le dices que corra y que no mire atrás. Luego te quedas ahí, en mitad de la calle, esperando al coche. A Eida le cuentas que la caja se perdió por tu culpa, que la tuviste delante y la dejaste ir. Te lo cree, porque es exactamente lo que esperaba de ti. Te quitan la placa esa misma semana, y si dejaste tu código en una compuerta te la quitan con expediente. Duermes mejor que en años.',
      texto_replicante:
        'El hombre de la gabardina te dice que corras. No te explica por qué y tú no tienes tiempo de preguntárselo. Meses después, muy lejos, lees que a un agente le abrieron expediente por dejar escapar material de Solaris. No sale su nombre en la noticia. Nunca llegaste a sabérselo.',
    },

    f_incinerada: {
      titulo: 'Protocolo',
      condicion: 'confianza >= -1',
      texto_mora:
        'Entregas la caja. Eida te da las gracias por tu profesionalidad y esa palabra te va a perseguir mucho tiempo. La incineración está firmada a las nueve cuarenta. Duró once segundos. Tú sigues trabajando, porque no sabes hacer otra cosa, y cada vez que te mandan a un aviso de ruidos piensas en un callejón.',
      texto_replicante:
        'Te la quitan de las manos sin violencia, casi con cuidado, como quien recoge algo que se le ha caído a un niño. Nadie te dispara. Te devuelven a la planta y al turno de noche, y al pasillo B, y al mismo suelo. Lo que más te asusta es lo poco que ha cambiado nada.',
    },

    f_perdida: {
      titulo: 'Nadie gana',
      condicion: 'default',
      texto_mora:
        'Todo pasa en cuatro segundos y ninguno de los cuatro es culpa de nadie en concreto. La caja acaba en el suelo, abierta, bajo la lluvia. Eida ni siquiera se agacha a mirarla: da media vuelta y firma algo en una tablet mientras vuelve al coche. A eso se le llama resolver un incidente.',
      texto_replicante:
        'La caja se te va de las manos en el forcejeo. Ves el gel pálido mezclarse con el agua del bordillo y bajar hacia la alcantarilla, y lo ves durante mucho más tiempo del que tarda en desaparecer. Solaris no tendrá que quemar nada. Salió gratis.',
    },

    // Finales directos: no entran en orden_evaluacion, se alcanzan desde el
    // nodo que los nombra con "final:<id>".
    f_muerte_mora: {
      titulo: 'Incidente resuelto',
      condicion: 'directo',
      texto_mora:
        'En el parte de Solaris figuras como agente fuera de servicio en zona restringida. Tres líneas. Sanabria va al entierro y dice unas palabras sobre tus veintidós años. La caja térmica llegó a la planta a las nueve y diez y la orden se ejecutó a la hora prevista, porque ese es el tipo de cosa que no depende de nadie en concreto.',
      efectos: { 'persistente.mora_cayo': true },
    },

    f_semilla_fria: {
      titulo: 'Seis horas',
      condicion: 'directo',
      texto_replicante:
        'Solaris no tuvo que quemar nada: el frío se acabó solo y la ciudad hizo el resto. A ti te devuelven a la planta, al turno de noche y al pasillo B, con un correctivo en el expediente por abandono del puesto. Nadie menciona la caja. Y lo que peor llevas no es haber fallado, es saber que lo tuviste seis horas en las manos y que las seis horas eran todo lo que había.',
    },

    f_retirada: {
      titulo: 'Retirada de material',
      condicion: 'directo',
      texto_replicante:
        'En el registro de Solaris de esa mañana hay dos líneas seguidas. La primera dice que la unidad sustraída fue recuperada y desactivada a las 07:44. La segunda dice que el material biológico se recuperó íntegro y se ejecutó la orden a las 09:10, según lo previsto. Las dos líneas las firma la misma persona y ninguna de las dos menciona un nombre.',
    },
  },

  persistentes: {
    mora_cayo: { tipo: 'bool', inicial: false, se_activa_en: 'f_muerte_mora' },
    teo_detenido: { tipo: 'bool', inicial: false, se_activa_en: 'r_15_teo (rama teo_ayuda == false)' },
    semilla_sembrada: { tipo: 'bool', inicial: false, se_activa_en: 'f_siembra' },
  },
};
