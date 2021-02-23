---
layout: post
title: "QML: How to Call a Function That's Inside of a TabView"
description: "Call a function or get a property in a TabView"
comments: 2016-01-01
keywords: "qml"
---

If you have a `TabView` in your QML file and you want to call a `Tab`'s function of that tab view, you might run into a problem If you try to call it directly
like you would any other function. This is because `Tab` does not inherit from `Item`, it inherits from `Loader`. So you would need the `item` property of the
`Tab` to call a function or acces a property of it.

Let's say you have the following code in your QML file.

```qml
TabView {
    Tab {
        id: tabOne

        SomeQMLObject {
            id: myObject

            function myFunc() {
                console.log("Called it!");
            }
        }
    }
}
```

Since `Tab` inherits `Loader`, the way you access the `myFunc` function is like this:

```qml
TabView {
    id: tabView

    Tab {
        id: tabOne

        SomeQMLObject {
            id: myObject

            function myFunc() {
                console.log("Called it!");
            }
        }
    }
}

Button {
    text: "Click Me"
    onClicked: tabOne.item.myFunc()
}
``````

**EDIT:** [@AkiHydway][aki_twitter_link] mentioned that `Tab` must be loaded, other wise `item` will be undefined, since it inherits `Loader`. And `Tab`s have lazy initialization, so it will not be loaded unless you specifically tell it to load or you activate the `Tab` by clicking on it. Thanks for the suggestion [@AkiHydway][aki_twitter_link]!


[aki_twitter_link]: https://twitter.com/AkiHydway

