import type { PortableText, PortableTextBlock, PortableTextSpan } from '../types/sanity';

/**
 * Tiny Portable Text → HTML renderer covering exactly what the Studio's
 * blockContent type allows: paragraphs, h2/h3, blockquote, bullet/number lists,
 * strong/em and links. Output is escaped; use with `set:html`.
 */

const escapeHtml = (s: string) =>
  s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

const isSafeHref = (href: string) => /^(https?:|mailto:|tel:|\/)/i.test(href.trim());

function renderSpan(span: PortableTextSpan, block: PortableTextBlock): string {
  let html = escapeHtml(span.text).replace(/\n/g, '<br>');
  for (const mark of span.marks ?? []) {
    switch (mark) {
      case 'strong':
        html = `<strong>${html}</strong>`;
        break;
      case 'em':
        html = `<em>${html}</em>`;
        break;
      case 'underline':
        html = `<u>${html}</u>`;
        break;
      case 'strike-through':
        html = `<s>${html}</s>`;
        break;
      case 'code':
        html = `<code>${html}</code>`;
        break;
      default: {
        const def = block.markDefs?.find((d) => d._key === mark);
        if (def?._type === 'link' && typeof def.href === 'string' && isSafeHref(def.href)) {
          const target = def.blank === false ? '' : ' target="_blank" rel="noopener noreferrer"';
          html = `<a href="${escapeHtml(def.href)}"${target}>${html}</a>`;
        }
      }
    }
  }
  return html;
}

function renderChildren(block: PortableTextBlock): string {
  return (block.children ?? [])
    .filter((c) => c._type === 'span')
    .map((c) => renderSpan(c, block))
    .join('');
}

function renderBlock(block: PortableTextBlock): string {
  const inner = renderChildren(block);
  switch (block.style) {
    case 'h2':
      return `<h2>${inner}</h2>`;
    case 'h3':
      return `<h3>${inner}</h3>`;
    case 'h4':
      return `<h4>${inner}</h4>`;
    case 'blockquote':
      return `<blockquote>${inner}</blockquote>`;
    default:
      return inner.trim() === '' ? '' : `<p>${inner}</p>`;
  }
}

export function portableTextToHtml(blocks: PortableText | null | undefined): string {
  if (!blocks?.length) return '';

  const out: string[] = [];
  // Stack of open lists: [tag, level]
  const open: Array<{ tag: 'ul' | 'ol'; level: number }> = [];

  const closeTo = (level: number) => {
    while (open.length && open[open.length - 1]!.level > level) {
      out.push(`</li></${open.pop()!.tag}>`);
    }
  };

  for (const block of blocks) {
    if (block._type !== 'block') continue;

    if (!block.listItem) {
      closeTo(0);
      out.push(renderBlock(block));
      continue;
    }

    const tag = block.listItem === 'number' ? 'ol' : 'ul';
    const level = block.level ?? 1;
    const top = open[open.length - 1];

    if (!top || level > top.level) {
      // Nested list opens inside the current <li>
      out.push(`<${tag}><li>${renderChildren(block)}`);
      open.push({ tag, level });
    } else {
      closeTo(level);
      const current = open[open.length - 1];
      if (current && current.tag !== tag) {
        out.push(`</li></${current.tag}>`);
        open.pop();
        out.push(`<${tag}><li>${renderChildren(block)}`);
        open.push({ tag, level });
      } else if (current) {
        out.push(`</li><li>${renderChildren(block)}`);
      } else {
        out.push(`<${tag}><li>${renderChildren(block)}`);
        open.push({ tag, level });
      }
    }
  }
  closeTo(0);
  return out.join('');
}

/** Plain-text version, handy for meta descriptions. */
export function portableTextToPlain(blocks: PortableText | null | undefined, max = 160): string {
  if (!blocks?.length) return '';
  const text = blocks
    .filter((b) => b._type === 'block')
    .map((b) => (b.children ?? []).map((c) => c.text).join(''))
    .join(' ')
    .replace(/\s+/g, ' ')
    .trim();
  return text.length > max ? `${text.slice(0, max - 1).trimEnd()}…` : text;
}
