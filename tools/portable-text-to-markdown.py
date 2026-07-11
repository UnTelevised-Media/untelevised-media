#!/usr/bin/env python3
"""
PORTABLE TEXT TO MARKDOWN CONVERTER

Converts Sanity Portable Text blocks back to Markdown with rich text support.

Converts:
- Block styles (normal, h1-h6, blockquote) → markdown equivalents
- Marks (strong, em, code) → **text**, *text*, `text`
- Links → [text](url)
- Lists (bullet, number) → -, 1., 2., etc.
- Tables → pipe-delimited markdown tables
- Images → <!-- IMAGE ... --> comment markers
- Code blocks → ```language ... ```
- Mermaid diagrams → ```mermaid ... ```

Usage:
    python tools/portable-text-to-markdown.py <portable-text-json> [--output <output-file>]
"""

import json
import sys
from pathlib import Path


def resolve_mark_defs(children, mark_defs):
    """
    Resolve mark definitions into a lookup dict.

    Args:
        children: list of span objects
        mark_defs: list of mark definition objects (mostly for links)

    Returns:
        dict mapping mark key to mark definition
    """
    mark_lookup = {}
    if mark_defs:
        for mark_def in mark_defs:
            mark_key = mark_def.get("_key")
            if mark_key:
                mark_lookup[mark_key] = mark_def
    return mark_lookup


def render_inline_children(children, mark_defs):
    """
    Render inline children (spans) with marks into markdown.

    Args:
        children: list of span objects
        mark_defs: list of mark definitions

    Returns:
        markdown string with inline formatting
    """
    mark_lookup = resolve_mark_defs(children, mark_defs)
    result = []

    for child in children:
        if child.get("_type") != "span":
            continue

        text = child.get("text", "")
        marks = child.get("marks", [])

        # Apply marks in order: links, then code, then em, then strong
        # (stronger emphasis should wrap weaker)

        # Check for link mark
        link_url = None
        non_link_marks = []
        for mark in marks:
            if mark in mark_lookup:
                mark_def = mark_lookup[mark]
                if mark_def.get("_type") == "link":
                    link_url = mark_def.get("href", "")
            else:
                non_link_marks.append(mark)

        # Apply non-link marks
        formatted_text = text
        if "code" in non_link_marks:
            formatted_text = f"`{formatted_text}`"
        if "em" in non_link_marks:
            formatted_text = f"*{formatted_text}*"
        if "strong" in non_link_marks:
            formatted_text = f"**{formatted_text}**"

        # Apply link mark
        if link_url:
            formatted_text = f"[{formatted_text}]({link_url})"

        result.append(formatted_text)

    return "".join(result)


def render_block(block):
    """
    Render a single block into markdown.

    Args:
        block: portable text block object

    Returns:
        markdown string for this block
    """
    block_type = block.get("_type", "block")

    # Standard text block
    if block_type == "block":
        style = block.get("style", "normal")
        children = block.get("children", [])
        mark_defs = block.get("markDefs", [])

        inline_text = render_inline_children(children, mark_defs)

        if style == "normal":
            return inline_text
        elif style == "h1":
            return f"# {inline_text}"
        elif style == "h2":
            return f"## {inline_text}"
        elif style == "h3":
            return f"### {inline_text}"
        elif style == "h4":
            return f"#### {inline_text}"
        elif style == "h5":
            return f"##### {inline_text}"
        elif style == "h6":
            return f"###### {inline_text}"
        elif style == "blockquote":
            # Multi-line blockquotes: each line gets >
            lines = inline_text.split('\n')
            return '\n'.join(f"> {line}" for line in lines)
        else:
            return inline_text

    # List item (bullet or numbered)
    elif block_type == "block" and ("listItem" in block):
        children = block.get("children", [])
        mark_defs = block.get("markDefs", [])
        list_item_type = block.get("listItem", "bullet")
        level = block.get("level", 0)

        inline_text = render_inline_children(children, mark_defs)
        indent = "  " * level

        if list_item_type == "bullet":
            return f"{indent}- {inline_text}"
        else:  # number
            return f"{indent}1. {inline_text}"

    # Image block
    elif block_type == "image":
        alt = block.get("alt", "")
        asset_ref = block.get("asset", {}).get("_ref", "")
        caption = block.get("caption", "")
        credit = block.get("credit", "")

        parts = [f'alt="{alt}"']
        if asset_ref:
            parts.append(f'asset="{asset_ref}"')
        if caption:
            parts.append(f'caption="{caption}"')
        if credit:
            parts.append(f'credit="{credit}"')

        return f"<!-- IMAGE {' '.join(parts)} -->"

    # Code block
    elif block_type == "code":
        code_content = block.get("code", "")
        language = block.get("language", "text")
        return f"```{language}\n{code_content}\n```"

    # Mermaid diagram
    elif block_type == "mermaidDiagram":
        code_content = block.get("code", "")
        return f"```mermaid\n{code_content}\n```"

    # Table
    elif block_type == "table":
        rows = block.get("rows", [])
        if not rows:
            return ""

        markdown_rows = []
        for idx, row in enumerate(rows):
            cells = row.get("cells", [])
            row_text = " | ".join(str(cell) for cell in cells)
            markdown_rows.append(f"| {row_text} |")

            # Add separator after header row
            if idx == 0:
                separator = " | ".join(["---"] * len(cells))
                markdown_rows.append(f"| {separator} |")

        return "\n".join(markdown_rows)

    return ""


