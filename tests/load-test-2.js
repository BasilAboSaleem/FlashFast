import http from "k6/http";
import { check, sleep } from "k6";
import { Counter } from "k6/metrics";

export let errors = new Counter("errors");

export let options = {
  stages: [
    { duration: "1m", target: 4000 }, // ramp up to 4k VUs (to simulate load distribution)
    { duration: "3m", target: 4000 },
    { duration: "2m", target: 0 },
  ],
  thresholds: {
    http_req_duration: ["p(95)<700", "p(99)<1500"],
    errors: ["count<200"],
  },
};

const BASE = __ENV.BASE_URL || "http://localhost:3001";

export default function () {
  const body = JSON.stringify({
    productId: "sku-001",
    userId: `user-${__VU}-${__ITER}`,
  });
  const res = http.post(`${BASE}/purchase`, body, {
    headers: { "Content-Type": "application/json" },
  });
  if (!(res.status === 202 || res.status === 200)) {
    errors.add(1);
  }
  sleep(Math.random() * 0.15);
}
