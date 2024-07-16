#!/bin/bash

echo 'Starting ...'
# Nome do projeto
# PROJECT_NAME=$1

# # Criação do projeto Expo
# npx create-expo-app $PROJECT_NAME --template || { echo 'Failed to create Expo project'; exit 1; }
# cd $PROJECT_NAME || { echo "Failed to change directory to $PROJECT_NAME"; exit 1; }
cd p

echo 'Removing dirs and files...'
rm -rf app components constants assets/fonts || { echo 'Failed to remove directories'; exit 1; }

echo 'Creating new files and dirs...'
mkdir -p src/{components,app,services,utils,styles,storage,types} || { echo 'Failed to create directories'; exit 1; }

echo 'Installing NativeWind dependencies...'
# Instalação do NativeWind
npx expo install nativewind react-native-reanimated tailwindcss || { echo 'Failed to install dependencies'; exit 1; }

while [ ! -f package-lock.json ]; do
    sleep 1
done

echo 'Config files'

# Configuração do Babel para NativeWind
cat <<EOT >> babel.config.js
module.exports = function (api) {
  api.cache(true);
  return {
    presets: [
      ["babel-preset-expo", { jsxImportSource: "nativewind" }],
      "nativewind/babel",
    ],
  };
};
EOT

cat <<EOT >> tailwind.config.js
/** @type {import('tailwindcss').Config} */
module.exports = {
  // NOTE: Update this to include the paths to all of your component files.
  content: ["./src/app/**/*.{ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {},
  },
  plugins: [],
}
EOT

cat <<EOT >> src/styles/global.css
@tailwind base;
@tailwind components;
@tailwind utilities;
EOT

cat <<EOT >> metro.config.js
const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require('nativewind/metro');

const config = getDefaultConfig(__dirname)

module.exports = withNativeWind(config, { input: './src/styles/global.css' })
EOT

cat <<EOT >> nativewind-env.d.ts
/// <reference types="nativewind/types" />
EOT

# Adição do TypeScript
# npx expo install typescript
rm tsconfig.json
touch tsconfig.json

cat <<EOT >> tsconfig.json
{
  "extends": "expo/tsconfig.base",
  "compilerOptions": {
    "strict": true,
    "paths": {
      "@/*": [
        "./src/*"
      ]
    }
  },
  "include": [
    "**/*.ts",
    "**/*.tsx",
    ".expo/types/**/*.ts",
    "expo-env.d.ts"
  ]
}
EOT

cat <<EOT >> src/app/_layout.tsx
import Slot from "expo-router/Slot";

import "../global.css"

export default function Layout() {
  return (
    <Slot />
  )
}
EOT

cat <<EOT >> src/app/index.tsx
import { Text, View } from 'react-native'

export default function Page() {
  return (
    <View className="flex-1 items-center justify-center">
      <Text>Hello World!</Text>
    </View>
  )
}
EOT

echo "Configuração completa!"
