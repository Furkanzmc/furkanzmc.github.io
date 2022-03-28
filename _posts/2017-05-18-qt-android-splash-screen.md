---
layout: post
title:  "Use Splash Screen and Avoid Flicker"
description: "TLDR Post for How to Add Splash Screen"
date: 2017-05-18
category:
  - qt
  - android
  - qutils
  - tldr
comments: true
---

This is just a TLDR version of [this post](https://medium.com/@benlaud/complete-guide-to-make-a-splash-screen-for-your-qml-android-application-567ca3bc70af).

# Step 1

Put this in your `android/res/drawable` folder

```xml

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

```

You can optionally use this. It does the same thing, but in this case you need to have a `android/drawable/colors.xml` file with the color `blue` defined in it.

```xml

<?xml version="1.0" encoding="utf-8"?>
<layer-list xmlns:android="http://schemas.android.com/apk/res/android">
    <item android:drawable="@color/blue"/>
    <item>
        <bitmap android:gravity="center" android:src="@drawable/logo"/>
    </item>
</layer-list>

```

# Step 2

Create an app theme in `android/res/values`.

```qml

<?xml version="1.0" encoding="utf-8"?>
<resources>
    <style name="AppTheme" parent="@android:style/Theme.DeviceDefault.Light.NoActionBar">
        <item name="android:windowBackground">@drawable/splash</item>
    </style>
</resources>

```

# Step 3

Add this to your main activity in `AndroidManifest.xml`

```

android:theme="@style/AppTheme"

```

# Step 4

Set `android.app.splash_screen_drawable` to your splash drawable.

```xml

<meta-data android:name="android.app.splash_screen_drawable" android:resource="@drawable/splash"/>

```

# Step 5

Use `Loader` to load your main scene. Set the initial `opacity` of the `Loader` to `0`, and set the `visible` property of your `Window` to `false`.
`Loader` should also have `asynchronous: true`. Like so:

```qml

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

```

# Step 6

You are done!

# Problems

The only problem I encountered is that the splash screen that is shown before `android.app.splash_screen_drawable` is mis-aligned with the one show in `android.app.splash_screen_drawable`.
To work around this problem I used the same style as the `splash.xml` but I removed the logo in the middle.

You can see the problem here:

![image](https://drive.google.com/uc?export=download&id=0B2b4SnYRu-h_YWR4amV1YldOY00)
