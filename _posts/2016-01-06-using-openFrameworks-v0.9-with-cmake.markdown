---
title:  "CMake: using openFrameworks v0.9 with CMake on Windows"
description: "CMake file templates for openFrameworks v0.9"
date: 2016-01-06
tags: c++, openFrameworks, programming
---

A while ago I wrote a project generator for using `QMake` with openFrameworks v0.8.4. You can find it [here][ofproject_generator_link]. When ofv0.9 came out with support for VS2015 and x64, I didn't want to use the previous version. But I also didn't want to use Visual Studio, I have a weird peeve about it. Since `QMake` doesn't have support for VS215, yet, I decided to port it to `CMake`. I didn't update the `ofProjectGenerator` to use both OF versions, `QMake` and `CMake`, but I'll do it soon. Here I'll lay out the steps to get it to work manually.

This is based on `of_v0.9.0_vs_release`. So, it's using the libraries in the release. Note that If you compile openFrameworks for both `release` and `debug`, you can copy those files to `${OF_PATH}/libs/openFrameworksCompiled/lib/cs/${Win32/x64}}` and the Cmake scripts will use those libraries and skip compiling openFrameworks from source. And that will decrease your compilation time. Be sure to name the `release` library as `openFrameworksLib_release.lib` and the `debug` library as `openFrameworksLib_debug.lib`.

You can get the template files from my GitHub account, [here][cmake_template_link]. Download the files `project_CMakeLists.txt`, `of_CMakeLists.txt` and `findOpenFrameworks-v0.9.cmake`.


- `project_CMakeLists.txt` is the cmake file for your project.
- `of_CMakeLists.txt` is the file for openFrameworks v0.9
- `findOpenFrameworks-v0.9.cmake` is the file that will set up the environment for you.


First copy `of_CMakeLists.txt` and `findOpenFrameworks-v0.9.cmake` to the openFrameworks root path on your computer. That's ``D:/Development/Tools/of_v0.9.0_vs_release/` on my computer. Then rename `of_CMakeLists.txt` to `CMakeLists.txt`.
Next up, create a folder for your project. Let's name it `of_cmake`. Copy the `project_CMakeLists.txt` to that folder as `CMakeLists.txt`. Now, open that file and you'll see a line like this: `set(OF_PATH "D:/Development/Tools/of_v0.9.0_vs_release/")`. Change that directory to point to the openFrameworks v0.9 path on your computer. And you are done!

If you want to use `addons`, then you'll see a `include(ofAddons.cmake)` line. Open `ofAddons.cmake`, or if you don't have it create the file, and add the desired addons like below. `${ADDONS_PATH}` is automatically set based on your `${OF_PATH}`, so you don't need to worry about that.

{% highlight cmake linenos %}
# Add addons
list(APPEND ADDONS_SRC
    ${ADDONS_PATH}/ofxAnimatable/src/ofxAnimatable.cpp
    ${ADDONS_PATH}/ofxAnimatable/src/ofxAnimatableFloat.cpp
    ${ADDONS_PATH}/ofxAnimatable/src/ofxAnimatableOfColor.cpp
    ${ADDONS_PATH}/ofxAnimatable/src/ofxAnimatableOfPoint.cpp
    )
list(APPEND ADDONS_HEADERS
        ${ADDONS_PATH}/ofxAnimatable/src/ofxAnimatable.h
        ${ADDONS_PATH}/ofxAnimatable/src/ofxAnimatableOfColor.h
        ${ADDONS_PATH}/ofxAnimatable/src/ofxAnimatableFloat.h
        ${ADDONS_PATH}/ofxAnimatable/src/ofxAnimatableOfPoint.h
    )

list(APPEND ADDONS_INCLUDE_PATH
    ${ADDONS_PATH}/ofxAnimatable/src
    )
{% endhighlight %}

This seems a lot of work to start a project but until I update the generator, it's as easy as it gets.

[ofproject_generator_link]: https://github.com/Furkanzmc/ofQProjectGenerator
[cmake_template_link]: https://github.com/Furkanzmc/ofQProjectGenerator/tree/master/data
