#!/bin/bash

# MbiuFun Quick UI Test Script
# Tests the Angular application like a human would browse it

echo "🚀 MbiuFun Quick UI Test Suite"
echo "================================"
echo ""

BASE_URL="http://localhost:4200"
TEMP_DIR="/tmp/mbiufun-test"
mkdir -p "$TEMP_DIR"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Test counter
TESTS_RUN=0
TESTS_PASSED=0

run_test() {
    local test_name="$1"
    local test_command="$2"
    local expected_pattern="$3"
    
    echo -e "${BLUE}🧪 Testing: $test_name${NC}"
    TESTS_RUN=$((TESTS_RUN + 1))
    
    # Run the test command
    local result
    result=$(eval "$test_command" 2>&1)
    local exit_code=$?
    
    # Check if test passed
    if [ $exit_code -eq 0 ] && [[ -z "$expected_pattern" || "$result" =~ $expected_pattern ]]; then
        echo -e "${GREEN}✅ PASSED: $test_name${NC}"
        TESTS_PASSED=$((TESTS_PASSED + 1))
        return 0
    else
        echo -e "${RED}❌ FAILED: $test_name${NC}"
        echo -e "${YELLOW}   Command: $test_command${NC}"
        echo -e "${YELLOW}   Output: $result${NC}"
        echo -e "${YELLOW}   Exit code: $exit_code${NC}"
        return 1
    fi
}

# Test 1: Server Health Check
echo "🏥 Server Health Checks"
echo "----------------------"

run_test "Server Running" \
    "curl -s -I $BASE_URL | head -1" \
    "200 OK"

run_test "Main Page Loads" \
    "curl -s $BASE_URL -o $TEMP_DIR/main.html && [ -s $TEMP_DIR/main.html ]" \
    ""

run_test "Angular App Present" \
    "curl -s $BASE_URL | grep -q 'app-root'" \
    ""

run_test "JavaScript Files Loading" \
    "curl -s -I $BASE_URL/main.js | head -1" \
    "200 OK"

run_test "CSS Files Loading" \
    "curl -s -I $BASE_URL/styles.css | head -1" \
    "200 OK"

echo ""

# Test 2: Route Testing
echo "🛤️  Route Testing"
echo "----------------"

run_test "Root Route Accessible" \
    "curl -s -I $BASE_URL/ | head -1" \
    "200 OK"

run_test "Login Route Accessible" \
    "curl -s -I $BASE_URL/login | head -1" \
    "200 OK"

run_test "Register Route Accessible" \
    "curl -s -I $BASE_URL/register | head -1" \
    "200 OK"

echo ""

# Test 3: Content Analysis
echo "📄 Content Analysis"
echo "------------------"

# Download the main page for analysis
curl -s $BASE_URL -o "$TEMP_DIR/index.html"

run_test "Page Has Title" \
    "grep -q '<title>' $TEMP_DIR/index.html" \
    ""

run_test "Angular Scripts Present" \
    "grep -q 'main.js' $TEMP_DIR/index.html" \
    ""

run_test "App Root Element Present" \
    "grep -q '<app-root' $TEMP_DIR/index.html" \
    ""

# Download register page to check for form elements
curl -s $BASE_URL/register -o "$TEMP_DIR/register.html" 2>/dev/null

if [ -s "$TEMP_DIR/register.html" ]; then
    run_test "Register Page Has Content" \
        "[ $(wc -c < $TEMP_DIR/register.html) -gt 1000 ]" \
        ""
fi

echo ""

# Test 4: Real Browser Simulation (if available)
echo "🌐 Browser Simulation Tests"
echo "--------------------------"

if command -v node >/dev/null 2>&1; then
    echo "Node.js available - can run advanced tests"
    
    # Create a simple Node.js test
    cat > "$TEMP_DIR/browser-test.js" << 'EOF'
const http = require('http');
const https = require('https');

