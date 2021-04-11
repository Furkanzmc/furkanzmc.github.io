---
layout: post
title:  "C++: Body Tracking with Kinect v2"
description: "A simple starting point for learning body tracking with Kinect v2"
date: 2016-01-08
tags: "cpp, kinect, programming"
comments: true
---

Welcome to my 2nd post on using Kinect v2 with C++. If you haven't read it, you can read my introduction to Kinect v2 post [here][intro_kinect_link]
With Kinect v2 you can track up to 6 people. This tutorial does not deal with drawing the skeletons or anything like that. I want to focus only on Kinect part here. You can use whatever tool you want to draw the data you get from Kinect.

First, let's talk about the data types that you'll be using for skeleton tracking.

- `IKinectSensor`: Represents a Kinect sensor device. This is the interface that you use to connect to a device, open new streams, or the availability of the device.
- `IBodyFrameSource`: You use this interface to get the frame source and connect to the `IBodyFrameReader`.
- `IBodyFrameReader`: This is the interface to acquire the skeleton data. You cannot create a `IBodyFrameReader` unless you have a valid, open and available `IKinectSensor`, and `IBodyFrameSource`.
- `IBodyFrame`: Represents the current frame in `IBodyFrameReader`. This holds relative time from the sensor, skeleton joint data and the floor clip plane.
- `IBody`: This is the that holds the data for skeleton joints (Joint positions, rotations), hand states and lean information.

So here's the flow to getting the skeleton joint position. First, you get the default Kinect device to a `IKinectSensor` interface, then using that you open a source for your `IBodyFrameReader` from which you get `IBodyFrame` that holds all the available skeleton information. Let's get into some code.

--------------------

Remember the flow? We first get an available Kinect device.

```cpp
IKinectSensor *sensor = nullptr;
IBodyFrameReader *bodyFrameReader = nullptr;

//Get the default Kinect sensor
HRESULT hr = GetDefaultKinectSensor(&sensor);
```

`HRESULT` is a Windows specific data type that holds return codes for the Windows specific functions. You use `SUCCEEDED` or `FAILED` to determine if the code was a success. You can find all the error codes in `winerror.h` file or [here][windows_hresult_list]. From here we only continue if the operation succeeded. So the rest of the code looks like this.

```cpp
IKinectSensor *sensor = nullptr;
IBodyFrameReader *bodyFrameReader = nullptr;

//Get the default Kinect sensor
HRESULT hr = GetDefaultKinectSensor(&sensor);

//If the function succeeds, open the sensor
if (SUCCEEDED(hr)) {
    hr = sensor->Open();

    if (SUCCEEDED(hr)) {
        //Get a body frame source from which we can get our body frame reader
        IBodyFrameSource *bodyFrameSource = nullptr;
        hr = sensor->get_BodyFrameSource(&bodyFrameSource);

        if (SUCCEEDED(hr)) {
            hr = bodyFrameSource->OpenReader(&bodyFrameReader);
        }

        //We're done with bodyFrameSource, so we'll release it.
        safeRelease(bodyFrameSource);
    }
}

if (sensor == nullptr || FAILED(hr)) {
    std::cerr << "Cannot find any sensors.\n";
    return E_FAIL;
}
```

After we are done with error checking, we can go ahead and get our skeleton data.

```cpp
while (bodyFrameReader != nullptr) {
    IBodyFrame *bodyFrame = nullptr;
    hr = bodyFrameReader->AcquireLatestFrame(&bodyFrame);

    if (SUCCEEDED(hr)) {
        IBody *bodies[BODY_COUNT] = {0};
        hr = bodyFrame->GetAndRefreshBodyData(_countof(bodies), bodies);

        //If we successfully got the body information, continue to process the bodies.
        if (SUCCEEDED(hr)) {
            processBodies(BODY_COUNT, bodies);
            //After body processing is done, we're done with our bodies so release them.
            for (unsigned int bodyIndex = 0; bodyIndex < _countof(bodies); bodyIndex++) {
                safeRelease(bodies[bodyIndex]);
            }

            //We are done with bodyFrame, so release it
            safeRelease(bodyFrame);
        }
    }
    else if (sensor) {
        BOOLEAN isSensorAvailable = false;
        hr = sensor->get_IsAvailable(&isSensorAvailable);
        if (SUCCEEDED(hr) && isSensorAvailable == false) {
            std::cerr << "No available sensor is found.\n";
        }
    }
    else {
        std::cerr << "Trouble reading the body frame.\n";
    }
}
```

