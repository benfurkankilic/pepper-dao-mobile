/**
 * Aragon DAO Contract ABIs
 * 
 * IMPORTANT: These ABIs must be from the IMPLEMENTATION contracts, not the proxies.
 * 
 * Implementation Contracts:
 * - Staged Processor: 0xfca5b9bbe4f2a8b1bbcc0a6b32e9df53c6b7c135
 * - Token Voting: 0xf1b3ed4f41509f1661def5518d198e0b0257ffe1
 * 
 * To get the ABIs:
 * 1. Visit https://chiliscan.com/address/0xfca5b9bbe4f2a8b1bbcc0a6b32e9df53c6b7c135
 * 2. Click "Contract" tab
 * 3. Copy the ABI JSON
 * 4. Paste below as STAGED_PROCESSOR_ABI
 * 5. Repeat for Token Voting implementation
 */

/**
 * Staged Proposal Processor Implementation ABI
 * 
 * Implementation: 0xfca5b9bbe4f2a8b1bbcc0a6b32e9df53c6b7c135
 * Use with Proxy: 0x8d639bd52301D7265Ebd1E6d4B0813f1CF190415
 * 
 * Key Functions:
 * - proposalCount() → uint256
 * - getProposal(uint256) → (bool executed, uint16 approvals, Parameters, Action[], uint256)
 * - state(uint256) → uint8
 * - getStages(uint256) → Stage[]
 * - advanceProposal(uint256)
 * - execute(uint256)
 */
