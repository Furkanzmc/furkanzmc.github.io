---
layout: post
title:  "Use formatexpr and tagfunc with LSP"
description: ""
date: 2021-12-27
category:
  - vim
  - neovim
  - shorts
comments: true
---

You can set `formatexpr` and `tagfunc` to keep using Vim default mappings for formatting and
jumping to a tag.

```lua
if resolved_capabilities.goto_definition == true then
    api.nvim_buf_set_option(bufnr, "tagfunc", "v:lua.vim.lsp.tagfunc")
end

if resolved_capabilities.document_formatting == true then
    api.nvim_buf_set_option(bufnr, "formatexpr", "v:lua.vim.lsp.formatexpr()")
    -- Add this <leader> bound mapping so formatting the entire document is easier.
    map("n", "<leader>gq", "<cmd>lua vim.lsp.buf.formatting()<CR>", opts)
end
```

I like using this approach because it lets me stay closer to default shortcuts without having to
know new ones. Also, I much prefer `gqi{` to visually selecting the range and then calling the LSP
range format function on it.
