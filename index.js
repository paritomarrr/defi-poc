const { ethers } = require('ethers');

// Ensure you are using the correct RPC URL
const provider = new ethers.providers.JsonRpcProvider('https://rpc.ankr.com/eth');

const tokenContractAddress = '0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984';
const userAddress = '0x007B8Eb47956BC6e92f35647132280382D897C46';
const daysBack = 10;

// Correctly using ethers to get the ERC-20 Transfer event signature
const transferEventSig = ethers.utils.id("Transfer(address,address,uint256)");

async function checkInteractionWithinDays(userAddress, daysBack) {
    const currentBlock = await provider.getBlockNumber();
    const blocksPerDay = 6500; // Rough estimate, adjust based on actual block time
    const startBlock = currentBlock - (blocksPerDay * daysBack);
    let fromBlock = startBlock;
    const toBlock = currentBlock;
    const maxBlocksPerQuery = 2000; // Adjust based on your provider's limits

    let interactionsFound = false;

    while (fromBlock <= toBlock && !interactionsFound) {
        const queryToBlock = Math.min(fromBlock + maxBlocksPerQuery, toBlock);

        const transactions = await provider.getLogs({
            fromBlock: ethers.utils.hexlify(fromBlock), // Convert to hex string
            toBlock: ethers.utils.hexlify(queryToBlock), // Convert to hex string
            address: tokenContractAddress,
            topics: [transferEventSig, null, ethers.utils.hexZeroPad(userAddress, 32)],
        });
        

        if (transactions.length > 0) {
            console.log(`User has interacted in the last ${daysBack} days. Transaction details:`);
            transactions.forEach(tx => {
                console.log(`Block Number: ${tx.blockNumber}, Transaction Hash: ${tx.transactionHash}`);
            });
            interactionsFound = true;
        }

        // Increment the fromBlock for the next iteration to avoid infinite loop
        fromBlock = queryToBlock + 1;
    }

    if (!interactionsFound) {
        console.log(`User has not interacted in the last ${daysBack} days.`);
    }
}

checkInteractionWithinDays(userAddress, daysBack).catch(console.error);
