import { networkCall } from './handler'

const Login = ({ setUser, prynkerTxs }) => {
  return (
    <div>
      <form onSubmit={(e) => networkCall(e, { callType: 'getAccount', setUser, txs: prynkerTxs })}>
        <input name='address' type='text' placeholder='ardor-address'/>
        <input type='submit' value='Login'/>
      </form>
    </div>
  )
}

export default Login