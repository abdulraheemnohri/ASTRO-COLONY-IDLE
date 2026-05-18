import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.astrocolony.idle',
  appName: 'Astro Colony Idle+',
  webDir: 'dist',
  plugins: {
    CapacitorSQLite: {
      iosDatabaseLocation: 'Library/CapacitorDatabase',
      iosIsEncryption: false,
      iosKeychainPrefix: 'astro-colony-idle',
      iosBiometric: {
        biometricAuth: false,
        biometricTitle: "Biometric login for \"Capacitor SQLite\""
      },
      androidIsEncryption: false,
      androidBiometric: {
        biometricAuth: false,
        biometricTitle: "Biometric login for \"Capacitor SQLite\""
      }
    }
  }
};

export default config;
