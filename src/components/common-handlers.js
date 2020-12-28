import CryptoJS from 'crypto-js'

export const decrypt = (token) => {
  const bytes = CryptoJS.AES.decrypt(token, process.env.REACT_APP_ENCRYPTION_KEY)
  const accountString = bytes.toString(CryptoJS.enc.Utf8)
  const date = accountString.slice(accountString.lastIndexOf(':')+1)
  return new Date(Number(date))
}

export const encrypt = (text) => CryptoJS.AES.encrypt(`${text}`, process.env.REACT_APP_ENCRYPTION_KEY).toString()