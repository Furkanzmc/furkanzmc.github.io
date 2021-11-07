---
layout: post
title:  "Neovim: Unified Theory of Completion"
description: "Leverage LSPs to prevent duplicate efforts of creating completion sources"
date: 2021-11-06
tags: "neovim, lsp"
comments: true
---

Let's take a look at a rough list of completion plugins:

- [supertab*](https://github.com/ervandew/supertab)
- [VimCompletesMe*](https://github.com/ackyshake/VimCompletesMe)
- [vim-mucomplete*](https://github.com/lifepillar/vim-mucomplete)
- [sekme.nvim*](https://github.com/Furkanzmc/sekme.nvim)
- [YouCompleteMe](https://github.com/ycm-core/YouCompleteMe)
- [deoplete.nvim](https://github.com/shougo/deoplete.nvim)
- [neocomplete.vim](https://github.com/shougo/neocomplete.vim)
- [coc.nvim](https://github.com/neoclide/coc.nvim)
- [neocomplcache.vim](https://github.com/shougo/neocomplcache.vim)
- [AutoComplPop](https://github.com/vim-scripts/AutoComplPop)
- [clang_complete](https://github.com/xavierd/clang_complete)
- [OmniCppComplete](https://github.com/vim-scripts/OmniCppComplete)
- [completor.vim](https://github.com/maralla/completor.vim)
- [asyncomplete.vim](https://github.com/prabirshrestha/asyncomplete.vim)
- [nvim-cmp](https://github.com/hrsh7th/nvim-cmp)
- [coq_nvim](https://github.com/ms-jpq/coq_nvim)
- [completion-nvim](https://github.com/nvim-lua/completion-nvim)

> The ones marked with `*` don't really provide completion sources but extend Vim's own completion
> feature by chaining them or binding them to one key.

I'm sure I'm missing a few plugins. But take a look at this list! All of this... For completion...
The end goal of these plugins is the same: Get a list of completion items in a fast way. However
because of the way they are implemented, almost all of those plugins require people to write custom
completion sources for them.

Let's take a look at what completion plugins do these days:

1. It implements its own caching.
2. Handles LSP requests and response.
3. Implements documentation functionality: Show signature on hover, show documentation on
   completion item selection.
4. Creates custom sources.
5. Implements snippets.

Each of those are huge tasks on their own. If one day you wanted to create a new completion plugin,
because why not and maybe you have a new idea, you would have invest hundreds of hours to get to a
usable plugin. Take a look at how much time [coq.nvim author
spent](https://www.reddit.com/r/neovim/comments/p4m8vt/i_spent_1_year_of_my_life_on_making_a_fast_as/)
on the plugin: 1 year!

There must be a way to make it less painful for people to work on these plugins.

In order to solve this, I think a completion plugin should just focus on items from #1 to #3.
Completion sources and snippets should not be a completion plugins business. These are always
implementation specific, one source for a plugin is not useful for another.

The good thing is, most completion plugins (namely nvim-cmp and coq.nvim) rely on [LSP
specification](https://microsoft.github.io/language-server-protocol/specifications/specification-3-17/#completionClientCapabilities)
to extend their sources and snippet support.

For snippets, they are provided by LSPs and completion plugins add the fancy UI elements to make it
easier for us to use. For completion sources, they compute their own completion items and then feed
it back to their completion engine in the same format that LSP specification shows.

# Enter General Purpose LSPs

Neovim has great built-in LSP support. After I switched to using it, I wanted to explore some
completion plugin options. But no matter what I tried, there was always something missing for me.
I wasn't that interested in the additional features they add, I was just interested in getting my
completion menu populated with completion items from LSPs and other Vim built-in sources.

[completion-nvim](https://github.com/nvim-lua/completion-nvim) provided the best experience for me,
but when I started it at the time it was in its early stages of development. I was very interested
in its chain completion feature, and I just ended up implementing a simple version of it in my
configuration and ever since then I've been using that (Now I made that into a simple plugin
[sekme.nvim](https://github.com/Furkanzmc/sekme.nvim)).

There was another problem, I would sometimes come across certain sources from these completion
plugins, but I would need to switch to using that plugin in order to leverage it. But whenever I
switch to a completion plug-in, I just found myself coming back to my own. I want to make it clear
that this in no way means those plug-ins are bad. They are great tools created by smart people.
They were just not for me.

So, while looking for solutions, I came across
[efm-langserver](https://github.com/mattn/efm-langserver). It is a general purpose LSP that you can
extend with your own external commands to provide your own custom completion or hover
sources.

So, at first I had a chain of commands to provide completion sources with:

```lua
lspconfig.efm.setup({
    on_attach = setup,
    init_options = { documentFormatting = true },
    settings = {
        languages = {
            ["="] = {
                {
                    completionCommand = 'cat ${INPUT} | rg "\\w+" --no-filename --no-column --no-line-number --only-matching | sort -u',
                    completionStdin = false
                },
            },
        },
    },
})
```

This was simple and fast enough for completing items from the same buffer. I used a similar
approach to provide completion sources in different ways. For example, I wrote a little function to
get me completion items with mnemonics.

```lua
local function get_name() {
    return "Jane Doe"
}

gn<Tab> -- This results in get_name to appear in completion list.
```

I also had a custom script that returns the description of pylint error codes in Python files.

The benefit of this approach is that I can use any completion plugin I want, I would still get the
same result.

Eventually, I switched to using a Python script to return these results and add a few more
functionalities on top of it. But this was restrictive for me. I can do a lot, but I have limited
access to Neovim's API and on top of it it's another dependency. It would be so much better for me
to write all my code in Lua, which I use for my editor configuration as well, so that it's easier
to maintain.

So, I thought to myself, wouldn't it be great if we had a general purpose language server written
in Lua? One that I can use to write my own completion sources that would be useful with any
completion plugin, one that I could use to create hover sources all in Lua! All the while having
the ability to access any other plug-ins code, treesitter, or other Lua libraries like
[plenary.nvim](https://github.com/nvim-lua/plenary.nvim).


This would make things so much easier. No longer would I need to worry about what sources I can or
can't access. There's a source I'm interested from nvim-cmp? Then I can just fork it, modify it a
little so it doesn't depend on nvim-cmp any more and use the code.

I was thinking about this during my hikes in Alberta, and I was looking forward to coming back home
to start working on this. But sadly, I didn't have enough time because of work and my preparation
for vimconf.live. I was watching Justin's talk at vimconf.live, and I noticed he mentioned a
plug-in called [null-ls.nvim](https://github.com/jose-elias-alvarez/null-ls.nvim). Immediately
after the talk, I went on the GitHub page and tried it out.

`null-ls.nvim` is exactly what I was thinking I would create. Jose did a fantastic job with the
plug-in. It's very easy to get started and implement your own formatting and hover sources. He's
very active and there's lots of built-in formatting and diagnostics sources.

I immediately switched over my efm-langserver configuration to null-ls. It was pretty
straightforward and easier because I could now use Lua. There was one thing missing though:
Completion. So, I just built on what Jose created and submitted a [PR for the completion
support](https://github.com/jose-elias-alvarez/null-ls.nvim/pull/301).

I also created two completion sources as samples, you can find them in the PR. On top of that, I
wanted to see if it would be trivial to convert nvim-cmp sources to null-ls sources. And turns out,
it was pretty easy! As an experiment, I copied the exact same code over to [my
configuration](https://github.com/Furkanzmc/dotfiles/blob/master/vim/lua/vimrc/completions/buffers.lua).
And it works perfectly!

Here's where the beauty of null-ls is. As software engineers, we want to avoid duplication. But
with these plugins, there's so much duplication that benefits only a certain subset of people.
Wouldn't it be great if coq.nvim users could benefit from the sources written for nvim-cmp? It is
possible, it's just a matter of community deciding to act on this.

I think null-ls.nvim has great potential to be much bigger than it is right now. It's ripe with
potential. Imagine how trivial it would be for you to create a completion source for your own
needs. Imagine how easy it would be to have your own project specific code lens, or hover options.
This would make it much easier for other plug-in developers to create new solutions. Just off the
top of my head, I could see nvim-cmp, coq.nvim, any plugin that's built on LSP. With the treesitter
support in Neovim, there's so much power.

I already have my small snippets to run my tests. With null-ls, I could go one step further and
easily customize which test to run. I could have code actions to run these tests. And many more
things that I can't even think of right now.

Over the next few weeks, I'll see in what ways I can extend null-ls and how I can improve my work
flow. I'll also try to fork nvim-cmp sources and see If I can port them over to null-ls. If my
experiments go right, I'm hoping to engage nvim-cmp and coq.nvim authors to get their feedback on
this idea.

Until then, please share your opinions on this and go give
[null-ls.nvim](https://github.com/jose-elias-alvarez/null-ls.nvim) a try!
