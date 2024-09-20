export enum ActionTypes {
  SIGN_IN = 'SIGN_IN'
}

type SignIn = { type: ActionTypes.SIGN_IN }

export type Actions = SignIn
