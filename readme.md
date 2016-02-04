# Task Nagger for "Remember the Milk"

Nagging tasks client for RTM, for OSX and Windows, based on the official web app. Built with [Electron](http://electron.atom.io/). 

It adds nagging abilities to RTM - Consistenly reminding you of due tasks and preventing you from forgetting.

## Requirements

This currently works only for the new UI of Remember The Milk, available only for pro members - If your UI is different from the picture, it will not work.

If you'd like a version for the older version, open an issue for that or submit a PR.

## Features

* Choose a list to nag you about
* Blink a badge with the nubmer of pending tasks, when they are due - Postpone or complete the tasks to stop the blinking
* Global keyboard shortkey to add a task (WIN+SHIFT+D)

## Screenshots

Badge:

![Badge](http://i.imgur.com/KMiyALp.png)

Settings:

![Settings](http://i.imgur.com/2Yj4FVd.png)

## Installation

Download and run the [latest release](https://github.com/vitalybe/task-nagger-2/releases). Run `TaskNagger.exe` in the archive.

A version for mac can be build from source. *Note:* Was not tested on Mac - Should work, but might not*

## Getting started

Once you can see your tasks, press `CTRL+,` and configure the list it should nag you about. For example, **Today** would be a good choice.

Press `CTRL+SHIFT+D` to add tasks from anywhere.

## Contributions

Contributions are welcome!

## Build and run

To build from the source, run the following commands:  

`npm install`  
`sudo npm run build`  
`npm run dev`

--

> Forked originally from [Whatsapp-Desktop](https://github.com/bcalik/Whatsapp-Desktop/releases). Thank you for the bootstrap!
