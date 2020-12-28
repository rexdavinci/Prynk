// import logo from './logo.svg';
import React, { useState, useEffect } from 'react';
import './App.css';
import { Home, Login, Logout, WithdrawFunds, encrypt } from './components'

const Prynk = () => {
  const [user, setUser] = useState({})
  const [transactions, setTransactions] = useState([])
  useEffect(() => {
    (async () => {
      let txs = await fetch(`${process.env.REACT_APP_SERVER}requestType=getBlockchainTransactions&chain=2&account=${process.env.REACT_APP_PRYNK_ADDRESS}`)
      txs = await txs.json();
      setTransactions(txs.transactions)
    })()
  }, [user])

  const selectWithdrawalDate = (e) => {
    e.preventDefault()
    const target = [...e.target]
    const result = {}
    target.map(t => {
      if(t.name){
        return result[t.name] = t.value
      }
      return false
    })

    let text = `${result.month}/${result.day}/${result.year}`
    text = new Date(text).getTime()
    if(isNaN(text)) {
      alert('Date is in wrong format')
      return null
    }
    const token = encrypt(`${user.account}:${text}`)
    setUser(prevState => ({ ...prevState, token }))
  }

  return (
    <div className="App">
      <Home prynkAddress={process.env.REACT_APP_PRYNK_ADDRESS} user={user} transactions={transactions}/>
      <div>
        {
          !user.account ? <Login setUser={setUser} prynkerTxs={transactions}/> : null
        }
      </div>
      {
        (user && user.account && !user.token) ? <div>
        <p>When do you wish to withdraw your funds?</p>
        <form onSubmit={(e) => selectWithdrawalDate(e)}>
          <span>day: </span><input name='day' />
          <span>month: </span> <input name='month'/>
          <span>year: </span> <input name='year'/>
          <input type='submit' value='Set'/>
        </form>
        </div> : null
      }
      
      { (user && user.account) &&
        <div>
          <Logout setUser={setUser}/>
        </div>
      } 
        <div>
          <WithdrawFunds user={user} />
          </div>
    </div>
  )
}

  export default Prynk;
