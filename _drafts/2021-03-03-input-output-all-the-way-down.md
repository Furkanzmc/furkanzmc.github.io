---
layout: post
title:  "Vim: Buffer is King"
description: "Learn to use the potential of the buffers to its limits"
date: 2021-03-03
draft: true
tags: "vim, nvim"
---

As a software developer, most of my time is spent editing text in one form or another. I may be
writing code, writing documentation, running tests, debugging, running commands on my shell, but
regardless of the activity they all have one thing in common: Text manipulation.

Text processing, and almost everything else I do involves entering input, and getting output.

- I write code that gets an input and produces an output.

```python
def add(x: int, y: int) -> int:
    return x + y
```

- I write tests that take an input, and produces an output: Test passed or failed.

```python
assert add(2, 3) == 5
```

- I write shell commands that take input, and produces output for another command.

```sh
ls | grep .html$
```

Input and output processing is not just specific to the tech world. We as humans, along with every
other living being, are masters of input processing and producing output. The appropriate devices
that we use to get these inputs vary (e.g our eyes, ears, our tongue) and they are what kept us
alive.

Since everything we do involves input/output, it's only natural that we've developed ways of
exercising this as easy as possible. We evolved body language, then developed spoken language,
written language so on so forth.

Then we invented computers, and along with that a myriad of other ways to get input and produce
output. On top of the developer centric way of getting input, we developed ways to get input from
other people. Starting with the early command prompts with keyboard, to mouse, and to touch input.

I've spent most of my life without thinking about this, like many other normal people. But then I
started using Vim...

# Adopting Unix Philosophy Through Vim

I'm sure everyone is aware of the Unix Philosophy. You either heard it, or even practice it in your
own day to day job. But just to refresh our memory, here's the four items[[1]](https://en.wikipedia.org/wiki/Unix_philosophy):

> 1. Make each program do one thing well. To do a new job, build afresh rather than complicate old
> programs by adding new "features".
> 2. Expect the output of every program to become the input to another, as yet unknown, program.
> Don't clutter output with extraneous information. Avoid stringently columnar or binary input
> formats. Don't insist on interactive input.
> 3. Design and build software, even operating systems, to be tried early, ideally within weeks.
> Don't hesitate to throw away the clumsy parts and rebuild them.
> 4. Use tools in preference to unskilled help to lighten a programming task, even if you have to
> detour to build the tools and expect to throw some of them out after you've finished using them.

These norms originated from Ken Thomson and were documented by Doug McIlroy in 1978. But they stood
the test of time for 43 years, and I suspect it will keep being that way for a long time to come.

These are all golden standards to live by, however I want to draw your attention to item #4.


-----

It's not a revolutionary realization. Of course we are processing text, that's why the existence of
all the editors and IDEs out there! But bear with me, this will nicely tie into the use of command
line tools, Vim, and buffers.

```python
def work(data: Any) -> str:
    return "Tons of text."
```

-----

Let's examine some of the commonly used scenarios in my work flow. Every developer works
differently, and my examples may apply to you or you may find them useless.

## Running Tests

As part of my workflow for backend development is to write and execute tests. One of the things I
do a lot is compare the results of different runs of a test. Vim provides the basics for achieving
this task in various way. One common way is to use `:h quickfix`.

Here's some sample plugins that enable you to do this:

- [JarrodCTaylor/vim-python-test-runner](https://github.com/JarrodCTaylor/vim-python-test-runner)
- [vim-test/vim-test](https://github.com/vim-test/vim-test)

There's very likely at least 5 more you'll find out there, and I'm sure a lot of people have gems
tucked away in their dotfiles that they use for this purpose.

I don't use any of the aforementioned plug-ins. Using a terminal buffer is good enough for me, I
developed habits/bindings around it that suits my needs. Terminal buffer here is key for me.
Because I want access to the tests I ran before. I don't want to lose the output from the previous
runs, or other tests that I ran. So I have a simple function that calls the test I want, creates a
terminal buffers, gives it a number and time stamp, and just lets it do its own thing.

## Debugging Applications

I also do quite a bit of desktop development with C++. Let me first start off by saying that you
should not shy away from using a modern UI to your debugger, like VS Code, Qt Creator. I also do
that.  But other times I run `lldb` from the command line, or use
[nvim-gdb](https://github.com/sakhnik/nvim-gdb).

When I use the debugger in Vim, I prefer to keep a copy of the stack, or better yet, the entire
output of my debugging session. This way I can go back and forth, compare and try to fix the bug.


## Navigating Projects

I use [vim-dirvish](https://github.com/justinmk/vim-dirvish) as my file explorer. It's one of the
two plug-ins I cannot live without, the other being
[vim-fugitive](https://github.com/tpope/vim-fugitive/). These two plug-ins are the standard to
which I hold other plug-ins.

`vim-dirvish` lets you treat a directory like it's a buffer. So, you can navigate to a directory,
delete lines, add lines, change, clip, do whatever. The files are not actually affected, and it
gives you opportunities 

While working on desktop application development with C++/Qt/QML, I use command line tools for my
work (debugging, linting, formatting etc.). All these things produce output. The program runs, and
spits out logs. Tests run, spits out results. It's all text all the way.

And as part of our work as software developers, we process that output. Whether with our eyes, with
an external tool, or out editor. We navigate, we add, remove, change... The buffer is our canvas,
and our black board.

Vim provides excellent tools that we can use to process text, it's literally a text processor. It
uses text input to populate the `:h quickfix` and `:h setloclist()`, then uses `:h errorformat` to
parse that text so it can create references to other text. We use LSP servers that take in text,
and outputs text that the LSP client consumes to yet create more text!

Then 

-- vim: textwidth=100 cursorline

