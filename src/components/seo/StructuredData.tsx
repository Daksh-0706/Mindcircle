/**
 * Renders one JSON-LD block as a `<script type="application/ld+json">` tag.
 *
 * `JSON.stringify` alone is not enough here: if any string in the data ever
 * contained a `<`, the browser would parse the rest of the payload as markup.
 * Escaping the `<` as `\u003c` keeps the script contents valid JSON while
 * making that impossible.
 */
export default function StructuredData({ data }: { data: object }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(data).replace(/</g, '\\u003c'),
      }}
    />
  )
}