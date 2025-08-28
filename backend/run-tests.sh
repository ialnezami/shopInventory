#!/bin/bash

echo "🧪 Running Shop Inventory API Tests"
echo "=================================="

# Function to run unit tests
run_unit_tests() {
    echo "📋 Running Unit Tests..."
    npm run test
}

# Function to run e2e tests
run_e2e_tests() {
    echo "🌐 Running End-to-End Tests..."
    npm run test:e2e
}

# Function to run tests with coverage
run_tests_with_coverage() {
    echo "📊 Running Tests with Coverage..."
    npm run test:cov
}

# Function to run tests in watch mode
run_tests_watch() {
    echo "👀 Running Tests in Watch Mode..."
    npm run test:watch
}

# Function to run all tests
run_all_tests() {
    echo "🚀 Running All Tests..."
    echo ""
    
    # Run unit tests first
    if run_unit_tests; then
        echo "✅ Unit tests passed!"
        echo ""
        
        # Run e2e tests
        if run_e2e_tests; then
            echo "✅ E2E tests passed!"
            echo ""
            echo "🎉 All tests passed successfully!"
        else
            echo "❌ E2E tests failed!"
            exit 1
        fi
    else
        echo "❌ Unit tests failed!"
        exit 1
    fi
}

# Check command line arguments
case "$1" in
    "unit")
        run_unit_tests
        ;;
    "e2e")
        run_e2e_tests
        ;;
    "coverage")
        run_tests_with_coverage
        ;;
    "watch")
        run_tests_watch
        ;;
    "all"|"")
        run_all_tests
        ;;
    *)
        echo "Usage: $0 {unit|e2e|coverage|watch|all}"
        echo ""
        echo "Options:"
        echo "  unit     - Run unit tests only"
        echo "  e2e      - Run end-to-end tests only"
        echo "  coverage - Run tests with coverage report"
        echo "  watch    - Run tests in watch mode"
        echo "  all      - Run all tests (default)"
        echo ""
        exit 1
        ;;
esac
