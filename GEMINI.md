# Marbella Beachfront Project Overview

This project is a high-end vacation rental website for "Marbella Beachfront," a luxury apartment in Jardines de las Golondrinas, Elviria, Marbella. It features a bilingual setup (English and Spanish) and integrates with FullCalendar for availability tracking.

## Core Technologies
- **Frontend:** HTML5, Vanilla CSS, Vanilla JavaScript.
- **Frameworks/Libraries:** 
  - Bootstrap 5.3.0 (for layout and components).
  - FontAwesome 6.0.0 (for icons).
  - FullCalendar 6.1.11 (for the availability calendar).
  - ICAL.js (for parsing .ics calendar data).
- **Image Hosting:** Cloudinary (f_auto, q_auto optimization).
- **Automation:** GitHub Actions (for hourly calendar updates from Google Calendar).

## Project Structure
- `/index.html`: Root redirector based on browser language.
- `/en/index.html`: English version of the landing page.
- `/es/index.html`: Spanish version of the landing page.
- `/styles.css`: Global CSS (often inlined for performance).
- `/animations.js`: Scroll-reveal animations using IntersectionObserver.
- `/calendar-init.js`: FullCalendar initialization logic.
- `/calendar.ics`: Local copy of the availability calendar (updated via GitHub Action).

## Development Conventions
- **Performance First:** 
  - Critical CSS is inlined in the `<head>`. 
  - External resources (Bootstrap, FontAwesome, FullCalendar) are loaded asynchronously using the `media="print"` pattern.
  - Resource hints (`preconnect`, `preload`) are used for fonts and primary hero images.
- **Images:** 
  - Always use Cloudinary URLs with `f_auto, q_auto` parameters. 
  - Hero images should be capped at `w_1200`, and secondary images (gallery, icons) at `w_600` for optimal load speed.
- **SEO & Structured Data:** 
  - JSON-LD structured data is mandatory for `VacationRental`. 
  - Always include the `geo` field (GeoCoordinates) at the root of the JSON-LD object for better indexing.
- **Animations:** Use the `.reveal` class on elements that should animate into view; these are handled by `IntersectionObserver` in `animations.js`.
- **Mobile Friendly:** The site is fully responsive, leveraging Bootstrap's grid system and utility classes.

## Key Workflows
- **Calendar Update:** The `.github/workflows/update_calendar.yml` fetches the latest `.ics` file from Google Calendar every hour and commits it to the repository. The website then parses this local file to display availability.
