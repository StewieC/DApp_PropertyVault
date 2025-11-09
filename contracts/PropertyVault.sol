pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract PropertyVault is Ownable, ReentrancyGuard {
    IERC20 public immutable usdc;

    struct Property {
        address tenant;
        string roomLabel;
        uint256 rentAmount;
        uint256 savingsPercent;
        uint256 totalSaved;
        uint256 savingsGoal;
        uint256 lastPaid;
    }

    Property[] public properties;

    event PropertyCreated(uint256 indexed id, address tenant);
    event RentPaid(uint256 indexed id, uint256 saved);
    event SavingsWithdrawn(uint256 indexed id, uint256 amount);

    constructor(address _usdc, address _initialOwner) Ownable(_initialOwner) {
        usdc = IERC20(_usdc);
    }

    function createProperty(
        address _tenant,
        string calldata _roomLabel,
        uint256 _rentAmount,
        uint256 _savingsPercent,
        uint256 _savingsGoal
    ) external onlyOwner {
        properties.push(Property({
            tenant: _tenant,
            roomLabel: _roomLabel,
            rentAmount: _rentAmount,
            savingsPercent: _savingsPercent,
            totalSaved: 0,
            savingsGoal: _savingsGoal,
            lastPaid: 0
        }));
        emit PropertyCreated(properties.length - 1, _tenant);
    }

    function payRent(uint256 _id) external nonReentrant {
        Property storage p = properties[_id];
        require(p.tenant == msg.sender, "Not tenant");
        require(block.timestamp >= p.lastPaid + 30 days, "Too early");

        uint256 savings = (p.rentAmount * p.savingsPercent) / 100;
        uint256 ownerGets = p.rentAmount - savings;

        p.totalSaved += savings;
        p.lastPaid = block.timestamp;

        usdc.transferFrom(msg.sender, address(this), p.rentAmount);
        usdc.transfer(owner(), ownerGets);

        emit RentPaid(_id, savings);
    }

    function withdrawSavings(uint256 _id) external onlyOwner nonReentrant {
        Property storage p = properties[_id];
        uint256 amount = p.totalSaved;
        require(amount > 0, "No savings");
        p.totalSaved = 0;
        usdc.transfer(owner(), amount);
        emit SavingsWithdrawn(_id, amount);
    }

    function getPropertyCount() external view returns (uint256) {
        return properties.length;
    }
}
