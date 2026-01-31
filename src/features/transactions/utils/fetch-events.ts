import { PublicClient } from 'viem';

export interface EventWithTimestamp {
  blockNumber: bigint;
  transactionHash: string;
  args?: any;
  blockTimestamp: number;
}

const BLOCK_RANGE = 9000; // Safe limit below 10k
const TOTAL_BLOCKS = 50000; // Fetch last 50k blocks

export async function fetchEventsInChunks(
  publicClient: PublicClient,
  eventName: string,
  args: any,
  contractAddress: `0x${string}`,
  abi: any
): Promise<EventWithTimestamp[]> {
  const currentBlock = await publicClient.getBlockNumber();
  const fromBlock = currentBlock - BigInt(TOTAL_BLOCKS);

  const allEvents: EventWithTimestamp[] = [];
  let currentFrom = fromBlock;

  while (currentFrom < currentBlock) {
    const currentTo =
      currentFrom + BigInt(BLOCK_RANGE) > currentBlock
        ? currentBlock
        : currentFrom + BigInt(BLOCK_RANGE);

    try {
      const events = await publicClient.getContractEvents({
        address: contractAddress,
        abi,
        eventName,
        args,
        fromBlock: currentFrom,
        toBlock: currentTo,
      });

      const eventsWithTimestamps = await Promise.all(
        events.map(async event => {
          try {
            const block = await publicClient.getBlock({
              blockNumber: event.blockNumber,
            });
            return {
              ...event,
              blockTimestamp: Number(block.timestamp),
            } as EventWithTimestamp;
          } catch (err) {
            console.error('Error fetching block timestamp:', err);
            return {
              ...event,
              blockTimestamp: Date.now() / 1000,
            } as EventWithTimestamp;
          }
        })
      );

      allEvents.push(...eventsWithTimestamps);
    } catch (err) {
      console.error(
        `Error fetching ${eventName} events from block ${currentFrom} to ${currentTo}:`,
        err
      );
    }

    currentFrom = currentTo + BigInt(1);
  }

  return allEvents;
}
