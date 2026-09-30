.PHONY: dev dev-load test seed perf-smoke perf-load perf-stress

dev:
	USE_MOCK_DATA=true uvicorn app.main:app --reload

# Server for perf-* targets: enables load_0000001..load_2000000 (single process: state is in memory).
dev-load:
	USE_MOCK_DATA=true LOAD_TEST_CUSTOMERS=2000000 uvicorn app.main:app

test:
	USE_MOCK_DATA=true pytest -q

seed:
	python -m app.seed.validate

perf-smoke:
	python ../performance/run_benchmark.py --scenario business --concurrency 50 --requests 50

perf-load:
	python ../performance/run_benchmark.py --scenario business --concurrency 500 --requests 500

perf-stress:
	python ../performance/run_benchmark.py --scenario read --concurrency 1000 --requests 1000
