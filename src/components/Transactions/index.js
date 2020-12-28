const Transactions = ({ transactions }) => {
  console.log(transactions)

  // const withdrawals = transactions.map(t => )
  console.log(transactions[0])
  return(
    <div style={{ overflowY: 'auto', height: '500px', width: '50%', margin: '1rem auto', border: '2px solid blue'}}> 
    
    <table>
      <thead>
      <tr>
        <th>Date</th>
        <th>Amount</th>
        <th></th>
      </tr>
      </thead>
    </table>
    </div>
  )
}

export default Transactions
