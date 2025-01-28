import { Snowyflake, Epoch } from 'snowyflake';

export default new Snowyflake({
    workerId: 1n,
    epoch: Epoch.Twitter // BigInt timestamp
});
