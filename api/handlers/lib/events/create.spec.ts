import 'mocha';
import 'should';

import { create } from './create';

const emptyEvent = {eventId: "", timestamp: "", type: ''};
describe('Create', () => {
    it('shouldn\'t trim fields', async ()=> {
        const existing = { hello: "world" };
        const newEvent = { ...emptyEvent, name: 'Matthew' };
        const updated = await create(newEvent, existing);
        updated.hello.should.equal(existing.hello);
    });

    it('updates name', async () => {
        const existing = { hello: "world" };
        const newEvent = { ...emptyEvent, name: 'Matthew' };
        const updated = await create(newEvent, existing);
        updated.name.should.equal(newEvent.name);
    });
});