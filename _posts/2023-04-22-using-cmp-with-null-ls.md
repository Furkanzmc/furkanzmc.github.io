---
layout: post
title:  "Using cmp-buffer with null-ls"
description: ""
date: 2023-04-22
category:
  - neovim
  - lsp
  - null-ls
---

I've been using [null-ls](https://github.com/jose-elias-alvarez/null-ls.nvim) for a long long time
now for most of my LSP needs. I use it for looking up words in a markdown file, formatting, pylint
errors, and showing [previews](https://github.com/Furkanzmc/zettelkasten.nvim/wiki#help-keywordprg)
of my [zettelkasten](https://github.com/Furkanzmc/zettelkasten.nvim) notes.
[null-ls](https://github.com/jose-elias-alvarez/null-ls.nvim) has quickly made it to my list of
plugins that I can't live without along with [vim-fugitive](https://github.com/tpope/vim-fugitive),
and [vim-dirvish](https://github.com/justinmk/vim-dirvish).

I've written about [null-ls](https://github.com/jose-elias-alvarez/null-ls.nvim) before
[here](https://zmc.space/unified-theory-of-completion.html) and briefly talked about how I
converted [nvim-cmp](https://github.com/hrsh7th/nvim-cmp) sources so I can use it with
[null-ls](https://github.com/jose-elias-alvarez/null-ls.nvim). Now that've been using it for a
while, I thought I'd write an update about it. I've been using the nvim-cmp sources for a long time
now and I'm happy to say that I have not had any problems with it at all.

![cmp-buffer-preview](/assets/images/2023-04-22-using-cmp-with-null-ls/cmp-buffer-preview.png)

Completions from [cmp-buffer](https://github.com/hrsh7th/cmp-buffer) shows up along with [spell
source](https://github.com/Furkanzmc/dotfiles/blob/master/vim/lua/vimrc/lsp.lua#L520) for
[null-ls](https://github.com/jose-elias-alvarez/null-ls.nvim).

I also haven't needed to change [the
code](https://github.com/Furkanzmc/dotfiles/blob/master/vim/lua/vimrc/lsp.lua#L182) that I wrote to
integrate nvim-cmp sources into [null-ls](https://github.com/jose-elias-alvarez/null-ls.nvim) ever
since I wrote it the first time. It has been working well for my needs, and I don't rely on a fancy
completion plugin but just use my simple one called
[sekme.nvim](https://github.com/Furkanzmc/sekme.nvim).
