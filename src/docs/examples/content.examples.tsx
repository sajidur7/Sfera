import { useState } from 'react';
import { AspectRatio, Avatar, AvatarGroup, Blockquote, Carousel, Citation, Code, CodeBlock, Divider, Heading, HStack, Kbd, Markdown, Text, Thumbnail, Token, VisuallyHidden, VStack } from '../../sfera';
import { sampleImages } from '../../data/mock';

// #region Headings
export function Headings() {
  return (
    <VStack gap={3}>
      <Heading level={1} size="display">Calm by default</Heading>
      <Heading level={2} size="h1">Records overview</Heading>
      <Heading level={3} size="h2">Pipeline this quarter</Heading>
      <Heading level={4} size="h3">Recent activity</Heading>
    </VStack>
  );
}
// #endregion

// #region TextExample
export function TextExample() {
  return (
    <VStack gap={2}>
      <Text size="lg">Large body for intros and empty states.</Text>
      <Text>Default body text at 14px with a 1.55 line height.</Text>
      <Text size="sm" tone="muted">Secondary text for descriptions and metadata.</Text>
      <Text size="xs" mono tone="subtle">GEIST MONO · SMALL LABELS · 12PX</Text>
      <Text numeric weight="medium">$128,450.00 · 1,204 records</Text>
    </VStack>
  );
}
// #endregion

// #region Avatars
export function Avatars() {
  return (
    <VStack gap={5} align="center">
      {/* pairs, so a narrow screen wraps 2 + 2 instead of 3 + 1 */}
      <HStack gap={4} wrap justify="center">
        <HStack gap={4}>
          <Avatar name="Olive Usher" size="2xl" presence="online" />
          <Avatar name="Ana Ruiz" size="2xl" presence="away" />
        </HStack>
        <HStack gap={4}>
          <Avatar name="Ben Ueda" size="2xl" presence="busy" />
          <Avatar name="Theo Park" size="2xl" presence="offline" />
        </HStack>
      </HStack>
      <HStack gap={3} wrap justify="center" align="center">
        <Avatar name="Mira Chen" size="xs" presence="online" />
        <Avatar name="Theo Park" size="sm" presence="away" />
        <Avatar name="Ana Ruiz" size="md" presence="busy" />
        <Avatar name="Jonas Weber" size="lg" presence="offline" />
        <Avatar name="Lea Moss" size="xl" presence="online" />
        <Avatar name="Northwind" size="xl" square presence="online" />
      </HStack>
      <AvatarGroup names={['Mira Chen', 'Theo Park', 'Ana Ruiz', 'Jonas Weber', 'Lea Moss', 'Sam Ito']} max={4} size="md" />
    </VStack>
  );
}
// #endregion

// #region KeyCaps
export function KeyCaps() {
  return (
    <VStack gap={3} align="center">
      <HStack gap={3} wrap justify="center">
        <Kbd keys={['mod', 'k']} />
        <Kbd keys={['mod', 'shift', 'p']} />
        <Kbd keys={['alt', 'enter']} />
        <Kbd keys={['ctrl', 'backspace']} />
        <Kbd keys={['up', 'down']} />
      </HStack>
      <Text size="sm" tone="muted">Press <Kbd keys={['mod', 'k']} /> to search.</Text>
    </VStack>
  );
}
// #endregion

// #region Dividers
export function Dividers() {
  return (
    <VStack gap={4}>
      <Text size="sm">Above the line</Text>
      <Divider />
      <Divider label="or continue with" />
      <HStack gap={3}>
        <Text size="sm">Left</Text>
        <Divider orientation="vertical" />
        <Text size="sm">Right</Text>
      </HStack>
    </VStack>
  );
}
// #endregion

