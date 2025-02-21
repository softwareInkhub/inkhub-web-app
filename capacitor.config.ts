import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.your.app',
  appName: 'inkhub',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  }
};

export default config;