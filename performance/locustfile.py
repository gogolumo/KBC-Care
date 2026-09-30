import os

from locust import HttpUser, between, task

CUSTOMERS = max(1, int(os.getenv("LOAD_TEST_CUSTOMERS", "2000000")))


class CompassUser(HttpUser):
    wait_time = between(0.05, 0.2)

    def on_start(self):
        number = (id(self) % CUSTOMERS) + 1
        self.customer_id = f"load_{number:07d}"
        self.client.post("/api/simulation/reset", json={"customerId": self.customer_id}, name="POST reset")

    @task(6)
    def read_customer(self):
        self.client.get(f"/api/customers/{self.customer_id}", name="GET customer")

    @task(2)
    def evaluate_policy(self):
        self.client.post(
            "/api/policy/evaluate",
            json={
                "customerId": self.customer_id,
                "stateId": "state_home",
                "action": "PRE_APPROVED_MORTGAGE_OFFER",
            },
            name="POST policy",
        )

    @task(2)
    def state_cycle(self):
        self.client.post("/api/simulation/reset", json={"customerId": self.customer_id}, name="POST reset")
        for event_id in ["evt_salary", "evt_mortgage", "evt_myhome", "evt_rent", "evt_property_doc"]:
            self.client.post(
                f"/api/simulation/events/{event_id}",
                json={"customerId": self.customer_id},
                name="POST event",
            )
        self.client.get(f"/api/customers/{self.customer_id}/state", name="GET state")
