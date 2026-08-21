export type IState = {
  id?: string;
  name: string;
  stateCode: string;
  countryId: string;
  country: {
    name: string;
  };
};

export type IStateForm = Omit<IState, 'country'>;
