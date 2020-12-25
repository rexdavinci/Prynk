export const networkCall = async (e, { callType, setUser, txs }) => {
  e.preventDefault()
  if (callType === 'getAccount') {
    const account = e.target[0].value
    let userAccount = await fetch(`${process.env.REACT_APP_SERVER}requestType=${callType}&account=${account}`)
    userAccount = await userAccount.json()

    // const { transactions } = await myDeposits.json()
    const accountDeposits = []
    const accountWithdrawals = []

    const blockchainStatus = await fetch(`${process.env.REACT_APP_SERVER}requestType=getBlocks&lastIndex=1`)

    const currentBlock = await blockchainStatus.json()
    const { height } = currentBlock.blocks[0]
    let accountCreatedBlock = height
    const myTxs = txs.filter(tx => tx.senderRS === userAccount.accountRS || tx.recipientRS === userAccount.accountRS)
    myTxs.map((t) => {
      if(t.senderRS === userAccount.accountRS){
        if(t.height < accountCreatedBlock){
          accountCreatedBlock = t.height
        }
        accountDeposits.push(Number(t.amountNQT))
      } else if(t.recipientRS === userAccount.accountRS){
        accountWithdrawals.push(Number(t.amountNQT))
      }
      return true
    })


    let withTokenDeposits = myTxs.filter(t => t.senderRS === userAccount.accountRS)

    
    withTokenDeposits = withTokenDeposits.filter(t => {
      if(!t.attachment.message) {
        return false
      }
      return true
    })

    let token = ''

    if (withTokenDeposits.length === 1) {
      token = withTokenDeposits[0].attachment.message
    } else if(withTokenDeposits.length > 1){
      const blocks = withTokenDeposits.map(t => t.block)
      let oldestBlock = blocks[0]
      for(let index in blocks) {
        if(blocks[index] > oldestBlock) {
          oldestBlock = blocks[index]
        }
      }

      withTokenDeposits = withTokenDeposits.find(t => t.block === oldestBlock)
      token = withTokenDeposits.attachment.message
      console.log('too many goals submitted, going with the oldest submission...')
    }

    let totalDeposits = 0
    let totalWithdrawals = 0
    let withdrawable = 0
    if (accountDeposits.length > 0) {
      totalDeposits = accountDeposits.reduce((acc, curr) => acc + curr, 0)
      totalWithdrawals = accountWithdrawals.reduce((acc, curr) => acc + curr, 0)
      const fee = totalDeposits * 0.01 // 1% of deposits
      withdrawable = totalDeposits - totalWithdrawals - fee
    }


    setUser({ token, myTxs, accountCreatedBlock, account: userAccount.accountRS, totalDeposits, totalWithdrawals, withdrawable })
  }
}
