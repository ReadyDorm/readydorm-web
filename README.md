# ReadyDorm Web

ReadyDorm es una solución SafetyTech orientada a mejorar la preparación, coordinación y respuesta de personas que viven solas, con roommates o en residencias ante situaciones de emergencia.

El repositorio contiene el avance de implementación de la Landing Page del proyecto del curso **IHC y Tecnologías Móviles (1ASI0385)** de la Universidad Peruana de Ciencias Aplicadas.

## Demo

- Landing Page: [https://victor-pajuelo.github.io/readydorm-web/](https://victor-pajuelo.github.io/readydorm-web/)
- Repositorio: [https://github.com/Victor-Pajuelo/readydorm-web](https://github.com/Victor-Pajuelo/readydorm-web)

## Integrantes

| Integrante | Código |
| --- | --- |
| Junior Cabrera Valverde | U20241E610 |
| Abraham Gadiel Coronado Aliendres | U20241E328 |
| Patrik Arnold Cruz Pallqui | U20241C737 |
| Gricel Alexa Lluncor Salvador | U20241D149 |
| Victor Andre Pajuelo Requena | U202410214 |

## Segmentos objetivo

### Residentes jóvenes

Estudiantes y jóvenes que viven solos, con roommates o en residencias y necesitan prepararse, coordinar tareas y solicitar ayuda durante una emergencia.

### Gestores de residencias

Administradores de edificios, residencias universitarias o inmuebles compartidos que requieren monitorear residentes, emitir alertas y organizar recursos de seguridad.

### Contactos de emergencia

Familiares o personas de confianza que necesitan recibir alertas, conocer la ubicación y consultar información médica crítica del residente.

## Características principales

- Perfil de emergencia, ficha médica y contactos de confianza.
- Selección de rol para residentes, gestores y contactos.
- Botón SOS con activación sostenida, voz, linterna y cancelación.
- Reporte de estado "Estoy a salvo" y alertas de proximidad.
- Directorio de números de emergencia del Perú.
- Rutas de evacuación por piso, salida alterna y punto seguro.
- Coordinación de roommates mediante roles, tareas y chat.
- Mochila de 72 horas con checklist y alertas de caducidad.
- Quizzes, score de preparación, medallas y simulacros.
- Vista de seguimiento para familiares y contactos.
- Dashboard para gestores, brigadistas, equipos y reportes.
- Mapa simulado de centros médicos cercanos.

El prototipo representa las 46 historias de usuario funcionales definidas para ReadyDorm.

## Tecnologías

- HTML5
- CSS3
- JavaScript
- Google Fonts
- Git y GitHub
- GitHub Pages

El proyecto no utiliza frameworks de CSS ni JavaScript.

## Estructura del proyecto

```text
.
|-- public/
|   |-- assets/
|   |   |-- images/
|   |   |   |-- readydorm-icon.png
|   |   |   `-- readydorm-logo.png
|   |   |-- scripts/
|   |   |   `-- main.js
|   |   `-- styles/
|   |       `-- styles.css
|   |-- favicon.ico
|   |-- index.html
|   |-- login.html
|   `-- registro.html
|-- .gitignore
`-- README.md
```

## Flujo de trabajo GitFlow

- `main`: versión estable y publicada.
- `develop`: rama de integración del equipo.
- `feature/*`: ramas creadas desde `develop` para implementar funcionalidades o mejoras.

La reorganización solicitada para el challenge fue trabajada en la rama `feature/challenge-landing-structure`, integrada primero en `develop` y posteriormente en `main`.

## Ejecución local

La carpeta pública del proyecto es `public`.

```bash
python -m http.server 8000 --directory public
```

Después, abre:

```text
http://localhost:8000
```

También puedes abrir directamente `public/index.html` en un navegador.

## Alcance académico

El repositorio publica únicamente el código y los recursos de la Landing Page. Los documentos académicos internos y archivos PDF no forman parte del repositorio.
