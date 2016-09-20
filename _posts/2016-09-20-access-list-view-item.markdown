---
title:  "QML: Access Children of a ListView"
description: "Access Children of a ListView"
date: 2016-09-20
tags: qml
---

When working with `ListView`s you sometimes want to access the properties of an item in `ListView`. And here's how you do it!

{% highlight qml %}

    ListView {
        id: listView

        Component {
            id: contextDelegate

            MyListItem {
                text: title
            }
        }

        MouseArea {
            anchors.fill: parent
            onClicked: {
                // Set the property
                listView.contentItem.children[0].text = "Hey Yo!";
                // Ge the property
                console.log(listView.contentItem.children[0].text);
            }
        }
    }

{% endhighlight %}

