# UI Components

Reusable UI components following the Pepper DAO retro gaming design system.

## Button

A retro-styled button component with haptic feedback, chunky borders, and pixel fonts.

### Usage

```tsx
import { Button } from '@/components/ui/button';

function MyComponent() {
  return (
    <>
      {/* Primary button (pink) */}
      <Button onPress={() => console.log('Pressed')} variant="primary">
        Click Me
      </Button>

      {/* Secondary button (white) */}
      <Button onPress={() => console.log('Pressed')} variant="secondary">
        Cancel
      </Button>

      {/* Success button (green) */}
      <Button onPress={() => console.log('Pressed')} variant="success">
        Connected
      </Button>

      {/* Disabled button */}
      <Button onPress={() => {}} disabled>
        Disabled
      </Button>

      {/* With custom className */}
      <Button onPress={() => {}} className="flex-1 mb-4">
        Full Width
      </Button>
    </>
  );
}
```

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `children` | `string` | *required* | Button text content |
| `onPress` | `() => void \| Promise<void>` | *required* | Function called on press |
| `variant` | `'primary' \| 'secondary' \| 'success'` | `'primary'` | Button style variant |
| `disabled` | `boolean` | `false` | Whether button is disabled |
| `className` | `string` | `''` | Additional Tailwind classes |

### Variants

- **Primary** (`variant="primary"`): Hot pink background (#FF006E), white text
- **Secondary** (`variant="secondary"`): White background, black text  
- **Success** (`variant="success"`): Neon green background (#00FF80), white text

### Features

- ✅ Automatic haptic feedback on press (light impact)
- ✅ Retro gaming aesthetic with 4px black borders
- ✅ Box shadow (4px 4px 0px black)
- ✅ Active state animation (translate + shadow removal)
- ✅ Disabled state (50% opacity)
- ✅ Pixel font (PPNeueBit-Bold)
- ✅ Uppercase text with wider letter spacing

### Design System Compliance

The Button component follows the Pepper DAO design system:
- Light mode styling (dark borders on light backgrounds)
- Chunky 4px borders
- Sharp corners (no border-radius)
- Solid shadows with no blur
- Retro gaming color palette
- Haptic feedback for tactile experience

### Used By

- `WalletConnectButton` - Wallet connection/status
- `OnboardingWizard` - Navigation buttons (Back, Next, Get Started)
- `WalletConnectionModal` - Connect and Explore buttons

### Related

- See `.cursor/rules/design-system.mdc` for full design guidelines
- See `.cursor/rules/ui-and-styling.mdc` for styling patterns

