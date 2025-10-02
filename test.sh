#!/bin/bash

# CloudPulse Monitor - Application Test Script
# Tests both backend API and frontend functionality

BASE_URL="http://localhost:8080"
API_BASE="$BASE_URL/api"

echo "🚀 Starting CloudPulse Monitor Tests..."
echo "========================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test counter
TESTS_RUN=0
TESTS_PASSED=0
TESTS_FAILED=0

# Helper function to print test results
print_test_result() {
    TESTS_RUN=$((TESTS_RUN + 1))
    if [ $1 -eq 0 ]; then
        echo -e "  ${GREEN}✅ PASS${NC}: $2"
        TESTS_PASSED=$((TESTS_PASSED + 1))
    else
        echo -e "  ${RED}❌ FAIL${NC}: $2"
        TESTS_FAILED=$((TESTS_FAILED + 1))
    fi
}

# Helper function to make API calls
api_test() {
    local method=$1
    local endpoint=$2
    local data=$3
    local expected_code=${4:-200}

    echo "  Testing $method $endpoint"

    if [ -n "$data" ]; then
        response=$(curl -s -w "%{http_code}" -o /tmp/curl_output \
            -X "$method" \
            -H "Content-Type: application/json" \
            -d "$data" \
            "$API_BASE$endpoint")
    else
        response=$(curl -s -w "%{http_code}" -o /tmp/curl_output \
            -X "$method" \
            "$API_BASE$endpoint")
    fi

    http_code=${response: -3}
    body=$(cat /tmp/curl_output)

    if [ "$http_code" -eq "$expected_code" ]; then
        print_test_result 0 "$method $endpoint (HTTP $http_code)"
    else
        print_test_result 1 "$method $endpoint (Expected HTTP $expected_code, got $http_code)"
        echo "    Response: $body"
    fi
}

# 1. Health Check Tests
echo ""
echo "📋 1. Health Check Tests"
echo "------------------------"

# Backend health
api_test "GET" "/health" "" 200

# System status
api_test "GET" "/status" "" 200

# 2. Monitor Management Tests
echo ""
echo "📊 2. Monitor Management Tests"
echo "-----------------------------"

# Get all monitors (should return empty array initially)
api_test "GET" "/monitors" "" 200

# Create a test monitor
MONITOR_DATA='{
  "name": "Test Website",
  "url": "https://httpbin.org/status/200",
  "type": "http",
  "interval_seconds": 60,
  "timeout_seconds": 10
}'

echo "  Creating test monitor..."
response=$(curl -s -X POST \
    -H "Content-Type: application/json" \
    -d "$MONITOR_DATA" \
    "$API_BASE/monitors")

if echo "$response" | grep -q "id"; then
    print_test_result 0 "POST /monitors (Monitor created)"
    # Extract monitor ID for later tests
    MONITOR_ID=$(echo "$response" | grep -o '"id":[0-9]*' | grep -o '[0-9]*')
    echo "    Monitor ID: $MONITOR_ID"
else
    print_test_result 1 "POST /monitors (Failed to create monitor)"
    echo "    Response: $response"
fi

# Get monitors again (should have our test monitor)
api_test "GET" "/monitors" "" 200

# Get specific monitor
if [ -n "$MONITOR_ID" ]; then
    api_test "GET" "/monitors/$MONITOR_ID" "" 200

    # Update monitor
    UPDATE_DATA='{
      "name": "Updated Test Website",
      "interval_seconds": 120
    }'
    api_test "PUT" "/monitors/$MONITOR_ID" "$UPDATE_DATA" 200

    # Get monitor checks (should be empty initially)
    api_test "GET" "/monitors/$MONITOR_ID/checks" "" 200
fi

# 3. Monitoring System Tests
echo ""
echo "📈 3. Monitoring System Tests"
echo "----------------------------"

# Get recent checks
api_test "GET" "/checks?limit=10" "" 200

# Get incidents
api_test "GET" "/incidents" "" 200

# Get uptime stats
api_test "GET" "/uptime?days=7" "" 200

# 4. Scheduler Tests
echo ""
echo "⏰ 4. Scheduler Tests"
echo "-------------------"

# Get scheduler status
api_test "GET" "/scheduler/status" "" 200

# Get scheduled jobs
api_test "GET" "/scheduler/jobs" "" 200

# 5. Frontend Tests
echo ""
echo "🌐 5. Frontend Tests"
echo "-------------------"

# Test frontend accessibility
echo "  Testing frontend dashboard..."
frontend_response=$(curl -s -w "%{http_code}" -o /tmp/frontend_output "$BASE_URL/")

if [ "$frontend_response" -eq 200 ]; then
    print_test_result 0 "Frontend accessible (HTTP $frontend_response)"
else
    print_test_result 1 "Frontend accessible (Expected HTTP 200, got $frontend_response)"
fi

# 6. Database Tests
echo ""
echo "💾 6. Database Tests"
echo "-------------------"

# Check if database file exists
if [ -f "./data/uptime.db" ]; then
    print_test_result 0 "Database file exists"

    # Check database size
    db_size=$(stat -c%s "./data/uptime.db" 2>/dev/null || stat -f%z "./data/uptime.db" 2>/dev/null || echo "0")
    if [ "$db_size" -gt 0 ]; then
        print_test_result 0 "Database has content (Size: $db_size bytes)"
    else
        print_test_result 1 "Database is empty"
    fi
else
    print_test_result 1 "Database file not found"
fi

# 7. Container Health Tests
echo ""
echo "🐳 7. Container Health Tests"
echo "---------------------------"

# Check if containers are running
backend_running=$(docker-compose ps -q cloudpulse-backend | wc -l)
frontend_running=$(docker-compose ps -q cloudpulse-frontend | wc -l)

if [ "$backend_running" -eq 1 ]; then
    print_test_result 0 "Backend container running"
else
    print_test_result 1 "Backend container running"
fi

if [ "$frontend_running" -eq 1 ]; then
    print_test_result 0 "Frontend container running"
else
    print_test_result 1 "Frontend container running"
fi

# Summary
echo ""
echo "📋 Test Summary"
echo "==============="
echo "Tests Run: $TESTS_RUN"
echo -e "Tests Passed: ${GREEN}$TESTS_PASSED${NC}"
echo -e "Tests Failed: ${RED}$TESTS_FAILED${NC}"

if [ $TESTS_FAILED -eq 0 ]; then
    echo ""
    echo -e "${GREEN}🎉 All tests passed! Your CloudPulse Monitor is working perfectly!${NC}"
    echo ""
    echo "🌐 Access your dashboard at: $BASE_URL"
    echo "🔌 API documentation available at: $BASE_URL/api/*"
    echo ""
    echo "✨ Next steps:"
    echo "   - Add monitors for websites you want to track"
    echo "   - Configure alerting (email notifications)"
    echo "   - Set up monitoring schedules"
    echo "   - View detailed analytics and reports"
else
    echo ""
    echo -e "${YELLOW}⚠️  Some tests failed. Check the errors above.${NC}"
fi

echo ""
echo "🛑 Test script completed."