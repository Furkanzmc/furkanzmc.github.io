---
layout: post
title: "vimconf.live: 👑 Buffer is King 👑"
description: "Content for vimconf.live 2021"
date: 2021-07-11
category:
  - vim
  - neovim
comments: true
---

> Buffer me once, buffer me twice, buffer me chicken soup with rice.
> ~~ Todd

- I/O
- `:help buffer` vs `:help window` vs `:help tab`
- Fast `:help buffer` switching
- `:help buffer-list` vs `:help argument-list`
- `:help special-buffers`, what are they good for?
- Commands on `:help buffers` and `:help windows`
- Unix philosophy on buffers.
  + `:help filter`, `:help equalprg`, and `:help formatprg`
  + `:help read`, and `:help write`
- Move around, select, and edit faster.
- `:help skeleton`
- Why bother with all this?
- Introduction to `:help firvish.txt`

# I/O

> I/O & U

- We process input and produce output with everything we do.

```sh
echo -e '#include <stdio.h>\nint main() { \n\tprintf("Hello world!");\n\treturn 0;\n}' > hello.c
cat hello.c | grep world
cat hello.c | sed s/Hello/Ahoy/g
clang hello.c -o hello && ./hello | sed s/Ahoy/Hello/g
```

```python
def hello():
    print("Hello world!")

hello()
```

# `:help buffer` vs `:help window` vs `:help tab`

- A **buffer** is the in-memory text of a file.
- A **window** is a viewport on a buffer.
- A **tab page** is a collection of windows.

> But I use bufferline!

- Beauty of Vim is you can make it your own. Nothing is worse or better than the other. Do what
  works for you.

# Fast `:help buffer` switching

- Slow way: `:while !(bufname() =~ "indirect.c$") | bnext | endwhile`
- Slightly faster: `:help ls` and `:buffer 5`
- Fast way: `:buffer ind*.c<wildchar>` or `:buffer indir<CR>` or `:buffer *rect*.c`
> Tip: `:help wildcard`
- You can also use `:[s]bfirst`, `:[s]bnext`, `:[s]bprevious`, `:[s]blast`.
> Tip: I map these to `[b` and `]b`, or `[sb` and `]sb`

# `:help buffer-list` vs `:help argument-list`

- You can edit multiple files! `:help 07.2`
- You have only one buffer list but you can have multiple argument lists.
    + `:help argglobal`
    + `:help arglocal`
- `:bnext` != `:next`

# `:help special-buffers`, what are they good for?

- Buffers can be used for purposes other than displaying the contents a file.
  - `:help quickfix`
  - `:help help`
  - `:help terminal`
  - `:help scratch-buffer`

# Commands on `:help buffers` and `:help windows`

Run commands on buffers/windows/tabs.

+ `:help bufdo`
+ `:help argdo`
+ `:help windo`
+ `:help tabdo`
+ `:help cexpr`
+ `:help cfdo`
+ `:help lfdo`

Manipulate/Navigate buffers.

+ `:help buffer`
+ `:help buffers`
+ `:help bdelete`
+ `:help edit`
+ `:help new`
+ `:help badd`
+ `:help bwipeout`
+ `:help bunload`
+ `:help sbuffer`
+ `:help bnext`
+ `:help bprevious`
+ `:help sbnext`
+ `:help sbprevious`
+ `:help bmodified`

# Example 1

- Add the list of changed files in branch to the `:help arglist`.

Command line:
```sh
git diff origin/master --name-only | xargs nvim "+nmap <leader>d :Gdiffsplit<CR>"
```

Vim:
```vim
:args `git diff --name-only`
```

> See `:help backtick-expansion`

# Example 2

- Find and replace in multiple files.

```vim
:args `rg -l linux`
:argdo %s/linux/windows/g
```

> **Tip**: Use `%s/linux/windows/gc` to confirm each substitution.

# Example 3

 Search in specific files.

```vim
:args `fd . -e h`
:argdo grepadd ext2_inode_info %
```

Or search in all buffers:

```vim
:bufdo grepadd ext2_inode_info %
```

# Example 4

- Format all open buffers.

```vim
:bufdo normal gggqG
:bufdo !clang-format -i %
:bufdo !black %
```

# Example 5

- Turn on `:help number` in all windows in the tab.

```vim
:windo setlocal number
```

# Example 6

- Find files that match a pattern and add them to quickfix window.

```vim
" You need to set errorformat=%f for this to work.
:cexpr system("fd . -t f ext2")
" Now we can find and replace string only in these files
:cfdo %s/ext2/ext32/g
```

# Example 7

- Create a backup of all buffers. (Duplicate buffers.)

```vim
:bufdo write %.backup
```

# Example 8

- Close buffers that are deleted from the file system.

```vim
:bufdo if !filereadable(bufname()) | bdelete | endif
```

# Exercises for You

- Unload all buffers that match a pattern but do not close them.
- Discard changes in modified buffers.
- Format all buffers with a specific `:help filetype` (e.g C++, Rust) and skip the rest.
- Print a list of open `:help terminal` buffers.
- Add the current date and time to the last line of buffers in the windows in the current tab.

# Unix philosophy on buffers.

> Expect the output of every program to become the input to another, as yet unknown, program...

- `:help filter`, `:help formatprg`, and `:help equalprg`
- `:help write`, and `:help read`

