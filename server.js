"use strict";

const express = require("express");
const Slapp = require("slapp");
const ConvoStore = require("slapp-convo-beepboop");
const Context = require("slapp-context-beepboop");

// use `PORT` env var on Beep Boop - default to 3000 locally
var port = process.env.PORT || 3000;

var slapp = Slapp({
  // Beep Boop sets the SLACK_VERIFY_TOKEN env var
  verify_token: process.env.SLACK_VERIFY_TOKEN,
  convo_store: ConvoStore(),
  context: Context()
});

const getAllEmoji = msg => {
  const appToken = msg.meta.app_token;

  return new Promise((resolve, reject) => {
    const payload = {
      token: appToken
    };
    slack.emoji.list(payload, (err, data) => {
      const emoji = data["emoji"];
      resolve(emoji);
    });
  });
};

slapp.command("/bigmoji", "\:(.*)\:", (msg, text, emojiName) => {
  // text == :emojiName:
  getAllEmoji(msg).then(emoji => {
    const userEmoji = emoji[emojiName];
    if (userEmoji) {
      msg.say({
        token: msg.meta.app_token,
        text: `*${msg.body.user_name}*`,
        attachments: [
          {
            title: "",
            color: "#420",
            image_url: userEmoji
          }
        ]
      });
    } else {
      msg.say("not an emoji");
    }
  });
});

// attach Slapp to express server
var server = slapp.attachToExpress(express());

// start http server
server.listen(port, err => {
  if (err) {
    return console.error(err);
  }

  console.log(`Listening on port ${port}`);
});
