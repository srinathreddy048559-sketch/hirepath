import React from "react";
import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";

const styles = StyleSheet.create({
  page: { padding: 28, fontSize: 11, color: "#111" },
  h1: { fontSize: 16, marginBottom: 8, fontWeight: 700 },
  bullet: { marginLeft: 10, marginBottom: 2 },
});

function splitMarkdown(md: string): Array<{ kind: "h1" | "p" | "li"; text: string }> {
  return md
    .split(/\r?\n/)
    .map((line) => {
      const t = line.trim();
      if (!t) return null;
      if (/^#\s+/.test(t)) return { kind: "h1" as const, text: t.replace(/^#\s+/, "") };
      if (/^[-*•]\s+/.test(t)) return { kind: "li" as const, text: t.replace(/^[-*•]\s+/, "") };
      return { kind: "p" as const, text: t };
    })
    .filter(Boolean) as Array<{ kind: "h1" | "p" | "li"; text: string }>;
}

export default function ResumePDF({ markdown }: { markdown: string }) {
  const blocks = splitMarkdown(markdown || "");
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View>
          {blocks.map((b, i) =>
            b.kind === "h1" ? (
              <Text key={i} style={styles.h1}>{b.text}</Text>
            ) : b.kind === "li" ? (
              <Text key={i} style={styles.bullet}>• {b.text}</Text>
            ) : (
              <Text key={i} style={{ marginBottom: 4 }}>{b.text}</Text>
            )
          )}
        </View>
      </Page>
    </Document>
  );
}
