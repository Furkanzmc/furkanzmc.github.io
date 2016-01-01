---
title:  "How to Compile OpenBR for x86 Architecture with MSVC2013"
description: Compile OpenBR for x86 Windows
date: 2015-12-30
---

For those of you wants to use OpenBR for x64 platforms, OpenBR has a binary version [here][openbr_binary_download], or If you want to build it from source the instructions are [here][openbr_instructions].
Now, building for x86 is pretty much the same, you just need to provide the x86 libraries.

- First, make sure that you have the Microsoft compilers installed.
- Then, download and install CMake [here][cmake_download].
- Now, download OpenCV and follow the instructions to install it here. Make sure you complete all 5 steps.
- Download the Qt libraries [here][qt_download].
- Now, download the OpenBR source from [GitHub][openbr_source]. If you download as zip file, openbr/jangus folder will be empty. So make sure to download jangus from here and place its contents in the openbr/jangus folder.
- Then create a build in the OpenBR folder `D:/OpenBR/build`
- In the build folder, right click on the Explorer window while holding to shift button to open the command prompt in that directory.
- Once the command prompt is open, configure it with cmake

```text
cmake.exe -G "Visual Studio 12 2013" -DCMAKE_PREFIX_PATH="D:/OpenCV/build;C:/Qt/Qt5.3.1/5.3/msvc2013" -DCMAKE_INSTALL_PREFIX="./install" -DBR_INSTALL_DEPENDENCIES=ON -DCMAKE_BUILD_TYPE=Release ..
```

After the configuration is done  it will create the solution files for VS. If you don't want to use VS, cmake has other build targets you can use them.

[openbr_instructions]: http://openbiometrics.org/doxygen/latest/installation.html
[cmake_download]: http://www.cmake.org/cmake/resources/software.html
[qt_download]: http://www.qt.io/download/
[openbr_source]: https://github.com/biometrics/openbr
[openbr_binary_download]: https://github.com/biometrics/openbr/releases
