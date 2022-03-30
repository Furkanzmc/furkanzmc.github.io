---
layout: post
title:  "How to Deploy for App Store with Qt"
description: "Learn how to deploy your app to the App Store on macOS"
date: 2018-04-25
category:
  - qt
comments: true
---

Deploying to the App Store is pretty straightforward using XCode. But I had lots of trouble using the `macdeployqt` and signing the bundle.
But after a few unsuccessful attempts at manually signing the app bundle in the `.pro` file, I decided to go another way.

If you use XCode to deploy the app to the App Store, you just need to go to `Product > Archive`. And that's it. After the product is successfully archived
you will be able to see it in the Organizer (`Window > Organizer`) and just upload the archive to the App Store. We are going to be using this same process.

# Step 1: Create an XCode project.

You can convert the `.pro` file to a fully functional XCode project. Add the following target to your `.pro` file.

```
osx {
    # You export any environment variables that you use to configure your project.
    generate_xcode.commands = export CUSTOM_ENV_VAR=34
    QBIN_BATH = $$dirname(QMAKE_QMAKE)
    QT_PATH = $$dirname(QBIN_BATH)
    generate_xcode.commands += && $$QMAKE_QMAKE -spec macx-xcode $$PWD/CuzTranslationApp.pro -o $$OUT_PWD/ CONFIG+=$$BUILD_TYPE CONFIG+=release QMAKE_INCDIR_QT=$$QT_PATH/include QMAKE_LIBDIR=$$QT_PATH/lib QMAKE_MOC=$$QT_PATH/bin/moc QMAKE_QMAKE=$$QT_PATH/bin/qmake

    QMAKE_EXTRA_TARGETS += generate_xcode
}
```

Now, whenever you want to create an XCode project you can just run `make generate_xcode` and you'll have a fully configured project file.
Also, you can do this buy adding an additional make step in `Projects` tab in Qt Creator.

