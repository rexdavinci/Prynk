import axios from 'axios'
import { decrypt } from '../common-handlers'

const WithdrawFunds = ({ user, chain }) => {  

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
    if(chain.name === 'goerli') {

      console.log(chain.tokenAddress)
      try{
      const withdraw = await chain.prynkContract.withdraw(chain.tokenAddress)
      const tx = await withdraw.wait()

        // console.log(tx)
      } catch(e) {
        console.log(e.message)
      }
    }

    if(chain.name === 'tArdor') {
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
  }

  if(chain.name === 'goerli') {

    return <div>
      <p>Withdraw My Funds</p>
      <button onClick={handleWithdraw}>Withdraw</button>
    </div>
  }

  if(chain.name === 'tArdor') {
  return user.withdrawable > 0 && (
    <div>
      <p>Withdraw My Funds</p>
      <button onClick={handleWithdraw}>Withdraw</button>
    </div>

    )
  }

  return null
}

export default WithdrawFunds
