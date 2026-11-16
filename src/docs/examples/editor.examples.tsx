import { useState } from 'react';
import { RichTextEditor, RichTextView, Text, VStack } from '../../sfera';

// #region EditorExample
const initial = '<p>Kick-off notes for <b>Q3 launch</b>.</p><ul><li>Pricing page copy</li><li>Email sequence</li></ul><p>Try typing www.northwind.com then a space.</p>';

export function EditorExample() {
  const [html, setHtml] = useState(initial);
  return (
    <VStack gap={4}>
      <RichTextEditor label="Meeting notes" defaultValue={initial} onChange={setHtml} />
      <Text size="xs" tone="subtle" mono>RICH TEXT VIEW (LIVE)</Text>
      <RichTextView html={html} />
    </VStack>
  );
}
// #endregion
