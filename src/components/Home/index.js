import { Fragment } from 'react'
import { decrypt } from '../common-handlers'

const Home = ({ user, prynkAddress, ethAddress, blockchain }) => {
  return blockchain === 'tArdor' ? (
    <Fragment>
      <div> Send your deposits<b>{prynkAddress}</b></div>
      <div>
        <small>Your account is: <b>{user.account}</b> </small>
        { user && user.totalDeposits === 0 ? 
          <div>
            <small>This is your goalToken: <b>{user.token}</b> make sure to add it to your first deposit</small>
          </div>
          : user && user.token  && user.withdrawable > 0 ? <div>
              <small>You are saving until: {decrypt(user.token).toDateString()}</small>
          </div> 
          : user && user.token && user.withdrawable <= 0 ? <div>
            
          </div> : null
          
        }       
        { user.token && <small>Your withdrawable balance is <b>{user.withdrawable < 0 ? 0 : user.withdrawable / (10 ** 8)}</b> IGNIS</small> }
      </div>
    </Fragment>
  ) : (
    <Fragment>
      <div>PRYNK's contract address: <small><a rel='noreferrer' target='_blank' href={`https://goerli.etherscan.io/address/${ethAddress}`}><b>{ethAddress}</b></a></small></div>
      <small>Get free tokens: <a rel='noreferrer' target='_blank' href='https://rexdavinci.github.io/erc20-faucet-client'><b>faucet</b></a></small>
    </Fragment>
  )
}

export default Home