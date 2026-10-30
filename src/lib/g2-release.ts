/**
 * Release 2-step protection:
 * 1. This UI flag must stay false until G2 tests and privacy are approved.
 * 2. Server requires CLIMACICLO_ENABLE_LEAD_SUBMISSION=true, independently.
 * Backend RPC additionally requires app_settings.ready_for_real_data=true.
 *
 * Never make the UI flag true merely to run a preview demonstration.
 */
export const PUBLIC_LEAD_SUBMISSION_RELEASED: boolean = false;
