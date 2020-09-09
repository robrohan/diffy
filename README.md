# Diffy

Diffy is a single file Javascript library that can help you make a Single Page Application (SPAs) from a server rendered application. The library is quite small (~200 lines), has no dependencies, and degrades if the client does not have Javascript turned on.

## What is this for?

We use Diffy as a rapid prototyping tool, and to quickly create some internal products. It is mostly used for proof of concept spikes which require a dynamic SPA feeling, but only use server side rendering technology (go template for example).

It is blazingly fast compared to something like React or Angular (in both page load speed and product iteration). It allows one to use backend templates while still letting you "stay on one page", dynamically update parts of the page, or do page refreshes without losing scroll positioning.

It's not a full fledged framework, but can get you pretty far when flushing out a product idea.

## How it works

You define the parts of a page that should be "dynamic", Diffy then rewrite the links and forms in those sections, and, upon interaction, replaces those area dynamically by fetching the next page in the background.

It's a simple concept that basically works like this. You include diffy on your pages, and tell it which query selectors to watch. For example the following code:

```
    Diffy.init([".one", ".two"]);
```

will watch and replace two DOM areas: `class="one"` and `class="two"`. Diffy will override any anchor tags or form posting tags in those sections. When the user interacts with those sections of the page, diffy will do the following:


```
      +------------------+
      | Diffy            |-----------fetch------------+
      |                  |<----+                      |
      +------------------+     |                      \/
      +------------------+     |          +------------------+
      | HTML<1>          |     |          | HTML<N>          |
      |                  |     |          |                  |
      |                  |     |          |                  |
      |                  |click+          |                  |
      |                  |                |                  |
      |                  |                |                  |
      |                  |                |                  |
      +------------------+                +------------------+

```

The action is intercepted, and the HTTP request is made by diffy and the next page is loaded in the background.


```
      +------------------+
      | Diffy            |<----------response------------+
      |                  |replace-+                      |
      +------------------+        |                      |
      +------------------+        |         +------------------+
      | HTML<1>          |        |         | HTML<N>          |
      |                  |        |         |                  |
      |                  |        |         |                  |
      |                  |<------ +         |                  |
      |                  |                  |                  |
      |                  |                  |                  |
      |                  |                  |                  |
      +------------------+                  +------------------+

```

Diffy then replaces the section of the original page with the section from the new page (they must match). In our initial example, the contents in `class="one"` and `class="two"` will be replaced with the contents from the new page.

Additionally the history is rewritten so if the user bookmarks the new state (or clicks refresh on the browser), the second page is displayed.

## Usage

Include the Javascript file in the head section of your page

```
  ...
  <script src="diffy.js"></script>
  ...
```

And then at the bottom of the page before the end body tag, add the diffy init call and any handlers.

Minimum:

```
  <script>
    Diffy.init([".one", ".two"]); // <-- dom selectors
  </script>
```

With rebind handlers (functions called after a section has been updated by diffy)

```
  <script>
    Diffy.init([".one", ".two"]); // <-- dom selectors

    const fn = function () {
      (function () { console.log("I am called after diffy binds."); })();
    };

    Diffy.rebind.push(fn);        // <-- rebind handlers
  </script>
```

## Running the examples

To run the examples, start a web server in this directory, click on the `examples` folder, and then click the index page. If you don't have a play-around web server, and you like golang, you can try [this one](https://github.com/robrohan/busboy)


## Where are the tests?

It is important to note that Diffy is not what Movio considers "production ready code". We do quite a number of experiments and spikes while developing our products, and this is just one tool we use. Hopefully you find it useful, and pull requests are always welcome!

.