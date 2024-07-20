export type Request<P> = P;

export type Response<R> = Start | Ok<R> | Error;

type Start = {
  status: 'STARTED';
  messages?: string[];
};

type Ok<R> = {
  status: 'OK';
  messages?: string[];
  value: R;
};

type Error = {
  status: 'ERROR';
  messages?: string[];
  errors: string[];
};

export type MsgStruct<T extends string, P, R> = {
  type: T;
  payload: Request<P>;
  response: Response<R>;
};

/**
 * Example worker messaging types.
 */
export type Messages =
  | MsgStruct<'add', number[], number>
  | MsgStruct<'multiply', number[], number>
  | MsgStruct<'concat', string[], string>
  | MsgStruct<'split', { value: string; delimiter: string }, string[]>;
