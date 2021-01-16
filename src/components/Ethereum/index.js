import React, { useState, useEffect, Fragment } from 'react'
import { ethers, Contract } from 'ethers'
import { ABI, ERC20ABI } from '../../utils'
import { WithdrawFunds } from '../index'

const Ethereum = ({ goerli }) => {
    const { selectWithdrawalDate, user, prynkContractAddress } = goerli
    const [address, setAddress] = useState('')
    const [saved, setSaved] = useState({ amount: 0, goal: 0, symbol: '', withdrawable: 0 })
    const [token, setToken] = useState('')

    const [provider, setProvider] = useState(null)
    const [prynkContract, setPrynkContract] = useState(null)
    const [erc20Contract, setERC20Contract] = useState(null)
    
    useEffect(() => {
      setProvider(connectProvider({setAddress}))
    }, [])

    useEffect(() => {
      // console.log(provider)
      let signer
      if(provider) {
        signer = provider.getSigner(address)
        const prynkI = new Contract(prynkContractAddress, ABI, signer);
        if (prynkI) {
          prynkI.mySavings(token).then(res => { 
            setSaved({ amount: Number(res.saved), goal: Number(res.goalAmount), symbol: res.tokenSymbol, withdrawable: Number(res.withdrawalDate * 1000), decimals: Number(res.decimals) })
          })                         

          setPrynkContract(prynkI)
        }

        const erc20I = new Contract(token, ERC20ABI, signer)
        if(erc20I) {
          setERC20Contract(erc20I)
        }
      }
    }, [token]) // eslint-disable-line react-hooks/exhaustive-deps
    

    const prynkIt = async(e) => {
      // console.log(e.target.value)
      let deposit

      if(saved.amount === 0) {
        if(!user.result.amount) {
          alert('You must specify what your goal is')
        }
        const approval = await erc20Contract.approve(prynkContractAddress, ethers.utils.parseEther(user.result.amount))
        await approval.wait()

        const answer = prompt('How much are you depositing this time?')

        if(answer && (answer < user.result.amount)) {
          deposit = await prynkContract.startSaving(token, ethers.utils.parseEther(user.result.amount), ethers.utils.parseEther(answer), user.withdrawalDate)
          const tx = await deposit.wait()
          console.log(tx)
        }
      } else {
        const answer = prompt('How much are you depositing this time?')
     
        const savedAmount = (saved.amount / (10 ** saved.decimals))
        const savedGoal = (saved.goal / (10 ** saved.decimals))
        const nextSavingsTotal = Number(answer) + savedAmount

        if(nextSavingsTotal > savedGoal){
          alert(`This goal only requires an additional ${savedGoal - savedAmount}`)
        }

          deposit = await prynkContract.saveMore(token, ethers.utils.parseEther(answer))
          const tx = await deposit.wait()
          console.log(tx)
      }
    } 

    const handleTokenChange = (e) => {
      if(e.target.value !== '0x') {
        setToken(e.target.value)
      }
    }

    const supportedTokens = [
      {
        name: 'Select',
        symbol: '',
        address: '0x'
      },
      {
        name: 'SMNT Token',
        symbol: 'SMNT',
        address: '0x0566300f84f410040ab9cf22b311a1261d494564'
      }    
    ]

    return (
      <Fragment>
        <h3 style={{ color: 'red' }}>Use only testnet ETH (Goerli)</h3>
        <div style={{ padding: '1rem' }}> <em><b>contribute to code: </b><a rel='noreferrer'  target='_blank' href='https://github.com/rexdavinci/Prynk_ARDOR'>prynk</a></em></div>
        <p>Your address {address}</p>
        <select onChange={handleTokenChange}>
          {
            supportedTokens.map(t => {
              return(
                <option key={t.symbol} value={t.address}>{t.name}</option>
              )
            })
          }
        </select>
        
        {
          token ? 
          saved.amount === 0 ? <form onSubmit={(e) => selectWithdrawalDate(e, 'goerli')}>
              <span>Amount: </span><input name='amount'/>
              <span>day: </span><input name='day' />
              <span>month: </span> <input name='month'/>
              <span>year: </span> <input name='year'/>
              <input disabled={user.withdrawalDate} type='submit' value='Set'/>
            </form> : null : null
        }
        {
         saved.amount > 0 && <div>
            <p>You have currently saved {saved.amount / (10 ** saved.decimals)} {saved.symbol} of {saved.goal / (10 ** saved.decimals) } {saved.symbol} Withdrawable on {new Date(saved.withdrawable).toLocaleString()}  </p>
          </div>
        }
        
        {
          user.result && <div>
          {token ? <button onClick={prynkIt}>{saved.amount === 0 ? 'Start saving :D'  : 'Save More :)'}</button>: null}
          </div>
        }
      <div>
        <WithdrawFunds user={user} chain={{name: 'goerli', saved, prynkContract, tokenAddress: token}}/>
      </div>
      </Fragment>
    )
  }

  const connectProvider = ({ setAddress }) => {
    const { ethereum } = window
    if(!ethereum) {
      alert('You need to install metamask or similar tools')
    }
    const provider = new ethers.providers.Web3Provider(ethereum)
    ethereum.request({ method: 'eth_requestAccounts'}).then(acc => setAddress(acc[0]))
    return provider;
  }

  export default Ethereum