> How to do 90% of What Plugins Do: https://www.youtube.com/watch?v=XA2WjJbmmoM

Here's an unformatted code snippet

```lua
if vim.o.loadplugins == true then
print("Loading plugins.") end
```

# Continued: Unix philosophy on buffers.

```lua
if vim.o.loadplugins == true then
print("Loading plugins.") end
```

Here's how you would format the code and do more!

```
:'<,'>!lua-format
:.,+1!lua-format
:.,+1!lua-format | sed s/true/false/g | sed s/Loading/Unloading/g
```

# `:help formatprg` and `:help equalprg`

Here's the same unformatted code snippet

```lua
if vim.o.loadplugins == true then
print("Loading plugins.") end
```

Format it with `lua-format`.

```vim
:setlocal formatprg=lua-format\ --no-use-tab
:normal! gqj
```

Another unformatted text:

```json
{ "vimconf": { "live": true } }
```

```vim
" Replace the block with a child object.
:.,.!jq .vimconf
:normal u
" Format it with equalprg
:setlocal equalprg=jq
:normal ==
```

# Continued: `:help read` and `:help write`

- They are used for more than reading and writing files.

```vim
" List files
:read !ls -l
```

See the output of your script:

```python
def hello():
    print("Hello world!")

hello()
```

```vim
" See the output
:'<,'>write !python
" Write the output to the same file.
:'<,'>write !python >> %
" Write the output to the clipboard
:'<,'>write !python | pbcopy
```

# Exercises for You

- Write the output of a script block to a specified line.

# Move around, select, and edit faster

- Use `:help mark-motions`
    + Create a mark with `m{a-zA-Z}`
    + Jump to mark with backtick to specified location (row and column.)
    + Jump to mark with single quote to specified line.
- Use `,` and `;` to get to repeat `:help f`, `:help F`, `:help t`, or `:help T` motions.
- Repeat dot macro over a range:
```vim
xmap <silent> . :normal .<CR>
```
- Repeat macro over a range.

```vim
xnoremap @ :<C-u>call ExecuteMacroOverVisualRange()<CR>

function! ExecuteMacroOverVisualRange()
    echo "@".getcmdline()
    execute ":'<,'>normal @" . nr2char(getchar())
endfunction
```

- Jump in change list: `:help g;` and `:help g,`

# `:help skeleton`

Create templates for most used boiler-plate code.
```cpp
// ~/.dotfiles/vim/skeleton/skeleton.h
#ifndef MY_HEADER_H
#define MY_HEADER_H

class MyResourceClass {
public:
    MyResourceClass();
    ~MyResourceClass();

    MyResourceClass(const MyResourceClass&);
    MyResourceClass(MyResourceClass&&);

    MyResourceClass& operator=(const MyResourceClass&);
    MyResourceClass& operator=(MyResourceClass&&);
}

#endif
```
```vim
autocmd BufNewFile *Manager.h :0read ./demo/skeleton.h | %s/\(MY_HEADER_H\|MyResourceClass\)//n
```

Then simply do `cgn` to rename the include guard and the class name to something more
appropriate.

Or use a snippet engine!

# Exercise For You

- Pipe the contents of your skeleton file to an external program to modify it some way and then get
  the modified contents to your buffer.

# Why bother with all this?

- Get a better understanding of Vim.
> When you are developing plugins you can design it according to Vim way of doing things.
- Take leverage of your OS as a platform rather than your editor as a platform.
> See Unix as an IDE: https://blog.sanctum.geek.nz/series/unix-as-ide/
- Whenever you get stuck, DIY instead of looking for plugins.
> See How to do 90% of What Plugins Do: https://www.youtube.com/watch?v=XA2WjJbmmoM
- Turn your buffer into a playground.
> `:help terminal` does not allow you to edit the output of your commands.

# Extras

- `:help wincmd`
- `:help window-resize`
- `:help dgn`
- `:help previewwindow`
- `:help @=`

# Introduction to `:help firvish.txt`

`firvish.nvim` is a plugin that provides a collection of functions/commands for manipulating
buffers.

# What can you do with firvish.nvim?

- Start jobs that output to a buffer/quickfix/loclist.
- Run a shell/vim command on each line.
- List buffers/history in an editable buffer.
- Show list of buffers and history in a buffer.
- Filter buffer list buffer (e.g modified buffers, buffers in `:help arguments-list`)
- Run your favorite tool in a buffer: `:Rg`, `:Fd`, `:Ug`, and your own tools in your configuration
  file.
- Run asynchronous git commands.

Link: https://github.com/furkanzmc/firvish.nvim

# Firvish Roadmap

- Refactor the code.
- Ability to interactively communicate with a job.
- A better API for extending the plugin.
- Ability to add pickers similar to telescope.nvim but output it to a buffer instead of a floating
  window.

# Links

- vim-fugitive: https://github.com/tpope/vim-fugitive
- vim-dirvish: https://github.com/justinmk/vim-dirvish
- How to do 90% of What Plugins Do: https://www.youtube.com/watch?v=XA2WjJbmmoM
- Unix as an IDE: https://blog.sanctum.geek.nz/series/unix-as-ide/
- Seven habits of effective text editing: https://www.moolenaar.net/habits.html

Link to the talk: [https://youtu.be/rD2eyB9oMqQ](https://youtu.be/rD2eyB9oMqQ)
