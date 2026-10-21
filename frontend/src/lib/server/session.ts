import { request } from '../api';
import type { AuthToken, LiveState, RemoteSession } from './types';
export const tokenFor = (s: RemoteSession, role: 'parent'|'child') => role === 'parent' ? s.parentToken : s.childToken;
export async function childAccess(parent: AuthToken, childId: string): Promise<AuthToken> {
  const qr = await request<{qrAuthToken:string}>(`/parent/children/${childId}/login-qr`, {method:'POST',token:parent.accessToken});
  return request<AuthToken>('/auth/qr-login', {body:{qrAuthToken:qr.qrAuthToken}});
}
export async function loginParent(email:string, password:string, registration?:string): Promise<RemoteSession> {
  const parentToken = await request<AuthToken>(registration ? '/auth/register' : '/auth/login', {body:{email,password,...(registration ? {familyName:registration} : {})}});
  const parentState = await request<LiveState>('/family/state',{token:parentToken.accessToken});
  const selected = parentState.children.find(c=>c.profile.firstName === 'Никита') || parentState.children[0];
  const childToken = selected ? await childAccess(parentToken, selected.profile.id) : null;
  const childState = childToken ? await request<LiveState>('/family/state',{token:childToken.accessToken}) : null;
  return {parentToken,childToken,parentState,childState,selectedChildId:selected?.profile.id || null};
}
export async function loginChild(qrAuthToken:string): Promise<RemoteSession> {
  const childToken = await request<AuthToken>('/auth/qr-login',{body:{qrAuthToken:qrAuthToken.trim()}});
  const childState = await request<LiveState>('/family/state',{token:childToken.accessToken});
  return {parentToken:null,parentState:null,childToken,childState,selectedChildId:childToken.childId};
}
export async function selectChild(s:RemoteSession, childId:string): Promise<RemoteSession> {
  if(!s.parentToken || !s.parentState?.children.some(c=>c.profile.id===childId)) throw Error('Ребёнок не найден');
  const childToken = await childAccess(s.parentToken,childId);
  const childState = await request<LiveState>('/family/state',{token:childToken.accessToken});
  return {...s,childToken,childState,selectedChildId:childId};
}
export async function refreshSession(s:RemoteSession):Promise<RemoteSession> {
  const [parentState,childState]=await Promise.all([
    s.parentToken ? request<LiveState>('/family/state',{token:s.parentToken.accessToken}) : Promise.resolve(null),
    s.childToken ? request<LiveState>('/family/state',{token:s.childToken.accessToken}) : Promise.resolve(null),
  ]);
  return {...s,parentState,childState};
}
