#!/usr/bin/env python3
"""
ARTICLE ARCHIVER

Retrieves articles from Sanity and exports them as:
- [slug].md: Article body converted from Portable Text to Markdown
- [slug].json: All metadata (excluding sources field)

Usage:
    python tools/archive-articles.py [slug] [--output-dir archive/Articles]

Arguments:
    slug            Optional: archive only this article slug. If omitted, archives all.

Options:
    --output-dir    Output directory for archived articles (default: archive/Articles)
"""

import json
import sys
import subprocess
import os
from pathlib import Path
from datetime import datetime


def portable_text_to_markdown(blocks):
    """
    Convert portable text blocks to markdown inline.
    This is a simplified version to avoid subprocess overhead.
    """
    if not blocks:
        return ""

    def resolve_mark_defs(children, mark_defs):
        mark_lookup = {}
        if mark_defs:
            for mark_def in mark_defs:
                mark_key = mark_def.get("_key")
                if mark_key:
                    mark_lookup[mark_key] = mark_def
        return mark_lookup

    def render_inline_children(children, mark_defs):
        mark_lookup = resolve_mark_defs(children, mark_defs)
        result = []

        for child in children:
            if child.get("_type") != "span":
                continue

            text = child.get("text", "")
            marks = child.get("marks", [])

            link_url = None
            non_link_marks = []
            for mark in marks:
                if mark in mark_lookup:
                    mark_def = mark_lookup[mark]
                    if mark_def.get("_type") == "link":
                        link_url = mark_def.get("href", "")
                else:
                    non_link_marks.append(mark)

            formatted_text = text
            if "code" in non_link_marks:
                formatted_text = f"`{formatted_text}`"
            if "em" in non_link_marks:
                formatted_text = f"*{formatted_text}*"
            if "strong" in non_link_marks:
                formatted_text = f"**{formatted_text}**"

            if link_url:
                formatted_text = f"[{formatted_text}]({link_url})"

            result.append(formatted_text)

        return "".join(result)

    def render_block(block):
        block_type = block.get("_type", "block")

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
                lines = inline_text.split('\n')
                return '\n'.join(f"> {line}" for line in lines)
            else:
                return inline_text

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

        elif block_type == "code":
            code_content = block.get("code", "")
            language = block.get("language", "text")
            return f"```{language}\n{code_content}\n```"

        elif block_type == "mermaidDiagram":
            code_content = block.get("code", "")
            return f"```mermaid\n{code_content}\n```"

        elif block_type == "table":
            rows = block.get("rows", [])
            if not rows:
                return ""

            markdown_rows = []
            for idx, row in enumerate(rows):
                cells = row.get("cells", [])
                row_text = " | ".join(str(cell) for cell in cells)
                markdown_rows.append(f"| {row_text} |")

                if idx == 0:
                    separator = " | ".join(["---"] * len(cells))
                    markdown_rows.append(f"| {separator} |")

            return "\n".join(markdown_rows)

        return ""

    markdown_lines = []
    for block in blocks:
        rendered = render_block(block)
        if rendered:
            markdown_lines.append(rendered)

    result = []
    for i, line in enumerate(markdown_lines):
        result.append(line)
        if i < len(markdown_lines) - 1:
            next_line = markdown_lines[i + 1]
            is_current_list = line.lstrip().startswith(("- ", "1. "))
            is_next_list = next_line.lstrip().startswith(("- ", "1. "))

            if not (is_current_list and is_next_list):
                result.append("")

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


def query_sanity(slug=None):
    """
    Query Sanity for articles.

    Args:
        slug: Optional article slug to fetch single article

    Returns:
        list of article documents
    """
    from sanity import Client

    api_version = '2023-12-01'
    dataset = os.getenv('SANITY_DATASET', 'production')
    project_id = os.getenv('SANITY_PROJECT_ID')
    token = os.getenv('SANITY_API_TOKEN')

    if not project_id:
        print("Error: SANITY_PROJECT_ID environment variable not set", file=sys.stderr)
        sys.exit(1)

    client = Client(
        project_id=project_id,
        dataset=dataset,
        api_version=api_version,
        token=token,
    )

    if slug:
        query = f'*[_type == "article" && slug.current == "{slug}"]'
    else:
        query = '*[_type == "article"] | order(publishedAt desc)'

    try:
        results = client.fetch(query)
        return results if isinstance(results, list) else [results]
    except Exception as e:
        print(f"Error querying Sanity: {e}", file=sys.stderr)
        sys.exit(1)


