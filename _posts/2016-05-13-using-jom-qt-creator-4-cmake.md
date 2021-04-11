---
layout: post
title:  "CMake: Using Jom with Qt Creator 4.0"
description: "Set the default make program to Jom"
date: 2016-05-13
tags: "qtcreator, programming"
comments: true
---

With the release of Qt Creator 4.0, the use of CMake becomes less painful. But `nmake` is the default make program so the use of `-j X` is not an option.
Fortunately, Qt Creator allows to set default CMake settings for each kits we have. So we can use Jom and get our parallel build back.

To use Jom, you can either set the CMake program in your `CMakeLists.txt` file like so:

```cmake
set(CMAKE_MAKE_PROGRAM "E:/Qt/Tools/QtCreator/bin/jom.exe" CACHE STRING "Set make program to jom" FORCE)
```

Or you can set the value in CMake configuration settings to make it default for all the projects. Open the settings window and go to `Build & Run -> Kits`

![settings_page](https://drive.google.com/uc?export=download&id=0B2b4SnYRu-h_YkIybXJvZm43UHM)

And then click on the `Change` button at the bottom next to `CMake Configuration` label.

![cmake_configuration_page](https://drive.google.com/uc?export=download&id=0B2b4SnYRu-h_NnFNSWpjNDRweEk)

And add this line to the bottom:

```cmake
CMAKE_MAKE_PROGRAM:STRING=E:/Qt/Tools/QtCreator/bin/jom.exe
```

Now you can add `-j X` to `Tool arguments` in `Projects` tab as usual.

