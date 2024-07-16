import { GluegunCommand } from 'gluegun';
import { execa } from 'execa';
import fs from 'fs-extra';
import { defaultOptions, DEFAULT_APP_NAME } from '../constants';
import { CliResults } from '../types';

const command: GluegunCommand = {
  name: 'create',
  description: 'Create a new Expo project',
  run: async (toolbox) => {
    const { parameters, print, prompt } = toolbox;
    const { first: projectName = DEFAULT_APP_NAME, options } = parameters;
    let cliResults: CliResults = { ...defaultOptions, projectName };

    try {
      // Prompt for project name if not provided
      if (!projectName) {
        const name = await prompt.ask({
          type: 'input',
          name: 'projectName',
          message: 'What do you want to name your project?',
          initial: DEFAULT_APP_NAME,
        });
        cliResults.projectName = name.projectName || DEFAULT_APP_NAME;
      }

      // Create Expo project
      await execa('npx', ['create-expo-app', cliResults.projectName, '--template']);
      process.chdir(cliResults.projectName);

      // Install dependencies
      await execa('npm', ['install', 'nativewind', '@clerk/clerk-expo', 'expo-router', 'react-native-reanimated', 'tailwindcss']);

      // Configure Babel
      const babelConfig = `
module.exports = function (api) {
  api.cache(true);
  return {
    presets: [
      ["babel-preset-expo", { jsxImportSource: "nativewind" }],
      "nativewind/babel",
    ],
  };
};`;
      await fs.writeFile('babel.config.js', babelConfig);

      const cssConfig = `
      module.exports = function(api) {
          api.cache(true);
          return {
              presets: ['babel-preset-expo'],
              plugins: ['nativewind/babel'],
          };
      };`;
      await fs.writeFile('./src/styles/global.css', cssConfig);

      const metroConfig = `
      const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require('nativewind/metro');

const config = getDefaultConfig(__dirname)

module.exports = withNativeWind(config, { input: './src/styles/global.css' })`;

      await fs.writeFile('metro.config.js', metroConfig);

      const tailwindConfig = `
     /** @type {import('tailwindcss').Config} */
module.exports = {
  // NOTE: Update this to include the paths to all of your component files.
  content: ["./src/app/**/*.{ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {},
  },
  plugins: [],
}`;
      await fs.writeFile('tailwind.config.js', tailwindConfig);

      await execa('npx', ['expo', 'install', 'typescript']);

      const tsConfig = `
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
}`;
      await fs.writeFile('tsconfig.json', tsConfig);

      const appConfig = `
import { View, Text } from 'react-native';

export default function Home() {
  return (
      <View className="w-full flex-1 items-center justify-center">
        <Text>Hello World</Text>
      </View>
  );
}
`;
      await fs.writeFile('src/app/index.tsx', appConfig);

      const layoutConfig = `
      import { Slot } from 'expo-router'
import '../styles/global.css'

export default function Layout() {
  return (
      <Slot />
  )
}
      `;
            await fs.writeFile('src/app/_layout.tsx', layoutConfig);

      const nativewindTypes = '/// <reference types="nativewind/types" />';
      await fs.writeFile('nativewind-env.d.ts', nativewindTypes);

      await fs.remove('app')
      await fs.remove('constants')
      await fs.remove('components')

      print.success('Project setup complete!');
    } catch (error: Error | any) {
      print.error('Failed to create project: ' + error.message);
      if (error instanceof Error) {
        print.error(error.message);
      } else {
        print.error(String(error));
      }
    }
  },
};

export default command;