export const STAGED_PROCESSOR_ABI = [
  {
    "inputs": [],
    "name": "AlreadyInitialized",
    "type": "error"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "body",
        "type": "address"
      }
    ],
    "name": "BodyResultTypeNotSet",
    "type": "error"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "dao",
        "type": "address"
      },
      {
        "internalType": "address",
        "name": "where",
        "type": "address"
      },
      {
        "internalType": "address",
        "name": "who",
        "type": "address"
      },
      {
        "internalType": "bytes32",
        "name": "permissionId",
        "type": "bytes32"
      }
    ],
    "name": "DaoUnauthorized",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "DelegateCallFailed",
    "type": "error"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "stageId",
        "type": "uint256"
      },
      {
        "internalType": "address",
        "name": "body",
        "type": "address"
      }
    ],
    "name": "DuplicateBodyAddress",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "FunctionDeprecated",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "InsufficientGas",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "InterfaceNotSupported",
    "type": "error"
  },
  {
    "inputs": [
      {
        "components": [
          {
            "internalType": "address",
            "name": "target",
            "type": "address"
          },
          {
            "internalType": "enum IPlugin.Operation",
            "name": "operation",
            "type": "uint8"
          }
        ],
        "internalType": "struct IPlugin.TargetConfig",
        "name": "targetConfig",
        "type": "tuple"
      }
    ],
    "name": "InvalidTargetConfig",
    "type": "error"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "proposalId",
        "type": "uint256"
      }
    ],
    "name": "NonexistentProposal",
    "type": "error"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "proposalId",
        "type": "uint256"
      }
    ],
    "name": "ProposalAdvanceForbidden",
    "type": "error"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "proposalId",
        "type": "uint256"
      }
    ],
    "name": "ProposalAlreadyExists",
    "type": "error"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "proposalId",
        "type": "uint256"
      },
      {
        "internalType": "uint16",
        "name": "stageId",
        "type": "uint16"
      }
    ],
    "name": "ProposalCanNotBeCancelled",
    "type": "error"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "proposalId",
        "type": "uint256"
      },
      {
        "internalType": "uint16",
        "name": "stageId",
        "type": "uint16"
      }
    ],
    "name": "ProposalCanNotBeEdited",
    "type": "error"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "proposalId",
        "type": "uint256"
      }
    ],
    "name": "ProposalExecutionForbidden",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "StageCountZero",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "StageDurationsInvalid",
    "type": "error"
  },
  {
    "inputs": [
      {
        "internalType": "uint64",
        "name": "currentStageId",
        "type": "uint64"
      },
      {
        "internalType": "uint64",
        "name": "reportedStageId",
        "type": "uint64"
      }
    ],
    "name": "StageIdInvalid",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "StageThresholdsInvalid",
    "type": "error"
  },
  {
    "inputs": [
      {
        "internalType": "uint64",
        "name": "",
        "type": "uint64"
      }
    ],
    "name": "StartDateInvalid",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "Uint16MaxSizeExceeded",
    "type": "error"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "proposalId",
        "type": "uint256"
      },
      {
        "internalType": "uint8",
        "name": "currentState",
        "type": "uint8"
      },
      {
        "internalType": "bytes32",
        "name": "allowedStates",
        "type": "bytes32"
      }
    ],
    "name": "UnexpectedProposalState",
    "type": "error"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": false,
        "internalType": "address",
        "name": "previousAdmin",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "address",
        "name": "newAdmin",
        "type": "address"
      }
    ],
    "name": "AdminChanged",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "beacon",
        "type": "address"
      }
    ],
    "name": "BeaconUpgraded",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": false,
        "internalType": "uint8",
        "name": "version",
        "type": "uint8"
      }
    ],
    "name": "Initialized",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": false,
        "internalType": "bytes",
        "name": "metadata",
        "type": "bytes"
      }
    ],
    "name": "MetadataSet",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "uint256",
        "name": "proposalId",
        "type": "uint256"
      },
      {
        "indexed": true,
        "internalType": "uint16",
        "name": "stageId",
        "type": "uint16"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "sender",
        "type": "address"
      }
    ],
    "name": "ProposalAdvanced",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "uint256",
        "name": "proposalId",
        "type": "uint256"
      },
      {
        "indexed": true,
        "internalType": "uint16",
        "name": "stageId",
        "type": "uint16"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "sender",
        "type": "address"
      }
    ],
    "name": "ProposalCanceled",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "uint256",
        "name": "proposalId",
        "type": "uint256"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "creator",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "uint64",
        "name": "startDate",
        "type": "uint64"
      },
      {
        "indexed": false,
        "internalType": "uint64",
        "name": "endDate",
        "type": "uint64"
      },
      {
        "indexed": false,
        "internalType": "bytes",
        "name": "metadata",
        "type": "bytes"
      },
      {
        "components": [
          {
            "internalType": "address",
            "name": "to",
            "type": "address"
          },
          {
            "internalType": "uint256",
            "name": "value",
            "type": "uint256"
          },
          {
            "internalType": "bytes",
            "name": "data",
            "type": "bytes"
          }
        ],
        "indexed": false,
        "internalType": "struct Action[]",
        "name": "actions",
        "type": "tuple[]"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "allowFailureMap",
        "type": "uint256"
      }
    ],
    "name": "ProposalCreated",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "uint256",
        "name": "proposalId",
        "type": "uint256"
      },
      {
        "indexed": true,
        "internalType": "uint16",
        "name": "stageId",
        "type": "uint16"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "sender",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "bytes",
        "name": "metadata",
        "type": "bytes"
      },
      {
        "components": [
          {
            "internalType": "address",
            "name": "to",
            "type": "address"
          },
          {
            "internalType": "uint256",
            "name": "value",
            "type": "uint256"
          },
          {
            "internalType": "bytes",
            "name": "data",
            "type": "bytes"
          }
        ],
        "indexed": false,
        "internalType": "struct Action[]",
        "name": "actions",
        "type": "tuple[]"
      }
    ],
    "name": "ProposalEdited",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "uint256",
        "name": "proposalId",
        "type": "uint256"
      }
    ],
    "name": "ProposalExecuted",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "uint256",
        "name": "proposalId",
        "type": "uint256"
      },
      {
        "indexed": true,
        "internalType": "uint16",
        "name": "stageId",
        "type": "uint16"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "body",
        "type": "address"
      }
    ],
    "name": "ProposalResultReported",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "components": [
          {
            "components": [
              {
                "internalType": "address",
                "name": "addr",
                "type": "address"
              },
              {
                "internalType": "bool",
                "name": "isManual",
                "type": "bool"
              },
              {
                "internalType": "bool",
                "name": "tryAdvance",
                "type": "bool"
              },
              {
                "internalType": "enum StagedProposalProcessor.ResultType",
                "name": "resultType",
                "type": "uint8"
              }
            ],
            "internalType": "struct StagedProposalProcessor.Body[]",
            "name": "bodies",
            "type": "tuple[]"
          },
          {
            "internalType": "uint64",
            "name": "maxAdvance",
            "type": "uint64"
          },
          {
            "internalType": "uint64",
            "name": "minAdvance",
            "type": "uint64"
          },
          {
            "internalType": "uint64",
            "name": "voteDuration",
            "type": "uint64"
          },
          {
            "internalType": "uint16",
            "name": "approvalThreshold",
            "type": "uint16"
          },
          {
            "internalType": "uint16",
            "name": "vetoThreshold",
            "type": "uint16"
          },
          {
            "internalType": "bool",
            "name": "cancelable",
            "type": "bool"
          },
          {
            "internalType": "bool",
            "name": "editable",
            "type": "bool"
          }
        ],
        "indexed": false,
        "internalType": "struct StagedProposalProcessor.Stage[]",
        "name": "stages",
        "type": "tuple[]"
      }
    ],
    "name": "StagesUpdated",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "uint256",
        "name": "proposalId",
        "type": "uint256"
      },
      {
        "indexed": true,
        "internalType": "uint16",
        "name": "stageId",
        "type": "uint16"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "body",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "bodyProposalId",
        "type": "uint256"
      }
    ],
    "name": "SubProposalCreated",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "uint256",
        "name": "proposalId",
        "type": "uint256"
      },
      {
        "indexed": true,
        "internalType": "uint16",
        "name": "stageId",
        "type": "uint16"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "body",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "bytes",
        "name": "reason",
        "type": "bytes"
      }
    ],
    "name": "SubProposalNotCreated",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "components": [
          {
            "internalType": "address",
            "name": "target",
            "type": "address"
          },
          {
            "internalType": "enum IPlugin.Operation",
            "name": "operation",
            "type": "uint8"
          }
        ],
        "indexed": false,
        "internalType": "struct IPlugin.TargetConfig",
        "name": "newTargetConfig",
        "type": "tuple"
      }
    ],
    "name": "TargetSet",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "forwarder",
        "type": "address"
      }
    ],
    "name": "TrustedForwarderUpdated",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "implementation",
        "type": "address"
      }
    ],
    "name": "Upgraded",
    "type": "event"
  },
  {
    "inputs": [],
    "name": "SET_METADATA_PERMISSION_ID",
    "outputs": [
      {
        "internalType": "bytes32",
        "name": "",
        "type": "bytes32"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "SET_TARGET_CONFIG_PERMISSION_ID",
    "outputs": [
      {
        "internalType": "bytes32",
        "name": "",
        "type": "bytes32"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "UPGRADE_PLUGIN_PERMISSION_ID",
    "outputs": [
      {
        "internalType": "bytes32",
        "name": "",
        "type": "bytes32"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "_proposalId",
        "type": "uint256"
      }
    ],
    "name": "advanceProposal",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "_proposalId",
        "type": "uint256"
      }
    ],
    "name": "canExecute",
    "outputs": [
      {
        "internalType": "bool",
        "name": "",
        "type": "bool"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "_proposalId",
        "type": "uint256"
      }
    ],
    "name": "canProposalAdvance",
    "outputs": [
      {
        "internalType": "bool",
        "name": "",
        "type": "bool"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "_proposalId",
        "type": "uint256"
      }
    ],
    "name": "cancel",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "bytes",
        "name": "_metadata",
        "type": "bytes"
      },
      {
        "components": [
          {
            "internalType": "address",
            "name": "to",
            "type": "address"
          },
          {
            "internalType": "uint256",
            "name": "value",
            "type": "uint256"
          },
          {
            "internalType": "bytes",
            "name": "data",
            "type": "bytes"
          }
        ],
        "internalType": "struct Action[]",
        "name": "_actions",
        "type": "tuple[]"
      },
      {
        "internalType": "uint128",
        "name": "_allowFailureMap",
        "type": "uint128"
      },
      {
        "internalType": "uint64",
        "name": "_startDate",
        "type": "uint64"
      },
      {
        "internalType": "bytes[][]",
        "name": "_proposalParams",
        "type": "bytes[][]"
      }
    ],
    "name": "createProposal",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "proposalId",
        "type": "uint256"
      }
    ],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "bytes",
        "name": "_metadata",
        "type": "bytes"
      },
      {
        "components": [
          {
            "internalType": "address",
            "name": "to",
            "type": "address"
          },
          {
            "internalType": "uint256",
            "name": "value",
            "type": "uint256"
          },
          {
            "internalType": "bytes",
            "name": "data",
            "type": "bytes"
          }
        ],
        "internalType": "struct Action[]",
        "name": "_actions",
        "type": "tuple[]"
      },
      {
        "internalType": "uint64",
        "name": "_startDate",
        "type": "uint64"
      },
      {
        "internalType": "uint64",
        "name": "",
        "type": "uint64"
      },
      {
        "internalType": "bytes",
        "name": "_data",
        "type": "bytes"
      }
    ],
    "name": "createProposal",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "proposalId",
        "type": "uint256"
      }
    ],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "customProposalParamsABI",
    "outputs": [
      {
        "internalType": "string",
        "name": "",
        "type": "string"
      }
    ],
    "stateMutability": "pure",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "dao",
    "outputs": [
      {
        "internalType": "contract IDAO",
        "name": "",
        "type": "address"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "_proposalId",
        "type": "uint256"
      },
      {
        "internalType": "bytes",
        "name": "_metadata",
        "type": "bytes"
      },
      {
        "components": [
          {
            "internalType": "address",
            "name": "to",
            "type": "address"
          },
          {
            "internalType": "uint256",
            "name": "value",
            "type": "uint256"
          },
          {
            "internalType": "bytes",
            "name": "data",
            "type": "bytes"
          }
        ],
        "internalType": "struct Action[]",
        "name": "_actions",
        "type": "tuple[]"
      }
    ],
    "name": "edit",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "_proposalId",
        "type": "uint256"
      }
    ],
    "name": "execute",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "_proposalId",
        "type": "uint256"
      },
      {
        "internalType": "uint16",
        "name": "_stageId",
        "type": "uint16"
      },
      {
        "internalType": "address",
        "name": "_body",
        "type": "address"
      }
    ],
    "name": "getBodyProposalId",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "_proposalId",
        "type": "uint256"
      },
      {
        "internalType": "uint16",
        "name": "_stageId",
        "type": "uint16"
      },
      {
        "internalType": "address",
        "name": "_body",
        "type": "address"
      }
    ],
    "name": "getBodyResult",
    "outputs": [
      {
        "internalType": "enum StagedProposalProcessor.ResultType",
        "name": "",
        "type": "uint8"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "_proposalId",
        "type": "uint256"
      },
      {
        "internalType": "uint16",
        "name": "_stageId",
        "type": "uint16"
      },
      {
        "internalType": "uint256",
        "name": "_index",
        "type": "uint256"
      }
    ],
    "name": "getCreateProposalParams",
    "outputs": [
      {
        "internalType": "bytes",
        "name": "",
        "type": "bytes"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getCurrentConfigIndex",
    "outputs": [
      {
        "internalType": "uint16",
        "name": "",
        "type": "uint16"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getCurrentTargetConfig",
    "outputs": [
      {
        "components": [
          {
            "internalType": "address",
            "name": "target",
            "type": "address"
          },
          {
            "internalType": "enum IPlugin.Operation",
            "name": "operation",
            "type": "uint8"
          }
        ],
        "internalType": "struct IPlugin.TargetConfig",
        "name": "",
        "type": "tuple"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getMetadata",
    "outputs": [
      {
        "internalType": "bytes",
        "name": "",
        "type": "bytes"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "_proposalId",
        "type": "uint256"
      }
    ],
    "name": "getProposal",
    "outputs": [
      {
        "components": [
          {
            "internalType": "uint128",
            "name": "allowFailureMap",
            "type": "uint128"
          },
          {
            "internalType": "uint64",
            "name": "lastStageTransition",
            "type": "uint64"
          },
          {
            "internalType": "uint16",
            "name": "currentStage",
            "type": "uint16"
          },
          {
            "internalType": "uint16",
            "name": "stageConfigIndex",
            "type": "uint16"
          },
          {
            "internalType": "bool",
            "name": "executed",
            "type": "bool"
          },
          {
            "internalType": "bool",
            "name": "canceled",
            "type": "bool"
          },
          {
            "internalType": "address",
            "name": "creator",
            "type": "address"
          },
          {
            "components": [
              {
                "internalType": "address",
                "name": "to",
                "type": "address"
              },
              {
                "internalType": "uint256",
                "name": "value",
                "type": "uint256"
              },
              {
                "internalType": "bytes",
                "name": "data",
                "type": "bytes"
              }
            ],
            "internalType": "struct Action[]",
            "name": "actions",
            "type": "tuple[]"
          },
          {
            "components": [
              {
                "internalType": "address",
                "name": "target",
                "type": "address"
              },
              {
                "internalType": "enum IPlugin.Operation",
                "name": "operation",
                "type": "uint8"
              }
            ],
            "internalType": "struct IPlugin.TargetConfig",
            "name": "targetConfig",
            "type": "tuple"
          }
        ],
        "internalType": "struct StagedProposalProcessor.Proposal",
        "name": "",
        "type": "tuple"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "_proposalId",
        "type": "uint256"
      },
      {
        "internalType": "uint16",
        "name": "_stageId",
        "type": "uint16"
      }
    ],
    "name": "getProposalTally",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "approvals",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "vetoes",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "_index",
        "type": "uint256"
      }
    ],
    "name": "getStages",
    "outputs": [
      {
        "components": [
          {
            "components": [
              {
                "internalType": "address",
                "name": "addr",
                "type": "address"
              },
              {
                "internalType": "bool",
                "name": "isManual",
                "type": "bool"
              },
              {
                "internalType": "bool",
                "name": "tryAdvance",
                "type": "bool"
              },
              {
                "internalType": "enum StagedProposalProcessor.ResultType",
                "name": "resultType",
                "type": "uint8"
              }
            ],
            "internalType": "struct StagedProposalProcessor.Body[]",
            "name": "bodies",
            "type": "tuple[]"
          },
          {
            "internalType": "uint64",
            "name": "maxAdvance",
            "type": "uint64"
          },
          {
            "internalType": "uint64",
            "name": "minAdvance",
            "type": "uint64"
          },
          {
            "internalType": "uint64",
            "name": "voteDuration",
            "type": "uint64"
          },
          {
            "internalType": "uint16",
            "name": "approvalThreshold",
            "type": "uint16"
          },
          {
            "internalType": "uint16",
            "name": "vetoThreshold",
            "type": "uint16"
          },
          {
            "internalType": "bool",
            "name": "cancelable",
            "type": "bool"
          },
          {
            "internalType": "bool",
            "name": "editable",
            "type": "bool"
          }
        ],
        "internalType": "struct StagedProposalProcessor.Stage[]",
        "name": "",
        "type": "tuple[]"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getTargetConfig",
    "outputs": [
      {
        "components": [
          {
            "internalType": "address",
            "name": "target",
            "type": "address"
          },
          {
            "internalType": "enum IPlugin.Operation",
            "name": "operation",
            "type": "uint8"
          }
        ],
        "internalType": "struct IPlugin.TargetConfig",
        "name": "",
        "type": "tuple"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getTrustedForwarder",
    "outputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "_account",
        "type": "address"
      }
    ],
    "name": "hasAdvancePermission",
    "outputs": [
      {
        "internalType": "bool",
        "name": "",
        "type": "bool"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "_account",
        "type": "address"
      }
    ],
    "name": "hasExecutePermission",
    "outputs": [
      {
        "internalType": "bool",
        "name": "",
        "type": "bool"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "_proposalId",
        "type": "uint256"
      }
    ],
    "name": "hasSucceeded",
    "outputs": [
      {
        "internalType": "bool",
        "name": "",
        "type": "bool"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "implementation",
    "outputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "contract IDAO",
        "name": "_dao",
        "type": "address"
      },
      {
        "internalType": "address",
        "name": "_trustedForwarder",
        "type": "address"
      },
      {
        "components": [
          {
            "components": [
              {
                "internalType": "address",
                "name": "addr",
                "type": "address"
              },
              {
                "internalType": "bool",
                "name": "isManual",
                "type": "bool"
              },
              {
                "internalType": "bool",
                "name": "tryAdvance",
                "type": "bool"
              },
              {
                "internalType": "enum StagedProposalProcessor.ResultType",
                "name": "resultType",
                "type": "uint8"
              }
            ],
            "internalType": "struct StagedProposalProcessor.Body[]",
            "name": "bodies",
            "type": "tuple[]"
          },
          {
            "internalType": "uint64",
            "name": "maxAdvance",
            "type": "uint64"
          },
          {
            "internalType": "uint64",
            "name": "minAdvance",
            "type": "uint64"
          },
          {
            "internalType": "uint64",
            "name": "voteDuration",
            "type": "uint64"
          },
          {
            "internalType": "uint16",
            "name": "approvalThreshold",
            "type": "uint16"
          },
          {
            "internalType": "uint16",
            "name": "vetoThreshold",
            "type": "uint16"
          },
          {
            "internalType": "bool",
            "name": "cancelable",
            "type": "bool"
          },
          {
            "internalType": "bool",
            "name": "editable",
            "type": "bool"
          }
        ],
        "internalType": "struct StagedProposalProcessor.Stage[]",
        "name": "_stages",
        "type": "tuple[]"
      },
      {
        "internalType": "bytes",
        "name": "_pluginMetadata",
        "type": "bytes"
      },
      {
        "components": [
          {
            "internalType": "address",
            "name": "target",
            "type": "address"
          },
          {
            "internalType": "enum IPlugin.Operation",
            "name": "operation",
            "type": "uint8"
          }
        ],
        "internalType": "struct IPlugin.TargetConfig",
        "name": "_targetConfig",
        "type": "tuple"
      }
    ],
    "name": "initialize",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "_forwarder",
        "type": "address"
      }
    ],
    "name": "isTrustedForwarder",
    "outputs": [
      {
        "internalType": "bool",
        "name": "",
        "type": "bool"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "pluginType",
    "outputs": [
      {
        "internalType": "enum IPlugin.PluginType",
        "name": "",
        "type": "uint8"
      }
    ],
    "stateMutability": "pure",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "proposalCount",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "protocolVersion",
    "outputs": [
      {
        "internalType": "uint8[3]",
        "name": "",
        "type": "uint8[3]"
      }
    ],
    "stateMutability": "pure",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "proxiableUUID",
    "outputs": [
      {
        "internalType": "bytes32",
        "name": "",
        "type": "bytes32"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "_proposalId",
        "type": "uint256"
      },
      {
        "internalType": "uint16",
        "name": "_stageId",
        "type": "uint16"
      },
      {
        "internalType": "enum StagedProposalProcessor.ResultType",
        "name": "_resultType",
        "type": "uint8"
      },
      {
        "internalType": "bool",
        "name": "_tryAdvance",
        "type": "bool"
      }
    ],
    "name": "reportProposalResult",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "bytes",
        "name": "_metadata",
        "type": "bytes"
      }
    ],
    "name": "setMetadata",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "components": [
          {
            "internalType": "address",
            "name": "target",
            "type": "address"
          },
          {
            "internalType": "enum IPlugin.Operation",
            "name": "operation",
            "type": "uint8"
          }
        ],
        "internalType": "struct IPlugin.TargetConfig",
        "name": "_targetConfig",
        "type": "tuple"
      }
    ],
    "name": "setTargetConfig",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "_forwarder",
        "type": "address"
      }
    ],
    "name": "setTrustedForwarder",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "_proposalId",
        "type": "uint256"
      }
    ],
    "name": "state",
    "outputs": [
      {
        "internalType": "enum StagedProposalProcessor.ProposalState",
        "name": "",
        "type": "uint8"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "bytes4",
        "name": "_interfaceId",
        "type": "bytes4"
      }
    ],
    "name": "supportsInterface",
    "outputs": [
      {
        "internalType": "bool",
        "name": "",
        "type": "bool"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "components": [
          {
            "components": [
              {
                "internalType": "address",
                "name": "addr",
                "type": "address"
              },
              {
                "internalType": "bool",
                "name": "isManual",
                "type": "bool"
              },
              {
                "internalType": "bool",
                "name": "tryAdvance",
                "type": "bool"
              },
              {
                "internalType": "enum StagedProposalProcessor.ResultType",
                "name": "resultType",
                "type": "uint8"
              }
            ],
            "internalType": "struct StagedProposalProcessor.Body[]",
            "name": "bodies",
            "type": "tuple[]"
          },
          {
            "internalType": "uint64",
            "name": "maxAdvance",
            "type": "uint64"
          },
          {
            "internalType": "uint64",
            "name": "minAdvance",
            "type": "uint64"
          },
          {
            "internalType": "uint64",
            "name": "voteDuration",
            "type": "uint64"
          },
          {
            "internalType": "uint16",
            "name": "approvalThreshold",
            "type": "uint16"
          },
          {
            "internalType": "uint16",
            "name": "vetoThreshold",
            "type": "uint16"
          },
          {
            "internalType": "bool",
            "name": "cancelable",
            "type": "bool"
          },
          {
            "internalType": "bool",
            "name": "editable",
            "type": "bool"
          }
        ],
        "internalType": "struct StagedProposalProcessor.Stage[]",
        "name": "_stages",
        "type": "tuple[]"
      }
    ],
    "name": "updateStages",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "newImplementation",
        "type": "address"
      }
    ],
    "name": "upgradeTo",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "newImplementation",
        "type": "address"
      },
      {
        "internalType": "bytes",
        "name": "data",
        "type": "bytes"
      }
    ],
    "name": "upgradeToAndCall",
    "outputs": [],
    "stateMutability": "payable",
    "type": "function"
  }
] as const;

