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
      "Outro": { brand: "Outro", category: "Outro" }
    }
  },
  "Itaú": {
    cards: {
      "Itaú Free": { brand: "Visa", category: "Platinum" },
      "Itaú Uniclass Signature": { brand: "Visa", category: "Signature" },
      "Azul Itaú Infinite": { brand: "Visa", category: "Infinite" },
      "LATAM Pass Itaú Infinite": { brand: "Visa", category: "Infinite" },
      "LATAM Pass Itaú Black": { brand: "Mastercard", category: "Black" },
      "Pão de Açúcar Mastercard Black": { brand: "Mastercard", category: "Black" },
      "Personnalité Visa Infinite": { brand: "Visa", category: "Infinite" },
      "Personnalité Mastercard Black": { brand: "Mastercard", category: "Black" },
      "The One Mastercard Black": { brand: "Mastercard", category: "Black" },
      "Private Infinite Privilege": { brand: "Visa", category: "Infinite" },
      "Outro": { brand: "Outro", category: "Outro" }
    }
  },
  "Bradesco": {
    cards: {
      "Bradesco Neo": { brand: "Visa", category: "Platinum" },
      "Bradesco Signature": { brand: "Visa", category: "Signature" },
      "Bradesco Prime Visa Infinite": { brand: "Visa", category: "Infinite" },
      "Bradesco Prime Mastercard Black": { brand: "Mastercard", category: "Black" },
      "Elo Diners Club Nanquim": { brand: "Elo", category: "Nanquim" },
      "American Express Platinum": { brand: "Amex", category: "Platinum" },
      "American Express Centurion": { brand: "Amex", category: "Centurion" },
      "Bradesco Horizon Infinite": { brand: "Visa", category: "Infinite" },
      "Outro": { brand: "Outro", category: "Outro" }
    }
  },
  "Santander": {
    cards: {
      "Santander Free": { brand: "Visa", category: "Gold" },
      "Santander Elite": { brand: "Visa/Mastercard", category: "Platinum" },
      "Santander Unique Visa Infinite": { brand: "Visa", category: "Infinite" },
      "Santander Unique Mastercard Black": { brand: "Mastercard", category: "Black" },
      "Santander Unlimited Visa Infinite": { brand: "Visa", category: "Infinite" },
      "Santander Unlimited Mastercard Black": { brand: "Mastercard", category: "Black" },
      "AAdvantage Mastercard Black": { brand: "Mastercard", category: "Black" },
      "Outro": { brand: "Outro", category: "Outro" }
    }
  },
  "Nubank": {
    cards: {
      "Nubank Gold": { brand: "Mastercard", category: "Gold" },
      "Nubank Platinum": { brand: "Mastercard", category: "Platinum" },
      "Nubank Ultravioleta": { brand: "Mastercard", category: "Black" },
      "Outro": { brand: "Outro", category: "Outro" }
    }
  },
  "Inter": {
    cards: {
      "Inter Gold": { brand: "Mastercard", category: "Gold" },
      "Inter Platinum": { brand: "Mastercard", category: "Platinum" },
      "Inter Black": { brand: "Mastercard", category: "Black" },
      "Inter Win": { brand: "Mastercard", category: "Black" },
      "Outro": { brand: "Outro", category: "Outro" }
    }
  },
  "C6 Bank": {
    cards: {
      "C6 Platinum": { brand: "Mastercard", category: "Platinum" },
      "C6 Black": { brand: "Mastercard", category: "Black" },
      "C6 Carbon": { brand: "Mastercard", category: "Black" },
      "Outro": { brand: "Outro", category: "Outro" }
    }
  },
  "BTG Pactual": {
    cards: {
      "BTG Pactual Black": { brand: "Mastercard", category: "Black" },
      "BTG Ultrablue": { brand: "Mastercard", category: "Black" },
      "Outro": { brand: "Outro", category: "Outro" }
    }
  },
  "XP Investimentos": {
    cards: {
      "XP Visa Infinite One": { brand: "Visa", category: "Infinite" },
      "XP Visa Infinite": { brand: "Visa", category: "Infinite" },
      "Outro": { brand: "Outro", category: "Outro" }
    }
  },
  "Porto Bank": {
    cards: {
      "Porto Bank Visa Infinite": { brand: "Visa", category: "Infinite" },
      "Porto Bank Mastercard Black": { brand: "Mastercard", category: "Black" },
      "Outro": { brand: "Outro", category: "Outro" }
    }
  },
  "Banco BRB": {
    cards: {
      "BRB Dux Visa Infinite": { brand: "Visa", category: "Infinite" },
      "BRB Dux Eurobike Mastercard Black": { brand: "Mastercard", category: "Black" },
      "Outro": { brand: "Outro", category: "Outro" }
    }
  },
  "Caixa Econômica": {
    cards: {
      "Caixa Sim": { brand: "Visa", category: "Standard" },
      "Caixa Elo Diners Club Nanquim": { brand: "Elo", category: "Nanquim" },
      "Caixa Visa Infinite": { brand: "Visa", category: "Infinite" },
      "Outro": { brand: "Outro", category: "Outro" }
    }
  },
  "Outro": {
    cards: {
      "Outro": { brand: "Outro", category: "Outro" }
    }
  }
};
