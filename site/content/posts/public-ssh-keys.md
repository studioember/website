---
title: Public SSH Keys Page
description: Accessing Public GitHub / GitLab SSH Keys
date:  2021-04-16
slug: "public-ssh-keys"
categories: ["Tutorials"]
author: Nathan Grey
tags: ["development", "ssh"]
---

*tldr;* `curl https://github.com/overtfuture.keys >> $HOME/.ssh/authorized_keys`

When working on server or connecting to remote hosts, having ssh access is vital. It took me by surprise that GitHub and GitLab both host these pages for public ssh keys. This makes it super easy to access for times when you cannot paste into a remote server.

I also use this to add keys for co-workers or sending the above tldr; to a client to add my keys. It is super easy to remember, or type in. Try it out with scripts or easy to send commands for clients.

Below are the public address format for both GitHub and GitLab.

GitHub: `https://github.com/GITHUB_USERNAME.key`

GitLab: `https://gitlab.com/GITLAB_USERNAME.key`

Hope this helps someone save time for transferring public keys around the web!

