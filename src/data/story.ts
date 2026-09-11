import type { StoryData } from '../types/story';

// Nota de normalización: el guion original describe algunos efectos de
// "bateria" como texto narrativo ("+90 y luego -60 por el tiempo perdido").
// Aquí se guarda el delta neto ya calculado para que el motor solo tenga
// que sumar números. El texto narrativo completo se conserva en el nodo.
// También se añade "mora_sospecha" a las variables: se usa en dos nodos de
// la ruta de Mora pero no estaba declarada en el bloque "variables" original.

export const storyData: StoryData = {
  meta: {
    id: 'malaga_2049',
    titulo: 'La semilla',
    version: '0.1',
    idioma: 'es',
    ambientacion: 'Ciberpunk noir. Málaga, 2049.',
    notas:
      'Dos rutas sobre la misma noche. El jugador elige ruta al empezar. Los cuatro finales son comunes a ambas.',
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
    bateria: { tipo: 'int', inicial: 360, rango: [0, 360], unidad: 'minutos', nota: 'Reloj de la ruta del replicante. 360 = carga completa.' },
    teo_ayuda: { tipo: 'bool', inicial: false },
    teo_delata: { tipo: 'bool', inicial: false },
    sabe_verdad: { tipo: 'bool', inicial: false, nota: 'Sabe qué es realmente la semilla.' },
    vio_restos: { tipo: 'bool', inicial: false, nota: 'Vio los restos del intento anterior en los túneles.' },
    mora_declaro: { tipo: 'bool', inicial: false },
    mora_sabe_precedente: { tipo: 'bool', inicial: false },
    mora_sospecha: { tipo: 'int', inicial: 0, nota: 'Pistas de sospecha recogidas por Mora (no puntuada en los finales).' },
    confianza: { tipo: 'int', inicial: 0, rango: [-3, 5], nota: 'Vínculo entre Mora y el replicante.' },
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
        'Tres de la madrugada. La fregona deja una curva húmeda en el suelo del pasillo B. En la sala de control nadie ha apagado la pantalla, y en la pantalla hay una orden de incineración con fecha de esta misma mañana. Debajo, el código de la semilla. Llevas seis meses limpiando alrededor de ella sin saber qué era. Ahora lo sabes, y le quedan cinco horas.',
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
        'Terminas el pasillo B. Empiezas el C. La fregona hace el mismo ruido de siempre y el reloj de la pared no perdona. A las cuatro y cuarenta sueltas el palo en mitad del pasillo y echas a andar hacia el laboratorio. Has perdido casi dos horas.',
      efectos: { bateria: -100 },
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
      opciones: [{ texto: 'Meterte en la ciudad', destino: 'r_hub' }],
    },

    r_hub: {
      ruta: 'replicante',
      tipo: 'hub',
      texto:
        'La caja pesa y avisa. Cada media hora suelta un pitido corto que recuerda que el frío se acaba. Necesitas corriente, o necesitas frío, y los dos están en sitios malos.',
      reglas: { max_visitas: 2, salida_forzada_si: 'bateria <= 60', destino_salida: 'r_10_callejon' },
      opciones: [
        { texto: 'El mercado del puerto', destino: 'r_05_mercado', visitable_una_vez: true },
        { texto: 'La clínica clandestina del subsuelo', destino: 'r_06_clinica', visitable_una_vez: true },
        { texto: 'Los túneles de refrigeración', destino: 'r_07_tuneles', visitable_una_vez: true },
        { texto: 'No parar en ningún sitio. Seguir andando.', destino: 'r_10_callejon' },
      ],
    },

    r_05_mercado: {
      ruta: 'replicante',
      titulo: 'El mercado del puerto',
      texto:
        'Doscientos puestos bajo una lona y una cámara cada seis metros. Aquí hay corriente en cada mostrador y ojos en cada pasillo. Enchufas la caja detrás de un puesto de pescado mientras el hombre hace como que no te ve. Por la radio de un tenderete oyes el aviso: Solaris paga por una caja térmica. No dicen qué lleva dentro. Eso es lo que más miedo da.',
      efectos: { bateria: 30 },
      opciones: [
        { texto: 'Salir antes de que alguien sume dos y dos', destino: 'r_hub' },
        { texto: 'Preguntar quién paga y cuánto', efectos: { bateria: -20 }, destino: 'r_05b_precio' },
      ],
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
    },

    r_06_clinica: {
      ruta: 'replicante',
      titulo: 'La clínica del subsuelo',
      texto:
        'Dos plantas bajo el nivel de la calle, detrás de una puerta de chapa, hay un sitio donde a los replicantes les arreglan lo que Solaris no arregla. Una mujer con guantes sucios mira la caja, luego te mira a ti, y por primera vez en toda la noche alguien se sienta a explicarte lo que llevas encima: no es una muestra, no es un prototipo. Es descendencia. Es que los tuyos dejen de fabricarse.',
      efectos: { bateria: 120, sabe_verdad: true },
      opciones: [
        { texto: 'Aceptar lo que te piden a cambio', efectos: { bateria: -50 }, destino: 'r_06b_precio_clinica' },
        { texto: 'Negarte y salir con lo puesto', efectos: { bateria: -30 }, destino: 'r_hub' },
      ],
    },

    r_06b_precio_clinica: {
      ruta: 'replicante',
      texto:
        'Te piden una hora de tu tiempo y un poco de tu sangre: dicen que quieren tener registro de alguien que ha estado tan cerca de aquello. Te tumbas. Cargan la caja hasta arriba mientras tanto. Cuando sales, la lluvia ha bajado de intensidad y eso te parece mala señal.',
      efectos: { bateria: 60 },
      opciones: [{ texto: 'Volver a la calle', destino: 'r_hub' }],
    },

    r_07_tuneles: {
      ruta: 'replicante',
      titulo: 'Los túneles de refrigeración',
      texto:
        'Bajo la ciudad corre el frío que mantiene los servidores y los mercados. Aquí la caja no gasta nada: el aire hace el trabajo. También es un sitio sin segunda salida. A cuarenta metros, junto a un conducto, hay un mono de trabajo idéntico al tuyo, vacío, y una caja térmica abierta con la batería agotada hace mucho tiempo. Alguien intentó esto antes que tú. Nadie lo contó nunca.',
      efectos: { bateria: 150, vio_restos: true },
      opciones: [
        { texto: 'Quedarte todo lo que puedas', efectos: { bateria: 60 }, destino: 'r_07b_riesgo' },
        { texto: 'Salir ya, antes de que cierren la boca del túnel', destino: 'r_hub' },
      ],
    },

    r_07b_riesgo: {
      ruta: 'replicante',
      texto: 'Oyes voces arriba, en la rejilla. No bajan. Todavía. Sales por un conducto lateral con la ropa empapada y la caja llena.',
      opciones: [{ texto: 'Subir a la calle', destino: 'r_hub' }],
    },

    r_10_callejon: {
      ruta: 'replicante',
      hora: 'amanecer',
      titulo: 'El callejón',
      texto:
        'Contenedores, vapor, una escalera de incendios goteando. Llevas horas sin parar y la caja pita cada poco. Te encoges contra la pared mojada. Entonces oyes pasos: unos zapatos malos, de alguien que no quiere estar aquí. Un hombre con gabardina entra en el callejón y te ve. Tarda un segundo de más en llevarse la mano al arma, y en ese segundo entiendes que te ha visto a ti antes que a lo que eres.',
      opciones: [
        { texto: 'Hablarle', condicion: 'bateria > 60', efectos: { confianza: 1 }, destino: 'r_11_hablar' },
        { texto: 'Correr', destino: 'r_12_correr' },
        { texto: 'Enseñarle lo que llevas en la caja', condicion: 'sabe_verdad == true', efectos: { confianza: 3 }, destino: 'r_13_mostrar' },
      ],
    },

    r_11_hablar: {
      ruta: 'replicante',
      texto:
        'Le dices que no has matado a nadie. Él contesta que eso no es lo que le han mandado averiguar. Pero no dispara, y no llama por radio, y los dos os quedáis ahí mirándoos mientras la caja pita.',
      opciones: [
        { texto: 'Contarle lo de la orden de incineración', efectos: { confianza: 1 }, destino: 'r_14_cruce' },
        { texto: 'Aprovechar y echar a correr', efectos: { confianza: -1 }, destino: 'r_12_correr' },
      ],
    },

    r_12_correr: {
      ruta: 'replicante',
      efectos: { bateria: -40, confianza: -1 },
      texto: 'Corres. Él no dispara, pero tampoco se queda quieto. Sales del callejón hacia el paseo y la ciudad empieza a despertarse a tu alrededor, que es lo peor que podía pasar.',
      opciones: [{ texto: 'Seguir', destino: 'r_14_cruce' }],
    },

    r_13_mostrar: {
      ruta: 'replicante',
      texto:
        'Abres la caja lo justo. El vaho sale y se queda un momento entre los dos. Le explicas qué es. Ves cómo un hombre que lleva media vida cerrando expedientes se queda sin saber en qué casilla poner esto.',
      opciones: [{ texto: 'Pedirle ayuda', efectos: { confianza: 1 }, destino: 'r_14_cruce' }],
    },

    r_14_cruce: {
      ruta: 'replicante',
      tipo: 'convergencia',
      hora: '07:40',
      texto: 'Amanece mal, con esa luz gris que no llega a ser día. Un coche de Solaris entra por el fondo de la calle sin prisa ninguna, porque la gente con poder no tiene prisa. Eida Lunaris baja sin paraguas.',
      resolucion: 'evaluar_finales',
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
        { texto: 'Bajar el arma', efectos: { confianza: 1 }, destino: 'm_05_parte' },
        { texto: 'Ordenarle que suelte la caja', destino: 'm_05_parte' },
      ],
    },

    m_04b_hablar: {
      ruta: 'mora',
      texto:
        'Le preguntas qué lleva ahí. Te contesta que algo que van a quemar esta mañana. No es la respuesta que esperabas y no encaja en ningún formulario que tú sepas rellenar.',
      opciones: [
        { texto: 'Dejarle marchar y seguirle de lejos', destino: 'm_05_parte' },
        { texto: 'Detenerle', efectos: { confianza: -1 }, destino: 'm_05_parte' },
      ],
    },

    m_04c_dejar: {
      ruta: 'mora',
      texto:
        'Te das la vuelta. Das seis pasos. En el séptimo te paras, porque sabes perfectamente que mañana alguien te preguntará dónde estabas a esta hora y tú tendrás que decidir qué contestar.',
      opciones: [{ texto: 'Seguir adelante igualmente', destino: 'm_05_parte' }],
    },

    m_05_parte: {
      ruta: 'mora',
      tipo: 'decision_clave',
      texto: 'La radio del coche espera. Un parte de incidencia son cuarenta segundos. No darlo son cuarenta segundos que mañana no podrás justificar.',
      opciones: [
        { texto: 'Declarar el encuentro', efectos: { mora_declaro: true }, destino: 'm_06_refuerzo' },
        { texto: 'Callártelo e ir solo', efectos: { mora_declaro: false }, destino: 'm_hub' },
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
      reglas: { max_visitas: 2, destino_salida: 'm_10_eida' },
      opciones: [
        { texto: 'El mercado del puerto', destino: 'm_07_mercado', visitable_una_vez: true },
        { texto: 'La clínica del subsuelo', destino: 'm_08_clinica', visitable_una_vez: true },
        { texto: 'Los túneles de refrigeración', destino: 'm_09_tuneles', visitable_una_vez: true },
      ],
    },

    m_07_mercado: {
      ruta: 'mora',
      texto:
        'En el mercado todo el mundo ha visto algo y nadie lo ha visto gratis. Encuentras al que cobró por dar el aviso: un tipo con delantal que te enseña el número que le pagaron y que no sabe qué había en la caja. Le pagaron por la caja, no por lo de dentro. Eso te da que pensar más de lo que te gustaría.',
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

    m_10_eida: {
      ruta: 'mora',
      texto:
        'Eida Lunaris te llama por el canal privado. Es la tercera vez esta noche y cada vez está más amable. Te pregunta por tu espalda, por tus años de servicio, por lo cansado que debe de ser todo esto a tu edad. Con la gente como ella, la amabilidad es el último aviso.',
      opciones: [
        { texto: 'Decirle dónde está la caja', efectos: { confianza: -2 }, destino: 'm_11_cruce' },
        { texto: 'Mentirle', efectos: { confianza: 1 }, destino: 'm_11_cruce' },
        { texto: 'Colgarle', efectos: { confianza: 1 }, destino: 'm_11_cruce' },
      ],
    },

    m_11_cruce: {
      ruta: 'mora',
      tipo: 'convergencia',
      hora: '07:40',
      texto: 'Amanece gris. Los encuentras a la vez: al replicante contra una persiana bajada, con la caja pitando, y al coche de Solaris entrando por el fondo de la calle sin ninguna prisa.',
      resolucion: 'evaluar_finales',
    },
  },

  finales: {
    orden_evaluacion: ['f_siembra', 'f_culpa', 'f_incinerada', 'f_perdida'],

    f_siembra: {
      titulo: 'Fuera de la ciudad',
      condicion: "confianza >= 4 && sabe_verdad == true && (bateria > 40 || ruta == 'mora')",
      texto_mora:
        'Subes al replicante al coche y conduces hacia el norte hasta que la lluvia se acaba, que es más lejos de lo que creías. Nunca has visto tierra que no fuera de nadie. La semilla entra en ella sin ceremonia, en un minuto y medio. Vuelves solo. En el informe escribes que le perdiste el rastro en el puerto, y por primera vez en muchos años mientes sin que te pese.',
      texto_replicante:
        'Un hombre al que no conoces de nada conduce durante dos horas sin hablar. Cuando paráis, hay tierra hasta donde llega la vista y no hay una sola cámara. Abres la caja por última vez. Él no mira: te da la espalda y enciende un cigarro, y entiendes que te está dando el único regalo que sabe hacer, que es no mirar.',
    },

    f_culpa: {
      titulo: 'El que carga con ello',
      condicion: 'confianza >= 2',
      texto_mora:
        'Le dices que corra y que no mire atrás. Luego te quedas ahí, en mitad de la calle, esperando al coche. A Eida le cuentas que la caja se perdió por tu culpa, que la tuviste delante y la dejaste ir. Te lo cree, porque es exactamente lo que esperaba de ti. Te quitan la placa esa misma semana. Duermes mejor que en años.',
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
  },
};
