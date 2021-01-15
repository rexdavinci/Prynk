// SPDX-License-Identifier:MIT

pragma solidity ^0.6.0 <0.8.0;
import "https://github.com/OpenZeppelin/openzeppelin-contracts/blob/master/contracts/utils/ReentrancyGuard.sol";
import "https://github.com/OpenZeppelin/openzeppelin-contracts/blob/master/contracts/utils/Address.sol";
import "https://github.com/OpenZeppelin/openzeppelin-contracts/blob/master/contracts/math/SafeMath.sol";
import "./PrynkToken.sol";

contract Prynk is ReentrancyGuard, Ownable {
    using Address for address;
    using SafeMath for uint256;
    
    struct Goal {
        bool used;
        uint256 amount;
        uint256 withdrawalDate;
        uint256 currentAmount;
        address owner;
    }
    
    mapping(address => mapping(address => Goal)) deposits;
    
    mapping(address => uint256) fees;
    
    event Save(address sender, address tokenAddress, uint256 amount);
    
    event Withdraw(address withdrawnBy, address tokenAddress, uint256 amount);
    
    receive() external payable {}
    
    function balanceOfERC20(address tokenAddress) external view returns(uint256 tokenBalance, string memory tokenName) {
        ERC20 _token = ERC20(tokenAddress);
        uint256 _balance = _token.balanceOf(address(this));
        string memory name = _token.name();
        return (_balance, name);
    }
    
    function register(address tokenAddress, uint256 amount) external {
        ERC20 _token = ERC20(tokenAddress);
        _token.approve(address(this), amount);
    }
    
    function startSaving(address tokenAddress, uint256 goalAmount, uint256 amount, uint256 withdrawalDate) nonReentrant external {
        Goal memory goal = deposits[tokenAddress][msg.sender];
        require(!goal.used, 'You currently have a running deposit');
        require(amount > 0, 'Deposit amount too low');
        ERC20 _token = ERC20(tokenAddress);
        uint256 allowance = _token.allowance(msg.sender, address(this));
        require(allowance >= amount, "Check the token allowance");
        _token.transferFrom(msg.sender, address(this), amount);
        deposits[tokenAddress][msg.sender] = Goal(true, goalAmount, withdrawalDate, amount, msg.sender);
        emit Save(msg.sender, tokenAddress, amount);
    }
    
    function saveMore(address tokenAddress, uint256 amount) nonReentrant external {
        Goal memory goal = deposits[tokenAddress][msg.sender];
        require(goal.used, 'You need to start saving first');
        require(amount > 0, 'You need to send at least 1 token');
        ERC20 _token = ERC20(tokenAddress);
        uint256 allowance = _token.allowance(msg.sender, address(this));
        require(allowance >= amount, "Check the token allowance");
        _token.transferFrom(msg.sender, address(this), amount);
        deposits[tokenAddress][msg.sender].currentAmount = deposits[tokenAddress][msg.sender].currentAmount.add(amount);
        emit Save(msg.sender, tokenAddress, amount);
    } 
    
    function withdraw(address tokenAddress) nonReentrant external {
        Goal memory goal = deposits[tokenAddress][msg.sender];
        // Owner is requesting withdrawal
        require(goal.owner == msg.sender);
        
        // Withdrawal date has elapsed
        require(now >= goal.withdrawalDate, 'Not yet date for withdrawal');
        
        // Deduct withdrawal fee for the token
        uint256 _withdrawalFee = fees[tokenAddress];
        
        // User have enough to pay for service
        require(goal.currentAmount > _withdrawalFee, 'You only have enough to pay for withdrawal fee');
        
        uint256 netWithdrawal = goal.currentAmount.sub(_withdrawalFee);
        ERC20 _token = ERC20(tokenAddress);
        
        //transfer Prynk's fee
        _token.transfer(owner(), _withdrawalFee);
        
        // withdraw users deposits
        _token.transfer(goal.owner, netWithdrawal);
        
        deposits[tokenAddress][msg.sender].used = false;
        deposits[tokenAddress][msg.sender].amount = 0;
        deposits[tokenAddress][msg.sender].withdrawalDate = 0;
        deposits[tokenAddress][msg.sender].currentAmount = 0;
        deposits[tokenAddress][msg.sender].owner = address(0);
        
        emit Withdraw(msg.sender, tokenAddress, netWithdrawal);
    }
    
    function setFee(address tokenAddress, uint256 amount) onlyOwner external {
        fees[tokenAddress] = amount;
    }
    
    function mySavings(address tokenAddress) external view returns(uint256 saved, uint256 goalAmount, string memory tokenSymbol, uint256 withdrawalDate, uint256 decimals, uint256 withdrawable) {
        Goal memory goal = deposits[tokenAddress][msg.sender];
        ERC20 token = ERC20(tokenAddress);
        uint256 _withdrawable = goal.currentAmount.sub(fees[tokenAddress]);
        return (goal.currentAmount, goal.amount, token.symbol(), goal.withdrawalDate, token.decimals(), _withdrawable);
    }
    
    function getFee(address tokenAddress) external view returns(uint256 fee, string memory tokenName) {
        ERC20 _token = ERC20(tokenAddress);
        return (fees[tokenAddress], _token.name());
    }
}