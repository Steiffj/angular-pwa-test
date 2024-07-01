# PWA

This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 18.0.6.

## Development server

Run `ng serve` for a dev server. Navigate to `http://localhost:4200/`. The application will automatically reload if you change any of the source files.

Run `ng serve --configuration=production` to register the Service Worker while using the dev server.

## Web/Shared/Service Workers
This app uses service workers, web workers, and shared workers for different purposes.
1. Loading app assets to `CacheStorage` for offline support __(service worker)__. This is a core component of setting up a Progressive Web App (PWA).
2. Background data sync __(web worker)__. The web worker creates and periodically loads data to `IndexedDB` object stores. Only runs when opening the main app (via the default URL or <...>/home).
3. Sharing and persisting user session data (WIP) __(shared worker)__. Communicates between multiple app windows/tabs. Each window opens a connection to a single shared worker under the app's origin.
    - TODO Reads most relevant data in memory, reading from the `IndexedDB` objects stores created by the data sync worker.
    - TODO Saves user session in `IndexedDB` user object store.
    - TODO Posts relevant data to app windows, based on the type of data the window requests.

### Worker Development Considerations

#### Installing PWAs
PWAs () can be installed in Chromium-based browsers via a button in the right of the URL bar. This allows the app to run in a dedicated window without browser tabs, URL bar, or navigation buttons. The PWA can also open multiple dedicated windows, although opening a page/route that's already open will just focus the existing window.

#### Service Worker Setup
You typically won't write service worker code directly for an Angular app. Running `ng add @angular/pwa` will create an [`ngsw-config.json`](./ngsw-config.json) file that is used to generate the service worker itself

Service workers are not installed when running in dev mode. To install/execute the service worker during development, use `ng serve --configuration=production`. Note that source maps will not be available in Angular's default prod config, so it's probably worth creating another config that matches production but also includes source maps.

#### Shared Worker Suport
The Angular CLI supports web worker creation but not shared workers by default. However, it's possible to create a shared worker via the typical `ng g web-worker`. The existing web worker build process should work as long as the shared worker filename matches the pattern in `tsconfig.worker.json`. There is some additional dev environment setup required, which is covered below.

TypeScript does not include the global shared worker types by default. To add shared worker TS support:
1. Install the shared worker global scope types to the project: `npm i -D @types/sharedworker`.
2. Update shared workers' triple-slash directives to `/// <reference lib="DOM" />`. For some reason the shared worker types are in `DOM` rather than `webworker`.

#### Shared Worker Debuggin
Shared Workers do not appear in the standard devtools when debugging a single application window. You can open `chrome://inspect/#workers` to view a list of running shared workers. Click "inspect" to debug the relevant worker. The shared worker devtools will include source maps if you're running it from the dev server.

## Code scaffolding

Run `ng generate component component-name` to generate a new component. You can also use `ng generate directive|pipe|service|class|guard|interface|enum|module`.

## Build

Run `ng build` to build the project. The build artifacts will be stored in the `dist/` directory.

## Running unit tests

Run `ng test` to execute the unit tests via [Karma](https://karma-runner.github.io).

## Running end-to-end tests

Run `ng e2e` to execute the end-to-end tests via a platform of your choice. To use this command, you need to first add a package that implements end-to-end testing capabilities.

## Further help

To get more help on the Angular CLI use `ng help` or go check out the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.
