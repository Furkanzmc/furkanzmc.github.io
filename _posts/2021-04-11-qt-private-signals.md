---
layout: post
title: "How to Create Private Signals"
description: "Take control of your signals by making them private"
date: 2021-04-11
category:
  - qml
  - qt
comments: true
---

Qt provides a powerful mechanism to write reactive applications. A signal is emitted when a
particular event occurs. And as a response to that, a slot is fired. If you want your application to
change its theme when the system theme changes, you would write something like:

```cpp
connect(watcher, &SystemThemeWatcher::themeChanged, theme, &Theme::updateTheme);
```

`watcher` is our sender. When it emits `themeChanged()` signal, our `updateTheme()` will be called
and as a result our application theme will reflect the system theme.

I won't go into details of the signal slot system. The [official
documentation](https://doc.qt.io/qt-5/signalsandslots.html) does an excellent job of it. What I want
to focus on is the way that the signals are used. Let's examine the meaning of a signal.

> A signal is emitted when a particular event occurs.

This **particular event** is usually the change of an internal state of a class.

```cpp
class Theme : public QObject
{
    Q_OBJECT

public:
    void setTheme(Type type)
    {
        if (type == Type::Dark && m_currentType != type) {
            // Update theme
            emit themeChanged();
        }
        else if (type == Type::Light && m_currentType != type) {
            // Update theme
            emit themeChanged();
        }
    }

signals:
    void themeChanged();
}

// SomeOtherFile.cpp
void myFunc()
{
    Theme::instance().setTheme(Theme::Type::Dark);
}
```
My internal state in `Theme` is whether I have the dark or light theme.  When I call `myFunc()`, it
will access our theme singleton and ask it to load the dark theme.  There's a catch here, a signal
is a public member function of a class. That means, I can also do the following:

```cpp
void myBadFunc()
{
    emit Theme::instance().themeChanged();
}
```

What happens if this is called? I probably had dozens of bindings to `themeChanged()`, and all those
bindings got re-evaluated. For some other class, this could be an expensive operation. 

Since a signal conveys the message that "My internal state changed.", it only makes sense that this
internal change can only be known by the class itself. However, Since signals are public, there's no
way for us to stop the user of our class from emitting these signals.

Or is there?

I have not been able to find this feature in the official documentation. And it's briefly mentioned
in [How Qt Signals and Slots Work - Part 2 - Qt5 New
Syntax](https://woboq.com/blog/how-qt-signals-slots-work-part2-qt5.html). But even though it's
undocumented, there's indeed a way to create private signals. And I think this should be the default
way of creating signals for all classes as the users of a class should not know about its internal
state.

You can use `QPrivateSignal` as the last parameter of a signal to indicate that the signal is
supposed to be private. When `moc` is processing your file, it reads the arguments and if it's
`QPrivateSignal` then it creates a special version of the signal handler that always feeds in the
default constructed `QPrivateSignal` for the class. `QPrivateSignal` is defined inside `Q_OBJECT`
so as long as you have `Q_OBJECT` you have access to private signals.

```cpp
#define Q_OBJECT
public:
  QT_WARNING_PUSH
  Q_OBJECT_NO_OVERRIDE_WARNING
  static const QMetaObject staticMetaObject;
  virtual const QMetaObject *metaObject() const;
  virtual void *qt_metacast(const char *);
  virtual int qt_metacall(QMetaObject::Call, int, void **);
  QT_TR_FUNCTIONS
private:
  Q_OBJECT_NO_ATTRIBUTES_WARNING
  Q_DECL_HIDDEN_STATIC_METACALL static void qt_static_metacall(
      QObject *, QMetaObject::Call, int, void **);
  QT_WARNING_POP 
  struct QPrivateSignal {}; // This is the private data that enables us to create private signals.
  QT_ANNOTATE_CLASS(qt_qobject, "")
```

Here's the updated version of the above example with the private signal.

```cpp
class Theme : public QObject
{
    Q_OBJECT

public:
    void setTheme(Type type)
    {
        if (type == Type::Dark && m_currentType != type) {
            // Update theme
            emit themeChanged(QPrivateSignal{});
        }
        else if (type == Type::Light && m_currentType != type) {
            // Update theme
            emit themeChanged(QPrivateSignal{});
        }
    }

signals:
    void themeChanged(QPrivateSignal);
}

// SomeOtherFile.cpp
void myFunc()
{
    Theme::instance().setTheme(Theme::Type::Dark);
}
```

With this change, I will not be able to call `themeChanged()` outside of my `Theme` class.

```cpp
void myBadFunc()
{
    // ERROR! Cannot compile this.
    emit Theme::instance().themeChanged();
}
```

Interestingly, this feature has been available since 2012. And [here's the
commit](https://github.com/qt/qtbase/commit/0efa445141ce3d7243f28e7b6da730d8dec17e23) that
introduced this change.

Here's the generated `moc_Theme.cpp` file when we are using the public signal:

```cpp
void Theme::qt_static_metacall(QObject *_o, QMetaObject::Call _c,
                                        int _id, void **_a) {
  if (_c == QMetaObject::InvokeMetaMethod) {
    auto *_t = static_cast<Theme *>(_o);
    (void)_t;
    switch (_id) {
    case 1:
      _t->themeChanged();
      break;
    }
  }
}
```
And here's the private one:

```cpp
void Theme::qt_static_metacall(QObject *_o, QMetaObject::Call _c,
                                        int _id, void **_a) {
  if (_c == QMetaObject::InvokeMetaMethod) {
    auto *_t = static_cast<Theme *>(_o);
    (void)_t;
    switch (_id) {
    case 1:
      _t->themeChanged(QPrivateSignal());
      break;
    }
  }
}
```

It's important to note that the visibility of the signal is not actually affected. The declared
signal is still a public member of `Theme`. But since the first parameter is a private member of
`Theme`, the user of `Theme` does not have access to it and cannot provide the correct arguments to
call `themeChanged()`.

I've always hated using public signals, and having learned about this, I started using private
signals in my projects. It makes things easier to manage because it truly enforces the meaning of a
signal: An internal state change notification that only the class can know about.

## Private Signals with QML

The signals are always exposed to QML.

```qml
Theme {
   onThemeChanged: {

   }
}
```

When we make the `themeChanged()` private, the signal will still be accessible from QML. Another
interesting bit is that the private data member in the signal will still be exposed to QML if the
signal has more than 1 parameters. If there's only one, which is `QPrivateSignal`, then it won't
be exposed.

```cpp
// Theme.h
signals:
    void themeChanged(QPrivateSignal pr);
    void themeChangedWithParams(int type, QPrivateSignal pr);
```

```qml
// main.qml
Theme {
  onThemeChanged: (pr) => {
    console.log("pr is", pr)
    // Output: "pr is undefined"
  }
  onThemeChangedWithParams: (type, pr) => {
    console.log("pr is", pr)
    // Output: "pr is QVariant(Theme::QPrivateSignal, )"
  }
  // You should have this handler.
  onThemeChangedWithParams: (type) => {
  }
}
```
