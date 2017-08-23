---
title:  "Note to Self"
description: "General Notes About the Solutions I Have to a Problem"
date: 2017-07-18
tags: general, programming
---

# Problem 1

I recently added Firebase messaging support to [qutils](https://github.com/Furkanzmc/qutils). But I had no idea how to exclude the Firebase related files when I'm not using Firebase on my project. I finally figured it out.

I could exclude them by using the following code in `build.gradle` file.

{% highlight gradle %}

java {
    exclude "**/notification/QutilsFirebase**"
}

{% endhighlight %}
