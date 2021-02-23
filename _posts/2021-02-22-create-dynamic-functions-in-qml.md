---
layout: post
title:  "QML: Create dynamic function objects from C++ for QML"
description: "Learn to make use of QJSEngine and QJSValue to construct dynamic function objects."
date: 2021-02-22
tags: "qt, qml"
---

When working with QML, I always favor static typing to dynamic typing as much as possible. I very
rarely use `var` when declaring properties. Sometimes though, this is inevitable. Especially if you
are working on an old code base.

Imagine you have some sort of internal C++ data structure that persists data between different runs
of your application (e.g window geometry from the last time it was open.). It is relatively easy
to expose these data types to QML if they are primitive, or even complex... A map comes in, it is
then hooked up to properties in the QML side and a connection is made so that both sides are
notified of any changes. Basically how `Qt.labs.settings.Settings` work.

```qml
Window {
    id: root

    MySettings {
        id: settings

        property int x: root.x
        property int y: root.y
        property int width: root.width
        property int height: root.height
    }
}
```

In `MySettings`, each `MySettings` object is tied to a certain internal data structure. The absence
of a property in the QML side is a programming error. And the same happens If the names or types of
the properties don't match. This is pretty useful and can help us reduce a lot of boilerplate code.

There's one case that's not covered here though. We may also have callable objects that are
persisted or stored in the same data structure as the ones I mention above. In these cases, what we
can do is to have a `QObject` and expose it to QML side so we can dispatch function calls
with string identifiers which are then used in C++ side to get callbacks and execute.

```qml
Button {
    onClicked: {
        // If the function is not found, the program asserts.
        // But we won't know this until we actually click the button.
        bridge.send("OnClicked")
    }

    CppBridge { id: bridge }
}
```

The downside of this is that we can only check for the validity of these functions when it is
executed. On top of that, we don't allow any function arguments. It could be done by passing a
`QVariantList`, but it's just an ugly way of doing it. I would prefer a more natural solution where
we can call the function like I'm calling any other function with arguments.

```qml
Button {
    onClicked: {
        // Just an ugly syntax...
        bridge.send("OnClicked", [1, 2])
    }

    CppBridge { id: bridge }
}
```

The ideal solution for this is the same mechanism that we use for exposing the primitive types.
But how can we expose the functions like the properties?

# Enter QJSEngine

