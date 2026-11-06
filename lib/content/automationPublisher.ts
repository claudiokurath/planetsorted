import { createRemoteJWKSet, jwtVerify, type JWTVerifyGetKey } from 'jose'

export const CRM_SYNC_AUDIENCE = 'https://www.planetsorted.com/api/cron/sync-crm'
export const GAMMA_SYNC_AUDIENCE = 'https://www.planetsorted.com/api/content/presentations'
const keys = createRemoteJWKSet(new URL('https://token.actions.githubusercontent.com/.well-known/jwks'))

/** Trust only this repository's reviewed main-branch publishing workflow. */
export async function verifyAutomationPublisher(token: string, audience: string, getKey: JWTVerifyGetKey = keys) {
  const { payload } = await jwtVerify(token, getKey, {
    algorithms: ['RS256'], issuer: 'https://token.actions.githubusercontent.com',
    audience, maxTokenAge: '10m', clockTolerance: 5,
  })
  if (payload.repository !== 'claudiokurath/planetsorted' || payload.ref !== 'refs/heads/main'
    || payload.workflow_ref !== 'claudiokurath/planetsorted/.github/workflows/sync-gamma.yml@refs/heads/main'
    || !['push', 'schedule', 'workflow_dispatch'].includes(String(payload.event_name))) {
    throw new Error('Publisher is not authorised')
  }
}
