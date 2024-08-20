const Diffy = {};

(function() {
  "use strict";

  Diffy.templateArea = null;
  Diffy.replaceSelectors = [];

  // Initialize diffy with some DOM selectors
  Diffy.init = function(selectors) {
    if (!selectors || !selectors.length) {
      throw new Error("Diffy needs selectors");
    }
    Diffy.replaceSelectors = selectors;
    Diffy.replaceSelectors.forEach(function(sel) {
      Diffy.bind(sel);
    });
  };

  // Callback functions after new fragments
  // are updated
  Diffy.rebind = [];

  Diffy.bind = function(selector) {
    const fragment = document.querySelector(selector);
    if (!fragment) {
      return;
    }

    const aTags = fragment.querySelectorAll("a");
    Diffy.rewriteAnchor(aTags);

    const forms = fragment.querySelectorAll("form");
    Diffy.rewriteForms(forms);
  };

  // Overwrite form submissions
  Diffy.rewriteForms = function(forms) {
    const flen = forms.length;
    for (let x = 0; x < flen; x++) {
      const form = forms[x];
      form.addEventListener("submit", Diffy.formHandler(form));
    }
  };

  // Overwrite anchor tags
  Diffy.rewriteAnchor = function(aTags) {
    const atlen = aTags.length;
    for (let x = 0; x < atlen; x++) {
      const tag = aTags[x];
      tag.addEventListener("click", Diffy.aHandler(tag));
    }
  };

  // When the data comes back, this replaces the current 
  // document with the parts of the new doc that matter
  Diffy.replaceContent = function(html, url) {
    if (!html || !url) {
      return;
    }

    if (!Diffy.templateArea) {
      Diffy.templateArea = document.createElement("template");
    }
    const t = Diffy.templateArea;
    t.innerHTML = html;

    Diffy.replaceSelectors.forEach(function(sel) {
      const newFragment = t.content.querySelector(sel);
      const oldFragment = document.querySelector(sel);
      if(newFragment && oldFragment)
        oldFragment.innerHTML = newFragment.innerHTML;
    });

    history.pushState(t.innerHTML, "Diffy", url);

    Diffy.replaceSelectors.forEach(function(sel) {
      Diffy.bind(sel);
    });

    if (Diffy.rebind.length) {
      const rbl = Diffy.rebind.length;
      for(let i = 0; i < rbl; ++i) {
        const f = Diffy.rebind[i];
        f();
      }
    }
  };

  Diffy.inputsToFormPost = function(form) {
    // TODO: this needs checkbox, radio, etc
    const inputs = Array.from(form.querySelectorAll("input"));
    inputs.push.apply(inputs, form.querySelectorAll("textarea"));
    const qs = [""];
    for (let q = 0; q < inputs.length; q++) {
      const nv = inputs[q];
      if (nv.name) {
        qs.push(nv.name, "=", nv.value, "&");
      }
    }
    return qs.join("");
  };

  // Call this if you want to do a direct by hand
  Diffy.urlHandler = function(link) {
    fetch(link)
      .then(function(response) {
        return response.text();
      })
      .then(function(html) {
        Diffy.replaceContent(html, link);
      });
  }

  Diffy.aHandler = function(aTag) {
    return function(e) {
      e.preventDefault();
      const link = aTag.href;
      Diffy.urlHandler(link);
    };
  };

  Diffy.formHandler = function(form) {
    return function(e) {
      e.preventDefault();
      const method = form.method.toString().toLowerCase();

      fetch(form.action, {
        method: form.method,
        body: method === "get" ? null : Diffy.inputsToFormPost(form),
        headers: {
          "Content-Type": "application/x-www-form-urlencoded"
        }
      })
        .then(function(response) {
          return response.text();
        })
        .then(function(html) {
          Diffy.replaceContent(
            html,
            method === "get" ? form.action : window.location.href
          );
        })
        .catch(function(e) {
          console.error("Diffy error:", e);
        });

      return false;
    };
  };
})();
