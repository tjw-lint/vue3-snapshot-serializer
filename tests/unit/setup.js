import vueSnapshotSerializer from '../../index.js';

expect.addSnapshotSerializer(vueSnapshotSerializer);

global.beforeEach(() => {
});

global.afterEach(() => {
});
