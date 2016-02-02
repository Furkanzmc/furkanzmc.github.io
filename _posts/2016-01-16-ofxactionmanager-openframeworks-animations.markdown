---
title:  "openFrameworks: Making Easy Animations With ofxActionManager"
description: "A port of cocos2dx action system"
date: 2016-01-16
tags: c++, programming, openFrameworks, animation
---

I picked up using openFrameworks a while ago. But even before that I've been doing game development with [Cocos2dx][cocos2dx_link]. It's really a great framework and you come to get used to some aspects of it. And it becomes harder for you to live without them. :D

Take the `Action` system in Cocos2dx as an example. It's a great system in which you can make easy animations, chain them, and create new ones on condition. It's a great fire-and-forget system for animations. You want your circle to move to a position? Easy: `myCircle->runAction(MoveTo::create(.5f, Vec2(x, y)))`. And you don't have to keep track of it once you run it. It will do its job and self-destroy.

So that's why I also wanted to be able to use such a system in openFrameworks. So I started porting the system to openFrameworks and I named it `ofxActionManager`. You can find the code in my [GitHub account][ofx_action_manager_link].

`Action`s work on `Node`s in Cocos2dx. I'm not an expert on openFrameworks. But I thought since people do a lot of custom drawing and stuff in openFrameworks I thought it'd be better to make the `Action`s depend on a smaller, lightweight class. So instead of `Node`, ofxActionManager uses `ActionTarget` which is a class with rotation, position, scale and color properties. So when you want to use the action system, you can either inherit `ActionTarget` and call your update and draw functions. Or you can just store it as a variable and get the necessary information form that.

Let's talk about what each class is responsible for.

- `Action`: This is the base class for all the actions.
- `FiniteTimeAction`: It inherits `Action` and it is used for actions that have a duration. `0` seconds is also considered a duration.
- `ActionInterval`: An interval action is an action that takes place within a certain period of time. It has an start time, and a finish time.
- `ActionInstant`: Instant actions don't have any duration and they are executed immediately and one time only.
- `ActionEase`: This is the base class for the easing actions that run on other actions.

By using these base classes, you can create any number of actions you want. Cocos2dx has actions to manipulate position, scale, rotation, color, visibility... And many more can be implemented as needed.

Let's see an example in openFrameworks. Let's create a `MyCircle` class that inherits `ActionTarget`.

{% highlight cpp %}
#include "ActionTarget.h"

class MyCircle : public ActionTarget
{
public:
    MyCircle(float radius = 30.f)
        : m_Radius(radius)
    {}

    void draw()
    {
        ofCircle(m_Position, m_Radius);
    }

private:
    float m_Radius;
};

{% endhighlight %}

`ActionTarget` has a helper function `ActionTarget::runAction(Action *action)`. This function takes the action its given and adds it our action manager setting the target to itself.


{% highlight cpp %}

//Part ofApp.h
#include "MyCircle.h"

private:
    MyCircle m_Circle;

{% endhighlight %}


{% highlight cpp %}

//Part of ofApp.cpp
#include "ofxActionManager.h"

ofApp::ofApp()
    : m_Circle()
{

}

void ofApp::update()
{
    //ActionManager is a singleton class. Make sure to call update in just one place
    ActionManager::getInstance()->update(ofGetLastFrameTime());
}

void ofApp::draw()
{
    m_Circle.draw();
}

void ofApp::mouseReleased(int x, int y, int button)
{
    //Let's move the circle to the mouse position
    if (button == OF_MOUSE_BUTTON_1) {
        m_Circle.runAction(1.f, MoveTo::create(ofVec2f(x, y)));
    }
    else {
        //We can also use easings on any action
        auto moveAction = MoveTo::create(ofVec2f(x, y));
        m_Circle.runAction(1.f, EaseBackIn::create(moveAction));
    }
}

{% endhighlight %}

Once you call `runAction`, the circle will move to the position with a smooth and eased animation. Under the hood, `ActionTarget::runAction(Action *action)` calls `ActionManager::getInstance()->addAction(Action *action, this, false)`. So instead of using `runAction` you can also use `ActionManager::addAction`.

The main usage is the same as Cocos2dx so you can read up on actions from [here][cocos2dx_actions_link] and do the same with [ofxActionManager][ofx_action_manager_link].

[ofx_action_manager_link]: https://github.com/Furkanzmc/ofxActionManager
[cocos2dx_actions_link]: http://www.cocos2d-x.org/wiki/Actions
[cocos2dx_link]: http://www.cocos2d-x.org
