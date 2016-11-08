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

The example above assumes that delegates are perfectly lined with the same indexes. `ListView` or `GridView` can create additional items that are not related to
your `delegate`, so the safe way to do this would be to give your `delegate` a unique name in `ListView` so that you can use the following code to get the `delegate`
with name rather than index.

{% highlight qml %}

    ListView {
        id: listView

        Component {
            id: contextDelegate

            MyListItem {
                text: title
                objectName: unique_name
            }
        }

        MouseArea {
            anchors.fill: parent
            onClicked: {
                var delegate = getChildWithName(listView.contentItem, "unique_name");
                // Set the property
                delegate.text = "Hey Yo!";
                // Ge the property
                console.log(delegate.text);
            }
        }

        function getChildWithName(contentItem, name) {
            for(var i = 0; i < contentItem.children.length; i++) {
                var item = contentItem.children[i];
                if (item.objectName == name) {
                    return item;
                }
            }

            return undefined;
        }
    }

{% endhighlight %}
