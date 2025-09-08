// background.js
// Initialize browser for Firefox/Edge
let browser = chrome;

if (typeof browser !== "undefined") {
  browser = chrome;
}

browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "getCookie") {
    browser.cookies.get({
      url: "https://livetiming.formula1.com",
      name: "login-session"
    }).then(cookie => {
      sendResponse({ cookie: cookie ? cookie.value : null });
      return true;
    }).catch(error => {
      console.error("Error getting cookie:", error);
      sendResponse({ error: error.message });
      return true;
    });
    return true;
  }
});

// add a listener for navigation to a specific URL
browser.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.url) {
    if (changeInfo.url.includes("f1login.fastf1.dev") || changeInfo.url.includes(".fastf1.dev/extension")) {
      // grab port query parameter from url
      const port = new URL(changeInfo.url).searchParams.get("port");
      if (port) {
        // save port to localStorage
        localStorage.setItem("port", port);
        localStorage.setItem("pendingAuth", "true")
        // redirect to the login page
        browser.tabs.update(tabId, {url: "https://account.formula1.com/"});
      } else {
        browser.tabs.update(tabId, {url: "/status_ok.html"});
      }
    }

    if (changeInfo.url.includes("account.formula1.com")
        && changeInfo.url.includes("my-account")
        && localStorage.getItem("pendingAuth") === "true") {
      // redirect to the success page
      browser.tabs.update(tabId, {url: "/connect.html"});
    }

  }
});