`IBody` frame itself doesn't give you any seemingly meaningful data. It's up to you to make sense of it, otherwise they are just numbers on the screen. You don't get a message saying user swiped right or raised her hand. That's why we use the `processBodies` function. Now, gesture recognition is not for this blog but we'll just do a simple one. Let's look at `processBodies`.

```cpp
void processBodies(const unsigned int &bodyCount, IBody **bodies)
{
    for (unsigned int bodyIndex = 0; bodyIndex < bodyCount; bodyIndex++) {
        IBody *body = bodies[bodyIndex];

        //Get the tracking status for the body, if it's not tracked we'll skip it
        BOOLEAN isTracked = false;
        HRESULT hr = body->get_IsTracked(&isTracked);
        if (FAILED(hr) || isTracked == false) {
            continue;
        }

        //If we're here the body is tracked so lets get the joint properties for this skeleton
        Joint joints[JointType_Count];
        hr = body->GetJoints(_countof(joints), joints);
        if (SUCCEEDED(hr)) {
            //Let's print the head's position
            const CameraSpacePoint &headPos = joints[JointType_Head].Position;
            const CameraSpacePoint &leftHandPos = joints[JointType_HandLeft].Position;

            //Let's check if the use has his hand up
            if (leftHandPos.Y >= headPos.Y) {
                std::cout << "LEFT HAND UP!!\n";
            }

            HandState leftHandState;
            hr = body->get_HandLeftState(&leftHandState);
            if (SUCCEEDED(hr)) {
                if (leftHandState == HandState_Closed) {
                    std::cout << "CLOSED HAND\n";
                }
                else if (leftHandState == HandState_Open) {
                    std::cout << "OPEN HAND\n";
                }
                else if (leftHandState == HandState_Lasso) {
                    std::cout << "PEW PEW HANDS\n";
                }
                else if (leftHandState == HandState_NotTracked) {
                    std::cout << "HAND IS NOT TRACKED\n";
                }
                else if (leftHandState == HandState_Unknown) {
                    std::cout << "HANDS STATE IS UNKNOWN\n";
                }
            }
        }
    }
}
```

Kinect has 3 data types for coordinate representation: `CameraSpacePoint`, `DepthSpacePoint` and `ColorSpacePoint`. You can guess what they mean. But keep in mind that `CameraSpacePoint` coordinate system is relative to Kinect. So, the point `0, 0, 0`, is the center of Kinect's field of view. So it will change depending on where the sensor is looking at. `DepthSpacePoint` and `CameraSpacePoint` have the origin on their top left corner.

As you can see clearly from the code above, we only get the positions for head and left hand. And from their positions we deduce that user has his left hand up. As you can imagine, this is a very very simple way of gesture detection. You'll need more code and sophistication as you need more complex gestures, like swipe or punch (They are not that complex but those came to mind first.).

You can also get hand states from `IBody` and you can guess what each of them are, maybe except `HandState_Lasso`. You get `HandState_Lasso` when you extend only your two fingers.
Kinect does its thing at 30fps, so If you are developing a game or an interactive application with higher FPS nees you might want to use Kinect in a different thread.

You can find the full source code [here][full_source].

[intro_kinect_link]: http://zmc.space/2016/kinect-v2-introduction/
[windows_hresult_list]: https://msdn.microsoft.com/en-us/library/cc704587.aspx
[full_source]: https://gist.github.com/Furkanzmc/2925d8b53a5002d6f526
