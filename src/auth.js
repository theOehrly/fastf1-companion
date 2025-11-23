const statusElement = document.getElementById('status');
const authButton = document.getElementById('authButton');


let browser = chrome;

if (typeof browser !== "undefined") {
    browser = chrome;
}


authButton.addEventListener('click', async () => {
    authButton.disabled = true;
    statusElement.textContent = 'Authenticating...';

    try {
        const loginSession = await getCookie('login-session');

        if (!loginSession) {
            statusElement.textContent = 'Could not find login-session cookie!';
            statusElement.style.color = 'red';
            authButton.disabled = false;
            return;
        }

        await sendCookieToLocalhost(loginSession);
    } catch (error) {
        handleError(error);
        authButton.disabled = false;
    }
});

async function getCookie(name) {
    try {
        // Use browser.runtime for Firefox compatibility
        const runtime = window.browser || window.chrome;
        return new Promise((resolve, reject) => {
            runtime.runtime.sendMessage({
                action: "getCookie",
                name: name
            }, response => {
                if (response.error) {
                    reject(new Error(response.error));
                } else {
                    resolve(response.cookie);
                }
            });
        });
    } catch (error) {
        console.error("Error in getCookie:", error);
        throw error;
    }
}

async function sendCookieToLocalhost(loginSession) {
    try {
        const port = await new Promise(resolve => {
            browser.storage.local.get("port", data => resolve(data.port));
        });

        const response = await fetch(`http://localhost:${port}/auth`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                loginSession: loginSession
            })
        });

        if (response.ok) {
            statusElement.textContent = 'Authentication successful! You can now close this tab.';
            statusElement.style.color = 'green';
            browser.storage.local.remove('pendingAuth');
        } else {
            throw new Error(`Server responded with ${response.status}: ${response.statusText}`);
        }
    } catch (error) {
        if (error.message.includes('Failed to fetch')) {
            throw new Error('Could not connect to the local FastF1 application. Make sure it is running and listening on the correct port.');
        } else {
            throw error;
        }
    }
}

function handleError(error) {
    statusElement.textContent = `Error: ${error.message}`;
    statusElement.style.color = 'red';
    console.error('Authentication error:', error);
}