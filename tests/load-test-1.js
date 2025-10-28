import http from "k6/http";
import { check, sleep } from "k6";
import { Counter } from "k6/metrics";

export let errors = new Counter("errors");

export let options = {
  stages: [
    { duration: "1m", target: 2000 }, // ramp up to 2k VUs
    { duration: "3m", target: 2000 }, // sustain
    { duration: "2m", target: 0 },
  ],
  thresholds: {
    http_req_duration: ["p(95)<500", "p(99)<1200"],
    errors: ["count<100"],
  },
};

const BASE = __ENV.BASE_URL || "http://localhost:3001";

function makePayload(i) {
  return JSON.stringify({ productId: "sku-001", userId: `user-${__VU}-${i}` });
}

export default function () {
  const res = http.post(
    `${BASE}/purchase`,
    makePayload(Math.floor(Math.random() * 10000)),
    {
      headers: { "Content-Type": "application/json" },
      tags: { name: "purchase" },
    }
  );
  if (!(res.status === 202 || res.status === 200)) {
    errors.add(1);
  }
  sleep(Math.random() * 0.2);
}
