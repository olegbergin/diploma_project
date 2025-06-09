// src/components/BusinessProfile/api/appointments.js
export async function fetchAppointments(businessId, monthIso) {
  const res = await fetch(
    `/api/appointments?businessId=${businessId}&month=${monthIso}`
  );
  if (!res.ok) throw new Error("Network error");
  return res.json(); // [{ date:"YYYY-MM-DD", time:"HH:MM", ... }]
}
