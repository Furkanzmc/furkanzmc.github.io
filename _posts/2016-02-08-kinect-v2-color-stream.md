---
layout: post
title:  "C++: Color Stream with Kinect v2"
description: "Get the color data from Kinect v2"
date: 2016-02-08
tags: "cpp, kinect, programming"
comments: true
---

Kinect v2 supports 1080p RGB image and has 30 frames per second. So you can get much better quality than Kinect v1 which supported 640x480.

Let's talk about the interfaces we need for getting the color stream from the sensor.

- `RGBQUAD` is a structure that stores red, green and blue data fro an image.
- `IColorFrameReader` is the interface we use to read color frames from the sensor.
- `IColorFrameSource` is the interface that opens up a bridge for us to open a color frame reader.
- `IColorFrame` represents a frame from the frame reader.
- `IFrameDescription` stores the properties of an image frame from the sensor, like height, width, field of view etc...

The flow for getting the color data is similar to getting body data. We first have to connect to our sensor, get the color source from the sensor and using the color source open a color frame reader. Then we can use that reader to get our color frame. Then using that frame we get our raw RGBQUAD data. We can use casting to convert RGBQUAD to any RGB representation your graphics library needs. For example, with openFrameworks you can convert RGBQUAD to unsigned char and load that data to a texture. Let's see how this works out in code. I'm going to be using openFrameworks for this tutorial.

Let's see our member variables.

```cpp
private:
    const unsigned int m_ColorWidth, m_ColorHeight;
    IKinectSensor *m_KinectSensor;
    IColorFrameReader *m_ColorFrameReader;
    RGBQUAD *m_ColorRGBX;//Stores raw RGB data
    ofTexture m_Texture;

//Constructor in ofApp.cpp

ofApp::ofApp()
    : m_ColorWidth(1920)
    , m_ColorHeight(1080)
    , m_KinectSensor(nullptr)
    , m_ColorFrameReader(nullptr)
    , m_ColorRGBX(nullptr)
    , m_Texture()
{
    //Here we create heap storage for color pixel data
    m_ColorRGBX = new RGBQUAD[m_ColorWidth * m_ColorHeight];
}
```


Now, let's setup the sensor for color stream.

```cpp
HRESULT hr = GetDefaultKinectSensor(&m_KinectSensor);

if (m_KinectSensor && SUCCEEDED(hr)) {
    // Initialize the Kinect and get the color reader
    IColorFrameSource *colorFrameSource = nullptr;

    hr = m_KinectSensor->Open();

    if (SUCCEEDED(hr)) {
        hr = m_KinectSensor->get_ColorFrameSource(&colorFrameSource);
    }

    if (SUCCEEDED(hr)) {
        hr = colorFrameSource->OpenReader(&m_ColorFrameReader);
    }

    safeRelease(colorFrameSource);
}

if (!m_KinectSensor || FAILED(hr)) {
    std::cerr << ": No ready Kinect is found!\n";
}
```

From now on, we're going to use `m_ColorFrameReader` to access color data. We need to access it every frame to get updated color data. So we're going to get the new frames in our `ofApp::update` method.

```cpp
void ofApp::update()
{
    if (m_ColorFrameReader == nullptr) {
        return;
    }

    IColorFrame *colorFrame = nullptr;
    HRESULT hr = m_ColorFrameReader->AcquireLatestFrame(&colorFrame);

    if (FAILED(hr)) {
        return;
    }

    IFrameDescription *frameDescription = nullptr;

    int width = 0;
    int height = 0;

    UINT bufferSize = 0;
    RGBQUAD *buffer = nullptr;

    if (SUCCEEDED(hr)) {
        hr = colorFrame->get_FrameDescription(&frameDescription);
    }

    if (SUCCEEDED(hr)) {
        hr = frameDescription->get_Width(&width);
    }

    if (SUCCEEDED(hr)) {
        hr = frameDescription->get_Height(&height);
    }

    if (SUCCEEDED(hr)) {
        if (m_ColorRGBX) {
            buffer = m_ColorRGBX;
            bufferSize = m_ColorWidth * m_ColorHeight * sizeof(RGBQUAD);
            hr = colorFrame->CopyConvertedFrameDataToArray(bufferSize, reinterpret_cast<BYTE *>(buffer), ColorImageFormat_Rgba);
        }
        else {
            hr = E_FAIL;
        }
    }

    if (SUCCEEDED(hr)) {
        //If the width/height given from the sensor is the same as the default resolution, it means we get a valid data
        if (buffer && (width == m_ColorWidth) && (height == m_ColorHeight)) {
            // Draw the data with Direct2D
            const unsigned char *data = reinterpret_cast<unsigned char *>(buffer);
            if (data) {
                m_Texture.loadData(data, m_ColorWidth, m_ColorHeight, GL_RGBA);
            }
        }
    }

    safeRelease(frameDescription);
    safeRelease(colorFrame);
}
```

Lastly we draw the image in our `ofApp::draw` method.


```cpp
void ofApp::draw()
{
    if (m_Texture.isAllocated()) {
        m_Texture.draw(0, 0);
    }
}
```

Keep in mind that color frames come in 30 FPS. If you are developing a game or an interactive application with higher FPS needs you'll have the get the data from another thread to prevent FPS loss. We'll look into how you can do that after we finish with the streams.

Previous Posts

- [Introduction to Kinect v2][intro_kinect_link]
- [Body Tracking with Kinect v2][body_tracking_link]

[intro_kinect_link]: http://zmc.space/2016/kinect-v2-introduction/
[body_tracking_link]: http://zmc.space/2016/kinect-v2-body-tracking/
