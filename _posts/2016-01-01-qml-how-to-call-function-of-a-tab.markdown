---
title:  "QML: How to Call a Function That's Inside of a TabView"
description: "Call a function or get a property in a TabView"
date: 2016-01-01
---

If you have a `TabView` in your QML file and you want to call a `Tab`'s function of that tab view, you might run into a problem If you try to call it directly
like you would any other function. This is because `Tab` does not inherit from `Item`, it inherits from `Loader`. So you would need the `item` property of the
`Tab` to call a function or acces a property of it. 

Let's say you have the following code in your QML file.

{% highlight qml linenos %}
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
{% endhighlight %}

Since `Tab` inherits `Loader`, the way you access the `myFunc` function is like this:

{% highlight qml linenos %}
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
{% endhighlight %}