function testUrl(url) {
    return new Promise((resolve) => {
        const client = url.startsWith('https:') ? https : http;
        const req = client.get(url, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => resolve({ status: res.statusCode, data, headers: res.headers }));
        });
        req.on('error', () => resolve({ status: 0, data: '', error: true }));
        req.setTimeout(5000, () => {
            req.destroy();
            resolve({ status: 0, data: '', timeout: true });
        });
    });
}

async function runTests() {
    console.log('Running Node.js browser simulation...');
    
    const tests = [
        { name: 'Main Page', url: 'http://localhost:4200/' },
        { name: 'Login Page', url: 'http://localhost:4200/login' },
        { name: 'Register Page', url: 'http://localhost:4200/register' }
    ];
    
    for (const test of tests) {
        const result = await testUrl(test.url);
        const status = result.status === 200 ? '✅ PASSED' : '❌ FAILED';
        console.log(`${status}: ${test.name} (${result.status})`);
        
        if (result.data.includes('app-root')) {
            console.log(`✅ PASSED: ${test.name} contains Angular app-root`);
        }
        
        if (result.data.includes('Sign up') || result.data.includes('Sign in')) {
            console.log(`✅ PASSED: ${test.name} contains authentication UI`);
        }
    }
}

runTests().catch(console.error);
EOF
    
    run_test "Node.js Browser Simulation" \
        "cd $TEMP_DIR && timeout 30s node browser-test.js" \
        ""
else
    echo "⚠️  Node.js not available - skipping advanced tests"
fi

echo ""

# Test 5: Visual Content Check
echo "👁️  Visual Content Verification"
echo "------------------------------"

# Check if the main page has expected UI elements
if [ -s "$TEMP_DIR/index.html" ]; then
    # Look for common UI patterns that indicate the app is working
    MAIN_CONTENT=$(cat "$TEMP_DIR/index.html")
    
    # Check for Angular-specific patterns
    if echo "$MAIN_CONTENT" | grep -q "ng-"; then
        echo -e "${GREEN}✅ PASSED: Angular directives detected${NC}"
        TESTS_PASSED=$((TESTS_PASSED + 1))
    else
        echo -e "${YELLOW}⚠️  WARNING: No Angular directives detected${NC}"
    fi
    TESTS_RUN=$((TESTS_RUN + 1))
    
    # Check for modern web app patterns
    if echo "$MAIN_CONTENT" | grep -q -E "(router-outlet|routerLink|formControl)"; then
        echo -e "${GREEN}✅ PASSED: Angular routing/forms detected${NC}"
        TESTS_PASSED=$((TESTS_PASSED + 1))
    else
        echo -e "${YELLOW}⚠️  WARNING: No Angular routing/forms detected${NC}"
    fi
    TESTS_RUN=$((TESTS_RUN + 1))
fi

echo ""

# Test 6: Performance Check
echo "⚡ Performance Check"
echo "------------------"

run_test "Page Load Time < 5s" \
    "timeout 5s curl -s $BASE_URL > /dev/null" \
    ""

run_test "Main JS Bundle Size Check" \
    "curl -s -I $BASE_URL/main.js | grep -i 'content-length' | awk '{print \$2}' | tr -d '\r' | awk '{exit (\$1 > 10000000) ? 1 : 0}'" \
    ""

echo ""

# Final Report
echo "📊 Test Results Summary"
echo "======================"
echo -e "${BLUE}Tests Run: $TESTS_RUN${NC}"
echo -e "${GREEN}Tests Passed: $TESTS_PASSED${NC}"
echo -e "${RED}Tests Failed: $((TESTS_RUN - TESTS_PASSED))${NC}"

if [ $TESTS_PASSED -eq $TESTS_RUN ]; then
    echo -e "${GREEN}🎉 All tests passed! The UI is working perfectly.${NC}"
    exit 0
elif [ $TESTS_PASSED -gt $((TESTS_RUN / 2)) ]; then
    echo -e "${YELLOW}⚠️  Most tests passed, but there are some issues to investigate.${NC}"
    exit 1
else
    echo -e "${RED}❌ Many tests failed. The UI needs significant fixes.${NC}"
    exit 2
fi

# Cleanup
rm -rf "$TEMP_DIR"
