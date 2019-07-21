import 'mocha';
import 'should';

import { eventHandlers } from './index';
import { defaultAggregators } from './default';

describe('eventHandlers', () => {
    it('has create', () => {
        eventHandlers.default.should.be.equal(defaultAggregators);
    });
});