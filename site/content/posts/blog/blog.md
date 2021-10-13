---
title: Creating this Blog via Hugo
description: Building a freely hosted & backed up blog with Hugo
date:  2021-03-23
slug: "new-blog"
categories: ["Tutorials"]
author: Nathan Grey
tags: ["hugo","hosting","github","cicd"]
---

When starting a new project, picking the right frameworks and stack can make further development a lot more pleasant for your future self. Thinking about how I wanted to develop this blog was not an easy task. My first instinct was to purchase a monthly subscription to [Ghost Blog](https://ghost.org). At the time, the lowest subscription was about $30 / month billed annually. For a casual blog with no revenue, this was way too expensive. 

I started to branch out and look at alternatives or self hosting. Diving deeper about self hosting, preserving content, and managing backups just seemed like extra work for little return. I am a single developer just wanting to publish some articles in Markdown when the mood strikes.

Free is an adequate price.

I knew GitHub Pages were a possibility, but really I didn't enjoy their default offering, [jekyll](https://jekyllrb.com). It seemed a bit too messy with the rigid config and ruby base. There is nothing wrong with ruby, just something I never worked with. For the last few years, GoLang has been my main language. 

Then I found [Hugo](https://gohugo.io).

## Why Hugo

[Hugo](https://gohugo.io) offered something very compelling, a theme-able, structured, static, markdown based website creator. This along with GitHub actions and pages, a quick and backed up blog could be hosted for free.

## Stack

You can read more about the content structure [here](https://gohugo.io/content-management/organization/), I'm also still learning... Basically the stack is as follows:

```
							┌────────────────┐
							│ Project Files  │
							└────────────────┘
									 │        
									 ▼        
							┌────────────────┐
							│  Git (Backup)  │
							└────────────────┘
									 │        
									 ▼        
							┌────────────────┐
							│ GitHub Action  │
							└────────────────┘
									 │        
									 ▼        
							┌────────────────┐
							│  GitHub Pages  │
							└────────────────┘
									 │        
									 ▼        
							┌────────────────┐
							│   Website :)   │
							└────────────────┘
created with MonoDraw <3
```

This stack gives a powerful yet stress free blogging platform. Is it a bit technical? Sure, but the core concept of taking a markdown file and publishing it to a platform you control is worth it.

You can view the [source code](https://github.com/studioember/website) to see how this site is laid out. Keep in mind that the root of the project is not the [Hugo](https://gohugo.io) source. I placed everything in `/site` to leave room for CI/CD scripts in the root. 

## How To

First [install Hugo](https://gohugo.io/getting-started/installing/) using whichever platform that is appropriate. A simple `brew install hugo` on macOS did the trick for me.

Next, generate a new project by using `hugo new site example`. This will generate a base site with no content. At this point you can `cd example` and run `hugo server` to see your site at [localhost:1313](http://localhost:1313). It will be blank.

After that, browse and find a theme you like to get started. [Hugo](https://gohugo.io) offers a bunch [available here](https://themes.gohugo.io). When you find a theme, just follow the theme's README to install. 

For this site, I used [anubis](https://github.com/mitrichius/hugo-theme-anubis). The installation was pretty standard [here](https://github.com/mitrichius/hugo-theme-anubis#installation). You can use git submodules, or simply download and extract the theme in the `themes/` directory. 

Finally, add a markdown file in `content/` and configure you `config.yaml|.toml|.json` file. This did get me, yes the config file can be in 3 different formats, all are valid. Just pay attention you are not inserting `TOML` into a `YAML` config. Your site should auto refresh at [localhost:1313](http://localhost:1313) now.

## Hosting

A lot of this was taken care of with [this Hugo GitHub Pages Action](https://github.com/marketplace/actions/hugo-setup):

```yaml
# .github/workflows/gh-pages.yml

name: github pages

on:
  push:
	branches:
	  - main  # Set a branch to deploy

jobs:
  deploy:
	runs-on: ubuntu-18.04
	steps:
	  - uses: actions/checkout@v2
		with:
		  submodules: true  # Fetch Hugo themes (true OR recursive)
		  fetch-depth: 0    # Fetch all history for .GitInfo and .Lastmod

	  - name: Setup Hugo
		uses: peaceiris/actions-hugo@v2
		with:
		  hugo-version: 'latest'
		  # extended: true

	  - name: Build
		run: "hugo -s ./site/ --minify" # Using ./site here

	  - name: Deploy
		uses: peaceiris/actions-gh-pages@v3
		with:
		  github_token: ${{ secrets.GITHUB_TOKEN }}
		  publish_dir: "./site/public" # Using ./site here
```

This will go through and generate a new branch called `gh-pages` with all of the static website content in it. I was a bit confused on why this happened, but apparently GitHub does not have artifacts like GitLab so a new branch is necessary for hosting.

Configure your [GitHub Pages](https://docs.github.com/en/github/working-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site) with the correct branch, in this case `gh-pages`, and you are all set for a `$USERNAME.github.io page`.

Setting up a custom domain is a bit more work, but [GitHub's Documentation](https://docs.github.com/en/github/working-with-github-pages/configuring-a-custom-domain-for-your-github-pages-site) provides some insight.

## Summary

This was a quick way to get up and running with a blog that is fully version controlled and hosted for free. Hopefully, this helps shed some light on some initial issues you have getting hosting all set up.

Cheers 🍻

Nathan Grey