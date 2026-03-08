export type BankMapping = {
  [bankName: string]: {
    cards: {
      [cardName: string]: {
        brand: string;
        category: string;
      };
    };
  };
};

export const BANK_DATA: BankMapping = {
  "Banco do Brasil": {
    cards: {
      "Ourocard Fácil": { brand: "Visa", category: "Gold" },
      "Ourocard Platinum": { brand: "Visa/Mastercard", category: "Platinum" },
      "Ourocard Altus": { brand: "Visa", category: "Infinite" },
      "Ourocard Elo Diners Club": { brand: "Elo", category: "Nanquim" },
      "Ourocard Mastercard Black": { brand: "Mastercard", category: "Black" },
      "Smiles Visa Infinite": { brand: "Visa", category: "Infinite" },
      "Outro cartao": { brand: "Outro", category: "Outro" }
    }
  },
  "Itaú": {
    cards: {
      "Itaú Free": { brand: "Visa", category: "Platinum" },
      "Itaú Uniclass Signature": { brand: "Visa", category: "Signature" },
      "Azul Itaú": { brand: "Visa", category: "Infinite" },
      "LATAM Pass Itaú": { brand: "Visa/Mastercard", category: "Infinite/Black" },
      "Pão de Açúcar": { brand: "Mastercard", category: "Black" },
      "Personnalité": { brand: "Visa/Mastercard", category: "Infinite/Black" },
      "The One": { brand: "Mastercard", category: "Black" },
      "Private Infinite Privilege": { brand: "Visa", category: "Infinite" },
      "Outro cartao": { brand: "Outro", category: "Outro" }
    }
  },
  "Bradesco": {
    cards: {
      "Bradesco Neo": { brand: "Visa", category: "Platinum" },
      "Bradesco Signature": { brand: "Visa", category: "Signature" },
      "Bradesco Infinite": { brand: "Visa", category: "Infinite" },
      "Bradesco Black": { brand: "Mastercard", category: "Black" },
      "Bradesco Elo Nanquim": { brand: "Elo", category: "Nanquim" },
      "Bradesco Elo Diners Club": { brand: "Elo", category: "Nanquim" },
      "American Express Gold": { brand: "Amex", category: "Gold" },
      "American Express Platinum": { brand: "Amex", category: "Platinum" },
      "American Express Centurion": { brand: "Amex", category: "Centurion" },
      "AETERNUM": { brand: "Visa", category: "Infinite" },
      "Outro cartao": { brand: "Outro", category: "Outro" }
    }
  },
  "Santander": {
    cards: {
      "Santander SX": { brand: "Visa", category: "Gold" },
      "Santander Elite": { brand: "Visa/Mastercard", category: "Platinum" },
      "Santander Unique": { brand: "Visa/Mastercard", category: "Infinite/Black" },
      "Santander Unlimited": { brand: "Visa/Mastercard", category: "Infinite/Black" },
      "Santander GOL Smiles": { brand: "Visa", category: "Infinite" },
      "Santander AAdvantage": { brand: "Mastercard", category: "Black" },
      "Santander American Express": { brand: "Amex", category: "Platinum" },
      "Santander Centurion": { brand: "Amex", category: "Centurion" },
      "Outro cartao": { brand: "Outro", category: "Outro" }
    }
  },
  "Nubank": {
    cards: {
      "Nubank Gold": { brand: "Mastercard", category: "Gold" },
      "Nubank Platinum": { brand: "Mastercard", category: "Platinum" },
      "Nubank Ultravioleta": { brand: "Mastercard", category: "Black" },
      "Outro cartao": { brand: "Outro", category: "Outro" }
    }
  },
  "Inter": {
    cards: {
      "Inter Gold": { brand: "Mastercard", category: "Gold" },
      "Inter Platinum": { brand: "Mastercard", category: "Platinum" },
      "Inter Black": { brand: "Mastercard", category: "Black" },
      "Inter Win": { brand: "Mastercard", category: "Black" },
      "Outro cartao": { brand: "Outro", category: "Outro" }
    }
  },
  "C6 Bank": {
    cards: {
      "C6 Bank": { brand: "Mastercard", category: "Standard" },
      "C6 Platinum": { brand: "Mastercard", category: "Platinum" },
      "C6 Carbon": { brand: "Mastercard", category: "Black" },
      "C6 Graphene": { brand: "Mastercard", category: "Black" },
      "Outro cartao": { brand: "Outro", category: "Outro" }
    }
  },
  "BTG Pactual": {
    cards: {
      "BTG Opção Avançada": { brand: "Mastercard", category: "Platinum" },
      "BTG Black": { brand: "Mastercard", category: "Black" },
      "BTG Ultrablue": { brand: "Mastercard", category: "Black" },
      "Outro cartao": { brand: "Outro", category: "Outro" }
    }
  },
  "XP Investimentos": {
    cards: {
      "XP Visa Infinite": { brand: "Visa", category: "Infinite" },
      "XP Visa Infinite (One)": { brand: "Visa", category: "Infinite" },
      "Outro cartao": { brand: "Outro", category: "Outro" }
    }
  },
  "Banco BRB": {
    cards: {
      "BRB Dux": { brand: "Visa", category: "Infinite" },
      "BRB Dux Eurobike": { brand: "Visa", category: "Infinite" },
      "BRB Mastercard Black": { brand: "Mastercard", category: "Black" },
      "BRB Visa Infinite": { brand: "Visa", category: "Infinite" },
      "Outro cartao": { brand: "Outro", category: "Outro" }
    }
  },
  "Porto Bank (Porto Seguro)": {
    cards: {
      "Porto Bank Platinum": { brand: "Visa/Mastercard", category: "Platinum" },
      "Porto Bank Black": { brand: "Mastercard", category: "Black" },
      "Porto Bank Infinite": { brand: "Visa", category: "Infinite" },
      "Outro cartao": { brand: "Outro", category: "Outro" }
    }
  },
  "Caixa Econômica": {
    cards: {
      "Caixa Elo Nanquim": { brand: "Elo", category: "Black" },
      "Caixa Elo Diners Club": { brand: "Elo", category: "Nanquim" },
      "Caixa Mastercard Black": { brand: "Mastercard", category: "Black" },
      "Caixa Visa Infinite": { brand: "Visa", category: "Infinite" },
      "Outro cartao": { brand: "Outro", category: "Outro" }
    }
  },
  "Outro banco": {
    cards: {
      "Outro cartao": { brand: "Outro", category: "Outro" }
    }
  }
};
