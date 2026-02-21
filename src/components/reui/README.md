# REUI Components

This directory contains all REUI (ReUI) components for your project.

## What is REUI?

REUI is a free & open-source library of production-ready components built with:
- React 19
- TypeScript
- Tailwind CSS v4
- Radix UI primitives
- Framer Motion

## Installation Status

✅ All 68 requested components have been successfully installed!

## Component List

All components are available in this directory. See `REUI_COMPONENTS.md` in the project root for a complete categorized list.

## Usage Example

```tsx
import { Button } from "@/components/reui/button"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/reui/card"
import { Input } from "@/components/reui/input"

export default function MyComponent() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Example Card</CardTitle>
      </CardHeader>
      <CardContent>
        <Input placeholder="Enter text..." />
        <Button>Submit</Button>
      </CardContent>
    </Card>
  )
}
```

## Path Alias

Components use the `@/components/reui` path alias configured in your `components.json`:

```json
{
  "aliases": {
    "reui": "@/components/reui"
  }
}
```

## Documentation

For detailed component documentation, examples, and API references, visit:
https://reui.io/docs

## Support

- GitHub: https://github.com/keenthemes/reui
- Twitter: @reui_io
- Email: hello@reui.io

## License

MIT License - Free to use in personal and commercial projects.
