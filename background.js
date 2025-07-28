class Jobs {
  static init = (message, _sender, sendResponse) => {
    switch (message.action) {
      case 'setCookie':
        this.setCookie(message.token, sendResponse)
        break
      case 'getCookie':
        this.getCookie(sendResponse)
        break
      default:
        console.error('Unknown action:', message.action)
        this.sender({ success: false, error: 'Unknown action' })
        break
    }

    return true
  }

  static setCookie = (token, sendResponse) => {
    chrome.cookies.set(
      {
        url: 'https://gale.udemy.com',
        name: 'access_token',
        value: token,
        domain: '.gale.udemy.com',
        path: '/',
        secure: true,
      },
      () => {
        if (chrome.runtime.lastError)
          sendResponse({
            success: false,
            error: chrome.runtime.lastError.message,
          })
        else sendResponse({ success: true })
      }
    )
  }

  static getCookie = (sendResponse) => {
    chrome.cookies.get(
      {
        url: 'https://gale.udemy.com',
        name: 'access_token',
      },
      (cookie) => {
        const token = cookie ? cookie.value : null

        if (!token)
          return sendResponse({ success: false, error: 'No cookie found' })

        return sendResponse({
          success: true,
          token,
        })
      }
    )
  }
}

chrome.runtime.onMessage.addListener(Jobs.init)
