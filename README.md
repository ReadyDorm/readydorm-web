# ReadyDorm Web

ReadyDorm is an academic landing page for an emergency-readiness product designed for students, roommates, families, and residence managers. The final version is written in English, includes the required "About the Product" and "About the Team" videos, and is deployed with GitHub Pages.

## Demo

- Landing Page: [https://readydorm.github.io/readydorm-web/](https://readydorm.github.io/readydorm-web/)
- Repository: [https://github.com/ReadyDorm/readydorm-web](https://github.com/ReadyDorm/readydorm-web)

## Team

| Member | Code |
| --- | --- |
| Junior Cabrera Valverde | U20241E610 |
| Abraham Gadiel Coronado Aliendres | U20241E328 |
| Patrik Arnold Cruz Pallqui | U20241C737 |
| Gricel Alexa Lluncor Salvador | U20241D149 |
| Victor Andre Pajuelo Requena | U202410214 |

## Final Landing Page Scope

The final landing page satisfies the requested delivery criteria:

- English interface with `lang="en"` for internationalization.
- Responsive layout for desktop, tablet, and mobile screens.
- "About the Product" video with controls, captions, poster, and transcript.
- "About the Team" video with controls, captions, poster, and transcript.
- Accessibility-oriented structure: semantic landmarks, skip links, labels, alt text, visible focus states, keyboard-friendly navigation, captions, and reduced-motion support.
- Complete product sections for emergency protocols, resident modules, response workflow, and residence manager dashboard.
- GitHub Pages deployment workflow.

## Product Narrative

ReadyDorm helps users prepare before risk and act quickly during emergencies:

1. Prepare: emergency profile, trusted contacts, backpack checklist, and evacuation routes.
2. Respond: SOS, safe check-ins, route guidance, and nearby medical support.
3. Coordinate: family alerts, roommate coordination, and manager dashboards.

The landing page also presents action guides for earthquakes, fires, gas leaks, floods, power outages, and medical events, plus the modules that were part of the original product concept.

## Technologies

- HTML5
- CSS3
- JavaScript
- Google Fonts
- Git and GitHub Pages
- Local WebM video assets generated for the academic prototype

The project does not use JavaScript or CSS frameworks.

## Project Structure

```text
.
|-- public/
|   |-- assets/
|   |   |-- images/
|   |   |   |-- readydorm-icon.png
|   |   |   `-- readydorm-logo.png
|   |   |-- scripts/
|   |   |   `-- main.js
|   |   |-- styles/
|   |   |   `-- styles.css
|   |   `-- videos/
|   |       |-- about-product.webm
|   |       |-- about-product-poster.svg
|   |       |-- about-product.vtt
|   |       |-- about-team.webm
|   |       |-- about-team-poster.svg
|   |       `-- about-team.vtt
|   |-- favicon.ico
|   |-- index.html
|   |-- login.html
|   `-- registro.html
|-- .github/
|   `-- workflows/
|       `-- pages.yml
|-- tools/
|   `-- generate-videos.mjs
|-- .gitignore
`-- README.md
```

## Run Locally

```bash
python -m http.server 8000 --directory public
```

Then open:

```text
http://localhost:8000
```

## Academic Note

ReadyDorm is a course prototype for IHC y Tecnologias Moviles. The landing page demonstrates product communication, responsiveness, internationalization, and accessibility considerations for an emergency-readiness solution.