/**
 * Token-Based Majority Voting Implementation ABI
 * 
 * Implementation: 0xf1b3ed4f41509f1661def5518d198e0b0257ffe1
 * Use with Proxy: 0x4D1a5e3AFe6d5bC9dfE72A8332b67C916CEb77ff
 * 
 * Key Functions:
 * - proposalCount() → uint256
 * - getProposal(uint256) → (bool open, bool executed, Parameters, Tally, Action[], uint256)
 * - vote(uint256, address, VoteOption, uint256)
 * - canVote(uint256, address, VoteOption) → bool
 * - getVote(uint256, address) → (VoteOption, uint256)
 * - isMember(address) → bool
 * - token() → address
 * - lockManager() → address
 */
export const TOKEN_VOTING_ABI = [
  {
    "inputs": [],
    "name": "AlreadyInitialized",
    "type": "error"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "dao",
        "type": "address"
      },
      {
        "internalType": "address",
        "name": "where",
        "type": "address"
      },
      {
        "internalType": "address",
        "name": "who",
        "type": "address"
      },
      {
        "internalType": "bytes32",
        "name": "permissionId",
        "type": "bytes32"
      }
    ],
    "name": "DaoUnauthorized",
    "type": "error"
  },
  {
    "inputs": [
      {
        "internalType": "uint64",
        "name": "limit",
        "type": "uint64"
      },
      {
        "internalType": "uint64",
        "name": "actual",
        "type": "uint64"
      }
    ],
    "name": "DateOutOfBounds",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "DelegateCallFailed",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "EmptyDAOAddress",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "FunctionDeprecated",
    "type": "error"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "actionIdx",
        "type": "uint256"
      },
      {
        "internalType": "address",
        "name": "target",
        "type": "address"
      }
    ],
    "name": "InvalidActionTarget",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "InvalidTargetAddress",
    "type": "error"
  },
  {
    "inputs": [
      {
        "components": [
          {
            "internalType": "address",
            "name": "target",
            "type": "address"
          },
          {
            "internalType": "enum IPlugin.Operation",
            "name": "operation",
            "type": "uint8"
          }
        ],
        "internalType": "struct IPlugin.TargetConfig",
        "name": "targetConfig",
        "type": "tuple"
      }
    ],
    "name": "InvalidTargetConfig",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "LockManagerAlreadyDefined",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "NoVotingPower",
    "type": "error"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "proposalId",
        "type": "uint256"
      }
    ],
    "name": "NonexistentProposal",
    "type": "error"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "proposalId",
        "type": "uint256"
      }
    ],
    "name": "ProposalAlreadyExists",
    "type": "error"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "sender",
        "type": "address"
      }
    ],
    "name": "ProposalCreationForbidden",
    "type": "error"
  },
  {
    "inputs": [
      {
        "internalType": "uint64",
        "name": "limit",
        "type": "uint64"
      },
      {
        "internalType": "uint64",
        "name": "actual",
        "type": "uint64"
      }
    ],
    "name": "ProposalDurationOutOfBounds",
    "type": "error"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "proposalId",
        "type": "uint256"
      }
    ],
    "name": "ProposalExecutionForbidden",
    "type": "error"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "limit",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "actual",
        "type": "uint256"
      }
    ],
    "name": "RatioOutOfBounds",
    "type": "error"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "caller",
        "type": "address"
      }
    ],
    "name": "VoteCallForbidden",
    "type": "error"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "proposalId",
        "type": "uint256"
      },
      {
        "internalType": "address",
        "name": "account",
        "type": "address"
      }
    ],
    "name": "VoteCastForbidden",
    "type": "error"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "proposalId",
        "type": "uint256"
      },
      {
        "internalType": "address",
        "name": "voter",
        "type": "address"
      }
    ],
    "name": "VoteRemovalForbidden",
    "type": "error"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "caller",
        "type": "address"
      }
    ],
    "name": "VoteRemovalUnauthorized",
    "type": "error"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": false,
        "internalType": "address",
        "name": "previousAdmin",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "address",
        "name": "newAdmin",
        "type": "address"
      }
    ],
    "name": "AdminChanged",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "beacon",
        "type": "address"
      }
    ],
    "name": "BeaconUpgraded",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": false,
        "internalType": "uint8",
        "name": "version",
        "type": "uint8"
      }
    ],
    "name": "Initialized",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "contract ILockManager",
        "name": "lockManager",
        "type": "address"
      }
    ],
    "name": "LockManagerDefined",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": false,
        "internalType": "address[]",
        "name": "members",
        "type": "address[]"
      }
    ],
    "name": "MembersAdded",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": false,
        "internalType": "address[]",
        "name": "members",
        "type": "address[]"
      }
    ],
    "name": "MembersRemoved",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "definingContract",
        "type": "address"
      }
    ],
    "name": "MembershipContractAnnounced",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": false,
        "internalType": "bytes",
        "name": "metadata",
        "type": "bytes"
      }
    ],
    "name": "MetadataSet",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "uint256",
        "name": "proposalId",
        "type": "uint256"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "creator",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "uint64",
        "name": "startDate",
        "type": "uint64"
      },
      {
        "indexed": false,
        "internalType": "uint64",
        "name": "endDate",
        "type": "uint64"
      },
      {
        "indexed": false,
        "internalType": "bytes",
        "name": "metadata",
        "type": "bytes"
      },
      {
        "components": [
          {
            "internalType": "address",
            "name": "to",
            "type": "address"
          },
          {
            "internalType": "uint256",
            "name": "value",
            "type": "uint256"
          },
          {
            "internalType": "bytes",
            "name": "data",
            "type": "bytes"
          }
        ],
        "indexed": false,
        "internalType": "struct Action[]",
        "name": "actions",
        "type": "tuple[]"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "allowFailureMap",
        "type": "uint256"
      }
    ],
    "name": "ProposalCreated",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "uint256",
        "name": "proposalId",
        "type": "uint256"
      }
    ],
    "name": "ProposalExecuted",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "components": [
          {
            "internalType": "address",
            "name": "target",
            "type": "address"
          },
          {
            "internalType": "enum IPlugin.Operation",
            "name": "operation",
            "type": "uint8"
          }
        ],
        "indexed": false,
        "internalType": "struct IPlugin.TargetConfig",
        "name": "newTargetConfig",
        "type": "tuple"
      }
    ],
    "name": "TargetSet",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "implementation",
        "type": "address"
      }
    ],
    "name": "Upgraded",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "uint256",
        "name": "proposalId",
        "type": "uint256"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "voter",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "enum IMajorityVoting.VoteOption",
        "name": "voteOption",
        "type": "uint8"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "votingPower",
        "type": "uint256"
      }
    ],
    "name": "VoteCast",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "uint256",
        "name": "proposalId",
        "type": "uint256"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "voter",
        "type": "address"
      }
    ],
    "name": "VoteCleared",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": false,
        "internalType": "enum MajorityVotingBase.VotingMode",
        "name": "votingMode",
        "type": "uint8"
      },
      {
        "indexed": false,
        "internalType": "uint32",
        "name": "supportThresholdRatio",
        "type": "uint32"
      },
      {
        "indexed": false,
        "internalType": "uint32",
        "name": "minParticipationRatio",
        "type": "uint32"
      },
      {
        "indexed": false,
        "internalType": "uint32",
        "name": "minApprovalRatio",
        "type": "uint32"
      },
      {
        "indexed": false,
        "internalType": "uint64",
        "name": "proposalDuration",
        "type": "uint64"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "minProposerVotingPower",
        "type": "uint256"
      }
    ],
    "name": "VotingSettingsUpdated",
    "type": "event"
  },
  {
    "inputs": [],
    "name": "CREATE_PROPOSAL_PERMISSION_ID",
    "outputs": [
      {
        "internalType": "bytes32",
        "name": "",
        "type": "bytes32"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "EXECUTE_PROPOSAL_PERMISSION_ID",
    "outputs": [
      {
        "internalType": "bytes32",
        "name": "",
        "type": "bytes32"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "LOCK_MANAGER_PERMISSION_ID",
    "outputs": [
      {
        "internalType": "bytes32",
        "name": "",
        "type": "bytes32"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "SET_METADATA_PERMISSION_ID",
    "outputs": [
      {
        "internalType": "bytes32",
        "name": "",
        "type": "bytes32"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "SET_TARGET_CONFIG_PERMISSION_ID",
    "outputs": [
      {
        "internalType": "bytes32",
        "name": "",
        "type": "bytes32"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "UPDATE_SETTINGS_PERMISSION_ID",
    "outputs": [
      {
        "internalType": "bytes32",
        "name": "",
        "type": "bytes32"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "UPGRADE_PLUGIN_PERMISSION_ID",
    "outputs": [
      {
        "internalType": "bytes32",
        "name": "",
        "type": "bytes32"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "_proposalId",
        "type": "uint256"
      }
    ],
    "name": "canExecute",
    "outputs": [
      {
        "internalType": "bool",
        "name": "",
        "type": "bool"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "_proposalId",
        "type": "uint256"
      },
      {
        "internalType": "address",
        "name": "_voter",
        "type": "address"
      },
      {
        "internalType": "enum IMajorityVoting.VoteOption",
        "name": "_voteOption",
        "type": "uint8"
      }
    ],
    "name": "canVote",
    "outputs": [
      {
        "internalType": "bool",
        "name": "",
        "type": "bool"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "_proposalId",
        "type": "uint256"
      },
      {
        "internalType": "address",
        "name": "_voter",
        "type": "address"
      }
    ],
    "name": "clearVote",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "bytes",
        "name": "_metadata",
        "type": "bytes"
      },
      {
        "components": [
          {
            "internalType": "address",
            "name": "to",
            "type": "address"
          },
          {
            "internalType": "uint256",
            "name": "value",
            "type": "uint256"
          },
          {
            "internalType": "bytes",
            "name": "data",
            "type": "bytes"
          }
        ],
        "internalType": "struct Action[]",
        "name": "_actions",
        "type": "tuple[]"
      },
      {
        "internalType": "uint64",
        "name": "_startDate",
        "type": "uint64"
      },
      {
        "internalType": "uint64",
        "name": "_endDate",
        "type": "uint64"
      },
      {
        "internalType": "bytes",
        "name": "_data",
        "type": "bytes"
      }
    ],
    "name": "createProposal",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "proposalId",
        "type": "uint256"
      }
    ],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "currentTokenSupply",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "customProposalParamsABI",
    "outputs": [
      {
        "internalType": "string",
        "name": "",
        "type": "string"
      }
    ],
    "stateMutability": "pure",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "dao",
    "outputs": [
      {
        "internalType": "contract IDAO",
        "name": "",
        "type": "address"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "_proposalId",
        "type": "uint256"
      }
    ],
    "name": "execute",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getCurrentTargetConfig",
    "outputs": [
      {
        "components": [
          {
            "internalType": "address",
            "name": "target",
            "type": "address"
          },
          {
            "internalType": "enum IPlugin.Operation",
            "name": "operation",
            "type": "uint8"
          }
        ],
        "internalType": "struct IPlugin.TargetConfig",
        "name": "",
        "type": "tuple"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getMetadata",
    "outputs": [
      {
        "internalType": "bytes",
        "name": "",
        "type": "bytes"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "_proposalId",
        "type": "uint256"
      }
    ],
    "name": "getProposal",
    "outputs": [
      {
        "internalType": "bool",
        "name": "open",
        "type": "bool"
      },
      {
        "internalType": "bool",
        "name": "executed",
        "type": "bool"
      },
      {
        "components": [
          {
            "internalType": "enum MajorityVotingBase.VotingMode",
            "name": "votingMode",
            "type": "uint8"
          },
          {
            "internalType": "uint32",
            "name": "supportThresholdRatio",
            "type": "uint32"
          },
          {
            "internalType": "uint64",
            "name": "startDate",
            "type": "uint64"
          },
          {
            "internalType": "uint64",
            "name": "endDate",
            "type": "uint64"
          },
          {
            "internalType": "uint256",
            "name": "minParticipationRatio",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "minApprovalRatio",
            "type": "uint256"
          }
        ],
        "internalType": "struct MajorityVotingBase.ProposalParameters",
        "name": "parameters",
        "type": "tuple"
      },
      {
        "components": [
          {
            "internalType": "uint256",
            "name": "abstain",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "yes",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "no",
            "type": "uint256"
          }
        ],
        "internalType": "struct MajorityVotingBase.Tally",
        "name": "tally",
        "type": "tuple"
      },
      {
        "components": [
          {
            "internalType": "address",
            "name": "to",
            "type": "address"
          },
          {
            "internalType": "uint256",
            "name": "value",
            "type": "uint256"
          },
          {
            "internalType": "bytes",
            "name": "data",
            "type": "bytes"
          }
        ],
        "internalType": "struct Action[]",
        "name": "actions",
        "type": "tuple[]"
      },
      {
        "internalType": "uint256",
        "name": "allowFailureMap",
        "type": "uint256"
      },
      {
        "components": [
          {
            "internalType": "address",
            "name": "target",
            "type": "address"
          },
          {
            "internalType": "enum IPlugin.Operation",
            "name": "operation",
            "type": "uint8"
          }
        ],
        "internalType": "struct IPlugin.TargetConfig",
        "name": "targetConfig",
        "type": "tuple"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getTargetConfig",
    "outputs": [
      {
        "components": [
          {
            "internalType": "address",
            "name": "target",
            "type": "address"
          },
          {
            "internalType": "enum IPlugin.Operation",
            "name": "operation",
            "type": "uint8"
          }
        ],
        "internalType": "struct IPlugin.TargetConfig",
        "name": "",
        "type": "tuple"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "_proposalId",
        "type": "uint256"
      },
      {
        "internalType": "address",
        "name": "_voter",
        "type": "address"
      }
    ],
    "name": "getVote",
    "outputs": [
      {
        "components": [
          {
            "internalType": "enum IMajorityVoting.VoteOption",
            "name": "voteOption",
            "type": "uint8"
          },
          {
            "internalType": "uint256",
            "name": "votingPower",
            "type": "uint256"
          }
        ],
        "internalType": "struct IMajorityVoting.VoteEntry",
        "name": "",
        "type": "tuple"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getVotingSettings",
    "outputs": [
      {
        "components": [
          {
            "internalType": "enum MajorityVotingBase.VotingMode",
            "name": "votingMode",
            "type": "uint8"
          },
          {
            "internalType": "uint32",
            "name": "supportThresholdRatio",
            "type": "uint32"
          },
          {
            "internalType": "uint32",
            "name": "minParticipationRatio",
            "type": "uint32"
          },
          {
            "internalType": "uint32",
            "name": "minApprovalRatio",
            "type": "uint32"
          },
          {
            "internalType": "uint64",
            "name": "proposalDuration",
            "type": "uint64"
          },
          {
            "internalType": "uint256",
            "name": "minProposerVotingPower",
            "type": "uint256"
          }
        ],
        "internalType": "struct MajorityVotingBase.VotingSettings",
        "name": "",
        "type": "tuple"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "_proposalId",
        "type": "uint256"
      }
    ],
    "name": "hasSucceeded",
    "outputs": [
      {
        "internalType": "bool",
        "name": "",
        "type": "bool"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "implementation",
    "outputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "contract IDAO",
        "name": "_dao",
        "type": "address"
      },
      {
        "internalType": "contract ILockManager",
        "name": "_lockManager",
        "type": "address"
      },
      {
        "components": [
          {
            "internalType": "enum MajorityVotingBase.VotingMode",
            "name": "votingMode",
            "type": "uint8"
          },
          {
            "internalType": "uint32",
            "name": "supportThresholdRatio",
            "type": "uint32"
          },
          {
            "internalType": "uint32",
            "name": "minParticipationRatio",
            "type": "uint32"
          },
          {
            "internalType": "uint32",
            "name": "minApprovalRatio",
            "type": "uint32"
          },
          {
            "internalType": "uint64",
            "name": "proposalDuration",
            "type": "uint64"
          },
          {
            "internalType": "uint256",
            "name": "minProposerVotingPower",
            "type": "uint256"
          }
        ],
        "internalType": "struct MajorityVotingBase.VotingSettings",
        "name": "_votingSettings",
        "type": "tuple"
      },
      {
        "components": [
          {
            "internalType": "address",
            "name": "target",
            "type": "address"
          },
          {
            "internalType": "enum IPlugin.Operation",
            "name": "operation",
            "type": "uint8"
          }
        ],
        "internalType": "struct IPlugin.TargetConfig",
        "name": "_targetConfig",
        "type": "tuple"
      },
      {
        "internalType": "bytes",
        "name": "_pluginMetadata",
        "type": "bytes"
      }
    ],
    "name": "initialize",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "_account",
        "type": "address"
      }
    ],
    "name": "isMember",
    "outputs": [
      {
        "internalType": "bool",
        "name": "",
        "type": "bool"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "_proposalId",
        "type": "uint256"
      }
    ],
    "name": "isMinApprovalReached",
    "outputs": [
      {
        "internalType": "bool",
        "name": "",
        "type": "bool"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "_proposalId",
        "type": "uint256"
      }
    ],
    "name": "isMinVotingPowerReached",
    "outputs": [
      {
        "internalType": "bool",
        "name": "",
        "type": "bool"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "_proposalId",
        "type": "uint256"
      }
    ],
    "name": "isProposalEnded",
    "outputs": [
      {
        "internalType": "bool",
        "name": "",
        "type": "bool"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "_proposalId",
        "type": "uint256"
      }
    ],
    "name": "isProposalOpen",
    "outputs": [
      {
        "internalType": "bool",
        "name": "",
        "type": "bool"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "_proposalId",
        "type": "uint256"
      }
    ],
    "name": "isSupportThresholdReached",
    "outputs": [
      {
        "internalType": "bool",
        "name": "",
        "type": "bool"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "lockManager",
    "outputs": [
      {
        "internalType": "contract ILockManager",
        "name": "",
        "type": "address"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "minApprovalRatio",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "minParticipationRatio",
    "outputs": [
      {
        "internalType": "uint32",
        "name": "",
        "type": "uint32"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "minProposerVotingPower",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "pluginType",
    "outputs": [
      {
        "internalType": "enum IPlugin.PluginType",
        "name": "",
        "type": "uint8"
      }
    ],
    "stateMutability": "pure",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "proposalCount",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "proposalDuration",
    "outputs": [
      {
        "internalType": "uint64",
        "name": "",
        "type": "uint64"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "protocolVersion",
    "outputs": [
      {
        "internalType": "uint8[3]",
        "name": "",
        "type": "uint8[3]"
      }
    ],
    "stateMutability": "pure",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "proxiableUUID",
    "outputs": [
      {
        "internalType": "bytes32",
        "name": "",
        "type": "bytes32"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "bytes",
        "name": "_metadata",
        "type": "bytes"
      }
    ],
    "name": "setMetadata",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "components": [
          {
            "internalType": "address",
            "name": "target",
            "type": "address"
          },
          {
            "internalType": "enum IPlugin.Operation",
            "name": "operation",
            "type": "uint8"
          }
        ],
        "internalType": "struct IPlugin.TargetConfig",
        "name": "_targetConfig",
        "type": "tuple"
      }
    ],
    "name": "setTargetConfig",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "supportThresholdRatio",
    "outputs": [
      {
        "internalType": "uint32",
        "name": "",
        "type": "uint32"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "bytes4",
        "name": "_interfaceId",
        "type": "bytes4"
      }
    ],
    "name": "supportsInterface",
    "outputs": [
      {
        "internalType": "bool",
        "name": "",
        "type": "bool"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "token",
    "outputs": [
      {
        "internalType": "contract IERC20",
        "name": "",
        "type": "address"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "components": [
          {
            "internalType": "enum MajorityVotingBase.VotingMode",
            "name": "votingMode",
            "type": "uint8"
          },
          {
            "internalType": "uint32",
            "name": "supportThresholdRatio",
            "type": "uint32"
          },
          {
            "internalType": "uint32",
            "name": "minParticipationRatio",
            "type": "uint32"
          },
          {
            "internalType": "uint32",
            "name": "minApprovalRatio",
            "type": "uint32"
          },
          {
            "internalType": "uint64",
            "name": "proposalDuration",
            "type": "uint64"
          },
          {
            "internalType": "uint256",
            "name": "minProposerVotingPower",
            "type": "uint256"
          }
        ],
        "internalType": "struct MajorityVotingBase.VotingSettings",
        "name": "_votingSettings",
        "type": "tuple"
      }
    ],
    "name": "updateVotingSettings",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "newImplementation",
        "type": "address"
      }
    ],
    "name": "upgradeTo",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "newImplementation",
        "type": "address"
      },
      {
        "internalType": "bytes",
        "name": "data",
        "type": "bytes"
      }
    ],
    "name": "upgradeToAndCall",
    "outputs": [],
    "stateMutability": "payable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "_proposalId",
        "type": "uint256"
      },
      {
        "internalType": "address",
        "name": "_voter",
        "type": "address"
      }
    ],
    "name": "usedVotingPower",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "_proposalId",
        "type": "uint256"
      },
      {
        "internalType": "address",
        "name": "_voter",
        "type": "address"
      },
      {
        "internalType": "enum IMajorityVoting.VoteOption",
        "name": "_voteOption",
        "type": "uint8"
      },
      {
        "internalType": "uint256",
        "name": "_newVotingPower",
        "type": "uint256"
      }
    ],
    "name": "vote",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "votingMode",
    "outputs": [
      {
        "internalType": "enum MajorityVotingBase.VotingMode",
        "name": "",
        "type": "uint8"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  }
] as const;

/**
 * Multisig Plugin ABI (for Stage 1 - Spicy Ministers)
 * 
 * Address: 0x1FecF1c23dD2E8C7adF937583b345277d39bD554
 * 
 * Note: This is admin-only and not used in mobile app
 */
export const MULTISIG_PLUGIN_ABI = [
  {
    inputs: [],
    name: 'proposalCount',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'uint256', name: '_proposalId', type: 'uint256' }],
    name: 'getProposal',
    outputs: [
      { internalType: 'bool', name: 'executed', type: 'bool' },
      { internalType: 'uint16', name: 'approvals', type: 'uint16' },
      {
        components: [
          { internalType: 'uint16', name: 'minApprovals', type: 'uint16' },
          { internalType: 'uint64', name: 'snapshotBlock', type: 'uint64' },
          { internalType: 'uint64', name: 'startDate', type: 'uint64' },
          { internalType: 'uint64', name: 'endDate', type: 'uint64' },
        ],
        internalType: 'struct Multisig.ProposalParameters',
        name: 'parameters',
        type: 'tuple',
      },
      {
        components: [
          { internalType: 'address', name: 'to', type: 'address' },
          { internalType: 'uint256', name: 'value', type: 'uint256' },
          { internalType: 'bytes', name: 'data', type: 'bytes' },
        ],
        internalType: 'struct IDAO.Action[]',
        name: 'actions',
        type: 'tuple[]',
      },
      { internalType: 'uint256', name: 'allowFailureMap', type: 'uint256' },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'address', name: '_member', type: 'address' }],
    name: 'isMember',
    outputs: [{ internalType: 'bool', name: '', type: 'bool' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'uint256', name: '_proposalId', type: 'uint256' },
      { internalType: 'address', name: '_approver', type: 'address' },
    ],
    name: 'hasApproved',
    outputs: [{ internalType: 'bool', name: '', type: 'bool' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'uint256', name: '_proposalId', type: 'uint256' }],
    name: 'canExecute',
    outputs: [{ internalType: 'bool', name: '', type: 'bool' }],
    stateMutability: 'view',
    type: 'function',
  },
] as const;

/**
 * Contract configuration with ABIs
 */
export const ARAGON_CONTRACTS = {
  stagedProcessor: {
    address: '0x8d639bd52301D7265Ebd1E6d4B0813f1CF190415' as const,
    abi: STAGED_PROCESSOR_ABI,
    implementation: '0xfca5b9bbe4f2a8b1bbcc0a6b32e9df53c6b7c135' as const,
  },
  tokenVoting: {
    address: '0x4D1a5e3AFe6d5bC9dfE72A8332b67C916CEb77ff' as const,
    abi: TOKEN_VOTING_ABI,
    implementation: '0xf1b3ed4f41509f1661def5518d198e0b0257ffe1' as const,
  },
  multisig: {
    address: '0x1FecF1c23dD2E8C7adF937583b345277d39bD554' as const,
    abi: MULTISIG_PLUGIN_ABI,
  },
} as const;

/**
 * Vote options enum
 */
export enum VoteOption {
  None = 0,
  Abstain = 1,
  Yes = 2,
  No = 3,
}

/**
 * Proposal state enum
 */
export enum ProposalState {
  Active = 0,
  Succeeded = 1,
  Executed = 2,
  Defeated = 3,
  Expired = 4,
}