// #region CodeExample
export function CodeExample() {
  return (
    <VStack gap={3}>
      <Text size="sm">
        Wrap the app in <Code>{'<SferaProvider>'}</Code> once.
      </Text>
      <CodeBlock code={`import { SferaProvider, Button } from './sfera';\n\nexport default function App() {\n  return (\n    <SferaProvider defaultAccent="blue">\n      <Button variant="primary">Hello</Button>\n    </SferaProvider>\n  );\n}`} />
    </VStack>
  );
}
// #endregion

// #region BlockquoteExample
export function BlockquoteExample() {
  return <Blockquote cite="Ana Ruiz, Kiln">We moved every order screen to wells and cards. Support tickets about “where is my status” dropped by half.</Blockquote>;
}
// #endregion

// #region CitationExample
export function CitationExample() {
  return (
    <VStack gap={3}>
      <Text>
        StyleX compiles styles to atomic CSS at build time<Citation n={1} href="https://stylexjs.com/docs/learn/" title="StyleX: Introduction" /> and supports theming with defineVars<Citation n={2} href="https://stylexjs.com/docs/learn/theming/defining-variables/" title="Defining variables" />.
      </Text>
      <HStack gap={2} wrap>
        <Citation variant="source" href="https://stylexjs.com/docs/learn/" title="StyleX docs" />
        <Citation variant="source" href="https://lucide.dev/icons/" title="Lucide icons" />
      </HStack>
    </VStack>
  );
}
// #endregion

// #region MarkdownExample
export function MarkdownExample() {
  return (
    <Markdown
      source={`## Release 0.2\nSfera now covers the **full library**. Highlights:\n\n- Date inputs with a real calendar\n- A command palette, opened with \`mod+k\`\n- Chat components for assistant screens\n\n> Every component still ships as one file per group.\n\nRead the [StyleX docs](https://stylexjs.com) for build setup.`}
    />
  );
}
// #endregion

// #region MediaExample
export function MediaExample() {
  const [show, setShow] = useState<number | null>(null);
  return (
    <VStack gap={4}>
      <div style={{ maxWidth: 420, width: '100%' }}>
        <AspectRatio ratio={16 / 10}>
          <img src={sampleImages[0].src} alt={sampleImages[0].alt} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        </AspectRatio>
      </div>
      <HStack gap={2} wrap>
        {sampleImages.map((im, i) => (
          <Thumbnail key={i} src={im.src} alt={im.alt} size={i === 0 ? 'lg' : i === 1 ? 'md' : 'sm'} onClick={() => setShow(i)} />
        ))}
        <Thumbnail alt="Invoice PDF" size="md" />
      </HStack>
      <Text size="sm" tone="muted">{show === null ? 'Click a thumbnail.' : `Clicked: ${sampleImages[show].caption}`}</Text>
    </VStack>
  );
}
// #endregion

// #region TokenExample
export function TokenExample() {
  const [tags, setTags] = useState(['Enterprise', 'EU region', 'Renewal Q4']);
  return (
    <VStack gap={3} align="center">
      <HStack gap={2} wrap justify="center">
        {tags.map((t) => (
          <Token key={t} onRemove={() => setTags(tags.filter((x) => x !== t))}>{t}</Token>
        ))}
        <Token selected>Owner: Mira</Token>
      </HStack>
      <Text size="sm" tone="muted">
        A screen-reader-only label follows this sentence.<VisuallyHidden> (This text is only for screen readers.)</VisuallyHidden>
      </Text>
    </VStack>
  );
}
// #endregion

// #region CarouselExample
export function CarouselExample() {
  return (
    <Carousel
      label="Recent shoots"
      perView={2}
      slides={sampleImages.map((im) => (
        <figure key={im.src} style={{ margin: 0 }}>
          <AspectRatio ratio={4 / 3}>
            <img src={im.src} alt={im.alt} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 12, display: 'block' }} />
          </AspectRatio>
          <figcaption style={{ fontSize: 13, marginTop: 8 }}>{im.caption}</figcaption>
        </figure>
      ))}
    />
  );
}
// #endregion
