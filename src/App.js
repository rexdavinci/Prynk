// import logo from './logo.svg';
import React, { useState, useEffect, Fragment } from 'react';
import './App.css';
import { Home, Ethereum, Login, Logout, WithdrawFunds, encrypt } from './components'
import { ABI, ERC20ABI } from './utils'


const Prynk = () => {
  const [user, setUser] = useState({})
  const [transactions, setTransactions] = useState([])
  const [blockchain, setBlockchain] = useState('tArdor')
  const prynkContractAddress = '0xA7c2667b7A1067DDAca4487f0BA6Aa0d647CA387'
  useEffect(() => {
    (async () => {
      let txs = await fetch(`${process.env.REACT_APP_SERVER}requestType=getBlockchainTransactions&chain=2&account=${process.env.REACT_APP_PRYNK_ADDRESS}`)
      txs = await txs.json();
      setTransactions(txs.transactions)
    })()
  }, [user])

  const selectWithdrawalDate = (e, chain) => {
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

    if(chain === 'goerli') {
      setUser({ withdrawalDate: Math.floor(text/1000), result })
    }
    const token = encrypt(`${user.account}:${text}`)
    setUser(prevState => ({ ...prevState, token }))
  }


  const selectNetwork = (e) => {
    setBlockchain(e.target.value)
  }

  return (
    <div className="App">
      <div>
        Chain: <select onChange={selectNetwork}>
          <option value ='tArdor'> Ardor (Testnet) </option>
          <option value ='goerli'> Ethereum (Goerli Testnet)</option>
        </select>
      </div>
      {
        blockchain === 'tArdor' ? <Ardor ardor={ { user, setUser, transactions, selectWithdrawalDate } } /> : <Ethereum goerli={ { prynkContractAddress, user, setUser, selectWithdrawalDate } } />
      }
      <Home blockchain={blockchain} ethAddress={prynkContractAddress} prynkAddress={process.env.REACT_APP_PRYNK_ADDRESS} user={user} transactions={transactions}/>

    </div>
  )
}


const Ardor = ({ ardor }) => {
  const { user, setUser, transactions, selectWithdrawalDate } = ardor
    return (
      <Fragment>
        <h3 style={{ color: 'red' }}>Use only testnet IGNIS</h3>
          <div style={{ padding: '1rem' }}> <em><b>contribute to code: </b><a rel='noreferrer'  target='_blank' href='https://github.com/rexdavinci/Prynk_ARDOR'>prynk</a></em></div>
          <div>
            {
              !user.account ? <Login setUser={setUser} prynkerTxs={transactions}/> : null
            }
          </div>
          {
            (user && user.account && !user.token) ? <div>
            <p>When do you wish to withdraw your funds?</p>
            <form onSubmit={(e) => selectWithdrawalDate(e, 'ardor')}>
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
        <WithdrawFunds user={user} chain={{ name: 'tAdror' }}/>
        </div>
      </Fragment>
    )
  }



  

  export default Prynk;