[QJSEngine](https://doc.qt.io/qt-5/qjsengine.html) provides an environment for evaluating JavaScript
code. For example, It would allow you to implement a JavaScript console in your Qt application.
It can also help you create JavaScript objects in the C++ side that you can pass along to the QML
side.

What we want to do here, is to create an object that can be called using the regular function call
syntax in the QML side.

```qml
Window {
    id: root

    Button {
        onClicked: {
            settings.createCopy()
        }
    }

    MySettings {
        id: settings

        property int x: root.x
        property int y: root.y
        property int width: root.width
        property int height: root.height

        property var createCopy
    }
}
```

We can use [QJSEngine::evaluate](https://doc.qt.io/qt-5/qjsengine.html#evaluate) to create a
function object.

```cpp
QJSValue function = engine.evaluate("(function() { console.log('Hello world.') })")
assert(function.isCallable());
```

Using the same syntax, we can create a function and pass it to QML side.

```cpp
MySettings::init(InternalData *data)
{
    // Skipping a lot of the details here. You wouldn't actually refer to a
    // specific function object with name here but iterate over the available
    // ones.
    QJSEngine *engine = qjsEngine(this);
    InternalFunctionObject *obj = data.get("createCopy");
    QJSValue function = engine->evaluate("(function() { this._call('createCopy') })")
    assert(function.isCallable());

    const int propertyIndex = metaObject()->indexOfProperty("createCopy");
    assert(propertyIndex > 0);
    auto property = metaObject()->property(propertyIndex);
    property.write(this, QVariant::fromValue<QJSValue>(function));
}
```

But with this code, if we call `settings.createCopy` we'll get an error like this:

```log
<Unknown File>:1: TypeError: Property '_call' of object [object Object] is not a function
```

We want `this._call` call to happen in the current instance. But there's no instance information
here. `QJSEngine` will blindly create a `QJSValue` object without knowing anything about `MySettings`.
How do we tell the engine that we want `this` to be bound to our `MySettings` instance?

This is where [Function.bind()](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function/bind)
and [QJSValue::call](https://doc.qt.io/qt-5/qjsvalue.html#call) come in. We can create a function
that returns another function that has `this` bound to our `MySettings` instance.

```cpp
MySettings::init(InternalData *data)
{
    // Skipping a lot of the details here. You wouldn't actually refer to a
    // specific function object with name here but iterate over the available
    // ones.
    QJSEngine *engine = qjsEngine(this);
    InternalFunctionObject *obj = data.get("createCopy");

    QJSValue function =
        engine->evaluate("(function(obj) { return (function() { "
                         "this.call(args) }).bind(obj) })");
    assert(function.isCallable());

    QJSValue boundFunction = function.call(QJSValueList{engine->toScriptValue(this)});
    assert(boundFunction.isCallable());

    const int propertyIndex = metaObject()->indexOfProperty("createCopy");
    assert(propertyIndex > 0);
    auto property = metaObject()->property(propertyIndex);
    property.write(this, QVariant::fromValue<QJSValue>(boundFunction));
}
```

Now we have something we can use. The first function creates another function and the call to
`bind()` creates yet another function for us to use. And the final product will have `this` bound
to `MySettings` instance.

```qml
Window {
    id: root

    Button {
        onClicked: {
            // This now works! But we are not able to pass any arguments yet.
            settings.createCopy()
        }
    }

    MySettings {
        id: settings

        // ...

        property var createCopy
    }
}
```

The next problem to solve is passing arguments to this function. Unfortunately, there's no way for
us to statically tell the QML compiler that we want a function with two arguments and also mandate
the type of these arguments. This part of the solution will still require the function to be actually
called to see If the arguments were passed correctly.

We can use `arguments` object in JavaScript to create a function that takes as many arguments as
we provide them. We will still need to pass a list in the C++ side, but at least our call in QML
side will look like an actual function call.

```cpp
MySettings::init(InternalData *data)
{
    // Skipping a lot of the details here. You wouldn't actually refer to a
    // specific function object with name here but iterate over the available
    // ones.
    QJSEngine *engine = qjsEngine(this);
    InternalFunctionObject *obj = data.get("createCopy");

    QJSValue function =
        engine->evaluate("(function(obj) { return (function() { "
                         "let args = [];"
                         "for (let i = 0; i < arguments.length; i++) {"
                         "    args.push(arguments[i])"
                         "};"
                         "this.call(args) }).bind(obj) })");
    assert(function.isCallable());

    QJSValue boundFunction = function.call(QJSValueList{engine->toScriptValue(this)});
    assert(boundFunction.isCallable());

    const int propertyIndex = metaObject()->indexOfProperty("createCopy");
    assert(propertyIndex > 0);
    auto property = metaObject()->property(propertyIndex);
    property.write(this, QVariant::fromValue<QJSValue>(boundFunction));
}
```

Now we have a function that takes an unspecified number of arguments. These arguments are converted
to `QVariantList` because there's no way for us to expose a variadic method to QML from C++ side.

```qml
Window {
    id: root

    Button {
        onClicked: {
            // This now works!
            settings.createCopy()

            // Sadly, so does this.
            settings.createCopy(1, 2)
        }
    }

    MySettings {
        id: settings

        // ...

        property var createCopy
    }
}
```

# Conclusion

This solution has three benefits:

1- We get to know If we are missing a function or not when the QML document is first instantiated.
And not when we dispatch the function with a string, or do some other magic.

2- We are able to pass arguments to our functions in the C++ side.

3- We enable a uniform function call syntax.

This may not be the greatest solution, this is something that I came up with as I was thinking about
it and have not really applied it to the real life product yet. But it was interesting to see how
I can use these public APIs.

It would be great to be able to also check for the function arguments at initialization time.
Ideally, the declaration would look like this:

```qml
MySettings {
    id: settings

    // ...

    property Function<string> createCopy
}
```

However, this is something that needs support from the QML engine.  This is something I'll be
looking into for my future experiments.
