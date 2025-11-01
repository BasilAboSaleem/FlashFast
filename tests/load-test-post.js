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
    // errors: ["count<100"],
  },
};

// Read environment variables
const TOKEN =
  __ENV.TOKEN ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY5MDUyNDg1NTkxMTBhM2ZlMDdiNDUxZiIsInJvbGUiOiJjdXN0b21lciIsImlhdCI6MTc2MTk0NDg4OCwiZXhwIjoxNzYyMDMxMjg4fQ.f1oyhvdc9u6tW2xDdLrjDSTJjXskS3GxEK10b-wmT44";
const EVENT_ID = __ENV.EVENT_ID || "123";
const BASE = __ENV.BASE_URL || "http://localhost:80";

export default function () {
  const url = `${BASE_URL}/flashsale/${EVENT_ID}/purchase`;
  const payload = JSON.stringify({
    quantity: Math.floor(Math.random() * 3) + 1, // 1–3 quantity per request
  });
  const headers = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${TOKEN}`,
  };

  const res = http.post(url, payload, {
    headers,
    tags: { name: "flashsale-purchase" },
  });

  // if (!(res.status === 202 || res.status === 200)) {
  //   errors.add(1);
  // }

  check(res, {
    "status is 200 or 201": (r) => r.status === 200 || r.status === 201,
    "response has JSON": (r) =>
      r.headers["Content-Type"]?.includes("application/json"),
  }) || errors.add(1);

  sleep(Math.random() * 0.2);
}
