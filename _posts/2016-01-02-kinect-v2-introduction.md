---
layout: post
title:  "C++: Introduction to Kinect v2"
description: "General introduction to Kinect v2 with C++"
date: 2016-01-02
tags: "kinect, cpp"
comments: true
---

When I first started programming with Kinect v2, I couldn't find enough tutorials for using Kinect v2 with C++. The examples that come with the SDK gives a head-start but I think it'd be good to have a more structured resource on this. So I thought I'd share what I've learned so far in a structured format. This post is going to be a general introduction to Kinect v2, although most of what I'll write is already commonly know I thought it'd be a good starting point.

Kinect v2 came out in 2014 and it was a real improvement over Kinect v1. With v2, we got 1080p RGB camera, improved depth data and much wider angle of view and 5 more joints with skeletal tracking. That is why with Kinect v2, Microsoft abondoned the motorized tilt that Kinect v1 had. When it comes to IR sensor, v1 used structured light, which was a PrimeSense technology, but with v2 Kinect uses time of flight sensor for depth imaging.

The downside of Kinect v1 was it could only be used by one app at the same time. But with v2, Kinect becomes a background service and multiple apps can get access to it at the same time. v2 also has the ability to track up to 6 skeletons, whereas v1 had 2 but body index support was for 6 people.

The most important thing you need to know about Kinect v2 is that it requires USB 3.0 with Renesas or Intel chipset. Somehow, Microsoft managed to hide this fact deep in their documentation and many developers, including me, fell victim to it. You can find the confirmed list of USB 3.0 PCI-e cards for Kinect v2 [here][kinect_usb_list]. USB 3.0 requirement is all that unnecessary because depending on open streams Kinect transmits up to 600 MB of data through your USB port. That's a lot of data, that's why Kinect v2 has higher system requirements than v1. You need to have a GPU card that supports DirectX 11, at least 4GB of RAM and i7 3.1 GHz or higher processor.

Kinect v2 has 5 types of streams: Color stream, depth stream, infrared stream, body stream and audio stream, which can all be used in conjunction with each other.

Next up, I'll write about getting body stream from Kinect v2.


[kinect_usb_list]: https://social.msdn.microsoft.com/Forums/en-US/bb379e8b-4258-40d6-92e4-56dd95d7b0bb/confirmed-list-of-usb-30-pcie-cardslaptopsconfigurations-which-work-for-kinect-v2-during?forum=kinectv2sdk

