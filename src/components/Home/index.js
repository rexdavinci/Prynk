import { decrypt } from '../common-handlers'

const Home = ({ user, prynkAddress }) => {
  return (
    <>
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
            <small>Your withdrawable balance is <b>0</b> IGNIS</small>
          </div> : null
          
        }       
      </div>
    </>
  )
}

export default Home