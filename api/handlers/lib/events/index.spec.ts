import 'mocha';
import 'should';

import { index } from './index';

describe('eventHandlers', () => {
    it('has create',  ()=> {
        index.create.should.equal(require('./create').create);
    });
});