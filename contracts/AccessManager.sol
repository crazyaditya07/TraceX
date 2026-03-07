// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/AccessControl.sol";

/**
 * @title AccessManager
 * @dev Centralized role management contract for supply chain participants
 */
contract AccessManager is AccessControl {
    // Role definitions (same as SupplyChainNFT for consistency)
    bytes32 public constant MANUFACTURER_ROLE = keccak256("MANUFACTURER_ROLE");
    bytes32 public constant DISTRIBUTOR_ROLE = keccak256("DISTRIBUTOR_ROLE");
    bytes32 public constant RETAILER_ROLE = keccak256("RETAILER_ROLE");
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");

    // Participant structure
    struct Participant {
        address walletAddress;
        string name;
        string location;
        bytes32 role;
        uint256 registeredAt;
        bool isActive;
    }

    // Storage
    mapping(address => Participant) public participants;
    address[] public participantAddresses;
    
    // Events
    event ParticipantRegistered(
        address indexed wallet,
        string name,
        bytes32 role,
        uint256 timestamp
    );
    
    event ParticipantDeactivated(
        address indexed wallet,
        uint256 timestamp
    );
    
    event ParticipantReactivated(
        address indexed wallet,
        uint256 timestamp
    );
    
    event RoleChanged(
        address indexed wallet,
        bytes32 oldRole,
        bytes32 newRole,
        uint256 timestamp
    );

    constructor() {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(ADMIN_ROLE, msg.sender);
        
        // Register deployer as admin
        participants[msg.sender] = Participant({
            walletAddress: msg.sender,
            name: "System Admin",
            location: "System",
            role: ADMIN_ROLE,
            registeredAt: block.timestamp,
            isActive: true
        });
        participantAddresses.push(msg.sender);
    }

    /**
     * @dev Register a new participant with a role (admin only)
     */
    function registerParticipant(
        address wallet,
        string memory name,
        string memory location,
        bytes32 role
    ) public onlyRole(ADMIN_ROLE) {
        require(wallet != address(0), "Invalid wallet address");
        require(!participants[wallet].isActive, "Participant already registered");
        require(
            role == MANUFACTURER_ROLE || 
            role == DISTRIBUTOR_ROLE || 
            role == RETAILER_ROLE,
            "Invalid role"
        );
        
        participants[wallet] = Participant({
            walletAddress: wallet,
            name: name,
            location: location,
            role: role,
            registeredAt: block.timestamp,
            isActive: true
        });
        
        participantAddresses.push(wallet);
        _grantRole(role, wallet);
        
        emit ParticipantRegistered(wallet, name, role, block.timestamp);
    }

    /**
     * @dev Self-register as a participant (requests pending approval by admin)
     * For this simplified version, we auto-approve with CONSUMER role
     */
    function selfRegister(string memory name, string memory location) public {
        require(!participants[msg.sender].isActive, "Already registered");
        
        participants[msg.sender] = Participant({
            walletAddress: msg.sender,
            name: name,
            location: location,
            role: bytes32(0), // No special role, just a consumer
            registeredAt: block.timestamp,
            isActive: true
        });
        
        participantAddresses.push(msg.sender);
        
        emit ParticipantRegistered(msg.sender, name, bytes32(0), block.timestamp);
    }

    /**
     * @dev Deactivate a participant (admin only)
     */
    function deactivateParticipant(address wallet) public onlyRole(ADMIN_ROLE) {
        require(participants[wallet].isActive, "Participant not active");
        require(wallet != msg.sender, "Cannot deactivate self");
        
        participants[wallet].isActive = false;
        
        // Revoke their role
        if (participants[wallet].role != bytes32(0)) {
            _revokeRole(participants[wallet].role, wallet);
        }
        
        emit ParticipantDeactivated(wallet, block.timestamp);
    }

    /**
     * @dev Reactivate a participant (admin only)
     */
    function reactivateParticipant(address wallet) public onlyRole(ADMIN_ROLE) {
        require(participants[wallet].walletAddress != address(0), "Participant not found");
        require(!participants[wallet].isActive, "Participant already active");
        
        participants[wallet].isActive = true;
        
        // Restore their role
        if (participants[wallet].role != bytes32(0)) {
            _grantRole(participants[wallet].role, wallet);
        }
        
        emit ParticipantReactivated(wallet, block.timestamp);
    }

    /**
     * @dev Change participant's role (admin only)
     */
    function changeRole(address wallet, bytes32 newRole) public onlyRole(ADMIN_ROLE) {
        require(participants[wallet].isActive, "Participant not active");
        require(
            newRole == MANUFACTURER_ROLE || 
            newRole == DISTRIBUTOR_ROLE || 
            newRole == RETAILER_ROLE ||
            newRole == bytes32(0),
            "Invalid role"
        );
        
        bytes32 oldRole = participants[wallet].role;
        
        // Revoke old role
        if (oldRole != bytes32(0)) {
            _revokeRole(oldRole, wallet);
        }
        
        // Grant new role
        if (newRole != bytes32(0)) {
            _grantRole(newRole, wallet);
        }
        
        participants[wallet].role = newRole;
        
        emit RoleChanged(wallet, oldRole, newRole, block.timestamp);
    }

    /**
     * @dev Get participant details
     */
    function getParticipant(address wallet) public view returns (Participant memory) {
        return participants[wallet];
    }

    /**
     * @dev Get all participants count
     */
    function getParticipantCount() public view returns (uint256) {
        return participantAddresses.length;
    }

    /**
     * @dev Get participants by role
     */
    function getParticipantsByRole(bytes32 role) public view returns (address[] memory) {
        uint256 count = 0;
        
        // Count matching participants
        for (uint i = 0; i < participantAddresses.length; i++) {
            if (participants[participantAddresses[i]].role == role && 
                participants[participantAddresses[i]].isActive) {
                count++;
            }
        }
        
        // Create result array
        address[] memory result = new address[](count);
        uint256 index = 0;
        
        for (uint i = 0; i < participantAddresses.length; i++) {
            if (participants[participantAddresses[i]].role == role && 
                participants[participantAddresses[i]].isActive) {
                result[index] = participantAddresses[i];
                index++;
            }
        }
        
        return result;
    }

    /**
     * @dev Check if address is registered and active
     */
    function isRegistered(address wallet) public view returns (bool) {
        return participants[wallet].isActive;
    }

    /**
     * @dev Get role of a participant
     */
    function getRole(address wallet) public view returns (bytes32) {
        return participants[wallet].role;
    }

    /**
     * @dev Get role name as string
     */
    function getRoleName(address wallet) public view returns (string memory) {
        bytes32 role = participants[wallet].role;
        
        if (role == ADMIN_ROLE) return "ADMIN";
        if (role == MANUFACTURER_ROLE) return "MANUFACTURER";
        if (role == DISTRIBUTOR_ROLE) return "DISTRIBUTOR";
        if (role == RETAILER_ROLE) return "RETAILER";
        return "CONSUMER";
    }
}
