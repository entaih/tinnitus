import React, { useMemo } from 'react';
import { View, type TextStyle } from 'react-native';
import { useTheme } from '@/theme';
import { Text } from '@/components/Text';
import { useT } from '@/i18n';

/**
 * Minimal markdown renderer for content bodies (modules.ts, articles.ts):
 * - blank-line separated paragraphs; "## " headings; "- " bullets; "1. " numbered items;
 * - "| a | b | c |" table rows (consecutive lines; first row is the header);
 * - inline **bold** and [n] / [n, m] citation markers (tappable when onCitation is given).
 */
export interface MarkdownLiteProps {
  text: string;
  /** Font scale for the article font-size control (1 = normal). */
  scale?: number;
  /** Called with the 1-based citation number when a [n] marker is tapped. */
  onCitation?: (n: number) => void;
}

type Block =
  | { kind: 'p'; text: string }
  | { kind: 'h'; text: string }
  | { kind: 'ul'; items: string[] }
  | { kind: 'ol'; items: string[] }
  | { kind: 'table'; rows: string[][] };

export function parseMarkdownLite(src: string): Block[] {
  const out: Block[] = [];
  const chunks = src.replace(/\r/g, '').split(/\n\s*\n/);
  for (const chunk of chunks) {
    const lines = chunk.split('\n').map((l) => l.trim()).filter((l) => l.length);
    if (!lines.length) continue;
    let i = 0;
    while (i < lines.length) {
      const line = lines[i];
      if (line.startsWith('## ')) { out.push({ kind: 'h', text: line.slice(3).trim() }); i++; continue; }
      if (line.startsWith('|')) {
        const rows: string[][] = [];
        while (i < lines.length && lines[i].startsWith('|')) { rows.push(lines[i].split('|').slice(1, -1).map((c) => c.trim())); i++; }
        out.push({ kind: 'table', rows });
        continue;
      }
      if (/^[-•] /.test(line)) {
        const items: string[] = [];
        while (i < lines.length && /^[-•] /.test(lines[i])) { items.push(lines[i].slice(2).trim()); i++; }
        out.push({ kind: 'ul', items });
        continue;
      }
      if (/^\d+\. /.test(line)) {
        const items: string[] = [];
        while (i < lines.length && /^\d+\. /.test(lines[i])) { items.push(lines[i].replace(/^\d+\. /, '').trim()); i++; }
        out.push({ kind: 'ol', items });
        continue;
      }
      // paragraph: gather consecutive plain lines (indented continuation lines included)
      const para: string[] = [];
      while (i < lines.length && !lines[i].startsWith('## ') && !lines[i].startsWith('|') && !/^[-•] /.test(lines[i]) && !/^\d+\. /.test(lines[i])) { para.push(lines[i].trim()); i++; }
      out.push({ kind: 'p', text: para.join('\n') });
    }
  }
  return out;
}

/** Inline renderer: **bold** and [n] markers. */
export function InlineText({ text, style, baseVariant = 'body', onCitation, scale = 1 }: { text: string; style?: TextStyle; baseVariant?: 'body' | 'bodySmall' | 'bodyStrong' | 'h3'; onCitation?: (n: number) => void; scale?: number }) {
  const { colors, type } = useTheme();
  const t = useT();
  const parts = useMemo(() => text.split(/(\*\*[^*]+\*\*|\[\d+(?:,\s*\d+)*\])/g).filter(Boolean), [text]);
  const base = type[baseVariant];
  const scaled: TextStyle = { fontSize: base.fontSize * scale, lineHeight: base.lineHeight * scale };
  return (
    <Text variant={baseVariant} style={[scaled, style ?? {}]}>
      {parts.map((p, idx) => {
        if (p.startsWith('**') && p.endsWith('**')) return <Text key={idx} variant={baseVariant} style={[scaled, { fontWeight: '600' }]}>{p.slice(2, -2)}</Text>;
        const m = p.match(/^\[(\d+(?:,\s*\d+)*)\]$/);
        if (m) {
          const nums = m[1].split(',').map((x) => parseInt(x.trim(), 10));
          return (
            <Text key={idx} variant={baseVariant} style={[scaled, { color: colors.primary, fontWeight: '600' }]}>
              {' ['}
              {nums.map((n, j) => (
                <Text
                  key={n}
                  variant={baseVariant}
                  style={[scaled, { color: colors.primary, fontWeight: '600' }]}
                  onPress={onCitation ? () => onCitation(n) : undefined}
                  accessibilityRole={onCitation ? 'link' : undefined}
                  accessibilityLabel={onCitation ? t('edu.citation.a11y', { n }) : undefined}
                  suppressHighlighting
                >
                  {j > 0 ? ', ' : ''}{n}
                </Text>
              ))}
              {']'}
            </Text>
          );
        }
        return <React.Fragment key={idx}>{p}</React.Fragment>;
      })}
    </Text>
  );
}

export function MarkdownLite({ text, scale = 1, onCitation }: MarkdownLiteProps) {
  const { colors, space, radius } = useTheme();
  const blocks = useMemo(() => parseMarkdownLite(text), [text]);
  return (
    <View style={{ gap: space[3] }}>
      {blocks.map((b, i) => {
        switch (b.kind) {
          case 'h':
            return <InlineText key={i} text={b.text} baseVariant="h3" scale={scale} onCitation={onCitation} style={{ marginTop: i === 0 ? 0 : space[2] }} />;
          case 'ul':
          case 'ol':
            return (
              <View key={i} style={{ gap: space[2] }}>
                {b.items.map((it, j) => (
                  <View key={j} style={{ flexDirection: 'row', gap: space[2], paddingLeft: space[1] }}>
                    <Text variant="body" tone="primary" style={{ fontSize: 17 * scale, lineHeight: 26 * scale, minWidth: b.kind === 'ol' ? 22 * scale : 12 }}>{b.kind === 'ol' ? `${j + 1}.` : '•'}</Text>
                    <View style={{ flex: 1 }}><InlineText text={it} scale={scale} onCitation={onCitation} /></View>
                  </View>
                ))}
              </View>
            );
          case 'table':
            return (
              <View key={i} style={{ borderWidth: 1, borderColor: colors.border, borderRadius: radius.md, overflow: 'hidden' }} accessibilityRole="summary">
                {b.rows.map((row, r) => (
                  <View key={r} style={{ flexDirection: 'row', backgroundColor: r === 0 ? colors.tinted : r % 2 ? colors.skeleton : colors.card, borderTopWidth: r ? 1 : 0, borderTopColor: colors.border }}>
                    {row.map((cell, c) => (
                      <View key={c} style={{ flex: c === 0 ? 1.1 : 1.4, padding: space[2], borderLeftWidth: c ? 1 : 0, borderLeftColor: colors.border }}>
                        <InlineText text={cell} baseVariant={r === 0 ? 'bodyStrong' : 'bodySmall'} scale={Math.min(scale, 1.15)} onCitation={onCitation} />
                      </View>
                    ))}
                  </View>
                ))}
              </View>
            );
          default:
            return <InlineText key={i} text={b.text} scale={scale} onCitation={onCitation} />;
        }
      })}
    </View>
  );
}
