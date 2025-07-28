const tokenNameInStorage = 'udemy_access_token'
const screens = {
  loginScreen: 'loginScreen',
  saveTokenScreen: 'saveTokenScreen',
}

const loginScreen = document.getElementById('loginScreen')
const saveTokenScreen = document.getElementById('saveTokenScreen')
const loginBtn = document.getElementById('loginBtn')
const statusMessage = document.getElementById('status')
const tokenInput = document.getElementById('tokenInput')
const saveTokenBtn = document.getElementById('saveTokenBtn')
const resetTokenBtn = document.getElementById('resetTokenBtn')
const saveUpdatedCookieBtn = document.getElementById('saveUpdatedCookie')
const clearInputBtn = document.getElementById('clearInput')
const copyToClipboardBtn = document.getElementById('copyToClipboard')

/**
 *
 * @returns {Promise<string | null>}
 */
const getTokenFromStorage = async () =>
  new Promise((resolve) => {
    chrome.storage.local.get(tokenNameInStorage, (result) => {
      resolve(result[tokenNameInStorage] || null)
    })
  })

/**
 *
 * @param {Promise<string>} token
 */
const saveToken = (token) =>
  new Promise((resolve) => {
    chrome.storage.local.set({ [tokenNameInStorage]: token }, () => {
      statusMessage.textContent = 'Token saved successfully!'
      resolve(token)
    })
  })

const resetToken = () =>
  new Promise((resolve) => {
    chrome.storage.local.remove(tokenNameInStorage, () => {
      statusMessage.textContent = ''
      resolve()
    })
  })

/**
 *
 * @param {string} screen
 */
const switchScreen = (screen) => {
  if (screen === screens.saveTokenScreen) {
    loginScreen.classList.add('hidden')
    saveTokenScreen.classList.remove('hidden')
  } else if (screen === screens.loginScreen) {
    loginScreen.classList.remove('hidden')
    saveTokenScreen.classList.add('hidden')
  } else statusMessage.textContent = 'Error switching screens'
}

/**
 *
 * @returns {Promise<string | null>}
 */
const retriveCookie = () =>
  new Promise((resolve) => {
    chrome.runtime.sendMessage({ action: 'getCookie' }, (response) => {
      console.log('Response from getCookie:', response)

      if (chrome.runtime.lastError) {
        statusMessage.textContent =
          'Error retrieving cookie: ' + chrome.runtime.lastError.message
        resolve(null)
      } else if (response.success && response.token) {
        statusMessage.textContent = 'Cookie retrieved successfully!'
        resolve(response.token)
      } else {
        statusMessage.textContent = response.error || 'No cookie found'
        resolve(null)
      }
    })
  })

const clearInput = () => {
  tokenInput.value = ''
  statusMessage.textContent = ''
}

const copyToClipboard = () => {
  const token = tokenInput.value.trim()
  if (!token) {
    statusMessage.textContent = 'Please enter a token to copy.'
    return
  }
  navigator.clipboard
    .writeText(token)
    .then(() => {
      statusMessage.textContent = 'Token copied to clipboard!'
    })
    .catch((err) => {
      statusMessage.textContent = 'Failed to copy token: ' + err.message
    })
}

const retiveUpdatedCookie = async () => {
  const token = await retriveCookie()

  if (token) {
    tokenInput.value = token
    statusMessage.textContent = 'Cookie retrieved successfully!'
  } else {
    statusMessage.textContent = 'Failed to retrieve cookie.'
  }
}

const handleResetToken = async () => {
  await resetToken()
  switchScreen(screens.saveTokenScreen)
}

/**
 *
 * @param {string} token
 */
const handleLogin = (token) => async () => {
  chrome.runtime.sendMessage({ action: 'setCookie', token }, () => {
    if (chrome.runtime.lastError)
      statusMessage.textContent =
        'Error setting cookie: ' + chrome.runtime.lastError.message
    else statusMessage.textContent = 'Cookie set successfully!'
  })
}

const handleSaveToken = async () => {
  const tokenValue = tokenInput.value.trim()
  if (!tokenValue)
    return (statusMessage.textContent = 'Please enter a valid token.')

  token = await saveToken(tokenValue)
  switchScreen(screens.loginScreen)
}

;(async () => {
  try {
    let token = await getTokenFromStorage()
    if (!token) switchScreen(screens.saveTokenScreen)

    saveTokenBtn.addEventListener('click', handleSaveToken)
    loginBtn.addEventListener('click', handleLogin(token))
    resetTokenBtn.addEventListener('click', handleResetToken)
    saveUpdatedCookieBtn.addEventListener('click', retiveUpdatedCookie)
    clearInputBtn.addEventListener('click', clearInput)
    copyToClipboardBtn.addEventListener('click', copyToClipboard)
  } catch (error) {}
})()
