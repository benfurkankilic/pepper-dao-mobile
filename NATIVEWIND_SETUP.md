# NativeWind Setup Guide

## ✅ Installation Complete

NativeWind v4 (stable) has been successfully installed and configured with a **retro gaming bitmap style** theme!

## 📦 Installed Packages

- `nativewind` - Tailwind CSS for React Native (v4 stable)
- `tailwindcss@^3.4.17` - Tailwind CSS v3
- `prettier-plugin-tailwindcss@^0.5.11` - Prettier plugin for Tailwind
- `react-native-reanimated` - Already installed
- `react-native-safe-area-context` - Already installed

## 📁 Configuration Files Created

### 1. `metro.config.js`
Metro bundler configured with NativeWind support.

### 2. `global.css`
Global CSS file with standard Tailwind directives:
```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

### 3. `babel.config.js`
Babel configuration with NativeWind preset for JSX transformation.

### 4. `tailwind.config.js`
Custom Tailwind configuration with **retro gaming theme**:

**Colors:**
- `retro-pink`: #FF006E
- `retro-blue`: #0080FF
- `retro-purple`: #8000FF
- `retro-green`: #00FF80
- `retro-yellow`: #FFD600
- `retro-cyan`: #00FFFF
- `retro-orange`: #FF6B00
- `retro-dark`: #0A0A0F (background)
- `neon-pink`, `neon-blue`, `neon-green` (accent colors)

**Custom Shadows:**
- `shadow-retro`: 4px solid shadow (3D effect)
- `shadow-retro-sm`, `shadow-retro-lg`, `shadow-retro-xl`
- `shadow-neon-pink`, `shadow-neon-blue` (glowing effects)

**Border Widths:**
- `border-3`, `border-5`, `border-6` for chunky retro borders

### 5. `nativewind-env.d.ts`
TypeScript definitions for NativeWind:
```typescript
/// <reference types="nativewind/types" />
```

### 6. `app/_layout.tsx`
Updated to import `global.css` at the top.

### 7. `app.json`
Added Metro bundler configuration for web support.

## 🚀 Usage

### Basic Styling
Use the `className` prop on React Native components:

```tsx
import { View, Text, Pressable } from 'react-native';

function MyComponent() {
  return (
    <View className="flex-1 bg-retro-dark p-4">
      <Text className="text-white text-xl">Hello!</Text>
    </View>
  );
}
```

### Retro Gaming Button Pattern
```tsx
<Pressable className="bg-retro-pink border-4 border-white px-8 py-4 active:translate-x-1 active:translate-y-1">
  <Text className="text-white text-center uppercase tracking-wider">
    Press Start
  </Text>
</Pressable>
```

### Retro Card Component
```tsx
<View className="border-4 border-white bg-retro-purple p-6">
  <Text className="text-white text-lg uppercase mb-2">Title</Text>
  <Text className="text-white text-sm">Content goes here</Text>
</View>
```

## 🎨 Design System Colors

Use these color classes throughout your app:

**Backgrounds:**
- `bg-retro-dark` - Main dark background
- `bg-retro-purple` - Purple accent background
- `bg-retro-blue` - Blue accent background
- `bg-retro-pink` - Pink accent background

**Text:**
- `text-white` - Primary text
- `text-retro-green` - Success/accent text
- `text-retro-pink` - Emphasis text

**Borders:**
- `border-white` - Primary borders
- `border-4` - Thick retro border
- `border-3`, `border-5` - Alternative thicknesses

## 🏃 Running the App

Start the development server with cache cleared:

```bash
npx expo start --clear
```

For iOS:
```bash
npm run ios
```

For Android:
```bash
npm run android
```

## 🐛 Troubleshooting

### If styles aren't applying:
1. Clear the cache: `npx expo start --clear`
2. Restart the Metro bundler
3. Rebuild the app if necessary

### Enable Debug Mode:
```bash
DEBUG=nativewind npx expo start --clear
```

### Verify Installation:
```tsx
import { verifyInstallation } from 'nativewind';

function App() {
  verifyInstallation(); // Call inside a component
  return <View>...</View>;
}
```

## 📚 Resources

- [NativeWind v5 Documentation](https://www.nativewind.dev/v5)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Expo Router Documentation](https://docs.expo.dev/router/introduction/)

## ✨ Example

Check `app/(tabs)/index.tsx` for a working example of the retro gaming UI!

