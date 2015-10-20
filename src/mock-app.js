import kit from 'nokit';

let br = kit.require('brush');

let loadMockApp = (mockPath, opts) => {
    let mockApp = {
        tail: [],
        head: []
    };
    // 获取用户的mock插件
    // 载入 mock 入口点
    let isLoadMock = true;
    try {
        require.resolve(mockPath);
        kit.logs(`load module "${mockPath}"`);
    } catch (err) {
        isLoadMock = false;
        kit.logs(br.yellow(`skip module "${mockPath}"`));
    }
    if (isLoadMock) require(mockPath)(mockApp.tail, mockApp.head, opts);

    return mockApp;
};


export default (app, mockPath, opts) => {
    let mockApp = loadMockApp(mockPath, opts);
    let pushHead = () => {
        // 加载mockApp的head服务
        for (let i = 0; i < mockApp.head.length; i++) {
            app.push(mockApp.head[i]);
        }
    };

    let pushTail = () => {
        // 加载mockApp的tail服务
        for (let i = 0; i < mockApp.tail.length; i++) {
            app.push(mockApp.head[i]);
        }
    };

    return {
        pushHead,
        pushTail
    };
};