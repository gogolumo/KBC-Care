.PHONY: dev test seed perf-smoke perf-load perf-stress

dev:
	USE_MOCK_DATA=true uvicorn app.main:app --reload

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
