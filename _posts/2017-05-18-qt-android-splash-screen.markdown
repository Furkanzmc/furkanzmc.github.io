---
title:  "Qt Android: Use Splash Screen and Avoid Flicker"
description: "TLDR Post for How to Add Splash Screen"
date: 2017-05-18
tags: qt, android, qutils, tldr
---

This is just a TLDR version of [this post](https://medium.com/@benlaud/complete-guide-to-make-a-splash-screen-for-your-qml-android-application-567ca3bc70af).

# Step 1

Put this in your `android/res/drawable` folder

{% highlight xml %}

<?xml version="1.0" encoding="utf-8"?>
<layer-list xmlns:android="http://schemas.android.com/apk/res/android">
    <item>
        <shape android:shape="rectangle" >
            <solid android:color="#FFFFFFFF"/>
        </shape>
    </item>
    <item>
         <bitmap android:src="@drawable/icon"
        android:gravity="center" />
    </item>
</layer-list>

{% endhighlight %}

You can optionally use this. It does the same thing, but in this case you need to have a `android/drawable/colors.xml` file with the color `blue` defined in it.

{% highlight xml %}

<?xml version="1.0" encoding="utf-8"?>
<layer-list xmlns:android="http://schemas.android.com/apk/res/android">
    <item android:drawable="@color/blue"/>
    <item>
        <bitmap android:gravity="center" android:src="@drawable/logo"/>
    </item>
</layer-list>

{% endhighlight %}

# Step 2

Create an app theme in `android/res/values`.

{% highlight xml %}

<?xml version="1.0" encoding="utf-8"?>
<resources>
    <style name="AppTheme" parent="@android:style/Theme.DeviceDefault.Light.NoActionBar">
        <item name="android:windowBackground">@drawable/splash</item>
    </style>
</resources>

{% endhighlight %}

# Step 3

Add this to your main activity in `AndroidManifest.xml`

{% highlight text %}

android:theme="@style/AppTheme"

{% endhighlight %}

# Step 4

Set `android.app.splash_screen_drawable` to your splash drawable.

{% highlight xml %}

<meta-data android:name="android.app.splash_screen_drawable" android:resource="@drawable/splash"/>

{% endhighlight %}

# Step 5

Use `Loader` to load your main scene. Set the initial `opacity` of the `Loader` to `0`, and set the `visible` property of your `Window` to `false`.
`Loader` should also have `asynchronous: true`. Like so:

{% highlight qml %}

Window {
    id: mainWindow
    visible: false

    Loader {
        anchors.fill: parent
        asynchronous: true
        opacity: 0
        onStatusChanged: {
            if (status === Loader.Ready) {
                mainWindow.visible = true;
                ldMain.opacity = 1;
            }
        }

        Behavior on opacity { NumberAnimation { duration: 150 } }
    }
}

{% endhighlight %}

# Step 6

You are done!

# Problems

The only problem I encountered is that the splash screen that is shown before `android.app.splash_screen_drawable` is mis-aligned with the one show in `android.app.splash_screen_drawable`.
To work around this problem I used the same style as the `splash.xml` but I removed the logo in the middle.

You can see the problem here:

![image](https://doc-14-00-docs.googleusercontent.com/docs/securesc/tbqa6s1jtsgnb7meh093vfbnsu530498/fph8utb0v4688hca5q3jlc101f1sqs1h/1495137600000/02650037401319194663/02650037401319194663/0B2b4SnYRu-h_YWR4amV1YldOY00?e=download)
