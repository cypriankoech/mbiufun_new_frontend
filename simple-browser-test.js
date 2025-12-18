const http = require('http');
const https = require('https');

function testUrl(url, description) {
    return new Promise((resolve) => {
        console.log(`🔍 Testing ${description}: ${url}`);

        const client = url.startsWith('https:') ? https : http;
        const req = client.get(url, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                console.log(`📄 Status: ${res.statusCode}`);
                console.log(`📏 Content length: ${data.length} bytes`);

                // Check for Angular content
                const hasAppRoot = data.includes('<app-root');
                const hasAngularScripts = data.includes('main.js');
                const hasContent = data.length > 1000;

                console.log(`🅰️  Has app-root: ${hasAppRoot ? '✅' : '❌'}`);
                console.log(`📜 Has Angular scripts: ${hasAngularScripts ? '✅' : '❌'}`);
                console.log(`📦 Has substantial content: ${hasContent ? '✅' : '❌'}`);

                if (data.includes('<app-root>')) {
                    const appRootContent = data.match(/<app-root>(.*?)<\/app-root>/s);
                    console.log(`🔧 App-root content: ${appRootContent ? appRootContent[1].length + ' chars' : 'empty'}`);
                }

                resolve({ status: res.statusCode, data, hasContent, hasAppRoot, hasAngularScripts });
            });
        });

        req.on('error', (error) => {
            console.log(`❌ Error: ${error.message}`);
            resolve({ status: 0, error: error.message });
        });

        req.setTimeout(10000, () => {
            req.destroy();
            console.log(`⏰ Timeout`);
            resolve({ status: 0, timeout: true });
        });
    });
}

async function runTests() {
    console.log('🚀 Simple Browser Test for MbiuFun Angular App\n');

    const tests = [
        { url: 'http://localhost:4200/', desc: 'Main page' },
        { url: 'http://localhost:4200/main.js', desc: 'Main JS bundle' },
        { url: 'http://localhost:4200/styles.css', desc: 'Styles CSS' },
        { url: 'http://localhost:4200/login', desc: 'Login route' },
        { url: 'http://localhost:4200/register', desc: 'Register route' }
    ];

    for (const test of tests) {
        await testUrl(test.url, test.desc);
        console.log('─'.repeat(50));
    }

    console.log('✅ Tests completed');
}

runTests().catch(console.error);
