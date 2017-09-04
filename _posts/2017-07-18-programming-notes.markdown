---
title:  "Note to Self"
description: "General Notes About the Solutions I Have to Problems"
date: 2017-07-18
tags: general, programming
---

# Problem 1 - Android: Exclude Files From Build in Gradle

I recently added Firebase messaging support to [qutils](https://github.com/Furkanzmc/qutils). But I had no idea how to exclude the Firebase related files when I'm not using Firebase on my project. I finally figured it out.

I could exclude them by using the following code in `build.gradle` file.

{% highlight gradle %}

java {
    exclude "**/notification/QutilsFirebase**"
}

{% endhighlight %}


# Problem 2 - QML: How to Disable QML File Caching

You just need to put the following code before `QApplication` in your `main.cpp` file.

{% highlight cpp %}

qputenv("QML_DISABLE_DISK_CACHE", "1");

{% endhighlight %}

# Problem 3 - QML: Text's fontSizeMode Property Doesn't Work

I've encountered with this recently. I was setting the `fontSizeMode: Text.HorizontalFit` but the text was seamingly the same size and was the drawn text was overflowing from the container. But when I set `elide: Text.ElideRight`, it worked perfectly. When I checked with the documentation nothing caught my eye at first but I read it again and I found the following:

> The font size of fitted text has a minimum bound specified by the minimumPointSize or minimumPixelSize property and maximum bound specified by either the font.pointSize or font.pixelSize properties.

This meant that the size of the text cannot be smaller than the `minimumPixelSize` or `minimumPointSize`, in my case they were high enough that setting the `fontSizeMode` did not make any difference. Let's read on:

> If the text does not fit within the item bounds with the minimum font size the text will be elided as per the elide property.

And I did not have the `elide` property set. So I wasn't seeing the effects. After lowering the `minimumPixelSize` and adding in the `elide` property, things worked as expected.

Here's a poorly designed visual to help you understand it better.

![image](https://drive.google.com/uc?export=download&id=0B2b4SnYRu-h_ZUN1dFl4S3BvRkk)
