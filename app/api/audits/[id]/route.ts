import { z } from 'zod'
import { errorResponse } from '@/lib/api-response'
import { createClient } from '@/lib/supabase/server'

const idSchema = z.string().uuid()

export async function DELETE(_request: Request, context: RouteContext<'/api/audits/[id]'>) {
  const { id } = await context.params
  if (!idSchema.safeParse(id).success) return errorResponse(400, 'INVALID_AUDIT_ID', 'The audit ID is invalid.')

  const supabase = await createClient()
  const { data: claimsData, error: authError } = await supabase.auth.getClaims()
  const userId = claimsData?.claims.sub
  if (authError || typeof userId !== 'string') return errorResponse(401, 'AUTH_REQUIRED', 'Log in to delete an audit.')

  const { data, error } = await supabase.from('audits').delete().eq('id', id).eq('user_id', userId).select('id').maybeSingle()
  if (error) {
    console.error('Failed to delete audit:', error.code)
    return errorResponse(500, 'AUDIT_DELETE_FAILED', 'The audit could not be deleted. Please try again.')
  }
  if (!data) return errorResponse(404, 'AUDIT_NOT_FOUND', 'Audit not found.')

  return Response.json({ deleted: true })
}