def fetch_articles_via_cli(slug=None):
    """
    Fallback: Use sanity CLI to fetch articles as JSON.
    Requires: `sanity documents list --query '*[_type == "article"]' > articles.json`
    """
    try:
        if slug:
            query = f'*[_type == "article" && slug.current == "{slug}"]'
        else:
            query = '*[_type == "article"] | order(publishedAt desc)'

        # Use sanity CLI
        result = subprocess.run(
            ['sanity', 'documents', 'list', '--query', query, '--format', 'json'],
            capture_output=True,
            text=True,
            check=False
        )

        if result.returncode != 0:
            print(f"Warning: sanity CLI failed: {result.stderr}", file=sys.stderr)
            return []

        data = json.loads(result.stdout)
        return data if isinstance(data, list) else [data]

    except (FileNotFoundError, json.JSONDecodeError) as e:
        print(f"Error using sanity CLI: {e}", file=sys.stderr)
        return []


def archive_article(article, output_dir):
    """
    Archive a single article as .md and .json files.

    Args:
        article: Article document from Sanity
        output_dir: Path to output directory

    Returns:
        (md_file, json_file) tuple of output paths
    """
    slug = article.get("slug", {}).get("current", "")
    if not slug:
        print(f"Warning: Article has no slug: {article.get('_id')}", file=sys.stderr)
        return None, None

    output_dir = Path(output_dir)
    output_dir.mkdir(parents=True, exist_ok=True)

    # Convert body to markdown
    body = article.get("body", [])
    markdown_content = portable_text_to_markdown(body)

    # Prepare metadata (exclude sources, body, _rev, _createdAt)
    metadata = {}
    exclude_fields = {"body", "sources", "_rev", "_createdAt"}

    for key, value in article.items():
        if key not in exclude_fields:
            metadata[key] = value

    # Write markdown file
    md_file = output_dir / f"{slug}.md"
    with open(md_file, 'w', encoding='utf-8') as f:
        f.write(markdown_content)
    print(f"Created: {md_file}")

    # Write metadata JSON file
    json_file = output_dir / f"{slug}.json"
    with open(json_file, 'w', encoding='utf-8') as f:
        json.dump(metadata, f, indent=2, default=str, ensure_ascii=False)
    print(f"Created: {json_file}")

    return md_file, json_file


def main():
    slug = None
    output_dir = "archive/Articles"

    # Parse arguments
    for arg in sys.argv[1:]:
        if arg.startswith("--output-dir="):
            output_dir = arg.split("=", 1)[1]
        elif arg.startswith("--output-dir"):
            # Handle `--output-dir path` format
            pass
        elif not arg.startswith("--"):
            slug = arg

    print(f"Archiving articles to: {output_dir}", file=sys.stderr)
    if slug:
        print(f"Fetching single article: {slug}", file=sys.stderr)
    else:
        print("Fetching all articles...", file=sys.stderr)

    # Fetch articles
    try:
        articles = query_sanity(slug)
    except ImportError:
        print("Note: python-sanity library not installed, trying CLI fallback...", file=sys.stderr)
        articles = fetch_articles_via_cli(slug)

    if not articles:
        print("No articles found", file=sys.stderr)
        sys.exit(1)

    print(f"Found {len(articles)} article(s)", file=sys.stderr)

    # Archive each article
    archived = []
    for article in articles:
        md_file, json_file = archive_article(article, output_dir)
        if md_file and json_file:
            archived.append({
                "slug": article.get("slug", {}).get("current", ""),
                "title": article.get("title", ""),
                "markdown": str(md_file),
                "metadata": str(json_file),
            })

    print(f"\nArchived {len(archived)} article(s)", file=sys.stderr)
    for item in archived:
        print(f"  - {item['slug']}: {item['title']}", file=sys.stderr)


if __name__ == '__main__':
    main()