![generate_xcode](https://drive.google.com/uc?export=download&id=1U01isydj83gXqT8eU1hKq2TrhqG5VNoB)

Open the project file once the project is generated.

# Step 2: Archive Using XCode

Now, open XCode and archive the project by clicking on `Product -> Archive`. Make sure that signing the bundle is automatically handled by XCode. Once this project is finished, you can see the archive file in the Organizer.
Open the Organizer by clicking on `Window -> Organizer`.

![organizer](https://drive.google.com/uc?export=download&id=1SjK3bZvUsyv2stAOZldOjIXedpLX5-q7)


Right click on the archive and click on `Show in Finder.`

XCode stores all the archives in this directory: `/Users/Furkanzmc/Library/Developer/Xcode/Archives/%Y-%m-%d/`

![archive_contents](https://drive.google.com/uc?export=download&id=1eu0QeHRJetqwvlzF0ih-HmmVkI2cpQdX)

The `.xcarchive` file is a folder much like the `.app` bundle. Since XCode signs the archive and the bundle just before uploading to the App Store, we can play with the contents of this folder.
Let's create a script that will automatically find the newest archive folder in XCode's archives folder and then run `macdeployqt` on the contained app bundle.

```
CONFIG(release, debug|release): {
    QT_BIN_PATH = $$dirname(QMAKE_QMAKE)
    QT_PLUGINS_FOLDER = $$dirname(QT_BIN_PATH)/plugins
    # Get the absolute directory path for XCode archives folder.
    XCODE_ARCHIVES_DIRECTORY = $$system(echo ~/Library/Developer/Xcode/Archives)/$$system(date +%Y-%m-%d)
    # Get the newest file that starts with the target name.
    XCODE_ARCHIVE_NAME = $$system(cd $$XCODE_ARCHIVES_DIRECTORY && ls | grep -e $${TARGET}* | sort -n -t _ -k 2 | tail -1)
    # This will be the absolute path to the app bundle.
    DEPLOYED_APP_PATH = ""
    # If the variable is set to something, it means that we found our archive file.
    !isEmpty(XCODE_ARCHIVE_NAME) {
        DEPLOYED_APP_PATH = $$XCODE_ARCHIVES_DIRECTORY/$$XCODE_ARCHIVE_NAME/Products/Applications/$${TARGET}.app
        EXISTS_RESULT = $$system([ ! -e $$quote(\"$$DEPLOYED_APP_PATH\") ] && echo "false" || echo "true")
        # If the archive file doesn't exist, we are going to use the app bunlde in the build directory.
        equals(EXISTS_RESULT, false) {
            deploy.depends += all
            DEPLOYED_APP_PATH = $$OUT_PWD/$${TARGET}.app
        }
        else {
            DEPLOYED_APP_PATH = $$quote(\"$$DEPLOYED_APP_PATH\")
        }
    }
    else {
        # Since we cannot find the file, we need to make sure that the project is built so that the app bundle is creted.
        deploy.depends += all
        DEPLOYED_APP_PATH = $$OUT_PWD/$${TARGET}.app
    }

    BUNDLE_PLUGINS_FOLDER = $$DEPLOYED_APP_PATH/Contents/Plugins

    # The deploy target runs macdeployqt and removes the unsed files from the bundle. Signing is handled by XCode when uploading to the App Store.
    deploy.commands = $$QT_BIN_PATH/macdeployqt $$DEPLOYED_APP_PATH -qmldir=$$PWD/qml
    # Delete the unneccessary files. These files are not used in this project.
    deploy.commands += && rm -r $$BUNDLE_PLUGINS_FOLDER/quick/libqtquickcontrols2fusionstyleplugin.dylib
    deploy.commands += && rm -r $$BUNDLE_PLUGINS_FOLDER/quick/libqtquickcontrols2imaginestyleplugin.dylib
    deploy.commands += && rm -r $$BUNDLE_PLUGINS_FOLDER/quick/libqtquickcontrols2materialstyleplugin.dylib

    deploy.commands += && rm -r $$BUNDLE_PLUGINS_FOLDER/quick/libqtquickcontrols2universalstyleplugin.dylib
    deploy.commands += && rm -r $$BUNDLE_PLUGINS_FOLDER/quick/libwidgetsplugin.dylib
    deploy.commands += && rm -r $$BUNDLE_PLUGINS_FOLDER/sqldrivers/libqsqlmysql.dylib

    deploy.commands += && rm -r $$BUNDLE_PLUGINS_FOLDER/sqldrivers/libqsqlpsql.dylib
    deploy.commands += && rm -r $$BUNDLE_PLUGINS_FOLDER/styles/libqmacstyle.dylib
    deploy.commands += && rm -rf $$DEPLOYED_APP_PATH/Contents/Resources/qml/QtQuick/Fusion

    deploy.commands += && rm -rf $$DEPLOYED_APP_PATH/Contents/Resources/qml/QtQuick/Imagine
    deploy.commands += && rm -rf $$DEPLOYED_APP_PATH/Contents/Resources/qml/QtQuick/Material
    deploy.commands += && rm -rf $$DEPLOYED_APP_PATH/Contents/Resources/qml/QtQuick/Universal

    deploy.commands += && rm -rf $$DEPLOYED_APP_PATH/Contents/Resources/qml/QtQuick/Universal
    deploy.commands += && rm -rf $$DEPLOYED_APP_PATH/Contents/Resources/qml/QtQuick/Controls.2/Fusion
    deploy.commands += && rm -rf $$DEPLOYED_APP_PATH/Contents/Resources/qml/QtQuick/Controls.2/Imagine

    deploy.commands += && rm -rf $$DEPLOYED_APP_PATH/Contents/Resources/qml/QtQuick/Controls.2/Material
    deploy.commands += && rm -rf $$DEPLOYED_APP_PATH/Contents/Resources/qml/QtQuick/Controls.2/Universal
    # dSYM files are bundled with a different bundle ID than the app id and they are rejected by the App Store.
    deploy.commands += && find $$DEPLOYED_APP_PATH/ -name $$quote(\"*.dSYM\") -exec rm -rf -d -f {} +

    # Copy the geoservices
    deploy.commands += && mkdir -p $$BUNDLE_PLUGINS_FOLDER/geoservices/
    deploy.commands += && cp $$QT_PLUGINS_FOLDER/geoservices/libqtgeoservices_itemsoverlay.dylib $$BUNDLE_PLUGINS_FOLDER/geoservices/libqtgeoservices_itemsoverlay.dylib
    deploy.commands += && cp $$QT_PLUGINS_FOLDER/geoservices/libqtgeoservices_mapbox.dylib $$BUNDLE_PLUGINS_FOLDER/geoservices/libqtgeoservices_mapbox.dylib

    deploy.commands += && cp $$QT_PLUGINS_FOLDER/geoservices/libqtgeoservices_mapboxgl.dylib $$BUNDLE_PLUGINS_FOLDER/geoservices/libqtgeoservices_mapboxgl.dylib
    QMAKE_EXTRA_TARGETS += deploy
}
```

This script will find the newest archive file in the XCode's archive folder with the target name and then run `macdeployqt` on the contained bundle.

Now, either run `make deploy` or add a custom make process for `deploy` and then run the configuration.
Once this process is done, we have ourselves a fully contained `.xcarchive` file!

# Step 3: Upload the Archive File to the App Store

Go to Organizer again and click on that sweet `Upload to App Store` button!

![upload](https://drive.google.com/uc?export=download&id=1CANfhT8ADAICF-M74xu8YIE93wETxjvV)

Make sure that you select automatic signing so you don't have to deal with manually signing.

# Step 4: Weird Victory Dance

![dance](https://media.giphy.com/media/eGwW26RL3PknC/giphy.gif)
