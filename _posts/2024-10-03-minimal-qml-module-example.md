---
layout: post
title: "Minimal Example for Writing QML Modules"
description: ""
date: 2024-10-03
category:
  - qml
  - qt
  - cmake
comments: true
---

At work, we are using our own build system so we don't use Qt's CMake API for anything. On my own
time, I've been trying to get more into the CMake API and work on some hobby projects and
experiments on the side.

I've been working on a analog clock implementation with time zone support and I wanted to make this
implementation into a [QML module](https://doc.qt.io/qt-6/qt-add-qml-module.html). Maybe because I'm
not used to it, this wasn't a straightforward task... And for the life of me, somehow [this
section](https://doc.qt.io/qt-6/qtqml-writing-a-module.html#eliminating-run-time-file-system-access)
on the documentation didn't catch my eye...

So, I created a minimal sample on [GitHub](https://github.com/Furkanzmc/qml_module_minimal_example)
to hopefully save some time for people.

The crucial part is in your QML module, in the example above it would be the `rectangles` folder,
it matters whether or not you use `RESOURCE_PREFIX`. When that's used, you have to *manually* add
the import path to `QQmlEngine`. Otherwise your QML types will not be found. However, your C++ types
will load just fine and it'll leave you scratching your head...

Lessons learned, get a pair of glasses... 😅🤓
