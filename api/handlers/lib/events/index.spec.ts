import 'mocha';
import 'should';

import { index } from './index';
import { create } from './create';

describe('eventHandlers', () => {
    it('has create', () => {
        index.create.should.equal(create);
    });
});