# ReadyDorm Web

ReadyDorm es un prototipo web de una plataforma SafetyTech para jovenes que viven solos, con roommates o en residencias. La pagina organiza herramientas de prevencion, respuesta y coordinacion ante emergencias como sismos, incendios, fugas de gas, inundaciones y cortes de luz.

## Demo

Sitio publicado con GitHub Pages:

[https://victor-pajuelo.github.io/readydorm-web/](https://victor-pajuelo.github.io/readydorm-web/)

## Objetivo

El objetivo del prototipo es demostrar una experiencia integral de seguridad residencial que ayude a:

- Preparar informacion medica y contactos de emergencia.
- Activar alertas SOS con confirmacion y cancelacion.
- Coordinar tareas entre roommates durante una crisis.
- Consultar rutas de evacuacion y puntos seguros.
- Gestionar mochila de emergencia, caducidades y gastos compartidos.
- Apoyar a gestores con dashboard, alertas masivas, brigadistas y reportes.
- Ubicar centros medicos cercanos mediante un mapa simulado.

## Historias de Usuario

El prototipo cubre las 46 historias de usuario funcionales del proyecto ReadyDorm. Entre los modulos implementados se encuentran:

- Perfil, ficha medica y contactos de confianza.
- Selector de rol para residente, gestor y contacto de emergencia.
- Sistema SOS con presion sostenida, voz, linterna, alerta de piso, estado "Estoy a salvo" y cancelacion.
- Directorio de auxilio con llamadas a numeros de emergencia de Peru.
- Rutas de evacuacion por piso con ruta principal, ruta alterna y punto seguro.
- Coordinacion de roommates con tareas, confirmacion, chat, suministros, gastos e intrusos.
- Mochila inteligente con checklist, caducidad, mochila compartida y lista INDECI.
- Preparacion con score, quiz, medallas, avisos de simulacros y primeros auxilios.
- Vista para contactos familiares con alerta, ubicacion, llamada, ficha medica e historial.
- Panel de gestor con estado de residentes, alertas, equipos, brigadistas, reportes y averias.
- Mapa simulado de clinicas cercanas con filtros, rutas y distancias.

## Tecnologias

- HTML5
- CSS3
- JavaScript
- GitHub Pages

No se usan frameworks ni APIs pagadas. El mapa y las interacciones son simuladas para fines de prototipo academico.

## Estructura

```text
.
├── assets/
│   ├── readydorm-icon.png
│   └── readydorm-logo.png
├── css/
│   └── style.css
├── js/
│   └── main.js
├── index.html
├── login.html
├── registro.html
└── README.md
```

## Como ejecutar localmente

Abre `index.html` directamente en el navegador.

Tambien puedes usar un servidor local simple desde la carpeta del proyecto:

```bash
python -m http.server 8000
```

Luego visita:

```text
http://localhost:8000
```

## Nota

Este repositorio contiene solo los archivos de la pagina web. Los documentos academicos internos y archivos PDF no forman parte del repositorio publicado.
