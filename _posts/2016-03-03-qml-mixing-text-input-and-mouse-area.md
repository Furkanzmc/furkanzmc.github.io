---
layout: post
title:  "Mixing together TextInput and MouseArea(s)"
description: "Put MouseArea over TextInput and control focus"
date: 2016-03-03
category:
  - qml
  - programming
comments: true
---

`TextInput` gets activated with **pressing** rather than *clicking*. This creates some problems on mobile devices where you would like to add swipe or press and hold behaviors over `TextInput` with `MouseArea` over it. While I was developing [Mantar][mantar_url]. I wanted to press and hold over a `TextInput` to toggle the done state of a task and when I click on it, I wanted to start editing the task. I also had a topmost `MouseArea` that controlled swipe up and down gestures to open or close the menu.

To add a topmost `MouseArea` and still get the mouse or touch events to the other `MouseArea`s you just need to set the `propagateComposedEvents` value to true. And then, you add another `MouseArea` over the `TextInput` and set `propagateComposedEvents` value to true.


```qml
TextInput {
    id: textBox
    selectByMouse: true
    clip: true

    MouseArea {
        anchors.fill: parent
        //Set the focus reason so we can activate the keyboard on mobile devices
        onClicked: textBox.forceActiveFocus(Qt.MouseFocusReason)
        propagateComposedEvents: true
        visible: !textBox.focus
        onPressAndHold: {
            if (textBox.text.length > 0) {
                done = !done;
                root.editingFinished(done);
            }
        }
    }
}
```

[mantar_url]: https://github.com/ZerronLabs/Mantar
