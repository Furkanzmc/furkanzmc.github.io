---
layout: post
title:  "How to Support Emoji on Google Cloud SQL and Django"
description: "Support Emojis in Your MySQL Database"
date: 2017-09-14
tags: [django, python, google_cloud]
---

To enable emojis in your database, you just need to create it using `utf8mb4` charset and `utf8mb4_bin` collation. And then you can insert emojis to your database. But it's not that straightforward when you are using Django and Google Cloud SQL.

You can read why it's no straightforward [here](https://github.com/GoogleCloudPlatform/appengine-django-skeleton/issues/28). There's also a StackOverflow question [here](https://stackoverflow.com/questions/36144026/unable-to-use-utf8mb4-character-set-with-cloudsql-on-appengine-python).

> The issue is in the C code that we use to talk to MySQL. It doesn't support utf8mb4 itself, so when it makes a connection to MySQL, it tells the server to use "UTF8", which in MySQL means UTF-8 minus the 4-byte characters... and all your emojis get mangled.

And the workaround is

> Edit your base.py and change get_new_connection so that it sends the "SET NAMES utf8mb4" command.

It's actually pretty simple to solve. Just change your `django/db/backends/mysql/base.py` and edit `get_new_connection` method so it looks like the following:

{% highlight python %}

def get_new_connection(self, conn_params):
        conn = Database.connect(**conn_params)
        conn.encoders[SafeText] = conn.encoders[six.text_type]
        conn.encoders[SafeBytes] = conn.encoders[bytes]
        conn.query("SET NAMES utf8mb4")
        return conn

{% endhighlight %}

But this change will only apply to your local environment, and to your virtual environment if you are using one. So, you need to have a copy of the changes when you are deploying to Google App Engine. And Google App Engine requires that you vendor your external libraries. So you when do that you copy will be overwritten by the new one.

The way I deploy my projects is by using a script that takes the gt branch, downloads the required libraries and then deploy it based on the given parameters. So I do not keep a copy of the libraries in my repository. I simply download them once when I'm deploying. So, to solve the overwriting issue I copied only the `django/db/backends/mysql` folder to my project folder and then changed the database engine to point to my local copy.

So it looks like the following

{% highlight python %}

DATABASES = {
    'default': {
        'ENGINE': 'myproject.mysql'
    }
}

{% endhighlight %}
