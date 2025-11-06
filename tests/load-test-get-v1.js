import http from "k6/http";
import { check, sleep } from "k6";
import { Counter } from "k6/metrics";

export let errors = new Counter("errors");

export let options = {
  stages: [
    { duration: "1m", target: 2000 },
    { duration: "3m", target: 2000 },
    { duration: "2m", target: 0 },
  ],
  thresholds: {
    http_req_duration: ["p(95)<500", "p(99)<1200"],
  },
};

const BASE = __ENV.BASE_URL || "http://localhost:3000";

export default function () {
  const res = http.get(`${BASE}/flashsale-events`, {
    headers: { "Content-Type": "application/json" },
    tags: { name: "flashsale" },
  });
  if (!(res.status === 202 || res.status === 200)) {
    errors.add(1);
  }
  sleep(Math.random() * 0.2);
}