def portable_text_to_markdown(blocks):
    """
    Convert portable text blocks to markdown.

    Args:
        blocks: list of portable text block objects

    Returns:
        markdown string
    """
    if not blocks:
        return ""

    markdown_lines = []

    for block in blocks:
        rendered = render_block(block)
        if rendered:
            markdown_lines.append(rendered)

    # Join blocks with blank lines (except after list items which handle their own spacing)
    result = []
    for i, line in enumerate(markdown_lines):
        result.append(line)
        # Add blank line between blocks, but not after list items or before next list item
        if i < len(markdown_lines) - 1:
            next_line = markdown_lines[i + 1]
            is_current_list = line.lstrip().startswith(("- ", "1. "))
            is_next_list = next_line.lstrip().startswith(("- ", "1. "))

            # Add blank line unless both current and next are list items
            if not (is_current_list and is_next_list):
                result.append("")

    # Clean up excessive blank lines
    final_result = []
    prev_blank = False
    for line in result:
        if line.strip() == "":
            if not prev_blank:
                final_result.append("")
                prev_blank = True
        else:
            final_result.append(line)
            prev_blank = False

    return "\n".join(final_result).strip()


def main():
    if len(sys.argv) < 2:
        print("Usage: python tools/portable-text-to-markdown.py <portable-text-json> [--output <output-file>]")
        print()
        print("Options:")
        print("  --output <file>   Save markdown to file (default: stdout)")
        sys.exit(1)

    input_file = Path(sys.argv[1])
    output_file = None

    i = 2
    while i < len(sys.argv):
        arg = sys.argv[i]
        if arg == "--output" and i + 1 < len(sys.argv):
            output_file = Path(sys.argv[i + 1])
            i += 2
        else:
            i += 1

    # Read portable text JSON
    try:
        with open(input_file, 'r', encoding='utf-8') as f:
            content = f.read()
            # Handle both array of blocks and object with 'blocks' key
            data = json.loads(content)
            if isinstance(data, dict) and "blocks" in data:
                blocks = data["blocks"]
            elif isinstance(data, list):
                blocks = data
            else:
                blocks = [data]
    except FileNotFoundError:
        print(f"Error: File not found: {input_file}", file=sys.stderr)
        sys.exit(1)
    except json.JSONDecodeError as e:
        print(f"Error: Invalid JSON in {input_file}: {e}", file=sys.stderr)
        sys.exit(1)

    # Convert to markdown
    markdown_content = portable_text_to_markdown(blocks)

    if output_file:
        with open(output_file, 'w', encoding='utf-8') as f:
            f.write(markdown_content)
        print(f"Markdown saved to: {output_file}", file=sys.stderr)
    else:
        print(markdown_content)


if __name__ == '__main__':
    main()
