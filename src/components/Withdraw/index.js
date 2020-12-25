import axios from 'axios'
import { decrypt } from '../common-handlers'

const WithdrawFunds = ({ user }) => {  
  const handleWithdraw = async () => {
    const dueDate = decrypt(user.token)
    const now = Date.now()
    if(dueDate < now && user.withdrawable > 0){
      let fee
      const preferredFee = prompt('Fee (optional)')
      if(preferredFee) {
        fee = preferredFee * 1 * 10**8
      } else {
        fee = 0.025 * 10 ** 8
      }
      if (user.withdrawable < fee) {
        alert('Your balance is lower than the fee')
        return null
      }
      try {
        const withdraw = await axios.post(
          `${process.env.REACT_APP_SERVER}chain=2&requestType=sendMoney&recipient=${user.account}&amountNQT=${(user.withdrawable-fee)}&privateKey=${process.env.REACT_APP_PK}&feeNQT=${fee}&deadline=60`)
        console.log(withdraw.data)
      } catch(e) {
        console.log(e)
      }
    }
  }
  return (
    <div>
      <p>Withdraw My Funds</p>
      <button onClick={handleWithdraw}>Withdraw</button>
    </div>
  )
}

export default WithdrawFunds
