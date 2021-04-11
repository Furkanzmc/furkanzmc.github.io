---
layout: post
title:  "Note to Self"
description: "General Notes About the Solutions I Have to Problems"
date: 2017-07-18
tags: "general, programming"
comments: true
---

# Problem 1 - Android: Exclude Files From Build in Gradle

I recently added Firebase messaging support to [qutils](https://github.com/Furkanzmc/qutils). But I had no idea how to exclude the Firebase related files when I'm not using Firebase on my project. I finally figured it out.

I could exclude them by using the following code in `build.gradle` file.

```gradle

java {
    exclude "**/notification/QutilsFirebase**"
}

```


# Problem 2 - QML: How to Disable QML File Caching

You just need to put the following code before `QApplication` in your `main.cpp` file.

```cpp

qputenv("QML_DISABLE_DISK_CACHE", "1");

```

# Problem 3 - QML: Text's fontSizeMode Property Doesn't Work

I've encountered with this recently. I was setting the `fontSizeMode: Text.HorizontalFit` but the text was seamingly the same size and was the drawn text was overflowing from the container. But when I set `elide: Text.ElideRight`, it worked perfectly. When I checked with the documentation nothing caught my eye at first but I read it again and I found the following:

> The font size of fitted text has a minimum bound specified by the minimumPointSize or minimumPixelSize property and maximum bound specified by either the font.pointSize or font.pixelSize properties.

This meant that the size of the text cannot be smaller than the `minimumPixelSize` or `minimumPointSize`, in my case they were high enough that setting the `fontSizeMode` did not make any difference. Let's read on:

> If the text does not fit within the item bounds with the minimum font size the text will be elided as per the elide property.

And I did not have the `elide` property set. So I wasn't seeing the effects. After lowering the `minimumPixelSize` and adding in the `elide` property, things worked as expected.

Here's a poorly designed visual to help you understand it better.

![image](https://drive.google.com/uc?export=download&id=0B2b4SnYRu-h_ZUN1dFl4S3BvRkk)

# Problem 4 - QML: Handle the Focus In an App With SwipeView and StackView

I've had this problem using the `NativeUtils` in my library [qutils](https://github.com/Furkanzmc/qutils). Here's the general type of app you develop: You have a top `StackView` along with a menu bar. Each item in the `StackView` has its own navigation system.

```qml

Item {
    id: root

    SwipeView {
        id: swipeView

        ViewOne { }

        ViewTwo { }

        ViewThree { }

        ViewFour { }
    }

    MenuBar {
        id: menubar
    }
}

```

And in each view, you have a `StackView` for navigation.

```qml

Item {
    id: root

    NavigationBar {
        id: navBar
    }

    NavigationStack {
        id: navStack
        initialItem: cmp
    }

    Component {
        id: cmp

        InnerViewOne { }
    }
}

```

And here's `InnerViewOne`.

```qml

NavigationPage {
    id: root

    NativeUtils {
        buttonEventsEnabled: true
        onBackButtonPressed: {
            root.navigationStack.pop();
        }
    }
}

```

Now, all four of those views are initialized. When you are in `ViewOne` you need to be able to tell that the focus is in this view even though the other items are also created. Now, when the `currentIndex` of `SwipeView` changes the focus property of the current item is set automatically. So when `currentIndex` is 0, `ViewOne`'s `focus` property will be true. Here's where the problem starts, within `ViewOne` you also have a `StackView` and that `StackView` can contain multiple items. And those items are where the real logic happens. So, If you are on Android and want to pop the stack you need to hook to the back button event and also need to know that `InnerViewOne` is the main visible item, that menu bar is not showing another view.

Since `buttonEventsEnabled` is set to true, this instance will receive the events no matter the focus of the `NavigationPage`. To solve the problem, you need to make use of the `FocusScope` and bind to its focus property with the `NavigationStack`. And whenever the `focus` property of the `NavigationStack` changes, you need to get the last item in the stack and change its focus too.

# Problem 5 - QML Android: Call a number, or start an email activity for an email address

This is really easu using the right URI and `Qt.openUrlExternally`.

To open the dialar app for a specified number, use the following:

```qml

Qt.openUrlExternally("tel:" + phoneNumber);

```

To open the email app for a specified email, use the following:

```qml

Qt.openUrlExternally("mailto:email@address.com");

```

You can learn more about the mailto syntax [here](https://www.labnol.org/internet/email/learn-mailto-syntax/6748/).
