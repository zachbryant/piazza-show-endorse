"use strict";

function addJankIntoDom() {
  var script = document.createElement("script");
  script.appendChild(document.createTextNode("" + update + ";"));
  script.appendChild(document.createTextNode("(" + interval + ")();"));
  (document.body || document.head || document.documentElement).appendChild(
    script
  );
}
addJankIntoDom();

window.oldUrlParams = new URLSearchParams(window.location.search);
window.oldCid = oldUrlParams.get("cid");

function interval() {
  setInterval(function () {
    if (!window.hasOwnProperty("P")) {
      console.error("P is undefined!");
      return;
    }
    var curUrlParams = new URLSearchParams(window.location.search);
    var curCid = curUrlParams.get("cid");
    if (!(curCid === undefined || curCid == window.oldCid)) {
      window.oldUrlPrarams = curUrlParams;
      window.oldCid = curCid;
      update();
    }
    if (P.note_view.content.proxy !== true) {
      P.note_view = new Proxy(P.note_view, {
        set: function (target, key, value) {
          //console.log(`${key} set to ${value}`);
          target[key] = value;
          update();
        }
      });
      P.note_view.content.proxy = true;
      update();
    }
  }, 500); // check every half second
}

function update() {
  if (!window.hasOwnProperty("P")) {
    console.error("P is undefined!");
    return;
  }
  var endorsements = [{
    sel: ".good_note",
    class: "good_note",
    content: P.note_view.content["tag_good"]
  }];
  if (P.answer.answers.hasOwnProperty("s_answer")) {
    endorsements.push({
      sel: "#member_answer .good_answer",
      class: "good_answer",
      content: P.answer.answers.s_answer["tag_endorse"]
    });
  }
  if (P.answer.answers.hasOwnProperty("i_answer")) {
    endorsements.push({
      sel: "#instructor_answer .good_answer",
      class: "good_answer",
      content: P.answer.answers.i_answer["tag_endorse"]
    });
  }
  var topFollowupContent = P.clarifying_discussion.followups;
  var topFollowupContentKeys = Object.keys(topFollowupContent);
  var followupContent = new Map();
  topFollowupContentKeys.forEach(function (k, ind) {
    var f = topFollowupContent[k];
    followupContent.set(k, f);
    if (f.children) {
      for (child of f.children) {
        followupContent.set(child.id, child);
      }
    }
  });

  var followups = document.querySelectorAll(".followup_actions");
  followups.forEach(function (f, ind) {
    var parent = f.parentElement;
    var fId = parent.id;
    var ob = {
      sel: `#${fId}>.followup_actions span`,
      class: "number",
      content: followupContent.get(fId)["tag_good"]
    };
    endorsements.push(ob);
  });

  endorsements.forEach(e => {
    if (e.content === undefined || e.content.length == 0) return;
    $(e.sel).attr({
      style: "font-weight: bold !important; text-decoration: underline !important;",
      tutorial: e.content
        .map(u => {
          if (u.admin) return `${u.name} (${u.role.toUpperCase()})`;
          return `${u.name}`;
        })
        .join(", "),
      class: `${e.class} btn-mini post_actions_number post_action main show-tipsy`
    });
    $(`.show-tipsy.${e.class}`).tipsy({
      gravity: "n",
      html: true,
      title: "tutorial"
    });
  });
}