---
layout: post
title:  "Qt Creator: Force the Resource Re-compilation"
description: "Use custom build step to force resource compilation."
date: 2016-12-12
tags: "qt, qtcreator"
---

Because of a [bug](https://bugreports.qt.io/browse/QTCREATORBUG-1627) in Qt Creator, the `*.qrc` file i not always compiled into the executable file. A workaround to do this is to add a dummy file to your `*.qrc` file and then `touch` it before every build.
To do that in Windows:

- Go to `Projects` tab
- Click `Add Build Step`
- Select `Custom Process Step`
- Fill it according to the following screenshot

![cmake_configuration_page](https://drive.google.com/uc?export=download&id=0B2b4SnYRu-h_OWV6QmFxaDM1NHc)

And voila!
