---
layout: post
title:  "Use Git as a Vim Package Manager"
description: ""
date: 2022-01-11
comments: true
category:
  - vim
  - neovim
  - shorts
---

Vim comes with a built-in package manager. You can have plugins that are loaded by default or on
demand.

I'm going to assume that your `dotfiles` live under `$HOME` for this short tutorial and that your
Vim configuration is under `$HOME/.dotfiles/vim`.

Let's start with adding `vim-dirvish` to our plug-ins.

```sh
cd ~/.dotfiles/
# See :help packages for why we are using this path. I chose "packages" as the subdirectory but you
# can call it `pack/plugins/start/` as well.
git clone https://github.com/justinmk/vim-dirvish.git pack/packages/start/
# Now we've added vim-dirvish to our plugins.
cat .gitmodules
[submodule "vim/pack/packages/start/vim-dirvish"]
	path = vim/pack/packages/start/vim-dirvish
	url = https://github.com/justinmk/vim-dirvish.git
[submodule "vim/pack/packages/start/firvish.nvim"]
	path = vim/pack/packages/start/firvish.nvim
	url = https://github.com/Furkanzmc/firvish.nvim.git
# Now let's add an optional package.
git clone https://github.com/Furkanzmc/firvish.nvim.git pack/packages/opt/
git add .gitmodules pack/packages/*
git commit -m "Start using Git as package manager"
# Now we have the plugin in our packages. We only need to make a small change to our Vim config to
# get this to work.
```

Open your `init.vim` or `init.lua`.

```vim
set packpath += expand("~/.dotfiles/vim/")
```

Or in Lua for Neovim.
```vim
vim.opt.packpath:append(fn.expand("~/.dotfiles/vim/"))
```

Now, launch Vim and you should be able to use `vim-dirvish` by default. When you want to use
`firvish.nvim`, you just need to run `:packadd firvish.nvim` and the plugin will be available. I
like to make use of the optional plugins so I only enable them for certain file types and I don't
pay the runtime cost for it when launching Vim.

## Updating Plugins

The beauty of using Git as a package manager is that it acts as a lock file. If you encounter a
problem with an updated version of a plugin, you can always come back to the version that works.

I have these two tiny aliases in my `.gitconfig` to see the updates for the plugins and to update
them.

```
[alias]
  logpretty = log --graph --pretty=format:'%Cred%h%Creset -%C(yellow)%d%Creset %s %Cgreen(%cr) %C(bold blue)<%an>%Creset' --abbrev-commit
  show-updates = !git submodule foreach 'git fetch --prune && git logpretty HEAD..origin/HEAD && echo "-----"'
  update-packages = !git submodule foreach 'git fetch --prune && git logpretty HEAD..origin/HEAD > updates.git && git logpretty HEAD..origin/HEAD' && git submodule update --remote
```

When you want to see the updates and then decide if you want to update or not, just run these:

```sh
cd ~/.dotfiles
git show-updates
# If you decide you want to update
git update-packages
# Once the packages are updated, you can pick which update you want to keep. You don't have to
# update all your packages.
```

-----

Discuss on [Reddit](https://www.reddit.com/r/vim/comments/s1eaxq/use_git_as_a_vim_package_manager_zmcspace/)
