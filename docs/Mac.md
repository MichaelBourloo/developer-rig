# Mac Quick-start to Hello World with Developer Rig in Local Mode

Take these steps to get Hello World running in Local Mode in the Rig.
This guide assumes you have either cloned the Rig from [GitHub](/twitchdev/developer-rig) or downloaded the Zip file from [Twitch](https://dev.twitch.tv).

1.  Install all dependencies.  (It is possible to use [brew](https://brew.sh/) to install all of these.)
    1.  [Node LTS](https://nodejs.org/en/download/).  If you already have Node installed, it must be at least version 6.
    2.  [Yarn](https://yarnpkg.com/lang/en/docs/install).
    3.  [Git](https://git-scm.com/download/mac).
2.  Add `127.0.0.1 localhost.rig.twitch.tv` to `/etc/hosts`.
    1.  Open a terminal window and run `echo '127.0.0.1 localhost.rig.twitch.tv' | sudo tee -a /etc/hosts`
    2.  Provide your password if prompted.
3. Open a terminal window and run these commands.
    1.  `cd path/to/developer-rig`
    2.  `yarn install`  
        This takes about half a minute.
    3.  `yarn extension-init -d ../my-extension`  
        This will clone the Hello World example from GitHub.  You may replace *my-extension* with a different directory name here and in subsequent steps.
    4.  `yarn create-manifest -t panel -o ../panel.json`  
        This creates a panel extension manifest file in the parent directory.  For additional command line parameters, see [Using Local Mode](/twitchdev/developer-rig#using-local-mode).
    5.  `yarn host -d ../my-extension/public -p 8080 -l`  
        *../my-extension/public* is the public folder of the hello-world example extension created in step 3.iii above.
        **NOTE:**  this terminal window command will not exit.
4.  Visit https://localhost.rig.twitch.tv:8080/panel.html. If necessary, allow the certificate. You will see `Hello, World!` in the browser window.
5. Open a terminal window and run these commands to generate the necessary SSL certificates for and run your Hello World backend.
    1.  `cd path/to/my-extension`  
        This is the directory created in step 3.iii above.
    2.  `npm install`
    3.  `npm run cert`
    4.  `node services/backend -l ../panel.json`  
        *../panel.json* is the path to the file created in step 3.iv above.
        **NOTE:**  this terminal window command will not exit.
6.  Visit https://localhost:8081. If necessary, allow the certificate. You will see some JSON describing a 404 response in the browser window.
7.  Open a terminal window and run these commands.
    1.  `cd path/to/developer-rig`
    2.  `yarn start -l ../panel.json`  
        *../panel.json* is the path to the file created in step 3.iv above.  **You will need to sign in with your Twitch credentials to use the rig in Local Mode.**
        **NOTE:**  this terminal window command will not exit.
8.  Visit https://localhost.rig.twitch.tv:3003. If necessary, allow the certificate. You will see `live` in the browser window.
9.  Verify the rig is working.
    1.  Click the `+` button. The Add a new view panel will appear.
    2.  Select the `Broadcaster` viewer type and click `Save`. The Broadcaster view will appear.
    3.  Click `Yes, I would`. Verify the color changes and there is output to match that request in the second terminal window.
    4.  Click the `+` button again. The Add a new view panel will appear.
    5.  Select the `Logged-Out Viewer` viewer type and click `Save`. The Logged-Out Viewer view will appear.
    6.  Click `Yes, I would`. Verify the color changes in both views and there is output to match that request in the second terminal window.

When you are done using the Developer Rig, you may either close all opened terminal windows or press `Ctrl-C` in all of them.
