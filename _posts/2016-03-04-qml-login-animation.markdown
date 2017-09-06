---
layout: post
title:  "QML: Example Login Animation"
description: "Login Screen with QML"
date: 2016-03-04
tags: [qml, programming, design]
---

![index page](https://drive.google.com/uc?export=download&id=0B2b4SnYRu-h_N1p3NlhhX1Vuak0)

This login concept belongs to [enszgr][enszgr_url]. I liked it and I wanted to recreate it with QML. This only focuses on the visual parts of the login screen so don't expect any functionality.

We have four main components for this animation:

* A custom check box
* A custom text box
* A login message box
* And a stack to put them all together.

Let's start with our check box implementation.

# Check Box

It's more of a tick than a check box as it, I'm assuming from the design, doesn't need any click effects. To achieve the animation in the design we are going to use two `Rectangle`s and states to manage their animation. First, let's declare some properties that we will need for this.

{% highlight qml %}

property int shortLineWidth: 10
property int longLineWidth: 25
property int lineThickness: 5
property bool checked: false
property color color: "#BA68C8"

{% endhighlight %}

I thought, since we won't be handling any click events it makes more sense to individually set the width of the each line in the tick. And using those values I set the width and height of the `Item` using the formula `a^2 + b^2 = c^2` for a triangle.

{% highlight qml %}
Item {
    property int shortLineWidth: 10
    property int longLineWidth: 25
    property int lineThickness: 5
    property bool checked: false
    property color color: "#BA68C8"

    id: root
    width: Math.sqrt(Math.pow(shortLineWidth, 2) / 2) + Math.sqrt(Math.pow(longLineWidth, 2) / 2)
    height: Math.sqrt(Math.pow(longLineWidth, 2) / 2)

{% endhighlight %}

We have two lines in our check box and the short one has a rotation of 45 degrees and the long one has a rotation of -45 degrees. Using the same triangle formula, we can position the long one based on the short one's size. Let's implement our rectangles.

{% highlight qml %}
Rectangle {
        id: partOne
        width: 0
        height: lineThickness
        color: root.color
        y: Math.sqrt(Math.pow(shortLineWidth, 2) / 2)
        transform: Rotation {
            origin.x: 0
            origin.y: partOne.height / 2
            angle: 45
        }

        Behavior on width { NumberAnimation { duration: 500; easing.type: Easing.InExpo } }
    }

    Rectangle {
        id: partTwo
        width: 0
        height: lineThickness
        color: root.color
        x: Math.sqrt(Math.pow(partOne.width, 2) / 2) - height / 2
        y: partOne.y + Math.sqrt(Math.pow(partOne.width, 2) / 2)
        transform: Rotation {
            origin.x: 0
            origin.y: partOne.height / 2
            angle: -45
        }

        Behavior on width { NumberAnimation { duration: 500; easing.type: Easing.OutBack } }
    }
{% endhighlight %}

The initial widths of the rectangles are 0, since they will be in the unchecked state when first loaded. To control their check state, we can use `State` and `Transition` to animate and change their width.

{% highlight qml %}
states: [
        State {
            name: "checked"
            when: checked

            PropertyChanges { target: partOne; width: shortLineWidth }
            PropertyChanges { target: partTwo; width: longLineWidth }
        },
        State {
            name: "unchecked"
            when: !checked

            PropertyChanges { target: partOne; width: 0 }
            PropertyChanges { target: partTwo; width: 0 }
        }
    ]

    transitions: [
        Transition {
            from: "unchecked"
            to: "checked"

            SequentialAnimation {
                NumberAnimation { target: partOne; property: "width"; duration: 250; easing.type: Easing.InOutQuad; from: 0; to: shortLineWidth }
                PauseAnimation { duration: 100 }
                NumberAnimation { target: partTwo; property: "width"; duration: 250; easing.type: Easing.OutBack; from: 0; to: longLineWidth }
            }
        },
        Transition {
            from: "checked"
            to: "unchecked"

            SequentialAnimation {
                NumberAnimation { target: partTwo; property: "width"; duration: 250; easing.type: Easing.InOutQuad; from: longLineWidth; to: 0 }
                PauseAnimation { duration: 100 }
                NumberAnimation { target: partOne; property: "width"; duration: 250; easing.type: Easing.InOutQuad; from: shortLineWidth; to: 0 }
            }
        }
    ]
{% endhighlight %}

# Login Text Box

The text box is a quite simple looking white rectangle with centered text and placeholder text. It also has a vague drop shadow under it. And the check box goes over it.
To put the drop shadow under the text box, we use `Item` as our container and put `DropShadow` and `Rectangle`, which contains `TextInput`, in it.
The code is pretty straightforward. When you look at the code `DropShadow` is over `Rectangle` because we want to give it a lower z-index by default. We can control this with the `z` property too.

{% highlight qml %}
import QtQuick 2.5
import QtGraphicalEffects 1.0

Item {
    property string placeholder: "ID"
    property bool passwordMaskEnabled: false
    property string passwordMask: "*"

    property alias checked: checkBox.checked
    property alias text: textBox.text
    property alias fontColor: textBox.color
    property alias font: textBox.font

    id: root

    DropShadow {
        anchors.fill: rect
        horizontalOffset: 0
        verticalOffset: 1
        radius: 16.0
        samples: 16
        color: "#424242"
        opacity: 0.2
        source: rect
    }

    Rectangle {
        id: rect
        anchors.fill: parent
        antialiasing: true
        color: "white"

        Text {
            id: placeholderLabel
            anchors.centerIn: parent
            horizontalAlignment: Text.Center
            text: placeholder
            font {
                pixelSize: textBox.font.pixelSize
            }
            opacity: 0.5

            Behavior on opacity { NumberAnimation { duration: 250 } }
        }

        TextInput {
            id: textBox
            width: parent.width - checkBox.width * 2
            height: parent.height
            anchors.centerIn: parent
            clip: true
            focus: root.focus
            font {
                pixelSize: height * 0.5
            }
            verticalAlignment: TextInput.AlignVCenter
            horizontalAlignment: TextInput.AlignHCenter
            onTextChanged: placeholderLabel.opacity = text.length > 0 ? 0 : 0.5;
            echoMode: passwordMaskEnabled ? TextInput.Password : TextInput.Normal
            passwordCharacter: passwordMask
            color: "#34495e"
        }

        LoginCheckBox {
            id: checkBox
            longLineWidth: 15
            shortLineWidth: 6
            lineThickness: 4
            anchors {
                right: parent.right
                rightMargin: checkBox.width * 1
                verticalCenter: parent.verticalCenter
            }
        }
    }
}
{% endhighlight %}

# Login Stack

This puts together three text boxes and manages the animation.

{% highlight qml %}
import QtQuick 2.0

Item {
    id: root

    LoginTextBox {
        id: textBoxID
        width: parent.width / 3
        height: root.height
        z: 2
        anchors {
            left: parent.left
            top: parent.top
        }
        placeholder: qsTr("ID")
        Keys.onReturnPressed: {
            textBoxID.checked = true;
            textBoxPass.anchors.leftMargin = 1;
            textBoxPass.opacity = 1;
            focus = false;
            textBoxPass.forceActiveFocus(Qt.MouseFocusReason);
        }
    }

    LoginTextBox {
        id: textBoxPass
        width: textBoxID.width
        height: root.height
        z: 1
        anchors {
            left: textBoxID.right
            leftMargin: -width * 0.9
            top: parent.top
        }
        opacity: 0.3
        placeholder: qsTr("PASS")
        passwordMaskEnabled: true
        Keys.onReturnPressed: {
            textBoxPass.checked = true;
            loginMessage.anchors.leftMargin = 1;
            loginMessage.opacity = 1;
            loginMessage.text = "Welcome <b>Aristo</b>";
        }

        Behavior on opacity { NumberAnimation { duration: 500; easing.type: Easing.OutQuart } }
        Behavior on anchors.leftMargin { NumberAnimation { duration: 500; easing.type: Easing.OutQuart } }
    }

    LoginMessage {
        id: loginMessage
        width: textBoxID.width
        height: root.height
        z: 0
        anchors {
            left: textBoxPass.right
            leftMargin: -width * 0.9
            top: parent.top
        }
        opacity: 0.3
        fontColor: "#BA68C8"
        font.pixelSize: height * 0.4

        Behavior on opacity { NumberAnimation { duration: 500; easing.type: Easing.OutQuart } }
        Behavior on anchors.leftMargin { NumberAnimation { duration: 500; easing.type: Easing.OutQuart } }
    }
}
{% endhighlight %}

You can find the whole source code on my [GitHub][github_url] account.

[enszgr_url]: http://enszgr.com/login-concept.html
[github_url]: https://github.com/Furkanzmc/QML-Example-Login
