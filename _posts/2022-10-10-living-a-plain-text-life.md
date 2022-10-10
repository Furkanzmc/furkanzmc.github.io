---
layout: post
title:  "Living a Plain (Text) Life"
description: ""
date: 2022-10-10
draft: true
category:
  - note-taking
  - markdown
---

I didn't use to take a lot of notes, and whatever notes I had were on physical notebooks. But I
found that they were hard to search for when I needed a particular information. Once I purchased an
iPad, I wanted to continue taking notes as if I'm using a notebook with the added bonus of the
notes being easy to search so I researched some note taking apps I can use with the iPad.

There were many great ones, but the one I settled with was OneNote. I had everything there, from
technical notes to work notes, ranging from casual to structured notes. I bought a nice screen
protector that introduced a bit more friction to the screen and that made the note taking
experience better. I was so into OneNote that I got my two siblings (both medical students) into it
and got them iPads so they can take notes.

This worked great for a while. I had a huge repository of notes. But over time, I realized that it
suffered a discoverability problem. It was also hard to take a note on mobile. I couldn't properly
search for the hand written notes... So, I slowly started taking fewer and fewer notes.

For a long time, I have also been reading e-books. However, around 2-3 years ago, I realized that I
don't do a great job of reading when I'm reading on a screen, especially on iPad. Then began my
search for a paper like device. I knew about reMarkable and wanted to give that a shot. A friend of
mine bought it and she loved it. I thought I could use it to take notes like on OneNote with the
bonus of feeling like I'm taking note on a paper. I was hoping that I could also search for
handwritten notes. I bought it on sale and tried for a bit. But excitement for it was short lived.

First, I couldn't take notes on mobile any more. I was tied to the physical device. Then displaying
notes on desktop was not well supported. Exporting notes were hard, and useful features required
subscription... So, I realized it's not for me and returned the device.

After that disappointment, I started browsing the web for note taking systems. I stumbled upon a
note taking system called zettelkasten. [This video](https://www.youtube.com/watch?v=L9SLlxaEEXY)
from YouTube content creator [Morgan](https://www.youtube.com/c/morganeua/) did a great job of
explaining it for me and I instantly got hooked on it.

All the failed attempts made me realize that the systems I was using didn't satisfy a few criteria
that I need for a good and convenient note taking experience.

- [x] Ability to use Vim to edit notes
> This is not a must-have, but since I do most of my day work in Vim, it'd be very easy for me to
> fire up a new buffer and start adding notes. It would make the entry barrier to note taking as
> small as possible for me so I don't have an excuse for not saving a note.

- [x] Easy to search
> I need to be able to search for an information easily. Something like `grep`, which is what I'm
> used to for code.

- [x] Easy to connect to other notes
> Ideas don't come in isolated pieces. A holistic approach to note taking makes it easier to
> connect these ideas together and potentially form new ones with those connections. I was not able
> to do this with other note taking apps. Maybe I could have done something but switching back and
> forth would have been a pain.

- [x] Ability to edit files in a cross platform way
> I've long been a big believer in easily portable formats for data storage. I like that I can use
> whatever software I want to display a file, edit it, and save it. If I one day go from macOS to
> Windows, from iOS to Android, or use a different software, I can still access my notes the same
> way. Ideas also come when I'm not on my computer, so being able to take notes on whatever device
> I'm using is very important.

- [x] Markdown
> As a software engineer, I use markdown every day. Its simple syntax would mean I can add some
> bells and whistles like bold text, to do items etc without using specialized software.

In order to check the first box off, I quickly created a very simple Neovim plugin. I only wanted
some wrapper functions around the existing Vim functionality. I wanted a plug-in that would just
work without fancy options. The fanciest thing I would need is a way to list my notes with some
additional information about back links, tags etc. And that is the most complex part of the plugin.
The rest is just providing some sane defaults for markdown files. You can learn more about it on my
[GitHub account](https://github.com/Furkanzmc/zettelkasten.nvim).

Then I needed to find a solution for editing my notes on the go because I don't always have my
laptop with me. And that search led me to an app called [Taio](https://taio.app/). It's the best
markdown editing app I've used on mobile or desktop. The developer did a fantastic job! It has a
very simple editing interface, provides text actions in a way that doesn't distract you from the
core functionality of editing markdown files. I highly recommend checking out this app If you are
on an Apple device. I leverage Taio's text actions feature to create
[zettelkasten.nvim](https://github.com/Furkanzmc/zettelkasten.nvim) compatible notes so I don't
rely on Vim for creating new files when I'm on mobile.

Now that I have a way of editing markdown files on desktop and mobile, I need a way to share those
notes. I use Apple devices so I chose iCloud to store my notes. On desktop, I use Vim to edit my
notes. And on mobile I use [Taio](https://taio.app/). Since I have the full power of markdown, I
can easily view it on Vim, and use Taio for a better markdown viewing experience. iCloud on macOS
is horrible though. So, I'm hoping that Taio will soon support third part cloud providers so I can
move away from iCloud.

## Creating a Note on Desktop

I do most of my work on the terminal and I'm mostly in Vim. So when I want to record something, I
simply run `:ZkNew` to create a new note. And I get a new buffer that looks like this:

```markdown
# 2022-10-10-19-02-35 New Note

```

Then, I edit my title, add my note and save. The good thing about using time stamp for files is
that I can change my title to something else later on and I don't need to change all the references
to this file.

If I need to attach an image or another file to my note, I simply put it in an `assets/` folder and
prefix it's name with the note's ID.

```markdown
# 2022-10-10-19-02-35 Workouts

![Workout image](./assets/workout-gifs/one-leg-gecko-bridges.gif)

```

I can then either view this file in a Markdown viewer on desktop, Taio on mobile, or press
`<leader>p` to preview an image on desktop.

I can even use [Mermaid.js](https://mermaid-js.github.io/mermaid/) to embed diagrams to my notes
and render them to SVGs for displaying in Vim, or just use Taio's markdown viewer to display them.

## Creating a Note on Mobile

No matter how much I wish, I'll never have the same ergonomics of using Vim on mobile. So, having a
mobile friendly way of creating notes is important to make it as convenient as possible to create
notes. Otherwise, if it's hard, I'm not likely to record whatever I wanted to record.

Thankfully, I can use Taio's text actions to create new files.

```json
{
  "actions" : [
    {
      "type" : "@editor.new",
      "parameters" : {
        "location" : 0,
        "openInEditor" : true,
        "filename" : {
          "value" : "$.md",
          "tokens" : [
            {
              "location" : 0,
              "value" : "@date.format(yyyy-MM-dd-HH-mm-s)"
            }
          ]
        },
        "text" : {
          "value" : "# $ TITLE",
          "tokens" : [
            {
              "location" : 2,
              "value" : "@date.format(yyyy-MM-dd-HH-mm-s)"
            }
          ]
        },
        "overwriteIfExists" : false
      }
    }
  ],
  "buildVersion" : 1,
  "name" : "Zettelkasten Note",
  "clientMinVersion" : 1,
  "summary" : "",
  "icon" : {
    "glyph" : "wand.and.stars",
    "color" : "#FE824B"
  },
  "clientVersion" : 1051
}
```

You can save this JSON snippet as `Zettelkasten Note.taioactions` and import it into Taio to use
it.
