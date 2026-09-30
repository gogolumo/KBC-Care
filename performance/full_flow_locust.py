import os

from locust import HttpUser, between, task

CUSTOMERS = max(1, int(os.getenv("LOAD_TEST_CUSTOMERS", "1000")))


class FullDemoFlowUser(HttpUser):
    wait_time = between(0.5, 1.0)

    def on_start(self):
        number = (id(self) % CUSTOMERS) + 1
        self.customer_id = f"load_{number:07d}"

    @task
    def full_flow(self):
        cid = self.customer_id
        self.client.post("/api/simulation/reset", json={"customerId": cid}, name="full/reset")
        for event_id in ["evt_salary", "evt_mortgage", "evt_myhome", "evt_rent", "evt_property_doc"]:
            self.client.post(f"/api/simulation/events/{event_id}", json={"customerId": cid}, name="full/event")
        self.client.post("/api/policy/evaluate", json={
            "customerId": cid,
            "stateId": "state_home",
            "action": "PRE_APPROVED_MORTGAGE_OFFER",
        }, name="full/policy")
        self.client.post("/api/states/state_home/confirm", json={"customerId": cid}, name="full/confirm")
        self.client.get(f"/api/customers/{cid}/journey", name="full/journey")
        self.client.post("/api/journeys/journey_home/steps/budget/complete", json={"customerId": cid}, name="full/step")
        created = self.client.post("/api/context-passports", json={
            "customerId": cid,
            "purpose": "load_test",
            "selectedFields": ["confirmedGoal", "journeyProgress", "unresolvedQuestions"],
            "ttlHours": 24,
        }, name="full/passport")
        if created.ok:
            passport_id = created.json()["passport"]["id"]
            self.client.get(f"/api/context-passports/{passport_id}", name="full/passport-read")
