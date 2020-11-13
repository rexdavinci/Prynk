// import logo from './logo.svg';
import React, { useState, useEffect } from 'react';
import CryptoJS from 'crypto-js'
import axios from 'axios'
import './App.css';

const Prynk = () => {
  const [user, setUser] = useState({})
  const [transactions, setTransactions] = useState([])
  
  useEffect(() => {
    (async () => {
      let txs = await fetch(`http://localhost:26876/nxt?requestType=getBlockchainTransactions&chain=2&account=${process.env.REACT_APP_PRYNK_ADDRESS}`)
      txs = await txs.json();
      // console.log(txs.transactions)
      setTransactions(txs.transactions)
    })()
  }, [user])

  const selectWithdrawalDate = (e) => {
    e.preventDefault()
    const tar = [...e.target]
    const result = {}
    tar.map(t => {
      if(t.name){
        return result[t.name] = t.value
      }
      return false
    })

    let date = `${result.day}/${result.month}/${result.year}`
    date = new Date(date).getTime()
    const token = CryptoJS.AES.encrypt(`${date}`, process.env.REACT_APP_ENCRYPTION_KEY).toString()
    setUser(prevState => ({ ...prevState, token }))
  }

  return (
    <div className="App">
      <Home prynkAddress={process.env.REACT_APP_PRYNK_ADDRESS} user={user}/>
      <div>
        {
          !user.account ? <Login setUser={setUser} prynkerTxs={transactions}/> : null
        }
      </div>
      {
        user && user.account && user.totalDeposits === 0 && !user.token ? <div>
        <p>When do you wish to withdraw your funds?</p>
        <form onSubmit={(e) => selectWithdrawalDate(e)}>
          <span>day: </span><input name='day' />
          <span>month: </span> <input name='month'/>
          <span>year: </span> <input name='year'/>
          <input type='submit' value='Set'/>
        </form>
        </div> : null
      }
      <div>
        <WithdrawFunds user={user} />
      </div>
    </div>
  );
}

const decrypt = (token) => {
  const bytes = CryptoJS.AES.decrypt(token, process.env.REACT_APP_ENCRYPTION_KEY)
  const date = bytes.toString(CryptoJS.enc.Utf8)
  return new Date(Number(date))
}

const Home = ({ user, prynkAddress }) => {
  return (
    <React.Fragment>
      <div> Send your deposits<b>{prynkAddress}</b></div>
      <div>
        <small>Your account is: <b>{user.account}</b> </small>
        { user.withdrawalDate ? 
          <div>
            <small>This is your goalToken: <b>{user.token}</b> make sure to add it to your first deposit</small>
            <small>You are saving until: {decrypt(user.withdrawalDate).toDateString()}</small>
          </div>
          : null
        }
          
      </div>
    </React.Fragment>
  )
}

const networkCall = async (e, { callType, setFn, txs }) => {
  e.preventDefault()
  if (callType === 'getAccount') {
    const account = e.target[0].value
    let userAccount = await fetch(`http://localhost:26876/nxt?requestType=${callType}&account=${account}`)
    userAccount = await userAccount.json()

    // const { transactions } = await myDeposits.json()
    const accountDeposits = []
    const accountWithdrawals = []

    const blockchainStatus = await fetch(`http://localhost:26876/nxt?requestType=getBlocks&lastIndex=1`)

    const currentBlock = await blockchainStatus.json()
    const { height } = currentBlock.blocks[0]
    let firstDeposit = height
    txs.map((t) => {
      if(t.senderRS === userAccount.accountRS){
        if(t.height < firstDeposit){
          firstDeposit = t.height
        }
        accountDeposits.push(Number(t.amountNQT))
      } else if(t.recipientRS === userAccount.accountRS){
        accountWithdrawals.push(Number(t.amountNQT))
      }
      return true
    })

    const cypherGoalDeposit = txs.find(tx => tx.height === firstDeposit)

    let withdrawalDate = ''

    if(cypherGoalDeposit && cypherGoalDeposit.attachment.message) {
      withdrawalDate = cypherGoalDeposit.attachment.message
    }

    const totalDeposits = accountDeposits.reduce((acc, curr) => acc + curr, 0)
    const totalWithdrawals = accountWithdrawals.reduce((acc, curr) => acc + curr, 0)
    const fee = totalDeposits * 0.01
    const withdrawable = totalDeposits - fee
    setFn({ withdrawalDate, firstDeposit, account: userAccount.accountRS, totalDeposits, totalWithdrawals, withdrawable })

  }
}

const Login = ({ setUser, prynkerTxs }) => {
  return (
    <div>
      <form onSubmit={(e) => networkCall(e, { callType: 'getAccount', setFn: setUser, txs: prynkerTxs })}>
        <input name='address' type='text' placeholder='ardor-address'/>
        <input type='submit' value='Login'/>
      </form>
    </div>
  )
}

const WithdrawFunds = ({ user }) => {
  
  const handleWithdraw = async () => {
    const dueDate = decrypt(user.withdrawalDate)
    const now = Date.now()
    if(dueDate < now && user.withdrawable > 0){
      let fee
      const preferredFee = prompt('Fee (optional)')
      if(preferredFee){
        fee = preferredFee * 1 * 10**8
      }
      if (user.withdrawable < fee) {
        alert('Your balance is lower than the fee')
        return null
      }
      fee = 0.025 * 10 ** 8
      try {
        const withdraw = await axios.post(
          `http://localhost:26876/nxt?chain=2&requestType=sendMoney&recipient=${user.account}&amountNQT=${(user.withdrawable-fee)}&secretPhrase=${process.env.REACT_APP_SECRET_KEY}&feeNQT=${fee}&deadline=60`)
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

export default Prynk;
