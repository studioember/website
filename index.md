---
title: Typography Showcase
title_hidden: false
description: Testing Markdown support
date: "git Last Modified"
date_hidden: false
layout: layouts/base.njk
---

<div class="bg-background text-foreground min-h-screen">
  <div class="bg-card border border-border rounded-xl p-6">
    <h1 class="text-3xl font-bold text-primary">
      Studio Ember
    </h1>

    <p class="text-muted mt-2">
      DevOps • Kubernetes • Systems
    </p>

    <button class="mt-6 bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:opacity-90">
      Get Started
    </button>
  </div>
</div>

# Heading 1

This is a sample paragraph to demonstrate Tailwind's typography plugin styling for markdown content. It includes **bold text**, *italic text*, and [links](https://google.com).

## Heading 2

> This is a blockquote. It should be styled with nice left borders and slightly different typography.

### Heading 3

Here’s an example of a list:

- Unordered list item one
- Unordered list item two
  - Nested list item
  - Another nested list

1. Ordered list item one
2. Ordered list item two
   1. Nested ordered item
   2. Another nested ordered item

---

## Code Examples

Here’s some inline code: `console.log("Hello World")`.

Here’s a fenced code block with JavaScript:

```js
function greet(name) {
  console.log(`Hello, ${name}!`);
}
greet("Nathan");
```

---

## Tables

| Feature     | Description                           | Available |
|-------------|---------------------------------------|-----------|
| Headings    | Various sizes from h1 to h6           | ✅        |
| Lists       | Ordered, unordered, nested            | ✅        |
| Code        | Inline and fenced code blocks         | ✅        |
| Tables      | Styled tables with borders and padding| ✅        |

---

## Images

Below is an example image:

![Sample Landscape](https://picsum.photos/800/400)

---

## Horizontal Rule

This is a section above the horizontal rule.

---

This is a section below the horizontal rule.
