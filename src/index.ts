#!/usr/bin/env node
import { loadConfig, validateConfig, getConfigSummary } from './utils/config.js';
import { TeamsMCPServer } from './server.js';

async function main() {
  try {
    // Konfiguration laden
    const config = loadConfig();
    validateConfig(config);

    // Konfiguration ausgeben
    console.error(getConfigSummary(config));

    // Server starten
    const server = new TeamsMCPServer(config);
    await server.start();

    // Sicherstellen, dass der Prozess nicht vorzeitig beendet wird
    process.on('SIGINT', () => {
      console.error('\nServer wird heruntergefahren...');
      process.exit(0);
    });
  } catch (error) {
    console.error('Fehler beim Starten des Servers:', error);
    process.exit(1);
  }
}

main();
