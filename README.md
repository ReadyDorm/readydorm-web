# ReadyDorm Web

ReadyDorm ayuda a estudiantes y residentes a prepararse, pedir ayuda y coordinar contactos ante una emergencia desde una sola plataforma. La landing page prioriza una propuesta de valor clara: tener un plan simple antes del riesgo y actuar rápido cuando cada segundo importa.

El repositorio contiene el avance de implementación de la Landing Page del proyecto del curso **IHC y Tecnologías Móviles (1ASI0385)** de la Universidad Peruana de Ciencias Aplicadas.

## Demo

- Landing Page: [https://readydorm.github.io/readydorm-web/](https://readydorm.github.io/readydorm-web/)
- Repositorio: [https://github.com/ReadyDorm/readydorm-web](https://github.com/ReadyDorm/readydorm-web)

## Integrantes

| Integrante | Código |
| --- | --- |
| Junior Cabrera Valverde | U20241E610 |
| Abraham Gadiel Coronado Aliendres | U20241E328 |
| Patrik Arnold Cruz Pallqui | U20241C737 |
| Gricel Alexa Lluncor Salvador | U20241D149 |
| Victor Andre Pajuelo Requena | U202410214 |

## Enfoque de experiencia

La landing fue organizada para responder de forma progresiva:

1. **Problema:** muchos residentes no tienen contactos, rutas, datos médicos ni tareas claras ante una emergencia.
2. **Solución:** ReadyDorm reúne perfil de emergencia, mochila, rutas, contactos y botón SOS en una sola experiencia.
3. **Acción:** el usuario puede pedir ayuda, avisar que está a salvo, practicar simulacros o seguir una ruta de evacuación.

Esta estructura reduce la carga cognitiva y evita presentar todas las funcionalidades con la misma prioridad desde el primer pantallazo.

## Segmentos objetivo

### Residentes jóvenes

Estudiantes y jóvenes que viven solos, con compañeros de vivienda o en residencias y necesitan prepararse, coordinar tareas y solicitar ayuda durante una emergencia.

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
- Coordinación de compañeros de vivienda mediante roles, tareas y chat.
- Mochila de 72 horas con lista de verificación y alertas de caducidad.
- Preguntas rápidas, nivel de preparación, medallas y simulacros.
- Vista de seguimiento para familiares y contactos.
- Panel de estado para gestores, brigadistas, equipos y reportes.
- Mapa simulado de centros médicos cercanos.

El prototipo representa las 46 historias de usuario funcionales definidas para ReadyDorm.

## Criterios mejorados según feedback

- Propuesta de valor más clara en el primer pantallazo.
- Narrativa progresiva: problema, solución y acción.
- Funcionalidades agrupadas por intención: prepararse, actuar y coordinar ayuda.
- Lenguaje más directo para usuarios no técnicos.
- Mayor refuerzo de confianza: uso de datos en emergencia, contactos de confianza y prácticas preventivas.
- Llamadas a la acción más visibles: crear cuenta y ver cómo funciona.

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
|-- .github/
|   `-- workflows/
|       `-- pages.yml
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
