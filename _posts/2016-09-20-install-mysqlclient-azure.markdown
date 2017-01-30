---
title:  "Azure Python: Install mysqlclient Package on Azure Web App"
description: "Install mysqlclient to use MySQL with Python"
date: 2016-09-20
tags: azure, web, cloud
---

When installing a `wheel` package you may encounter an error saying `vcvarsall.bat file cannot be found.`. To fix this you either need to install
`Visual Studio Build Tools` or provide the `*.whl` package yourself. You probably wouldn't want to install `Visual Studio Build Tools` to Azure Web App.
I'm new to Azure but it seems quite easy to use and Microsoft provides a decent amount of tutorials and documentation. I did have my struggles
as I'm not really an experienced web developer well I'm not even a web developer :D. So it took sometime to figure it out.
It seems that adding `mysqlclient>=1.3.7` to the `requirements.txt` file does not work because you'll need `Visual Studio Build Tools` installed.

Here's a step by step guide to how to do it.

# Option 1

And as far as I know, `mysql-python` package is unmaintained. So you need to manually download an unofficial binary of `mysqlclient` from [here](http://www.lfd.uci.edu/~gohlke/pythonlibs/#mysqlclient) and then download that to
Azure Web App VM using `Console` or `PowerShell` and then install it manually using `pip`.

1- First, Windows doesn't have a built in console program to download files and I don't know how to use Remote Desktop for a Web App so using
the `Console` provided by the Web App download the file with the following command. Make sure to choose the version that works for you. Azure Web App
uses Python 3.4 so I'm downloading that version with x86 architecture.

{% highlight text %}

pip3 download http://www.lfd.uci.edu/~gohlke/pythonlibs/dp2ng7en/mysqlclient-1.3.7-cp34-none-win32.whl

{% endhighlight  %}

I'm putting that command but somehow `pip` couldn't download that file so I had to download it my computer, upload it to cloud and get a direct link, then
use that link to download the file. So, bear in mind that link might not work.

2- After the download is finished, `pip3` will save it with the name `uc`. That might be different in your case but that's what happened to me.
So you need to rename that file to the appropriate one, which is the exact name of the file as seen on the URL above. So use the command below to
change the file name.

{% highlight text %}

mv .\uc .\mysqlclient-1.3.7-cp34-none-win32.whl

{% endhighlight %}

3- Now you are ready to install it with `pip`

{% highlight text %}

pip3 install .\mysqlclient-1.3.7-cp34-none-win32.whl

{% endhighlight %}


# Option 2

Download the *.whl file, say `mysqlclient-1.3.7-cp34-none-win32.whl`, to a folder where you configured your git repository and put the
downloaded file into `YOUR_PROJECT_ROOT/wheelhouse/mysqlclient-1.3.7-cp34-none-win32.whl`.

Then you need to update the `requirements.txt` file to use the downloaded wheel file like so:

```
django>=1.9
djangorestframework>=3.4
wheelhouse/mysqlclient-1.3.9-cp35-cp35m-win32.whl
```

Make sure that you are using the latest `pip`.

------------------

To make sure that it's installed, check the installed packages with `pip3 list`. If you see `mysqlclient` there, congratulations you are done!
If not, you are in trouble because I didn't get an error there so I don't know the solution. :D But please do post it on comments so we can all learn!
