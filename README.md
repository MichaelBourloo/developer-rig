# Twitch Extensions Developer Rig
[![Build Status](https://travis-ci.org/twitchdev/developer-rig.svg?branch=master)](https://travis-ci.org/twitchdev/developer-rig) [![Coverage Status](https://coveralls.io/repos/github/twitchdev/developer-rig/badge.svg)](https://coveralls.io/github/twitchdev/developer-rig)

## Quickstart to Hello World with Developer Rig in Local Mode
The Developer Rig can be used in two modes to test your Extension, Online Mode and Local Mode.  Online Mode will let you test with production APIs and hosted assets on Twitch, but will first require completion of Extensions Developer onboarding [here](https://dev.twitch.tv/dashboard).  The Rig also supports Local Mode to let you get started building quickly pre-onboarding, using mock versions of the APIs.

Take these steps to get Hello World running in Local Mode in the Rig.

### Mac Users
1.  Install all dependencies.  (It is possible to use [brew](https://brew.sh/) to install all of these.)
    1.  [Node LTS](https://nodejs.org/en/download/).  If you already have Node installed, it must be at least version 6.
    2.  [Yarn](https://yarnpkg.com/lang/en/docs/install).
    3.  [Git](https://git-scm.com/download/mac).
2.  Add `127.0.0.1 localhost.rig.twitch.tv` to `/etc/hosts`.
    1.  Open a terminal window and run `echo '127.0.0.1 localhost.rig.twitch.tv' | sudo tee -a /etc/hosts`.
    2.  Provide your password if prompted.

### PC Users
1.  Install all dependencies.
    1.  [Node LTS](https://nodejs.org/en/download/).  If you already have Node installed, it must be at least version 6.
    2.  [Yarn](https://yarnpkg.com/lang/en/docs/install).
    3.  [Python 2](https://www.python.org/downloads/release/python-2715/).
    4.  [Git for Windows](https://github.com/git-for-windows/git/releases/download/v2.17.1.windows.2/Git-2.17.1.2-64-bit.exe).  Its shell, **Git Bash**, is used in subsequent steps.
2.  Add `127.0.0.1 localhost.rig.twitch.tv` to `/etc/hosts`.
    1.  Press the Windows key.
    2.  Type `notepad`.
    3.  In the search results, right-click **Notepad** and select **Run as administrator**.  Accept the elevation prompt, if any.
    4.  In **Notepad**, open `%SystemRoot%\System32\drivers\etc\hosts`.  This is usually `C:\Windows\System32\drivers\etc\hosts`.
    5.  Add `127.0.0.1 localhost.rig.twitch.tv` to the bottom of the file.
    6.  Press Ctrl+S to save your changes then close the window.

**NOTE:**  in the following instructions, a terminal window refers to **Git Bash**, not a Windows command prompt.  The default installation of **Git for Windows** will put an icon on your desktop to launch **Git Bash**.  In **Git Bash**, use forward slashes to separate directories, as shown below.

### All Developers
3.  Open a terminal window and run these commands.
    1.  `cd path/to/developer-rig`
    2.  `yarn install`  
        This takes about half a minute.
    3.  `yarn extension-init -d ../my-extension`  
        This will clone the Hello World example from GitHub.  You may replace *my-extension* with a different directory name here and in subsequent steps.
    4.  `yarn create-manifest -t panel -o ../panel.json`  
        This creates a panel extension manifest file in the parent directory.  For additional command line parameters, see [Using Local Mode](#using-local-mode).
    5.  `yarn host -d ../my-extension/public -p 8080 -l`  
        *../my-extension/public* is the public folder of the hello-world example extension created in step 3.iii above.  
        **NOTE:**  this terminal window will not exit.
4.  Visit https://localhost.rig.twitch.tv:8080/panel.html.  If necessary, allow the certificate.  You will see `Hello, World!` in the browser window.
5.  Open a terminal window and run these commands to generate the necessary SSL certificates for and run your Hello World backend.
    1.  `cd path/to/my-extension`  
        This is the directory created in step 3.iii above.
    2.  `npm install`
    3.  `npm run cert`
    4.  `node services/backend -l ../panel.json`  
        *../panel.json* is the path to the extension manifest file created in step 3.iv above.
        **NOTE:**  this terminal window will not exit.
6.  Visit https://localhost:8081.  If necessary, allow the certificate.  You will see some JSON describing a 404 response in the browser window.
7.  Open a terminal window and run these commands.
    1.  `cd path/to/developer-rig`
    2.  `yarn start -l ../panel.json`  
        *../panel.json* is the path to the extension manifest file created in step 3.iv above.  **You will need to sign in with your Twitch credentials to use the rig in Local Mode.**
        **NOTE:**  this terminal window will not exit.
8.  Visit https://localhost.rig.twitch.tv:3003.  If necessary, allow the certificate.  You will see `live` in the browser window.
9.  Verify the rig is working.
    1.  Click the `+` button.  The Add a new view panel will appear.
    2.  Select the `Broadcaster` viewer type and click `Save`.  The Broadcaster view will appear.
    3.  Click `Yes, I would`.  Verify the color changes and there is output to match that request in the second terminal window.
    4.  Click the `+` button again.  The Add a new view panel will appear.
    5.  Select the `Logged-Out Viewer` viewer type and click `Save`.  The Logged-Out Viewer view will appear.
    6.  Click `Yes, I would`.  Verify the color changes in both views and there is output to match that request in the second terminal window.

When you are done using the Developer Rig, you may either close all opened terminal windows or press `Ctrl-C` in all of them.

See additional documentation on how to use the Developer Rig in Local Mode here: [Using Local Mode](#using-local-mode)

If you're looking to move past Local Mode and run the Rig in Online Mode, go here: [Getting Started in Online Mode](#getting-started-in-online-mode)

## Quick Links
* [Twitch Extensions 101](#twitch-extensions-101)
* [Overview](#overview)
* [Getting Started in Online Mode](#getting-started-in-online-mode)
  * [Requirements](#requirements)
  * [Configuring the Developer Rig](#configuring-the-developer-rig)
  * [Starting the Developer Rig](#starting-the-developer-rig)
  * [Using the Developer Rig](#using-the-developer-rig)
* [Loading an Example Extension](#loading-an-example-extension)
* [TL;DR](#tldr)
* [Using Local Mode](#using-local-mode)
* [FAQs](#faqs)
* [Troubleshooting](#troubleshooting)

## Twitch Extensions 101
Think of Twitch Extensions as Apps for Twitch. Developers can create sandboxed web applications that run on [Twitch](https://twitch.tv) that provide new and different ways for viewers and broadcasters to interact.

To build the simplest Extension, a developer creates a web application; a collection of assets that include HTML, CSS, and Javascript; and then hosts these assets from the Twitch CDN ext.twitch.tv. A more complicated, but more common, Extension, leverages an Extension Backend Service (EBS). An EBS is a web service written by a developer for managing the state of their Extension. These two blocks of developer written code are often referred to as the **frontend** and the **backend**.

_Developer's are currently completely responsible for operating their backends._

The [Twitch Developer Site](https://dev.twitch.tv) is currently where the lifecycle of an Extension is managed. This includes creation, _frontend_ asset upload, submitting to review, and promoting to be released. The Dev Site is where key pieces of data are retrieved to configure and run the Developer Rig.

The Developer Rig hosts Extension frontends locally. This gives developers complete flexibility to run and test their Extensions without needing to load Twitch. For example, the Developer Rig does not currently stream video, reducing friction for testing a Video Overlay Extension. Additionally, multiple views of a single Extension can be loaded onto a single page, giving developers a single pane of glass for the different relevant views for their Extension.

## Motivation
The Developer Rig is a tool that enables [Twitch Extensions](https://dev.twitch.tv/extensions) developers to iterate more quickly and focus on building great Extensions, by providing a single pane of glass for all end user Extensions views and interactions. It is a lightweight web app that runs in a browser and is built using [NodeJS 6+](https://nodejs.org) and [React](https://reactjs.org/). The Developer Rig allows Extensions Developers to quickly and easily, locally end-to-end test in development Extensions.

## Overview
The Developer Rig renders Extensions in a combination of user contexts, views and different anchor types.

Supported user contexts include:
* broadcaster
* logged in viewers (linked and unlinked)
* logged out viewers (i.e. anonymous users)

Supported views include:
* channel page
* live dashboard
* broadcaster configuration

Supported anchor types include:
* panels
* video overlays
* mobile and video components

Extension output logs can be redirected to the [Rig Console](#rig-console), a Developer Rig specific local console.

## Getting Started in Online Mode
If you're just getting started with Extensions and haven't going through Extension Developer Onboarding, follow the steps at the top of the documentation for Local Mode.  Otherwise, the following guide will help you create your first Extension on Twitch and run it in the Developer Rig in Online Mode.

There are detailed guides for [Mac](docs/Mac.md) and [Windows](docs/Windows.md) to get you from nothing to Hello World.

#### Create an Extension on the Twitch Dev Site
For each Extension to be tested online in the Developer Rig, a corresponding Extension needs to be created on the [Twitch Dev Site](https://dev.twitch.tv/dashboard). More detailed instructions to do this can be found [here](https://dev.twitch.tv/docs/extensions#creating-your-extension). Most fields are not relevant for the Developer Rig. The _Type of Extension_ is loaded into the Developer Rig, and is hence important. Similarly, the _Author Email_ must be correctly set and verified, before an [Extension secret](#developer-rig-configuration) can be created.

<img src="./docs/create-extension.png" width="80%">

There are several highly pertinent pieces of data that need to be taken from the dev site, and surfaced in the Developer Rig for it to operate. These include:
* The Client ID of the Extension
* The version of the Extension to be loaded in the Developer Rig
* A generated Extension Secret, to be used to sign Extension JWTs

These are hard requirements that enable the Developer Rig to function correctly in Online Mode!

### Configuring the Developer Rig
Where possible, the Developer Rig is self-contained.  Note that you should sign in with your Twitch credentials in Local Mode before using online mode, as it provides necessary information for the Rig Configuration

#### Developer Rig Configuration
If you are new to building Twitch Extensions, [read this first](https://dev.twitch.tv/docs/extensions#high-level-steps-for-developing-extensions).

There are several pieces of configuration that the Developer Rig requires to function correctly:

* Client ID: the unique identifier for your Extension. Go to the [Extensions Dashboard](https://dev.twitch.tv/dashboard/extensions), select the Extension you want to run in the Developer Rig, then look for `Client ID` under `About This Extension`.

  <img src="./docs/client-id.png" width="30%">

* Extension Secret: a valid secret, that allows your Extension to authenticate. Go to the [Extensions Dashboard](https://dev.twitch.tv/dashboard/extensions), select the Extension you want to run in the Developer Rig, select the `settings` tab, and then navigate to `Secret Keys` and create/retrieve a valid secret.

  <img src="./docs/secret.png" width="60%">

  This is **not** the *Client Secret* field located on the *General* tab under settings. Please ensure to go to **Secret Keys**.

* Version: the exact version of an Extension to be loaded in the Developer Rig. Go to the [Extensions Dashboard](https://dev.twitch.tv/dashboard/extensions), find the Extension you want to run in the Developer Rig, and take note of the version number displayed under `status`.

  <img src="./docs/version.png" width="60%">

Values for these fields need to be injected as environment variables to the Developer Rig at startup. The environment variables names are:
* `EXT_CLIENT_ID`
* `EXT_SECRET`
* `EXT_VERSION`

If you don't want to set these values via environment variables, all but the extension secret can be set through a configuration file. This file is specified via a command line argument and is in the format of
```javascript
{
  "clientID": "<client id>",
  "version": "<version>"
}
```

### Starting the Developer Rig in Online Mode
Ensure that the [Developer Rig dependencies](#installing-dependencies) are installed and [required configuration](#developer-rig-configuration) is available.

To start the rig with environment variables, run:
```bash
EXT_CLIENT_ID=<client id> EXT_SECRET=<secret> EXT_VERSION=<version> yarn start
```
To start the rig with a config file and command line arguments, run:
```bash
yarn start -s <secret> -c location/of/your/config
```
The location of your config file can be either relative to the directory you are running the command or an absolute path to the file.

This will cause your browser to open to `https://localhost.rig.twitch.tv:3000`.

*Note*: Depending on your browser and operating system, you may see a warning that the TLS certificate is illegitimate as it is self-signed. You can choose to proceed through this warning (or just use [Chrome](https://www.google.com/chrome/)). TLS certificate generation occurs the first time the Developer Rig is started or it is used to host an example extension. Generated certificates are stored in the `ssl` directory. If you are on OSX, we'll generate and install the certs in the keychain. If you are on Windows or Linux, you'll have to configure that yourself.


### Using the Developer Rig
The Developer Rig UI presents a variety of views, anchors, and contexts.

#### Extension Views
This is likely the most used area for the Developer Rig. Views, anchors, and contexts can be configured to support comprehensive testing of an Extension.

Click the `plus` button to add a new view for the configured Extension Client ID, and remove them by clicking on the `x` on a view.

#### Broadcaster Config
This section displays the Broadcaster Config view that is presented to broadcasters after they have installed an Extension, but before they are able to activate it.

#### Live Config
This section displays the Live Config view that appears on a broadcaster's dashboard for an Extension.

#### Configurations
The section displays manifest data pulled from Twitch for the corresponding Extension Client ID.

#### Rig Console
At the bottom of every page, there is the Developer Rig Console. Extensions are able to output directly to this console by making the following call from their Extension's frontend javascript:
```
window.Twitch.ext.rig.log(<message to log>)
```
Each view is prefixed with the corresponding "user context", i.e logged in viewer, broadcaster etc. An active video stream is not required to leverage video overlays in the Developer Rig. When an Extension is running in the Developer Rig, developers can interact with it just like an end user.

#### Manage Bits Products
For developers currently in the Bits Limited Preview, this tab will let you configure your various bits products for use in your extension.  You will need to sign in with your developer credentials to get this working.  If you are not currently in the Bits Limited Preview, you will not be able to access this page (but stay tuned for when it goes to general availability).

## Loading an Example Extension
By default, the Developer Rig links to example Extension code available on [GitHub](https://github.com/TwitchDev/extensions-hello-world). To pull and link this code into the Developer Rig, run:
```bash
# Usage: yarn extension-init -a [github_account] -r [github_repo] -d [directory]
yarn extension-init -d <directory>
```
To have the Developer Rig host the frontend assets of an Extension, use the `host` command. Assets for the example Extension can be hosted on `https://localhost.rig.twitch.tv:8080` by issuing the following command:
```bash
# Usage: yarn host -d <directory> -p [port]
yarn host -d <directory>/public -p 8080
```

_Ensure that the URL that the example Extension's Extension Backend Service (EBS) is running on and the Extension secret, match what is specified in the dev site!_

<img src="./docs/asset-hosting.png" width="70%">

In the above screenshot, assets are specified as being available at:
```
https://localhost:8080/viewer.html
https://localhost:8080/config.html
```

If the Developer Rig is used to `host` an Extension's front end assets, the _Testing Base URI_ must be set to:
```
https://localhost.rig.twitch.tv:[port]
```

When an Extension has been loaded into the Developer Rig, refreshing your browser window will cause the latest Extension assets to be pulled into the page.

## TL;DR
Conceptualizing how an Extension works can be tricky, particularly in the context of the Developer Rig. Three main pieces are needed:
* the Developer Rig service (i.e. `yarn start`)
* a service hosting the Extension front end and associated assets (i.e. `yarn host`)
* an Extension Backend Service (EBS)

The Developer Rig loads the front end assets into its pages. The front end pages are able to call the EBS (signing requests with the Extension's JWT). An EBS can either respond directly to a front end client, or is able to push messages to all connected front ends via PubSub.

If you are experience difficulties getting things to work:
* ensure that everything is running on HTTPS and accessible in your browser
* ensure that the secret that is loaded into the Developer Rig matches the secret present in your EBS
* if you are struggling to get PubSub to work, assert that your EBS receives and extracts the channel name from the JWT sent by the Extension front end

## Using Local Mode
Local Mode enables developers to run their extension projects against
mock APIs and mock PubSub locally on their machine.  Developers can
start building extensions without having first gone through the
Twitch Extension Developer onboarding.  Additionally, coming soon,
it will provide an ability to perform integration tests against your
extension via configurable responses to the Extensions Helper Library.
The following sections will illustrate how to use Local Mode in the Rig.

There are several options for creating an extension manifest file.  The
example above creates an extension manifest file for a panel extension.
There are four types of extensions.  You may specify multiple types
for the `-t` parameter, any combination of *panel*, *video\_overlay*,
*mobile* and *video\_component*.  There are other options for panel or
component attributes along with some text descriptors.  They all have
reasonable defaults; specifying them is optional.  For more information
on the available options, run `yarn create-manifest -h` in a terminal
window.  Note that you can edit the JSON file to make changes or
adjustments.

### Providing a Secret for Your EBS in Local Mode
When you use Local Mode with your EBS, you'll be using a hard-coded secret in the Rig.  This is also included already in the Hello World example.  When creating an extension on Twitch, you'll have your own clientID and secret.

The Local Mode Secret is: `kkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkk`

Do **not** expose your EBS beyond your local machine while using the Local Mode secret.  It is purely meant to speed up initial development.

### Using Mock Pub Sub
When you are in Local Mode, to make calls to Pub Sub, it's important to make sure your EBS is pointing at the correct URI.  You'll want to be making calls to `localhost.rig.twitch.tv:3000/extensions/message` as opposed to `api.twitch.tv/extensions/message` in order to correctly send your message.  The rest of your message should be formatted the same as if you were sending to Twitch PubSub.  See the Hello World backend.js files for examples.

### Editing the Local Extension Manifest
After you create your local extension manifest, you can open up manifest.json and edit the fields directly.  Most of the fields are not relevant to running your extension locally in the Developer Rig, but you should be aware of a few:
  * name: Not critical for Local Mode, but it's always important to give your project a sweet name
  * anchor: This should be left blank
  * panel\_height: This is the height of a panel extension. Default is 300 pixels and must be between 100 and 500 pixels.  For Panel extensions only.
  * URLS of various views - When adding a view in the rig, it will look to these for the front end assets.  If you use the Rig host command, be sure to make sure the port and base URI are correct.
  * aspect\_width: expressed as a % of the screen width and must be < 50%.  30% would show up as 3000.  For Component Extensions only.
  * aspect\_height: expressed as a % of the screen height from 1% to 100%.  30% would show up as 3000.  For Component Extensions only.
  * zoom\_pixels: default is 1024.  For Component extensions only.
  * zoom: default is true.  For Component Extensions only

  When creating additional manifests, use the **-h** flag to see what additional arguments you can add.

## FAQs

_Can I use the Developer Rig without first completing Extensions Developer On-boarding?_

> Yes, but you must use the Developer Rig in Local Mode. For Online Mode, valid client IDs and Extension secrets are required to leverage the Developer Rig. Currently, these can only be generated on the Twitch Dev Site, once on-boarding is complete.

_Are the Extensions Function Components supported?_

> Extensions function components will be added shortly to the Developer Rig.


_XXX in the Developer Rig sucks! The Developer Rig is missing feature YYY!_

> Neither of these are questions :) . Raise a PR with proposed changes, and let's help each other!

_What are these Twitch Extensions of which you speak, and how can I learn more?_

> More information about Twitch Extensions is available on the [Twitch Developer Site](https://dev.twitch.tv/extensions), and in the [Twitch Developer Forums](https://discuss.dev.twitch.tv/c/extensions).

_The linked Hello World repository uses EXT\_OWNER\_ID while the Developer Rig uses EXT\_OWNER\_NAME. What's up with that?_

> The Developer Rig uses an API call to the Twitch /users endpoint to retrieve an owner's user id. This has not been done yet in the Hello World repository. It should be added shortly.

_What browsers are supported?_

> We know the Developer Rig works in Chrome and Firefox. Feel free to help ensure it works in other browsers!


## Troubleshooting

_The Extension I have specified is not appearing the Developer Rig._

> There are a number of things that can create problems. The most common causes are: [invalid NPM or NodeJS installations](#installing-dependencies); [a missing host file entry for the Developer Rig](#host-file); [misconfigured Environment variables being passed to the Developer Rig](#starting-the-developer-rig); or [Extension configuration that does not match the contents of the Twitch Developer Site](#developer-rig-configuration).

_I am certain that my Developer Rig Configuration is correct, but my Extension is still not working._

> Clear your browser cache and local storage, restart the Developer Rig, and cross your fingers. To delete the rig's local storage open the javascript console in your browser on a tab with the rig open and do `localStorage.clear();` then refresh. Ensure you've included the [Twitch Extension Helper](https://extension-files.twitch.tv/helper/v1/twitch-ext.min.js) is included in your front end files.

_I see an error when attempting to run 'yarn test'._

> Sometimes deleting and reinstalling your `node_modules` can correct this issue. On MacOS, you may need to explicitly install watchman via `brew install watchman`.

_`yarn install` fails in libssh2_

> See issue [#48](https://github.com/twitchdev/developer-rig/issues/48). Be sure libssh, and it's dependencies are installed.

_I get an error when pulling in the example project!_

> Ensure that Git is in your PATH variables by attempting to run "git" at your commmandline. If that works, also ensure that the local folder does not currently exist.

_The Developer Rig stops running unexpectedly in Local Mode._

> Try deleting the `node_modules` directory and rerunning `yarn install`.
