export namespace Bank {
  export enum Currency {
    Star = 'star'
  }

  export interface State {
    [Currency.Star]: number;
  }
}
  