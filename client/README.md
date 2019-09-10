# client

> Contract Manager

## Architecture

``` bash
The main files are in the src folder.
Components house the many Vue components that make up the UI.
Graphs contain the Chart.js set up for the charts.
Router ensures that the correct components are shown on urls.
Services take care of the communication between the Front-End and the Back-End.
Store maintains the user's state and holds current user information.
```

## Build Setup

``` bash
# install dependencies
npm install

# serve with hot reload at localhost:8080
npm run dev

# build for production with minification
npm run build

# build for production and view the bundle analyzer report
npm run build --report

# run unit tests
npm run unit

# run e2e tests
npm run e2e

# run all tests
npm test
```

For a detailed explanation on how things work, check out the [guide](http://vuejs-templates.github.io/webpack/) and [docs for vue-loader](http://vuejs.github.io/vue-loader).
