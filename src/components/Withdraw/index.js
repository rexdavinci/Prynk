import axios from 'axios'
import { decrypt } from '../common-handlers'

const WithdrawFunds = ({ user }) => {  

  const withdraw = async({ fee }) => {
    try {
      const withdraw = await axios.post(
        `${process.env.REACT_APP_SERVER}chain=2&requestType=sendMoney&recipient=${user.account}&amountNQT=${(user.withdrawable-fee)}&privateKey=${process.env.REACT_APP_PK}&feeNQT=${fee}&deadline=60`)
      alert(`Transaction successful, tx: ${withdraw.data.fullHash}`)
    } catch(e) {
      alert('An error occurred, please try again later')
      console.log(e)
    }
  }

  const handleWithdraw = async () => {
    const dueDate = decrypt(user.token)
    const now = Date.now()
    const fee = 0.025 * 10 ** 8
    if(dueDate < now && user.withdrawable > 0){
      if (user.withdrawable < fee) {
        alert('Your balance is lower than the fee')
        return null
      }
      await withdraw({ fee })
    } else {
      alert(`Your withdrawal target date is ${new Date(dueDate).toDateString()}. You can do it, just a little more patience`)
    }
  }
  return user.withdrawable > 0 && (
    <div>
      <p>Withdraw My Funds</p>
      <button onClick={handleWithdraw}>Withdraw</button>
    </div>
  )
}

export default WithdrawFunds
