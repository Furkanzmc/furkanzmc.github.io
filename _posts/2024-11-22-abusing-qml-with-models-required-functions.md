---
layout: post
title: "Abusing QML: Expose a Function to View with a `required property var`"
description: ""
date: 2024-10-03
category:
  - qml
  - qt
comments: true
---

At work, we make use of a similar system to Qt Quick Control's styling. We enforce some additional
rules for this though, which makes it more strict than Qt Quick Controls. For example, the following
is the way to style a `Button` with Qt Quick Controls styles.

```qml
Button {
    id: root
    contentItem: MyLabel {
        text: root.text
    }
}
```

However, for our use cases, we wouldn't expect the styler to set the `text` property. We set that in
the template side. We found that this takes a lot more off of the shoulders of the styling code.

With that background information, let's move on to how I abused QML recently...

I was in a situation similar to this:

```qml
// MyTemplate.qml
Item {
    id: root

    Column {
        Repeater {
            delegate: root.delegate
        }
    }

    MyDataModel {
        id: myData

        property bool option_1
        property bool option_2
        property bool option_3
    }
}
```

My goal was to show some `CheckBox`es to display some options and when those options change, update
the properties inside `MyDataModel` so that the underlying code can react to these changes.

I had two problems:

1. Find a way to provide a model to the `Repeater` so that I can use the `delegate` to display
   multiple check boxes.
2. Get access to the checked state of the delegates without really having syntactical access to the
   delegates (i.e the delegates are declared in a different file.)

To expose the model, I could just have a simple solution like this:

```qml
ListModel {
    ListElement { text: "Option 1" }
    ListElement { text: "Option 2" }
    ListElement { text: "Option 3" }
}
```

So, that's not really hard. The hard part is having access to the checked state...

The way I see it, I could create a `MyTemplateItem.qml` file that can be styled in whatever way we
want. And then a `MyTemplateItemDelegate.qml` that inherits from `MyTemplateItem.qml` and then
handle signals.

```qml
Repeter {
    delegate: MyTemplateItemDelegate {
        onCheckedChanged: {
            if (option === "option_1") { /* Do things... */ }
        }
    }
}
```

This felt like a lot of code because I would have to have different files, signal handlers, and
checking against a string type like this is something I don't like.

So, I figured maybe I can create a model here where I can put some `QtObject`s in so that maybe I
can have some aliases to take care of updating the properties.

```qml
Repeater {
    // NOTE: I think this should work but trying it with 6.8 caused "Cannot assign multiple values
    // to a singular property" error.
    model: [
        QtObject {
            property string text: "Option 1"
            property alias turnedOn: myData.option_1
        }
    ]
}
```

This, unfortunately, didn't work. When the `required` property changes, the underlying data doesn't
change because this model doesn't support changing the data.

When you have a sufficiently large QML codebase, you will use the models and views for all sorts of
things and will end up with a lot of these required properties. I have used all the primitive types,
custom objects and various other types as the `required` properties here.

But... It never occurred to me to use JS function objects! Technically, they should work because
they can be stored in `QVariant`s. I was very curious to try it!

This is what the code looks like:

```qml
Repeater {
    model: [
        QtObject {
            property string text: "Option 1"
            property var toggle: () => {
                myData.option_1 = !myData.option_1
            }
        }
    ]
    delegate: MyTemplateItem {
        required property var toggle

        onCheckedChanged: {
            toggle()
        }
    }
}
```

And just like that, when `checkedChanged` is called, `toggle()` function is triggered and our value
in `myData` changes accordingly!

This isn't something that I would rely on everywhere. But I think it's neat that we could have a
solution like this for those rare cases to save us some time and typing code.

Over the years, I've abused QML in other ways. And I'm hoping to write about those at some point as
well.

Here's the full code for you try mess around with using the `qml` tool.

```qml
import QtQuick
import QtQuick.Controls

ApplicationWindow {
   id: root
   visible: true
   width: 300
   height: 300

   Column {
       Label {
           anchors {
               left: parent.left
               right: parent.right
           }
           text: "Filters"
           font.bold: true
           bottomPadding: 4
       }

       Repeater {
           property list<QtObject> objects: [
               QtObject {
                   property int number: 32
                   property string name: "Invisible Objects"
                   property var toggle: () => {
                       console.log("Invisible objects filter toggled!")
                   }
               },
               QtObject {
                   property int number: 33
                   property string name: "Cropped Objects"
                   property var toggle: () => {
                       console.log("Cropped objects filter toggled!")
                   }
               }
           ]

           model: objects
           delegate: CheckBox {
               id: dlg

               required property int number
               required property string name
               required property var toggle

               text: name + " - " + number
               onCheckedChanged: {
                   dlg.toggle()
               }
           }
       }
   }
}
```
