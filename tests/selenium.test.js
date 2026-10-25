const { Builder, By, until } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');
const { app } = require('../src/app');

async function ejecutarPruebaSelenium() {
  let server;
  let driver;
  const puerto = 3099;

  try {
    // iniciar servidor web local
    await new Promise((resolve) => {
      server = app.listen(puerto, () => resolve());
    });

    // configurar opciones de chrome headless
    const options = new chrome.Options();
    options.addArguments('--headless=new');
    options.addArguments('--no-sandbox');
    options.addArguments('--disable-dev-shm-usage');
    options.addArguments('--disable-gpu');

    // crear instancia del navegador
    driver = await new Builder()
      .forBrowser('chrome')
      .setChromeOptions(options)
      .build();

    // navegacion y verificacion del dom
    await driver.get(`http://localhost:${puerto}/index.html`);
    const titulo = await driver.findElement(By.id('titulo-pagina')).getText();
    if (!titulo.includes('Inventario de Instrumentos')) {
      throw new Error('Titulo no coincide con lo esperado');
    }

    await driver.wait(until.elementLocated(By.className('fila-instrumento')), 5000);
    const filas = await driver.findElements(By.className('fila-instrumento'));
    if (filas.length === 0) {
      throw new Error('No se cargaron filas de instrumentos');
    }

    console.log('Pruebas de Selenium completadas con exito.');
  } finally {
    // cierre de recursos
    if (driver) {
      await driver.quit();
    }
    if (server) {
      await new Promise((resolve) => server.close(resolve));
    }
  }
}

if (require.main === module) {
  ejecutarPruebaSelenium().catch((error) => {
    console.error('Fallo en prueba de Selenium:', error.message);
    process.exit(1);
  });
}

module.exports = { ejecutarPruebaSelenium };
