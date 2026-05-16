async function triggerUpdate() {
  console.log("Triggering /api/cron/update-markets...");
  try {
    const res = await fetch("http://localhost:3000/api/cron/update-markets?secret=ldi_secret_update_2026");
    const data = await res.json();
    console.log("Response:", JSON.stringify(data, null, 2));
  } catch (e) {
    console.error("Error triggering update:", e.message);
  }
}

triggerUpdate();
