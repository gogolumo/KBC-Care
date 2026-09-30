.PHONY: dev test seed

dev:
	USE_MOCK_DATA=true uvicorn app.main:app --reload

test:
	USE_MOCK_DATA=true pytest -q

seed:
	python -m app.seed.validate
