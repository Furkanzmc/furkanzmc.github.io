---
layout: post
title:  "Set up (Neo)Vim for Java"
description: "An extremely bare bones way of setting up (Neo)Vim for Java development."
date: 2021-11-13
category:
  - neovim
  - vim
  - null-ls
comments: true
---

I started reading Crafting Interpreters by Robert Nystrom. Great book! A chapter implements the
language in Java. I don't know Java, but I would still like to try things out. So, clearly I went
online and searched for "How to set up Vim for Java" right? Well.. No.

(Neo)Vim already provides very simple options for us to set up a bare bones environment for any
language that we want. All I want is a way to:

1. Execute code.
2. Format code.
3. Lint code.
4. Save my session when I quit.

Here's how you do all that with 7 lines of code:

```vim
" Put this in .exrc/.nvimrc file in your project's folder.
set makeprg=java\ %
set formatprg=clang-format
set errorformat=%f:%l:\ %trror:\ %m

augroup nvimrc
    autocmd!
    autocmd VimLeavePre * mksession! session.vim
augroup END
```

There you go! Now you can run `:make` to see the output of your program, or see the errors `java`
command produces in your `:help quickfix` window. You can use `gq` to format a visual selection or
entire file. And when you quit, Vim will create a session file for you.

You can also use [null-ls.nvim](https://github.com/jose-elias-alvarez/null-ls.nvim) to provide
diagnostics for you:

```lua
local helpers = require("null-ls.helpers")
require("null-ls.sources").register(helpers.make_builtin({
	method = require("null-ls.methods").internal.DIAGNOSTICS,
	filetypes = { "java" },
	generator_opts = {
		command = "java",
		args = { "$FILENAME" },
		to_stdin = false,
		format = "raw",
		from_stderr = true,
		on_output = helpers.diagnostics.from_errorformat([[%f:%l: %trror: %m]], "java"),
	},
	factory = helpers.generator_factory,
}))
```

Final `.nvimrc` file looks like this:

```vim
set makeprg=java\ %
set formatprg=clang-format
set errorformat=%f:%l:\ %trror:\ %m

augroup nvimrc
    autocmd!
    autocmd VimLeavePre * mksession! session.vim
augroup END

lua << EOF
local helpers = require("null-ls.helpers")
require("null-ls.sources").register(helpers.make_builtin({
	method = require("null-ls.methods").internal.DIAGNOSTICS,
	filetypes = { "java" },
	generator_opts = {
		command = "java",
		args = { "$FILENAME" },
		to_stdin = false,
		format = "raw",
		from_stderr = true,
		on_output = helpers.diagnostics.from_errorformat([[%f:%l: %trror: %m]], "java"),
	},
	factory = helpers.generator_factory,
}))
EOF
```
